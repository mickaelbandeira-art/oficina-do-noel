import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChristmasLayout } from "@/components/christmas/ChristmasLayout";
import { Gift, Sparkles, Trophy } from "lucide-react";
import aecLogo from "@/assets/aec-logo.png";
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
          className="h-20 md:h-32 lg:h-40 animate-fly-across"
        />
      </div>
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-8 max-w-2xl mx-auto animate-scale-in">
          {/* Title */}
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-4 mb-4">
              <img src={aecLogo} alt="AeC Logo" className="h-16 md:h-20" />
            </div>
            <h1 className="text-5xl md:text-7xl font-christmas text-white text-christmas-shadow">
              🎄 Escape AeC
            </h1>
            <h2 className="text-3xl md:text-4xl font-christmas text-christmas-gold text-christmas-shadow">
              O Mistério da Oficina do Papai Noel
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
        </div>
      </div>
    </ChristmasLayout>
  );
};

export default GameHome;