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
import { MapPin, MessageSquare, Smile, Zap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <header className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-secondary/50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">每日打卡</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Log Your Run</p>
        </div>
      </header>

      <Card className="border-none shadow-premium bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-primary w-full" />
        <CardHeader>
          <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
            <Zap className="text-primary" size={20} fill="currentColor" />
            跑步数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="distance" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                跑步公里数 (KM)
              </Label>
              <div className="relative group">
                <Input
                  id="distance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-20 text-5xl font-black italic pl-6 pr-16 rounded-3xl border-none bg-secondary/50 focus:bg-secondary transition-all focus:ring-2 focus:ring-primary/20"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                  autoFocus
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black italic text-2xl text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  KM
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="feeling" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                跑步感受
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-muted-foreground" size={18} />
                <Textarea
                  id="feeling"
                  placeholder="分享一下今天的跑步心情吧..."
                  className="min-h-[140px] pl-11 pt-4 rounded-3xl border-none bg-secondary/50 focus:bg-secondary transition-all focus:ring-2 focus:ring-primary/20 resize-none text-sm font-medium"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                快速标签
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['🏃‍♂️ 轻松', '🔥 暴汗', '💪 突破', '✨ 治愈', '😴 疲惫', '🌧️ 雨跑'].map((tag) => (
                  <motion.button
                    key={tag}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeeling(prev => prev ? `${prev} #${tag}` : `#${tag}`)}
                    className="whitespace-nowrap px-5 py-2.5 bg-secondary rounded-2xl text-xs font-black italic hover:bg-primary hover:text-white transition-all shadow-sm border border-border/50"
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 text-xl font-black italic rounded-3xl shadow-premium group" 
              disabled={loading}
            >
              {loading ? "正在提交..." : (
                <span className="flex items-center gap-2">
                  立即打卡 <Zap size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
