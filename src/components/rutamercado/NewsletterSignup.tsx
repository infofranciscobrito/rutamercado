import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = {
  variant?: "full" | "compact";
  marketSlug?: string;
};

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
        className="h-12 flex-1 border-transparent bg-white text-[#18253f] placeholder:text-[#9CA3AF]"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="h-12 bg-[#54b678] px-7 text-base font-semibold text-[#18253f] hover:bg-[#3f9560]"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
          </>
        ) : (
          "Suscribirme"
        )}
      </Button>
    </form>
  );

  if (compact) {
    return (
      <section className="overflow-hidden rounded-2xl bg-[#18253f] rm-shadow-warm">
        <div className="h-[3px] w-full bg-[#54b678]" aria-hidden="true" />
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
    <section className="w-full bg-[#18253f]">
      <div className="h-[3px] w-full bg-[#54b678]" aria-hidden="true" />
      <div className="mx-auto w-full max-w-2xl px-6 py-20 text-center sm:px-8 sm:py-24">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#54b678] text-[#18253f]">
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="mt-6 font-display text-2xl leading-tight text-white sm:text-3xl">
          Recibe los mercados de la semana en tu correo
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#C7D0DE]">
          Cada semana te mandamos los mercados activos en Puerto Rico. Sin spam,
          cancelas cuando quieras.
        </p>
        <div className="mt-8 space-y-3">
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
