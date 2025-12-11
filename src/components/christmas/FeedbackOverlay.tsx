import { useEffect, useState } from "react";

// Import correct images
import correct1 from "@/assets/feedback/correct-1.png";
import correct2 from "@/assets/feedback/correct-2.png";
import correct3 from "@/assets/feedback/correct-3.png";

// Import incorrect images
import incorrect1 from "@/assets/feedback/incorrect-1.png";
import incorrect2 from "@/assets/feedback/incorrect-2.png";
import incorrect3 from "@/assets/feedback/incorrect-3.png";

const correctImages = [correct1, correct2, correct3];
const incorrectImages = [incorrect1, incorrect2, incorrect3];

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
}

export const FeedbackOverlay = ({ isVisible, isCorrect }: FeedbackOverlayProps) => {
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (isVisible) {
      const images = isCorrect ? correctImages : incorrectImages;
      const randomIndex = Math.floor(Math.random() * images.length);
      setSelectedImage(images[randomIndex]);
    }
  }, [isVisible, isCorrect]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div 
        className={`
          flex flex-col items-center gap-4 p-6 rounded-2xl
          transform transition-all duration-300
          animate-scale-in
          ${isCorrect 
            ? "bg-green-500/20 border-4 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]" 
            : "bg-red-500/20 border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
          }
        `}
      >
        <img 
          src={selectedImage} 
          alt={isCorrect ? "Resposta correta" : "Resposta incorreta"}
          className="w-48 h-48 md:w-64 md:h-64 object-contain"
        />
        <p className={`
          text-2xl md:text-3xl font-bold font-christmas
          ${isCorrect ? "text-green-400" : "text-red-400"}
        `}>
          {isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta"}
        </p>
      </div>
    </div>
  );
};
