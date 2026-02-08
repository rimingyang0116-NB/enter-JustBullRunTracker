import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Target, Users } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns";

export default function CoachPanel() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("本周训练计划");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

  if (profile?.role !== 'coach') {
    return <div className="p-10 text-center">您没有教练权限</div>;
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
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black italic tracking-tighter">教练管理后台</h1>
        <p className="text-muted-foreground text-sm">制定计划, 督促成员</p>
      </header>

      <Card className="border-none shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="text-primary" size={20} />
            发布新计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">计划名称</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 本周基础耐力训练"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">目标公里数 (KM)</Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="例如: 30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">开始日期</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">结束日期</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 font-bold mt-4" disabled={loading}>
              {loading ? "发布中..." : "立即发布计划"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="text-primary" size={20} />
            团队概况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground text-sm">
            功能开发中: 实时查看每位成员的完成进度
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
