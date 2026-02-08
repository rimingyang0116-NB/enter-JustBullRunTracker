import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, MapPin, Flame, TrendingUp, ChevronRight, User, ShieldCheck } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Stats {
  totalDistance: number;
  totalDays: number;
  weeklyDistance: number;
}

interface Plan {
  id: string;
  title: string;
  target_distance: number;
  start_date: string;
  end_date: string;
}

interface RecentLog {
  id: string;
  distance: number;
  log_date: string;
  feeling: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalDistance: 0, totalDays: 0, weeklyDistance: 0 });
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchCurrentPlan();
      fetchRecentLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchStats() {
    const startOfW = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfW = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: logs } = await supabase
      .from('running_logs')
      .select('distance, log_date')
      .eq('user_id', user?.id);

    if (logs) {
      const totalDistance = logs.reduce((acc, log) => acc + Number(log.distance), 0);
      const totalDays = new Set(logs.map(log => log.log_date)).size;
      
      const weeklyDistance = logs
        .filter(log => {
          const date = new Date(log.log_date);
          return date >= startOfW && date <= endOfW;
        })
        .reduce((acc, log) => acc + Number(log.distance), 0);

      setStats({ totalDistance, totalDays, weeklyDistance });
    }
  }

  async function fetchCurrentPlan() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('running_plans')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCurrentPlan(data as Plan);
    }
    setLoading(false);
  }

  async function fetchRecentLogs() {
    const { data } = await supabase
      .from('running_logs')
      .select(`
        id,
        distance,
        log_date,
        feeling,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentLogs(data as unknown as RecentLog[]);
    }
  }

  const progress = currentPlan ? Math.min((stats.weeklyDistance / currentPlan.target_distance) * 100, 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
      />
    </div>;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      <header className="flex items-center justify-between">
        <motion.div variants={item}>
          <h1 className="text-3xl font-black italic tracking-tighter text-foreground">
            你好, <span className="text-primary">{profile?.full_name || '跑友'}</span>!
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={14} className="text-primary" />
            今天也是充满活力的一天
          </p>
        </motion.div>
        <motion.div variants={item} className="flex items-center gap-3">
          {profile?.role === 'coach' && (
            <Link to="/coach">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 flex items-center gap-2"
              >
                <ShieldCheck size={18} fill="currentColor" />
                <span className="text-[10px] font-black italic uppercase">Coach</span>
              </motion.div>
            </Link>
          )}
          <div className="relative">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/10 shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="text-primary" size={28} />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <Flame size={10} className="text-white" fill="currentColor" />
            </div>
          </div>
        </motion.div>
      </header>

      {/* Weekly Plan Card */}
      <motion.div variants={item}>
        <Card className="bg-primary text-white border-none shadow-premium overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Flame size={120} strokeWidth={3} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <Calendar size={16} />
              WEEKLY TARGET
            </CardTitle>
            <h2 className="text-2xl font-black italic tracking-tight mt-1">
              {currentPlan?.title || '暂无训练计划'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-5xl font-black italic tracking-tighter">{stats.weeklyDistance.toFixed(1)}</span>
                <span className="text-lg font-bold ml-2 opacity-70 italic">/ {currentPlan?.target_distance || 0} KM</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black italic">{progress.toFixed(0)}%</span>
                <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Completed</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-3 bg-white/20" indicatorClassName="bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                <span>Start: {currentPlan ? format(new Date(currentPlan.start_date), 'MM/dd') : '--'}</span>
                <span>End: {currentPlan ? format(new Date(currentPlan.end_date), 'MM/dd') : '--'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-card/50 backdrop-blur-sm border border-border/50">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
              <MapPin className="text-primary" size={24} />
            </div>
            <span className="text-3xl font-black italic tracking-tighter">{stats.totalDistance.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total KM</span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-card/50 backdrop-blur-sm border border-border/50">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
              <Trophy className="text-primary" size={24} />
            </div>
            <span className="text-3xl font-black italic tracking-tighter">{stats.totalDays}</span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total Days</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.section variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black italic tracking-tight uppercase">跑友动态</h2>
          <Link to="/leaderboard" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            查看排行 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <motion.div 
                key={log.id} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-white dark:bg-card/50 rounded-2xl shadow-sm border border-border/50 group transition-all"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex-shrink-0 overflow-hidden border border-primary/5">
                  {log.profiles?.avatar_url ? (
                    <img src={log.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                      {log.profiles?.full_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black italic truncate">{log.profiles?.full_name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(log.log_date), 'MM/dd')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 italic">
                    {log.feeling || "今天跑得很牛！🐂"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black italic text-primary tracking-tighter">{log.distance.toFixed(1)}</div>
                  <div className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">KM</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
              <p className="text-sm text-muted-foreground font-medium">暂无动态，快去打卡吧！</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
