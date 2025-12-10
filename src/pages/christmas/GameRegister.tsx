import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { useChristmasGame } from "@/hooks/useChristmasGame";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";

const GameRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerPlayer } = useChristmasGame();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    matricula: "",
  });

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
      
      // Store player data in sessionStorage
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
                <Label htmlFor="matricula" className="text-foreground">Matrícula</Label>
                <Input
                  id="matricula"
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
            </form>
          </div>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameRegister;