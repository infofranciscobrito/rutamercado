import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthReady, AuthLoadingSpinner } from "@/hooks/use-auth-ready";

export const Route = createFileRoute("/_admin")({
  // Client-only: Supabase session lives in localStorage, unavailable during SSR.
  ssr: false,
  component: AdminGuard,
});

function AdminGuard() {
  const { status } = useAuthReady();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [status, navigate]);

  if (status !== "authenticated") {
    return <AuthLoadingSpinner />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
