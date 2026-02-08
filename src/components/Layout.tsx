import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, PlusCircle, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { icon: Home, label: "首页", path: "/" },
    { icon: Trophy, label: "排行榜", path: "/leaderboard" },
    { icon: PlusCircle, label: "打卡", path: "/check-in", primary: true },
    { icon: User, label: "我的", path: "/profile" },
  ];

  if (profile?.role === 'coach') {
    navItems.push({ icon: Settings, label: "教练", path: "/coach" });
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container max-w-md mx-auto px-4 pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-2 flex justify-around items-center z-50 shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                item.primary && "relative -top-4"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all",
                item.primary && "bg-primary text-white shadow-glow scale-125",
                isActive && !item.primary && "bg-primary/10"
              )}>
                <Icon size={item.primary ? 28 : 24} />
              </div>
              {!item.primary && <span className="text-xs font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
