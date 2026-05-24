import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    // Skip auth check during SSR — Supabase session lives in localStorage (client only).
    // Without this guard, SSR always sees "no user" and redirects to /admin/login.
    if (typeof window === "undefined") return;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
