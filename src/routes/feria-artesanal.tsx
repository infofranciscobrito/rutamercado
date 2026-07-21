import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/feria-artesanal")({
  beforeLoad: () => {
    throw redirect({ to: "/ferias-artesanales", statusCode: 301 });
  },
});
