import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, Smile } from "lucide-react";

export default function CheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [distance, setDistance] = useState("");
  const [feeling, setFeeling] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || isNaN(Number(distance))) {
      toast({ variant: "destructive", title: "请输入有效的公里数" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('running_logs').insert({
      user_id: user?.id,
      distance: Number(distance),
      feeling: feeling,
      log_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      toast({ variant: "destructive", title: "打卡失败", description: error.message });
    } else {
      toast({ title: "打卡成功!", description: "继续保持, 你是最棒的!" });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black italic tracking-tighter">每日打卡</h1>
        <p className="text-muted-foreground text-sm">记录你的每一次奔跑</p>
      </header>

      <Card className="border-none shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            跑步数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-bold">跑步公里数 (KM)</Label>
              <div className="relative">
                <Input
                  id="distance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-16 text-3xl font-black italic pl-4 pr-12 rounded-2xl border-2 focus:border-primary"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">KM</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeling" className="text-sm font-bold flex items-center gap-2">
                <MessageSquare size={16} />
                跑步感受
              </Label>
              <Textarea
                id="feeling"
                placeholder="分享一下今天的跑步心情吧..."
                className="min-h-[120px] rounded-2xl border-2 focus:border-primary resize-none"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['🏃‍♂️ 轻松', '🔥 暴汗', '💪 突破', '✨ 治愈', '😴 疲惫'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFeeling(prev => prev ? `${prev} #${tag}` : `#${tag}`)}
                  className="whitespace-nowrap px-4 py-2 bg-secondary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-glow" disabled={loading}>
              {loading ? "提交中..." : "立即打卡"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
