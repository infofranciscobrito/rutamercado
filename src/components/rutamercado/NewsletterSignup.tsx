import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = {
  variant?: "full" | "compact";
  marketSlug?: string;
};

const STOPS = ["Metro", "Norte", "Sur", "Este", "Tu correo"];

function RouteStepper() {
  return (
    <div className="w-full select-none" aria-hidden="true">
      <div className="flex items-start justify-center">
        {STOPS.map((stop, i) => {
          const last = i === STOPS.length - 1;
          return (
            <div key={stop} className="flex min-w-0 items-start">
              {i > 0 && (
                <div
                  className="mt-[7px] h-0 w-10 shrink-0 border-t-2 border-dashed border-[#3c4d6b] sm:w-16"
                />
              )}
              <div className="flex w-auto flex-col items-center sm:w-20">
                {last ? (
                  <span
                    className="mt-[1px] h-[13px] w-[13px] rounded-full bg-[#54b678]"
                    style={{ boxShadow: "0 0 0 5px rgba(84,182,120,0.18), 0 0 14px rgba(84,182,120,0.55)" }}
                  />
                ) : (
                  <span className="mt-[4px] h-[7px] w-[7px] rounded-full bg-[#5b6c8a]" />
                )}
                <span
                  className={`mt-3 hidden text-[10px] uppercase tracking-[0.14em] sm:block ${
                    last ? "font-semibold text-[#54b678]" : "text-[#8291ac]"
                  }`}
                >
                  {stop}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NewsletterSignup({ variant = "full", marketSlug }: Props) {
  const subscribeFn = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const compact = variant === "compact";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || value.length > 255) {
      setError("Escribe un correo válido");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await subscribeFn({
        data: {
          email: value,
          source: compact ? "ficha_mercado" : "homepage",
          marketSlug: marketSlug ?? null,
        },
      });
      setDone(true);
    } catch (err) {
      console.error("[Newsletter] subscribe error", err);
      setError("No pudimos completar tu suscripción. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const privacy = (
    <p className={`${compact ? "text-[11px]" : "text-xs"} text-[#C7D0DE]`}>
      Al suscribirte aceptas nuestra{" "}
      <Link
        to="/politica-de-privacidad"
        className="text-[#54b678] underline underline-offset-2 hover:text-[#7fd39c]"
      >
        Política de Privacidad
      </Link>
    </p>
  );

  const successBox = (
    <div className="flex items-center justify-center gap-2 text-[#54b678]">
      <CheckCircle2 className={compact ? "h-5 w-5" : "h-6 w-6"} />
      <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>
        ¡Listo! Ya estás en la lista.
      </p>
    </div>
  );

  const form = (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`flex w-full flex-col gap-3 sm:flex-row ${compact ? "" : "sm:mx-auto sm:max-w-lg"}`}
    >
      <Input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        placeholder="tucorreo@ejemplo.com"
        disabled={submitting}
        aria-label="Correo electrónico"
        className="h-12 w-full flex-1 border-[#3c4d6b] bg-[#101a2e] text-white placeholder:text-[#7c8aa3] focus-visible:border-[#54b678]"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full bg-[#54b678] px-7 text-base font-semibold text-[#18253f] hover:bg-[#3f9560] sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
          </>
        ) : (
          "Suscribirme →"
        )}
      </Button>
    </form>
  );

  if (compact) {
    return (
      <section className="overflow-hidden rounded-2xl border-y-4 border-[#54b678] bg-[#18253f] rm-shadow-warm">
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <h2 className="font-display text-xl leading-tight text-white">
            ¿Quieres enterarte de mercados como este?
          </h2>
          <div className="mt-5 space-y-3">
            {done ? successBox : form}
            {!done && error && (
              <p className="text-xs text-[#FCA5A5]">{error}</p>
            )}
            {!done && privacy}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full border-y-4 border-[#54b678]"
      style={{ backgroundImage: "linear-gradient(135deg, #18253f 0%, #1d2b49 50%, #16213a 100%)" }}
    >
      <div className="mx-auto w-full max-w-[760px] px-6 py-20 text-center sm:px-8 sm:py-28">
        <RouteStepper />
        <h2 className="mt-14 font-display text-3xl leading-tight text-white sm:text-4xl">
          Los mercados de la semana, directo en tu correo
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#C7D0DE]">
          Cada semana seleccionamos los mercados activos en Puerto Rico y te los
          mandamos antes del fin de semana. Sin spam, cancelas cuando quieras.
        </p>
        <div className="mt-9 space-y-3">
          {done ? successBox : form}
          {!done && error && (
            <p className="text-sm text-[#FCA5A5]">{error}</p>
          )}
          {!done && privacy}
        </div>
      </div>
    </section>
  );
}
