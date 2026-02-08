import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

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

    // Fetch all logs for the month to calculate everything
    const { data, error } = await supabase
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
    <div className="space-y-3 mt-4">
      {items.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">暂无数据</div>
      ) : (
        items.map((item, index) => (
          <div key={item.user_id} className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border/50">
            <div className="w-8 flex justify-center font-black italic text-lg italic">
              {index === 0 ? <Trophy className="text-yellow-500" size={24} /> : 
               index === 1 ? <Medal className="text-slate-400" size={24} /> :
               index === 2 ? <Medal className="text-amber-600" size={24} /> :
               index + 1}
            </div>
            <Avatar className="w-10 h-10 border-2 border-primary/10">
              <AvatarImage src={item.avatar_url} />
              <AvatarFallback>{item.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 font-bold">{item.full_name}</div>
            <div className="text-right">
              <span className="text-lg font-black italic text-primary">{item.value.toFixed(unit === '天' ? 0 : 1)}</span>
              <span className="text-[10px] font-bold ml-1 text-muted-foreground uppercase">{unit}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black italic tracking-tighter">排行榜</h1>
        <p className="text-muted-foreground text-sm">谁才是真正的 JUST BULL?</p>
      </header>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary p-1 rounded-2xl h-12">
          <TabsTrigger value="daily" className="rounded-xl font-bold">今日里程</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-xl font-bold">本月里程</TabsTrigger>
          <TabsTrigger value="days" className="rounded-xl font-bold">本月天数</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">{renderList(dailyKM, 'KM')}</TabsContent>
        <TabsContent value="monthly">{renderList(monthlyKM, 'KM')}</TabsContent>
        <TabsContent value="days">{renderList(monthlyDays, '天')}</TabsContent>
      </Tabs>
    </div>
  );
}
