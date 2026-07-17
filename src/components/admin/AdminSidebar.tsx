import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Store, TrendingUp, LogOut, Inbox, Users, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countPendingSubmissions } from "@/lib/submissions.functions";
import { countNewContactMessages } from "@/lib/contact.functions";
import { adminCountPendingEmprendedores } from "@/lib/admin-emprendedores.functions";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/markets", label: "Mercados", icon: Store },
  { to: "/admin/producers", label: "Productores", icon: Users },
  { to: "/admin/emprendedores", label: "Emprendedores", icon: Briefcase },
  { to: "/admin/submissions", label: "Solicitudes de Mercados", icon: Inbox },
  { to: "/admin/messages", label: "Mensajes", icon: Mail },
  { to: "/admin/analytics", label: "Analíticas", icon: TrendingUp },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const countPendingSubmissionsFn = useServerFn(countPendingSubmissions);
  const countNewMessagesFn = useServerFn(countNewContactMessages);
  const countPendingEmprendedoresFn = useServerFn(adminCountPendingEmprendedores);
  const { data: pending } = useQuery({
    queryKey: ["admin", "submissions", "pending-count"],
    queryFn: () => countPendingSubmissionsFn(),
    refetchInterval: 60_000,
  });
  const { data: newMessages } = useQuery({
    queryKey: ["admin", "contact-messages", "new-count"],
    queryFn: () => countNewMessagesFn(),
    refetchInterval: 60_000,
  });
  const { data: pendingEmp } = useQuery({
    queryKey: ["admin", "emprendedores", "pending-count"],
    queryFn: () => countPendingEmprendedoresFn(),
    refetchInterval: 60_000,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="flex h-full w-full flex-col bg-[#18253f] text-white">
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
                  ? "bg-[#54b678]/15 border-l-[3px] border-[#54b678] text-[#54b678] font-medium"
                  : "border-l-[3px] border-transparent text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/admin/submissions" && (pending?.count ?? 0) > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#54b678] px-1.5 text-xs font-bold text-[#18253f]">
                  {pending!.count}
                </span>
              )}
              {item.to === "/admin/messages" && (newMessages?.count ?? 0) > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#54b678] px-1.5 text-xs font-bold text-[#18253f]">
                  {newMessages!.count}
                </span>
              )}
              {item.to === "/admin/emprendedores" && (pendingEmp?.count ?? 0) > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#54b678] px-1.5 text-xs font-bold text-[#18253f]">
                  {pendingEmp!.count}
                </span>
              )}
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
