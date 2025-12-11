import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { Gift, Sparkles, Trophy } from "lucide-react";
import quizNatalinoLogo from "@/assets/quiz-natalino-logo.png";
import sleighImage from "@/assets/sleigh-flying.png";

const GameHome = () => {
  const navigate = useNavigate();

  return (
    <ChristmasLayout>
      {/* Flying Sleigh */}
      <div className="fixed top-16 md:top-24 left-0 w-full pointer-events-none z-0 overflow-hidden">
        <img 
          src={sleighImage} 
          alt="Trenó do Papai Noel" 
          className="h-28 md:h-44 lg:h-56 animate-fly-across"
        />
      </div>
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-8 max-w-2xl mx-auto animate-scale-in">
          {/* Logo Principal */}
          <div className="space-y-6">
            <div className="flex justify-center items-center">
              <img 
                src={quizNatalinoLogo} 
                alt="Quiz Natalino AeC" 
                className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto drop-shadow-2xl"
              />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-christmas text-christmas-gold text-christmas-shadow">
              Chegou a hora de provar quem é o verdadeiro especialista do Natal!
            </h2>
          </div>

          {/* Story */}
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-4 text-christmas-red">
            <Gift className="w-16 h-16 mx-auto text-christmas-red animate-pulse-glow" />
            <p className="text-lg md:text-xl leading-relaxed">
              Os duendes da oficina do Papai Noel precisam da sua ajuda! 
              Um misterioso encantamento embaralhou todos os conhecimentos sobre o Natal.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              Responda <strong className="text-christmas-gold">10 perguntas</strong> sobre as tradições natalinas 
              e ajude a restaurar a magia da oficina antes da noite de Natal!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/christmas/register")}
              className="bg-christmas-red hover:bg-christmas-red/90 text-white text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Começar Aventura
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/christmas/ranking")}
              className="border-christmas-gold text-christmas-gold hover:bg-christmas-gold hover:text-christmas-dark text-xl px-8 py-6 rounded-full transition-all duration-300"
            >
              <Trophy className="mr-2 h-6 w-6" />
              Ver Ranking
            </Button>
          </div>

          {/* Footer */}
          <p className="text-white/60 text-sm">
            🎅 Boa sorte e Feliz Natal! 🎅
          </p>
          <p className="text-white/40 text-xs mt-2">
            Desenvolvido por Mickael Bandeira | Analista de Conteúdo
          </p>
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameHome;