import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";

interface Player {
  id: string;
  name: string;
  email: string;
  matricula: string;
  score: number;
  total_time_seconds: number | null;
  completed_at: string | null;
  created_at: string;
}

const AdminPlayers = () => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("christmas_players")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este participante?")) return;

    try {
      const { error } = await supabase
        .from("christmas_players")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Participante excluído!" });
      fetchPlayers();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir participante",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Email", "Matrícula", "Acertos", "Tempo (s)", "Status", "Data"];
    const rows = filteredPlayers.map((p) => [
      p.name,
      p.email,
      p.matricula,
      p.score,
      p.total_time_seconds || "",
      p.completed_at ? "Completo" : "Pendente",
      new Date(p.created_at).toLocaleDateString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "participantes_natal.csv";
    link.click();
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Participantes</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{players.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Completos</p>
          <p className="text-2xl font-bold text-christmas-green">
            {players.filter((p) => p.completed_at).length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-christmas-gold">
            {players.filter((p) => !p.completed_at).length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
          <p className="text-2xl font-bold">
            {players.length > 0
              ? Math.round((players.filter((p) => p.completed_at).length / players.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Nome</th>
                <th className="text-left p-4 text-sm font-semibold">Matrícula</th>
                <th className="text-center p-4 text-sm font-semibold">Acertos</th>
                <th className="text-center p-4 text-sm font-semibold">Tempo</th>
                <th className="text-center p-4 text-sm font-semibold">Status</th>
                <th className="text-right p-4 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum participante encontrado
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">{player.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{player.matricula}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold">{player.score}/10</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatTime(player.total_time_seconds)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {player.completed_at ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <XCircle className="w-4 h-4" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(player.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default AdminPlayers;