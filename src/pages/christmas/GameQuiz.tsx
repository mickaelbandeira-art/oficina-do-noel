import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { FeedbackOverlay } from "@/components/christmas/FeedbackOverlay";
import { useChristmasGame, Question } from "@/hooks/useChristmasGame";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GameQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { questions, loading, error, isUsingAI, submitGame, fetchAIQuestions } = useChristmasGame();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  // Get player from session
  const player = JSON.parse(sessionStorage.getItem("christmasPlayer") || "null");

  useEffect(() => {
    if (!player) {
      navigate("/christmas/register");
    }
  }, [player, navigate]);

  // Load AI questions on mount
  useEffect(() => {
    if (player?.id && fetchAIQuestions) {
      fetchAIQuestions();
    }
  }, [player?.id, fetchAIQuestions]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = (answer: string) => {
    if (showResult || isSubmitting) return;
    setSelectedAnswer(answer);
  };

  const handleConfirm = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newAnswers = { ...answers, [currentIndex]: selectedAnswer };
    const newScore = isCorrect ? score + 1 : score;

    setAnswers(newAnswers);
    setScore(newScore);
    setLastAnswerCorrect(isCorrect);
    setShowResult(true);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isLastQuestion) {
      // Submit game
      try {
        setIsSubmitting(true);
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const updatedPlayer = await submitGame(player.id, newScore, totalTime, newAnswers);

        sessionStorage.setItem("christmasPlayer", JSON.stringify(updatedPlayer));

        sessionStorage.setItem("christmasResult", JSON.stringify({
          score: newScore,
          totalQuestions: questions.length,
          totalTime,
        }));

        navigate("/christmas/result");
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao salvar resultado. Tente novamente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return (
      <ChristmasLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin w-12 h-12 border-4 border-christmas-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-xl">Gerando perguntas exclusivas para você...</p>
            <p className="text-sm text-white/70 mt-2">Powered by AI 🤖</p>
          </div>
        </div>
      </ChristmasLayout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <ChristmasLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl text-destructive">Erro ao carregar o quiz</p>
            <Button onClick={() => navigate("/christmas")} className="mt-4">
              Voltar ao Início
            </Button>
          </div>
        </div>
      </ChristmasLayout>
    );
  }

  const options = [
    { key: "A", value: currentQuestion?.option_a },
    { key: "B", value: currentQuestion?.option_b },
    { key: "C", value: currentQuestion?.option_c },
    { key: "D", value: currentQuestion?.option_d },
  ];

  return (
    <ChristmasLayout showDecorations={false}>
      {/* Feedback Overlay */}
      <FeedbackOverlay isVisible={showResult} isCorrect={lastAnswerCorrect} />

      <div className="min-h-screen flex flex-col px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-3">
            {isUsingAI && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                🤖 IA
              </span>
            )}
            <div className="text-lg font-semibold">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress
          value={((currentIndex + 1) / questions.length) * 100}
          className="mb-8 h-3 bg-white/20"
        />

        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-scale-in">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 text-center">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option) => {
                const isSelected = selectedAnswer === option.key;
                const isCorrect = option.key === currentQuestion?.correct_answer;

                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";

                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-500/20 text-green-700";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-500/20 text-red-700";
                  } else {
                    buttonClass += "border-border bg-muted/50 opacity-50";
                  }
                } else if (isSelected) {
                  buttonClass += "border-christmas-gold bg-christmas-gold/20";
                } else {
                  buttonClass += "border-border bg-card hover:border-christmas-gold/50 hover:bg-christmas-gold/10";
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleAnswer(option.key)}
                    disabled={showResult || isSubmitting}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        isSelected && !showResult ? "bg-christmas-gold text-christmas-dark" : "bg-muted"
                      )}>
                        {option.key}
                      </span>
                      <span className="flex-1 text-foreground">{option.value}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            {!showResult && (
              <Button
                onClick={handleConfirm}
                disabled={!selectedAnswer || isSubmitting}
                className="w-full mt-6 py-6 text-lg bg-christmas-red hover:bg-christmas-red/90"
              >
                {isLastQuestion ? "Finalizar Quiz" : "Confirmar Resposta"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameQuiz;
