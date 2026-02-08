import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Scale, Ruler, FileText, ShieldCheck, LogOut, Save, Award } from "lucide-react";

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    height: "",
    weight: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        bio: formData.bio,
      })
      .eq("id", user?.id);

    if (error) {
      toast({ variant: "destructive", title: "更新失败", description: error.message });
    } else {
      toast({ title: "更新成功", description: "您的个人资料已保存" });
      await refreshProfile();
    }
    setLoading(false);
  };

  const handleApplyCoach = async () => {
    setApplying(true);
    const { error } = await supabase
      .from("profiles")
      .update({ coach_application_status: "pending" })
      .eq("id", user?.id);

    if (error) {
      toast({ variant: "destructive", title: "申请失败", description: error.message });
    } else {
      toast({ title: "申请已提交", description: "请等待管理员审核" });
      await refreshProfile();
    }
    setApplying(false);
  };

  const bmi = (formData.height && formData.weight) 
    ? (Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)).toFixed(1)
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">个人中心</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Profile & Health</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-2xl bg-secondary/50 text-destructive">
          <LogOut size={20} />
        </Button>
      </header>

      {/* Health Stats Card */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-none shadow-sm bg-white dark:bg-card/50 text-center p-4">
          <Ruler className="mx-auto text-primary mb-2" size={20} />
          <div className="text-lg font-black italic">{formData.height || "--"}</div>
          <div className="text-[8px] font-black uppercase text-muted-foreground">Height (cm)</div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-card/50 text-center p-4">
          <Scale className="mx-auto text-primary mb-2" size={20} />
          <div className="text-lg font-black italic">{formData.weight || "--"}</div>
          <div className="text-[8px] font-black uppercase text-muted-foreground">Weight (kg)</div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-card/50 text-center p-4">
          <Award className="mx-auto text-primary mb-2" size={20} />
          <div className="text-lg font-black italic">{bmi || "--"}</div>
          <div className="text-[8px] font-black uppercase text-muted-foreground">BMI Index</div>
        </Card>
      </div>

      {/* Profile Form */}
      <Card className="border-none shadow-premium bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-primary w-full" />
        <CardHeader>
          <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
            <User className="text-primary" size={20} fill="currentColor" />
            基本资料
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">昵称/姓名</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">身高 (CM)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">体重 (KG)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="h-12 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">健康宣言/简介</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="分享你的跑步目标或健康状况..."
                className="min-h-[100px] rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all resize-none"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-black italic rounded-2xl shadow-premium group" disabled={loading}>
              {loading ? "保存中..." : (
                <span className="flex items-center gap-2">
                  保存资料 <Save size={20} />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coach Application Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-card/50 border border-border/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
            <ShieldCheck className="text-primary" size={20} />
            教练申请
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            申请成为教练，为跑友制定专业计划
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.role === "coach" ? (
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-glow">
                <ShieldCheck size={20} fill="currentColor" />
              </div>
              <div>
                <div className="text-sm font-black italic uppercase">您已是认证教练</div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Certified Coach</div>
              </div>
            </div>
          ) : profile?.coach_application_status === "pending" ? (
            <div className="text-center py-6 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
              <p className="text-sm font-bold text-muted-foreground italic">申请审核中，请耐心等待...</p>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-2 border-primary text-primary font-black italic hover:bg-primary hover:text-white transition-all"
              onClick={handleApplyCoach}
              disabled={applying}
            >
              {applying ? "提交中..." : "立即申请成为教练"}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
