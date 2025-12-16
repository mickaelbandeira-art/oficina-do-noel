
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateQuizQuestions } from "@/services/groqService";
import { FALLBACK_QUESTIONS } from "@/data/fallbackQuestions";

export const MAX_ATTEMPTS = 4;

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  matricula: string;
  score: number;
  total_time_seconds: number | null;
  completed_at: string | null;
  quiz_attempts: number | null;
}

export interface GameState {
  currentQuestion: number;
  score: number;
  answers: Record<number, string>;
  startTime: number | null;
  isComplete: boolean;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useChristmasGame = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingAI, setIsUsingAI] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("christmas_questions")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      if (!data || data.length === 0) {
        console.warn("Nenhuma pergunta no banco (fetchQuestions). Usando fallback estático.");
        setQuestions(shuffleArray(FALLBACK_QUESTIONS));
      } else {
        setQuestions(shuffleArray(data));
      }
      setIsUsingAI(false);
    } catch (err) {
      console.error("Erro no fetchQuestions, usando fallback:", err);
      setQuestions(shuffleArray(FALLBACK_QUESTIONS));
      // setError(err instanceof Error ? err.message : "Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIQuestions = useCallback(async () => {
    // Disable AI - force fallback behavior
    return fetchQuestions();
  }, [fetchQuestions]);

  /*
      try {
        setLoading(true);
        setError(null);
  
        console.log("Gerando perguntas com IA...");
        const aiQuestions = await generateQuizQuestions();
  
        setQuestions(aiQuestions);
        setIsUsingAI(true);
        console.log("Perguntas geradas com sucesso!");
      } catch (err) {
        console.error("Erro ao gerar perguntas com IA, usando banco de dados:", err);
        // setError(null); // Ensure error is clear for fallback
  
  
        // Fallback para perguntas do banco
        try {
          const { data, error: dbError } = await supabase
            .from("christmas_questions")
            .select("*")
            .eq("is_active", true);
  
          if (dbError) throw dbError;
  
          if (!data || data.length === 0) {
            console.warn("Nenhuma pergunta no banco. Usando fallback estático.");
            setQuestions(shuffleArray(FALLBACK_QUESTIONS).slice(0, 10));
          } else {
            setQuestions(shuffleArray(data).slice(0, 10));
          }
          setIsUsingAI(false);
        } catch (dbErr) {
          console.error("Erro no banco, usando fallback final:", dbErr);
          setQuestions(shuffleArray(FALLBACK_QUESTIONS).slice(0, 10));
          setIsUsingAI(false);
          // Não setar erro para o usuário se o fallback funcionar
          // setError(dbErr instanceof Error ? dbErr.message : "Erro ao carregar perguntas");
        }
      } finally {
        setLoading(false);
      }
    }, []);
  */

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const registerPlayer = async (name: string, email: string, matricula: string) => {
    const { data, error } = await supabase
      .from("christmas_players")
      .insert({
        name,
        email,
        matricula,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esta matrícula já está cadastrada no jogo!");
      }
      throw error;
    }
    return data;
  };

  const submitGame = async (
    playerId: string,
    score: number,
    totalTimeSeconds: number,
    answers: Record<number, string>
  ) => {
    // Get current player data
    const { data: currentPlayer, error: fetchError } = await supabase
      .from("christmas_players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (fetchError) throw fetchError;

    const player = currentPlayer as unknown as Player;
    const currentAttempts = player.quiz_attempts || 0;
    const currentBestScore = player.score || 0;
    const isFirstAttempt = currentAttempts === 0;

    // Update with best score and increment attempts
    const { data, error } = await supabase
      .from("christmas_players")
      .update({
        score: Math.max(score, currentBestScore), // Keep best score
        total_time_seconds: score > currentBestScore ? totalTimeSeconds : currentPlayer.total_time_seconds,
        answers: score > currentBestScore ? answers : currentPlayer.answers,
        quiz_attempts: currentAttempts + 1,
        completed_at: isFirstAttempt ? new Date().toISOString() : currentPlayer.completed_at,
      })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const resetPlayerForRetry = async (playerId: string) => {
    // Just fetch current player data - no reset needed
    // Each attempt will generate new questions via AI
    const { data, error } = await supabase
      .from("christmas_players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error) throw error;
    return data;
  };

  const getRanking = async () => {
    const { data, error } = await supabase
      .from("christmas_players")
      .select("*")
      .not("completed_at", "is", null)
      .order("score", { ascending: false })
      .order("total_time_seconds", { ascending: true });

    if (error) throw error;
    return data as unknown as Player[];
  };

  const loginPlayer = async (matricula: string) => {
    const { data, error } = await supabase
      .from("christmas_players")
      .select("*")
      .eq("matricula", matricula)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Player | null;
  };

  return {
    questions,
    loading,
    error,
    isUsingAI,
    registerPlayer,
    loginPlayer,
    submitGame,
    getRanking,
    refreshQuestions: fetchQuestions,
    fetchAIQuestions,
    resetPlayerForRetry,
  };
};