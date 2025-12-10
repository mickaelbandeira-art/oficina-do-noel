import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Christmas Game Pages
const GameHome = lazy(() => import("./pages/christmas/GameHome"));
const GameRegister = lazy(() => import("./pages/christmas/GameRegister"));
const GameQuiz = lazy(() => import("./pages/christmas/GameQuiz"));
const GameResult = lazy(() => import("./pages/christmas/GameResult"));
const GameRanking = lazy(() => import("./pages/christmas/GameRanking"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminQuestions = lazy(() => import("./pages/admin/AdminQuestions"));
const AdminPlayers = lazy(() => import("./pages/admin/AdminPlayers"));
const AdminRanking = lazy(() => import("./pages/admin/AdminRanking"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(220,30%,8%)] to-[hsl(142,72%,29%)]">
    <div className="text-center text-white">
      <div className="animate-spin w-12 h-12 border-4 border-[hsl(43,96%,56%)] border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-xl">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;