import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1e37] p-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <img src="/logo-placeholder.svg" alt="RutaMercado" className="h-12 mx-auto mb-3" />
          <h1 className="font-display text-2xl text-[#1c1e37]">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground mt-1">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f8b625] text-[#1c1e37] hover:bg-[#f8b625]/90 font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
