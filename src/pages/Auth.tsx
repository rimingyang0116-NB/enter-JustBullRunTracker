import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, Mail, Lock, User } from "lucide-react";

import { usePageTitle } from "@/hooks/use-page-title";

export default function Auth() {
  usePageTitle("登录/注册");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "密码长度至少需要6位字符",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'member',
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "注册失败",
          description: error.message,
        });
      } else {
        toast({
          title: "注册成功",
          description: "账号已创建，正在为您登录...",
        });
        // Auto login after signup since auto-confirm is enabled
        await handleLogin(e);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "发生未知错误，请稍后再试",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: error.message === "Invalid login credentials" ? "邮箱或密码错误" : error.message,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "发生未知错误，请稍后再试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-premium bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <motion.div 
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-premium rotate-3"
            >
              <Flame className="text-white" size={40} strokeWidth={2.5} />
            </motion.div>
            <CardTitle className="text-4xl font-black italic tracking-tighter text-primary">JUST BULL</CardTitle>
            <CardDescription className="text-base font-medium mt-2">就是牛跑团 · 社区打卡平台</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-2xl h-12">
                <TabsTrigger value="login" className="rounded-xl font-bold data-[state=active]:shadow-sm">登录</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:shadow-sm">注册</TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <TabsContent value="login">
                  <motion.form 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin} 
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">电子邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="h-12 pl-11 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">登录密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-11 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 text-lg font-black italic rounded-2xl shadow-premium group" disabled={loading}>
                      {loading ? "正在进入..." : (
                        <span className="flex items-center gap-2">
                          立即进入 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>

                <TabsContent value="signup">
                  <motion.form 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignUp} 
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">真实姓名</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="fullName"
                          placeholder="张三"
                          className="h-12 pl-11 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">电子邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          className="h-12 pl-11 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">设置密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="至少6位字符"
                          className="h-12 pl-11 rounded-xl border-none bg-secondary/50 focus:bg-secondary transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 text-lg font-black italic rounded-2xl shadow-premium group" disabled={loading}>
                      {loading ? "正在创建..." : (
                        <span className="flex items-center gap-2">
                          创建账号 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-center mt-8 text-sm text-muted-foreground font-medium">
          加入 JUST BULL，释放你的牛劲！🐂
        </p>
      </motion.div>
    </div>
  );
}
