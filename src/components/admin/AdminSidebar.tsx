import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Store, TrendingUp, LogOut, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countPendingSubmissions } from "@/lib/submissions.functions";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/markets", label: "Mercados", icon: Store },
  { to: "/admin/submissions", label: "Envíos", icon: Inbox },
  { to: "/admin/analytics", label: "Analíticas", icon: TrendingUp },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="flex h-full w-full flex-col bg-[#1c1e37] text-white">
      <div className="flex items-center justify-center px-4 py-5 border-b border-white/10">
        <img
          src="/logo-rutamercado-horizontal.png"
          alt="RutaMercado — Directorio de mercados locales"
          className="h-14 w-auto"
        />
      </div>
      <nav className="flex-1 py-4">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active
                  ? "bg-[#f8b625]/15 border-l-[3px] border-[#f8b625] text-[#f8b625] font-medium"
                  : "border-l-[3px] border-transparent text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 border-l-[3px] border-transparent px-6 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}
