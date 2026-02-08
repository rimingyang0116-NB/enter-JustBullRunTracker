import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, PlusCircle, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

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
    navItems.splice(3, 0, { icon: Settings, label: "教练", path: "/coach" });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="container max-w-md mx-auto px-4 pt-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-6 py-3 flex justify-around items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70",
                item.primary && "relative -top-6"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-300 relative",
                item.primary && "bg-primary text-white shadow-premium scale-125 hover:scale-135 active:scale-110",
                isActive && !item.primary && "bg-primary/10"
              )}>
                <Icon size={item.primary ? 28 : 22} strokeWidth={isActive ? 2.5 : 2} />
                {item.path === '/coach' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                )}
              </div>
              {!item.primary && (
                <span className={cn(
                  "text-[10px] font-bold tracking-tight transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
