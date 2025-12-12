import { Question } from "@/hooks/useChristmasGame";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const SYSTEM_PROMPT = `Você é um especialista em criar perguntas de quiz sobre o Natal. 
Gere perguntas interessantes, divertidas e educativas sobre tradições natalinas, história do Natal, 
símbolos natalinos, músicas de Natal, e curiosidades relacionadas ao tema.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, no seguinte formato:
{
  "questions": [
    {
      "question": "Texto da pergunta aqui?",
      "option_a": "Primeira opção",
      "option_b": "Segunda opção",
      "option_c": "Terceira opção",
      "option_d": "Quarta opção",
      "correct_answer": "A"
    }
  ]
}`;

const USER_PROMPT = `Gere 10 perguntas únicas e aleatórias sobre o Natal em português do Brasil. 
Cada pergunta deve ter 4 opções de resposta (A, B, C, D) e apenas uma resposta correta.
Varie os temas: tradições, história, símbolos, músicas, curiosidades, etc.
Retorne apenas o JSON sem nenhum texto adicional.`;

// Cache para armazenar perguntas geradas
let cachedQuestions: Question[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const generateQuizQuestions = async (): Promise<Question[]> => {
  // Verificar cache
  if (cachedQuestions && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("Usando perguntas do cache");
    return cachedQuestions;
  }

  try {
    const messages: GroqMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 1.2,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API Groq:", errorText);
      throw new Error(`Erro da API Groq: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da API Groq");
    }

    // Limpar possíveis marcadores de código
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanContent);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Formato inválido de resposta da API");
    }

    // Converter para o formato esperado
    const questions: Question[] = parsed.questions.map((q: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      order_index: index + 1,
    }));

    // Validar perguntas
    questions.forEach((q, idx) => {
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
        throw new Error(`Pergunta ${idx + 1} está incompleta`);
      }
      if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
        throw new Error(`Pergunta ${idx + 1} tem resposta correta inválida`);
      }
    });

    // Atualizar cache
    cachedQuestions = questions;
    cacheTimestamp = Date.now();

    console.log(`${questions.length} perguntas geradas com sucesso pela IA`);
    return questions;
  } catch (error) {
    console.error("Erro ao gerar perguntas com IA:", error);
    throw error;
  }
};

// Função para limpar o cache manualmente
export const clearQuestionCache = () => {
  cachedQuestions = null;
  cacheTimestamp = null;
};
