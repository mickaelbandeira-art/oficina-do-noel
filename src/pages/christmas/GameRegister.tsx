import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { useChristmasGame, Player } from "@/hooks/useChristmasGame";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Search, Trophy, Play } from "lucide-react";

const GameRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerPlayer, loginPlayer } = useChristmasGame();
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(true);
  const [existingPlayer, setExistingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    matricula: "",
  });

  const handleSearch = async () => {
    if (!formData.matricula.trim()) {
      toast({
        title: "Matrícula obrigatória",
        description: "Digite sua matrícula para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const player = await loginPlayer(formData.matricula.trim());
      
      if (player) {
        setExistingPlayer(player);
        if (player.completed_at) {
          // Player already completed the quiz
          toast({
            title: "Você já participou! 🎄",
            description: "Confira seu resultado abaixo.",
          });
        } else {
          // Player started but didn't finish
          toast({
            title: `Bem-vindo de volta, ${player.name}!`,
            description: "Continue de onde parou.",
          });
        }
      } else {
        // New player - show full form
        setSearchMode(false);
        toast({
          title: "Matrícula não encontrada",
          description: "Preencha seus dados para se cadastrar.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGame = () => {
    if (existingPlayer) {
      sessionStorage.setItem("christmasPlayer", JSON.stringify(existingPlayer));
      navigate("/christmas/quiz");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.matricula) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const player = await registerPlayer(formData.name, formData.email, formData.matricula);
      
      sessionStorage.setItem("christmasPlayer", JSON.stringify(player));
      
      toast({
        title: "Bem-vindo(a)! 🎄",
        description: "Cadastro realizado com sucesso. Boa sorte!",
      });
      
      navigate("/christmas/quiz");
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ChristmasLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/christmas")}
            className="text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8 space-y-6">
            {/* Player already completed */}
            {existingPlayer?.completed_at ? (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-christmas text-christmas-gold">
                  🎄 Olá, {existingPlayer.name}!
                </h1>
                <p className="text-muted-foreground">
                  Você já participou do quiz natalino.
                </p>
                
                <div className="bg-background/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-christmas-gold">
                    <Trophy className="h-6 w-6" />
                    <span className="text-2xl font-bold">Seu Resultado</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Pontuação</p>
                      <p className="text-3xl font-bold text-christmas-green">
                        {existingPlayer.score}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo</p>
                      <p className="text-3xl font-bold text-christmas-red">
                        {existingPlayer.total_time_seconds 
                          ? formatTime(existingPlayer.total_time_seconds) 
                          : "--:--"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/christmas/ranking")}
                  className="w-full bg-christmas-gold hover:bg-christmas-gold/90 text-christmas-dark py-6 text-lg rounded-xl"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Ver Ranking Completo
                </Button>
              </div>
            ) : existingPlayer ? (
              /* Player exists but didn't complete */
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-christmas text-christmas-gold">
                  👋 Bem-vindo de volta!
                </h1>
                <p className="text-xl text-foreground">{existingPlayer.name}</p>
                <p className="text-muted-foreground">
                  Você ainda não finalizou o quiz. Continue de onde parou!
                </p>
                
                <Button
                  onClick={handleContinueGame}
                  className="w-full bg-christmas-green hover:bg-christmas-green/90 text-white py-6 text-lg rounded-xl"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Continuar Jogo
                </Button>
              </div>
            ) : searchMode ? (
              /* Search by matrícula */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-christmas text-christmas-gold">
                    🎅 Entrar no Jogo
                  </h1>
                  <p className="text-muted-foreground">
                    Digite sua matrícula para continuar
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="text-foreground">Matrícula</Label>
                    <Input
                      id="matricula"
                      type="text"
                      placeholder="Digite sua matrícula"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      className="bg-background/50"
                      disabled={loading}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="w-full bg-christmas-red hover:bg-christmas-red/90 text-white py-6 text-lg rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      "Buscando..."
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Buscar
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Primeira vez?{" "}
                    <button
                      type="button"
                      onClick={() => setSearchMode(false)}
                      className="text-christmas-gold hover:underline"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* Full registration form */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-christmas text-christmas-gold">
                    📝 Cadastro do Jogador
                  </h1>
                  <p className="text-muted-foreground">
                    Preencha seus dados para participar do desafio natalino
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matricula-form" className="text-foreground">Matrícula</Label>
                    <Input
                      id="matricula-form"
                      type="text"
                      placeholder="Digite sua matrícula"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      className="bg-background/50"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-christmas-red hover:bg-christmas-red/90 text-white py-6 text-lg rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      "Cadastrando..."
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Entrar no Jogo
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Já tem cadastro?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchMode(true);
                        setFormData({ name: "", email: "", matricula: "" });
                      }}
                      className="text-christmas-gold hover:underline"
                    >
                      Entre com sua matrícula
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameRegister;
