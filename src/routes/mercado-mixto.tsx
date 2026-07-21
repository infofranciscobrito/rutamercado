import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mercado-mixto")({
  beforeLoad: () => {
    throw redirect({ to: "/mercados-mixtos", statusCode: 301 });
  },
});
