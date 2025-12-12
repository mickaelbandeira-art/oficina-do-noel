import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateQuizQuestions } from "@/services/groqService";

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
}

export interface GameState {
  currentQuestion: number;
  score: number;
  answers: Record<number, string>;
  startTime: number | null;
  isComplete: boolean;
}

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
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
      setIsUsingAI(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIQuestions = useCallback(async () => {
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
      setError("Usando perguntas do banco de dados");

      // Fallback para perguntas do banco
      try {
        const { data, error: dbError } = await supabase
          .from("christmas_questions")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (dbError) throw dbError;
        setQuestions(data || []);
        setIsUsingAI(false);
      } catch (dbErr) {
        setError(dbErr instanceof Error ? dbErr.message : "Erro ao carregar perguntas");
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
    const { data, error } = await supabase
      .from("christmas_players")
      .update({
        score,
        total_time_seconds: totalTimeSeconds,
        answers,
        completed_at: new Date().toISOString(),
      })
      .eq("id", playerId)
      .select()
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
    return data as Player[];
  };

  const loginPlayer = async (matricula: string) => {
    const { data, error } = await supabase
      .from("christmas_players")
      .select("*")
      .eq("matricula", matricula)
      .maybeSingle();

    if (error) throw error;
    return data as Player | null;
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
  };
};