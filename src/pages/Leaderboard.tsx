import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardItem {
  user_id: string;
  full_name: string;
  avatar_url: string;
  value: number;
}

interface RunningLog {
  distance: number;
  log_date: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Leaderboard() {
  const [dailyKM, setDailyKM] = useState<LeaderboardItem[]>([]);
  const [monthlyKM, setMonthlyKM] = useState<LeaderboardItem[]>([]);
  const [monthlyDays, setMonthlyDays] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  async function fetchLeaderboards() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const startOfM = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endOfM = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('running_logs')
      .select(`
        distance,
        log_date,
        user_id,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .gte('log_date', startOfM)
      .lte('log_date', endOfM);

    const logs = data as unknown as RunningLog[];

    if (logs) {
      const userMap: Record<string, { name: string, avatar: string, daily: number, monthlyKM: number, monthlyDays: Set<string> }> = {};

      logs.forEach((log) => {
        const uid = log.user_id;
        if (!userMap[uid]) {
          userMap[uid] = {
            name: log.profiles?.full_name || '未知跑友',
            avatar: log.profiles?.avatar_url || '',
            daily: 0,
            monthlyKM: 0,
            monthlyDays: new Set(),
          };
        }

        if (log.log_date === today) {
          userMap[uid].daily += Number(log.distance);
        }
        userMap[uid].monthlyKM += Number(log.distance);
        userMap[uid].monthlyDays.add(log.log_date);
      });

      const daily = Object.entries(userMap)
        .map(([id, data]) => ({ user_id: id, full_name: data.name, avatar_url: data.avatar, value: data.daily }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      const monthly = Object.entries(userMap)
        .map(([id, data]) => ({ user_id: id, full_name: data.name, avatar_url: data.avatar, value: data.monthlyKM }))
        .sort((a, b) => b.value - a.value);

      const days = Object.entries(userMap)
        .map(([id, data]) => ({ user_id: id, full_name: data.name, avatar_url: data.avatar, value: data.monthlyDays.size }))
        .sort((a, b) => b.value - a.value);

      setDailyKM(daily);
      setMonthlyKM(monthly);
      setMonthlyDays(days);
    }
    setLoading(false);
  }

  const renderList = (items: LeaderboardItem[], unit: string) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 mt-6"
    >
      {items.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-[2rem] border-2 border-dashed border-border">
          <p className="text-muted-foreground font-bold italic">暂无数据，快去打卡占领高地！</p>
        </div>
      ) : (
        items.map((item, index) => (
          <motion.div 
            key={item.user_id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 bg-white dark:bg-card/50 rounded-2xl shadow-sm border border-border/50 group hover:border-primary/30 transition-all"
          >
            <div className="w-10 flex justify-center items-center font-black italic text-xl">
              {index === 0 ? <Crown className="text-yellow-500 drop-shadow-sm" size={28} fill="currentColor" /> : 
               index === 1 ? <Medal className="text-slate-400" size={24} /> :
               index === 2 ? <Medal className="text-amber-600" size={24} /> :
               <span className="text-muted-foreground/50 text-sm">{index + 1}</span>}
            </div>
            <Avatar className="w-12 h-12 border-2 border-primary/10 shadow-sm">
              <AvatarImage src={item.avatar_url} />
              <AvatarFallback className="bg-primary/5 text-primary font-black italic">{item.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-black italic truncate text-sm uppercase tracking-tight">{item.full_name}</div>
              {index === 0 && <div className="text-[8px] font-black text-primary uppercase tracking-widest">Current Leader</div>}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black italic text-primary tracking-tighter leading-none">
                {item.value.toFixed(unit === '天' ? 0 : 1)}
              </div>
              <div className="text-[8px] font-black ml-1 text-muted-foreground uppercase tracking-tighter">{unit}</div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">排行榜</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <Star size={12} className="text-primary" fill="currentColor" />
            Who is the real JUST BULL?
          </p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Trophy className="text-primary" size={28} />
        </div>
      </header>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1.5 rounded-2xl h-14 backdrop-blur-sm">
          <TabsTrigger value="daily" className="rounded-xl font-black italic text-xs uppercase tracking-tight data-[state=active]:shadow-sm">今日里程</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-xl font-black italic text-xs uppercase tracking-tight data-[state=active]:shadow-sm">本月里程</TabsTrigger>
          <TabsTrigger value="days" className="rounded-xl font-black italic text-xs uppercase tracking-tight data-[state=active]:shadow-sm">本月天数</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <TabsContent value="daily" key="daily">{renderList(dailyKM, 'KM')}</TabsContent>
          <TabsContent value="monthly" key="monthly">{renderList(monthlyKM, 'KM')}</TabsContent>
          <TabsContent value="days" key="days">{renderList(monthlyDays, '天')}</TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
