import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Target, Users, ShieldCheck, Plus, ArrowRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { motion } from "framer-motion";

export default function CoachPanel() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("本周训练计划");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

  if (profile?.role !== 'coach') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-xl font-black italic uppercase tracking-tight">权限不足</h2>
        <p className="text-sm text-muted-foreground font-medium">只有教练可以访问此管理后台</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || isNaN(Number(target))) {
      toast({ variant: "destructive", title: "请输入有效的目标公里数" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('running_plans').insert({
      coach_id: user?.id,
      title,
      target_distance: Number(target),
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      toast({ variant: "destructive", title: "发布失败", description: error.message });
    } else {
      toast({ title: "发布成功!", description: "新计划已同步给所有成员。" });
      setTarget("");
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">教练后台</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck size={12} className="text-primary" />
            Coach Management System
          </p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Plus className="text-primary" size={28} />
        </div>
      </header>

      <Card className="border-none shadow-premium bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-primary w-full" />
        <CardHeader>
          <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
            <Target className="text-primary" size={20} fill="currentColor" />
            发布新计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">计划名称</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 本周基础耐力训练"
                className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">目标公里数 (KM)</Label>
              <div className="relative">
                <Input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="例如: 30"
                  className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black italic text-muted-foreground/50">KM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">开始日期</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">结束日期</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-black italic rounded-2xl shadow-premium group mt-4" disabled={loading}>
              {loading ? "正在发布..." : (
                <span className="flex items-center gap-2">
                  立即发布计划 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
            <Users className="text-primary" size={20} />
            团队概况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 bg-secondary/20 rounded-[2rem] border-2 border-dashed border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              功能开发中: 实时查看每位成员的完成进度
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
