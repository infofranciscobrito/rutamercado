import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bazar-pop-up")({
  beforeLoad: () => {
    throw redirect({ to: "/bazares", statusCode: 301 });
  },
});
