import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  Trophy,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  totalPlayers: number;
  completedGames: number;
  averageScore: number;
  averageTime: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    completedGames: 0,
    averageScore: 0,
    averageTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/admin");
    }
  };

  const fetchStats = async () => {
    try {
      const { data: players, error } = await supabase
        .from("christmas_players")
        .select("*");

      if (error) throw error;

      const completed = players?.filter((p) => p.completed_at) || [];
      const avgScore = completed.length > 0
        ? completed.reduce((sum, p) => sum + p.score, 0) / completed.length
        : 0;
      const avgTime = completed.length > 0
        ? completed.reduce((sum, p) => sum + (p.total_time_seconds || 0), 0) / completed.length
        : 0;

      setStats({
        totalPlayers: players?.length || 0,
        completedGames: completed.length,
        averageScore: Math.round(avgScore * 10) / 10,
        averageTime: Math.round(avgTime),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado", description: "Até mais!" });
    navigate("/admin");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/dashboard/questions", icon: FileQuestion, label: "Perguntas" },
    { path: "/admin/dashboard/players", icon: Users, label: "Participantes" },
    { path: "/admin/dashboard/ranking", icon: Trophy, label: "Ranking" },
  ];

  const isOverview = location.pathname === "/admin/dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-christmas text-christmas-red">🎄 Admin</h1>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-christmas text-christmas-red">🎄 Painel Admin</h1>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-christmas-red text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          {isOverview ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-xl p-6 border">
                  <p className="text-sm text-muted-foreground">Total Participantes</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {loading ? "-" : stats.totalPlayers}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border">
                  <p className="text-sm text-muted-foreground">Jogos Completos</p>
                  <p className="text-3xl font-bold text-christmas-green mt-2">
                    {loading ? "-" : stats.completedGames}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border">
                  <p className="text-sm text-muted-foreground">Média de Acertos</p>
                  <p className="text-3xl font-bold text-christmas-gold mt-2">
                    {loading ? "-" : `${stats.averageScore}/15`}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border">
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-3xl font-bold text-christmas-red mt-2">
                    {loading ? "-" : `${Math.floor(stats.averageTime / 60)}m ${stats.averageTime % 60}s`}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/admin/dashboard/questions">
                  <div className="bg-card rounded-xl p-6 border hover:border-christmas-red transition-colors cursor-pointer">
                    <FileQuestion className="w-8 h-8 text-christmas-red mb-3" />
                    <p className="font-medium">Gerenciar Perguntas</p>
                    <p className="text-sm text-muted-foreground">Adicionar ou editar perguntas do quiz</p>
                  </div>
                </Link>
                <Link to="/admin/dashboard/players">
                  <div className="bg-card rounded-xl p-6 border hover:border-christmas-green transition-colors cursor-pointer">
                    <Users className="w-8 h-8 text-christmas-green mb-3" />
                    <p className="font-medium">Ver Participantes</p>
                    <p className="text-sm text-muted-foreground">Lista de todos os jogadores</p>
                  </div>
                </Link>
                <Link to="/admin/dashboard/ranking">
                  <div className="bg-card rounded-xl p-6 border hover:border-christmas-gold transition-colors cursor-pointer">
                    <Trophy className="w-8 h-8 text-christmas-gold mb-3" />
                    <p className="font-medium">Ver Ranking</p>
                    <p className="text-sm text-muted-foreground">Classificação dos jogadores</p>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;