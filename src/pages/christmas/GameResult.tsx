import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { useChristmasGame, Player, MAX_ATTEMPTS } from "@/hooks/useChristmasGame";
import { Trophy, Home, Award, Clock, RotateCcw, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { clearQuestionCache } from "@/services/groqService";

const GameResult = () => {
  const navigate = useNavigate();
  const { getRanking } = useChristmasGame();
  const [ranking, setRanking] = useState<Player[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get result from session
  const result = JSON.parse(sessionStorage.getItem("christmasResult") || "null");
  const player = JSON.parse(sessionStorage.getItem("christmasPlayer") || "null");

  useEffect(() => {
    if (!result || !player) {
      navigate("/christmas");
      return;
    }

    const fetchRanking = async () => {
      try {
        const data = await getRanking();
        setRanking(data);
        const rank = data.findIndex((p) => p.id === player.id);
        setPlayerRank(rank !== -1 ? rank + 1 : null);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      }
    };

    fetchRanking();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceMessage = () => {
    const percentage = (result.score / result.totalQuestions) * 100;
    if (percentage === 100) return "🎉 Perfeito! Você é um verdadeiro especialista em Natal!";
    if (percentage >= 80) return "🌟 Excelente! Os duendes estão orgulhosos!";
    if (percentage >= 60) return "👍 Muito bem! A magia do Natal está com você!";
    if (percentage >= 40) return "🎄 Bom esforço! Continue aprendendo sobre o Natal!";
    return "❄️ O Natal é cheio de surpresas para descobrir!";
  };

  if (!result) return null;

  return (
    <ChristmasLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg animate-scale-in">
          {/* Trophy */}
          <div className="text-center mb-6">
            <Trophy className="w-20 h-20 mx-auto text-christmas-gold animate-bounce-slow" />
          </div>

          {/* Result Card */}
          <div className="glass-card rounded-2xl p-8 space-y-6 text-center">
            <h1 className="text-4xl font-christmas text-christmas-gold">
              🎄 Resultado Final 🎄
            </h1>

            {/* Score */}
            <div className="py-6">
              <div className="text-6xl font-bold text-christmas-red mb-2">
                {result.score}/{result.totalQuestions}
              </div>
              <p className="text-lg text-muted-foreground">
                {((result.score / result.totalQuestions) * 100).toFixed(0)}% de acertos
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <Clock className="w-8 h-8 mx-auto text-christmas-green mb-2" />
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-xl font-bold text-foreground">
                  {formatTime(result.totalTime)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <Award className="w-8 h-8 mx-auto text-christmas-gold mb-2" />
                <p className="text-sm text-muted-foreground">Sua Posição</p>
                <p className="text-xl font-bold text-foreground">
                  {playerRank ? `${playerRank}º lugar` : "Calculando..."}
                </p>
              </div>
            </div>

            {/* Message */}
            <p className="text-lg text-foreground font-medium">
              {getPerformanceMessage()}
            </p>

            {/* Detailed Answers Accordion */}
            {result.questions && result.answers && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full mb-2 text-christmas-gold hover:text-christmas-gold/80 hover:bg-christmas-gold/10"
                >
                  {showDetails ? "Ocultar Respostas" : "Ver Correção da Prova"}
                  {showDetails ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>

                {showDetails && (
                  <div className="space-y-4 text-left max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-4 fade-in duration-500">
                    {result.questions.map((q: any, idx: number) => {
                      const userAnswer = result.answers[idx];
                      const isCorrect = userAnswer === q.correct_answer;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${isCorrect
                              ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                              : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="font-medium text-foreground">{idx + 1}. {q.question}</p>

                              <div className="text-sm space-y-1">
                                <p className={isCorrect ? "text-green-500 font-semibold" : "text-red-500 line-through opacity-70"}>
                                  Sua resposta: {userAnswer}) {q[`option_${userAnswer?.toLowerCase()}`]}
                                </p>
                                {!isCorrect && (
                                  <p className="text-green-500 font-semibold">
                                    Correta: {q.correct_answer}) {q[`option_${q.correct_answer?.toLowerCase()}`]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => navigate("/christmas/ranking")}
                className="flex-1 bg-christmas-gold hover:bg-christmas-gold/90 text-christmas-dark py-6"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Ver Ranking Completo
              </Button>

              {/* Play Again Button */}
              {player && (player.quiz_attempts || (player.completed_at ? 1 : 0)) < MAX_ATTEMPTS && (
                <Button
                  onClick={() => {
                    clearQuestionCache();
                    navigate("/christmas/quiz");
                  }}
                  className="flex-1 bg-christmas-green hover:bg-christmas-green/90 text-white py-6"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Jogar Novamente
                </Button>
              )}
              <Button
                onClick={() => {
                  sessionStorage.removeItem("christmasPlayer");
                  sessionStorage.removeItem("christmasResult");
                  navigate("/christmas");
                }}
                variant="outline"
                className="flex-1 py-6"
              >
                <Home className="mr-2 h-5 w-5" />
                Voltar ao Início
              </Button>
            </div>
          </div>

          {/* Share */}
          <p className="text-center text-white/60 text-sm mt-6">
            🎅 Feliz Natal e um próspero Ano Novo! 🎅
          </p>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameResult;