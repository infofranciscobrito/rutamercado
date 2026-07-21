import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mercado-agricola")({
  beforeLoad: () => {
    throw redirect({ to: "/mercados-agricolas", statusCode: 301 });
  },
});
