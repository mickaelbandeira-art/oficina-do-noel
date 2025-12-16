import { useEffect, useState, useRef } from "react";

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

// Sound effects using Web Audio API
const playCorrectSound = () => {
  try {
    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(audioCtx.destination);

    // Play ascending notes (C5 → E5 → G5) for happy sound
    [523, 659, 784].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gainNode);
      osc.start(audioCtx.currentTime + i * 0.12);
      osc.stop(audioCtx.currentTime + i * 0.12 + 0.15);
    });
  } catch (e) {
    console.log('Audio not supported');
  }
};

const playIncorrectSound = () => {
  try {
    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(audioCtx.destination);

    // Play descending notes for sad sound
    [300, 250].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gainNode);
      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.2);
    });
  } catch (e) {
    console.log('Audio not supported');
  }
};

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  correctAnswerText?: string;
}

export const FeedbackOverlay = ({ isVisible, isCorrect, correctAnswerText }: FeedbackOverlayProps) => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const hasPlayedSound = useRef(false);

  useEffect(() => {
    if (isVisible) {
      // Pick image only when becoming visible
      const images = isCorrect ? correctImages : incorrectImages;
      const randomIndex = Math.floor(Math.random() * images.length);
      setSelectedImage(images[randomIndex]);

      // Play sound effect
      if (!hasPlayedSound.current) {
        hasPlayedSound.current = true;
        if (isCorrect) {
          playCorrectSound();
        } else {
          playIncorrectSound();
        }
      }
    } else {
      hasPlayedSound.current = false;
      // Optional: Clear image when hiding to ensure fresh start, 
      // though unmounting handles this if parent conditionally renders.
    }
  }, [isVisible, isCorrect]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
      <div
        className={`
          flex flex-col items-center gap-6 p-8 rounded-2xl
          transform transition-all duration-300
          animate-scale-in max-w-md w-full mx-4 text-center
          ${isCorrect
            ? "bg-green-500/20 border-4 border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.6)]"
            : "bg-red-500/20 border-4 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.6)]"
          }
        `}
      >
        {selectedImage && (
          <img
            key={selectedImage} // Force re-render if image changes
            src={selectedImage}
            alt={isCorrect ? "Resposta correta" : "Resposta incorreta"}
            className="w-52 h-52 md:w-64 md:h-64 object-contain"
          />
        )}

        <div className="space-y-4">
          <p
            className={`
              text-3xl md:text-4xl font-bold font-christmas
              px-6 py-3 rounded-xl
              ${isCorrect
                ? "bg-green-600/90 text-white"
                : "bg-red-600/90 text-white"
              }
            `}
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            {isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta"}
          </p>

          {!isCorrect && correctAnswerText && (
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 animate-fade-in delay-300">
              <p className="text-gray-300 text-sm mb-1 uppercase tracking-wider">A resposta correta é:</p>
              <p className="text-xl md:text-2xl font-bold text-white text-shadow-glow">
                {correctAnswerText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
