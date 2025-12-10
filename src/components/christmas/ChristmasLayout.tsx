import { ReactNode } from "react";
import { Snowfall } from "./Snowfall";
import { ChristmasDecorations } from "./ChristmasDecorations";

interface ChristmasLayoutProps {
  children: ReactNode;
  showDecorations?: boolean;
}

export const ChristmasLayout = ({ children, showDecorations = true }: ChristmasLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-christmas-dark via-secondary to-christmas-dark relative overflow-hidden">
      <Snowfall />
      {showDecorations && <ChristmasDecorations />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};