import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Christmas Game Pages
import GameHome from "./pages/christmas/GameHome";
import GameRegister from "./pages/christmas/GameRegister";
import GameQuiz from "./pages/christmas/GameQuiz";
import GameResult from "./pages/christmas/GameResult";
import GameRanking from "./pages/christmas/GameRanking";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminRanking from "./pages/admin/AdminRanking";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to Christmas game */}
          <Route path="/" element={<Navigate to="/christmas" replace />} />
          
          {/* Christmas Game Routes */}
          <Route path="/christmas" element={<GameHome />} />
          <Route path="/christmas/register" element={<GameRegister />} />
          <Route path="/christmas/quiz" element={<GameQuiz />} />
          <Route path="/christmas/result" element={<GameResult />} />
          <Route path="/christmas/ranking" element={<GameRanking />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="ranking" element={<AdminRanking />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;