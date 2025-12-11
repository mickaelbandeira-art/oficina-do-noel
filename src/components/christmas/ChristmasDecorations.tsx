import { forwardRef } from "react";
import { Gift, Star, TreePine } from "lucide-react";

export const ChristmasDecorations = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref}>
      {/* Floating decorations */}
      <div className="fixed top-20 left-10 text-christmas-gold animate-bounce-slow opacity-60 z-0">
        <Star className="w-8 h-8 fill-current" />
      </div>
      <div className="fixed top-40 right-16 text-christmas-red animate-bounce-slow opacity-60 z-0" style={{ animationDelay: "0.5s" }}>
        <Gift className="w-10 h-10" />
      </div>
      <div className="fixed bottom-32 left-20 text-christmas-green animate-bounce-slow opacity-60 z-0" style={{ animationDelay: "1s" }}>
        <TreePine className="w-12 h-12" />
      </div>
      <div className="fixed bottom-20 right-10 text-christmas-gold animate-twinkle opacity-60 z-0">
        <Star className="w-6 h-6 fill-current" />
      </div>
      <div className="fixed top-1/3 right-8 text-christmas-gold animate-twinkle opacity-40 z-0" style={{ animationDelay: "1.5s" }}>
        <Star className="w-4 h-4 fill-current" />
      </div>
    </div>
  );
});

ChristmasDecorations.displayName = "ChristmasDecorations";
