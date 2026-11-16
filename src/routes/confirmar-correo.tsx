import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { confirmEncuestaEmail } from "@/lib/encuesta.functions";

export const Route = createFileRoute("/confirmar-correo")({
  validateSearch: zodValidator(z.object({ t: fallback(z.string(), "").default("") })),
  head: () => ({
    meta: [
      { title: "Confirma tu correo | RutaMercado" },
      { name: "description", content: "Confirma tu correo para entrar en la lista de espera de la membresía RutaLover." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Confirma tu correo | RutaMercado" },
      { property: "og:description", content: "Confirma tu correo para la lista de espera de RutaLover." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmarCorreo,
});

function ConfirmarCorreo() {
  const { t } = Route.useSearch();
  const confirm = useServerFn(confirmEncuestaEmail);
  const [state, setState] = useState<"cargando" | "ok" | "error">("cargando");
  useEffect(() => {
    if (!t) { setState("error"); return; }
    confirm({ data: { t } }).then((r) => setState(r.ok ? "ok" : "error")).catch(() => setState("error"));
  }, [t, confirm]);
  return (
    <main className="min-h-screen grid place-items-center bg-[#18253f] px-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <img src="/encuesta/mrmercado-feliz.png" alt="MrMercado" className="mx-auto h-48 w-auto" />
        {state === "cargando" && <p>Confirmando tu correo…</p>}
        {state === "ok" && (<><h1 className="font-display text-3xl">¡Correo confirmado!</h1><p className="text-white/80">Ya estás en la lista de espera de la membresía. Te aviso primero cuando la lancemos.</p></>)}
        {state === "error" && (<><h1 className="font-display text-3xl">Enlace no válido</h1><p className="text-white/80">Este enlace no funciona o ya venció. Si contestaste la encuesta, revisa el correo más reciente que te enviamos.</p></>)}
        <Link to="/" className="inline-block rounded-full bg-[#54b678] px-6 py-3 font-semibold">Ir a RutaMercado</Link>
      </div>
    </main>
  );
}
