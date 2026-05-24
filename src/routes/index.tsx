import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RutaMercado — Directorio de mercados locales en Puerto Rico" },
      {
        name: "description",
        content:
          "Descubre mercados agrícolas, ferias artesanales, food markets y bazares en todo Puerto Rico.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Puerto Rico
        </p>
        <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
          RutaMercado
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          Directorio público de mercados locales. Próximamente.
        </p>
      </div>
    </main>
  );
}
