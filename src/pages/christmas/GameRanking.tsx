import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { useChristmasGame, Player } from "@/hooks/useChristmasGame";
import { ArrowLeft, Trophy, Medal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const GameRanking = () => {
  const navigate = useNavigate();
  const { getRanking } = useChristmasGame();
  const [ranking, setRanking] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await getRanking();
        setRanking(data);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-400";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <ChristmasLayout>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/christmas")}
              className="text-white/80 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-scale-in">
            <Trophy className="w-16 h-16 mx-auto text-christmas-gold mb-4" />
            <h1 className="text-4xl font-christmas text-white text-christmas-shadow">
              🏆 Ranking Natalino 🏆
            </h1>
            <p className="text-white/70 mt-2">Os melhores ajudantes do Papai Noel</p>
          </div>

          {/* Ranking List */}
          <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-christmas-gold border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground mt-4">Carregando ranking...</p>
              </div>
            ) : ranking.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum participante ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-semibold text-muted-foreground">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Nome</div>
                  <div className="col-span-3 text-center">Acertos</div>
                  <div className="col-span-3 text-center">Tempo</div>
                </div>

                {/* Players */}
                {ranking.map((player, index) => (
                  <div
                    key={player.id}
                    className={cn(
                      "grid grid-cols-12 gap-2 p-4 items-center transition-colors",
                      index < 3 && "bg-christmas-gold/5"
                    )}
                  >
                    <div className="col-span-1">
                      {index < 3 ? (
                        <Medal className={cn("w-6 h-6", getMedalColor(index))} />
                      ) : (
                        <span className="text-muted-foreground font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="col-span-5">
                      <p className={cn(
                        "font-medium truncate",
                        index < 3 ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {player.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {player.matricula}
                      </p>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className={cn(
                        "font-bold",
                        index === 0 && "text-christmas-gold",
                        index === 1 && "text-gray-500",
                        index === 2 && "text-amber-600"
                      )}>
                        {player.score}/10
                      </span>
                    </div>
                    <div className="col-span-3 text-center flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(player.total_time_seconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Play Button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate("/christmas/register")}
              className="bg-christmas-red hover:bg-christmas-red/90 text-white px-8 py-6 rounded-full text-lg"
            >
              🎄 Participar do Quiz
            </Button>
          </div>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameRanking;