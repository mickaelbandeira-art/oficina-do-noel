import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateQuizQuestions } from "@/services/groqService";

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
    // Get current player data
    const { data: currentPlayer, error: fetchError } = await supabase
      .from("christmas_players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (fetchError) throw fetchError;

    const currentAttempts = currentPlayer.quiz_attempts || 0;
    const currentBestScore = currentPlayer.score || 0;
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
      .select("id, name, email, matricula, score, total_time_seconds, completed_at, quiz_attempts")
      .not("completed_at", "is", null)
      .order("score", { ascending: false })
      .order("total_time_seconds", { ascending: true });

    if (error) throw error;
    return data as Player[];
  };

  const loginPlayer = async (matricula: string) => {
    const { data, error } = await supabase
      .from("christmas_players")
      .select("id, name, email, matricula, score, total_time_seconds, completed_at, quiz_attempts")
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
    resetPlayerForRetry,
  };
};