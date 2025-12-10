import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  email: string;
  matricula: string;
  score: number;
  total_time_seconds: number | null;
  completed_at: string | null;
}

const AdminRanking = () => {
  const [ranking, setRanking] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase
        .from("christmas_players")
        .select("*")
        .not("completed_at", "is", null)
        .order("score", { ascending: false })
        .order("total_time_seconds", { ascending: true });

      if (error) throw error;
      setRanking(data || []);
    } catch (error) {
      console.error("Error fetching ranking:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getRowBg = (position: number) => {
    switch (position) {
      case 0:
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case 1:
        return "bg-gray-50 dark:bg-gray-800/20";
      case 2:
        return "bg-amber-50 dark:bg-amber-900/20";
      default:
        return "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-christmas-gold" />
        <h2 className="text-2xl font-bold">Ranking do Quiz</h2>
      </div>

      {/* Podium for top 3 */}
      {ranking.length >= 3 && (
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-4 border-2 border-gray-300">
              <Medal className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="font-bold truncate max-w-[120px]">{ranking[1].name}</p>
              <p className="text-sm text-muted-foreground">{ranking[1].score}/10</p>
              <p className="text-xs text-muted-foreground">{formatTime(ranking[1].total_time_seconds)}</p>
            </div>
            <div className="bg-gray-300 h-16 w-24 rounded-t-lg mt-2 flex items-center justify-center text-2xl font-bold text-white">
              2º
            </div>
          </div>

          {/* 1st place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-6 border-2 border-yellow-400 shadow-lg">
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-2" />
              <p className="font-bold text-lg truncate max-w-[140px]">{ranking[0].name}</p>
              <p className="text-christmas-gold font-bold">{ranking[0].score}/10</p>
              <p className="text-sm text-muted-foreground">{formatTime(ranking[0].total_time_seconds)}</p>
            </div>
            <div className="bg-yellow-400 h-24 w-28 rounded-t-lg mt-2 flex items-center justify-center text-3xl font-bold text-white">
              1º
            </div>
          </div>

          {/* 3rd place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-4 border-2 border-amber-600">
              <Medal className="w-12 h-12 mx-auto text-amber-600 mb-2" />
              <p className="font-bold truncate max-w-[120px]">{ranking[2].name}</p>
              <p className="text-sm text-muted-foreground">{ranking[2].score}/10</p>
              <p className="text-xs text-muted-foreground">{formatTime(ranking[2].total_time_seconds)}</p>
            </div>
            <div className="bg-amber-600 h-12 w-24 rounded-t-lg mt-2 flex items-center justify-center text-2xl font-bold text-white">
              3º
            </div>
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold w-16">Pos.</th>
                <th className="text-left p-4 text-sm font-semibold">Participante</th>
                <th className="text-center p-4 text-sm font-semibold">Acertos</th>
                <th className="text-center p-4 text-sm font-semibold">Tempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Carregando ranking...
                  </td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum participante completou o quiz ainda
                  </td>
                </tr>
              ) : (
                ranking.map((player, index) => (
                  <tr key={player.id} className={cn("hover:bg-muted/30", getRowBg(index))}>
                    <td className="p-4">
                      {index < 3 ? (
                        <Medal className={cn("w-6 h-6", getMedalColor(index))} />
                      ) : (
                        <span className="text-muted-foreground font-medium pl-1">
                          {index + 1}º
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className={cn("font-medium", index < 3 && "font-bold")}>
                          {player.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{player.matricula}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "font-bold text-lg",
                        index === 0 && "text-christmas-gold",
                        player.score === 10 && "text-christmas-green"
                      )}>
                        {player.score}/10
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatTime(player.total_time_seconds)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRanking;