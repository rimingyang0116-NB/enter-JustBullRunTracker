import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, MapPin, Flame } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { zhCN } from "date-fns/locale";

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

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalDistance: 0, totalDays: 0, weeklyDistance: 0 });
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchCurrentPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchStats() {
    const startOfW = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfW = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: logs, error } = await supabase
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
    const { data, error } = await supabase
      .from('running_plans')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .maybeSingle();

    if (data) {
      setCurrentPlan(data as Plan);
    }
    setLoading(false);
  }

  const progress = currentPlan ? Math.min((stats.weeklyDistance / currentPlan.target_distance) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter">你好, {profile?.full_name || '跑友'}!</h1>
          <p className="text-muted-foreground text-sm">今天也是充满活力的一天</p>
        </div>
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="text-primary" />
          )}
        </div>
      </header>

      {/* Weekly Plan Card */}
      <Card className="bg-primary text-white border-none shadow-glow overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Flame size={80} strokeWidth={3} />
        </div>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} />
            本周计划: {currentPlan?.title || '暂无计划'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-4xl font-black italic">{stats.weeklyDistance.toFixed(1)}</span>
              <span className="text-sm font-medium ml-1 opacity-80">/ {currentPlan?.target_distance || 0} KM</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-md">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-white/20" indicatorClassName="bg-white" />
          <p className="text-xs opacity-80">
            {currentPlan ? `${format(new Date(currentPlan.start_date), 'MM/dd')} - ${format(new Date(currentPlan.end_date), 'MM/dd')}` : '请联系教练发布计划'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-elegant">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <MapPin className="text-primary" size={20} />
            </div>
            <span className="text-2xl font-black italic">{stats.totalDistance.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-medium">总公里数</span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-elegant">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Trophy className="text-primary" size={20} />
            </div>
            <span className="text-2xl font-black italic">{stats.totalDays}</span>
            <span className="text-xs text-muted-foreground font-medium">打卡天数</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold italic tracking-tight">最近动态</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border/50">
              <div className="w-10 h-10 bg-secondary rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold italic">5.2 KM</div>
                <div className="text-[10px] text-muted-foreground">2小时前</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { User } from "lucide-react";
