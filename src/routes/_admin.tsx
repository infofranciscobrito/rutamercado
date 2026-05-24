import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
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
