import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitMesasAliadasInteres } from "@/lib/mesas-aliadas-interes.functions";
import logoWhite from "@/assets/rutamercado-logo-white.png";

type W = { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
const track = (fn: "gtag" | "fbq", ...args: unknown[]) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as W;
  w[fn]?.(...args);
};

const SHARE_LINK = "https://rutamercadopr.com/mesas-aliadas/interes?origen=compartido";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SERIF = { fontFamily: "'DM Serif Display', Georgia, serif" };
const SANS = { fontFamily: "'DM Sans', system-ui, sans-serif" };
const MOTION = "transition-[opacity,transform] duration-[250ms] motion-reduce:transition-none";
const FOCUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#54b678]/50";

type Opt = { v: string; l: string };
type Q = { key: Key; title: string; hint: string; multi?: boolean; opts: Opt[] };
type Key = "categoria" | "frecuencia" | "ticket" | "descuento" | "recibir" | "interes";

const QUESTIONS: Q[] = [
  { key: "categoria", title: "¿Qué vendes principalmente?", hint: "Escoge una.", opts: [
    { v: "comida", l: "Comida preparada" }, { v: "reposteria", l: "Repostería y dulces" }, { v: "bebidas", l: "Bebidas y café" },
    { v: "agricola", l: "Productos agrícolas" }, { v: "artesania", l: "Artesanía y arte" }, { v: "joyeria", l: "Joyería y accesorios" },
    { v: "ropa", l: "Ropa" }, { v: "cuidado", l: "Cuidado personal" }, { v: "plantas", l: "Plantas" }, { v: "mascotas", l: "Artículos para mascotas, (comida, accesorios)" }, { v: "otro", l: "Otro" } ] },
  { key: "frecuencia", title: "¿En cuántos mercados vendes al mes?", hint: "Escoge una.", opts: [
    { v: "1_menos", l: "1 o menos" }, { v: "2_3", l: "2 a 3" }, { v: "4_6", l: "4 a 6" }, { v: "7_mas", l: "7 o más" } ] },
  { key: "ticket", title: "¿Cuánto gasta un cliente típico en tu mesa?", hint: "Más o menos, en una sola compra.", opts: [
    { v: "menos_10", l: "Menos de $10" }, { v: "10_25", l: "$10 a $25" }, { v: "25_50", l: "$25 a $50" }, { v: "mas_50", l: "Más de $50" } ] },
  { key: "descuento", title: "¿Qué descuento le darías a un miembro?", hint: "Tú tendrías la última palabra. Esto es solo para saber.", opts: [
    { v: "5", l: "5%" }, { v: "10", l: "10%" }, { v: "15", l: "15%" }, { v: "no_se", l: "Todavía no sé" } ] },
  { key: "recibir", title: "A cambio de tu descuento, ¿qué te gustaría recibir?", hint: "Escoge hasta 2.", multi: true, opts: [
    { v: "regresan", l: "Que mis clientes regresen a mi mesa en otros mercados" }, { v: "nuevos", l: "Clientes nuevos que no me conocían" },
    { v: "rutamapa", l: "Que me promocionen cada semana en el RutaMapa" }, { v: "reporte", l: "Saber cuántos miembros me compraron y dónde" } ] },
  { key: "interes", title: "Si lanzamos el programa, ¿te unirías como Mesa Aliada?", hint: "Sin compromiso. Solo queremos saber.", opts: [
    { v: "si", l: "Sí, cuenten conmigo" }, { v: "info", l: "Me interesa, quiero más información" }, { v: "no", l: "Por ahora no" } ] },
];

type Answers = { categoria?: string; frecuencia?: string; ticket?: string; descuento?: string; recibir: string[]; interes?: string };
type Contact = { negocio: string; instagram: string; email: string; telefono: string; consentimiento: boolean };
const EMPTY_CONTACT: Contact = { negocio: "", instagram: "", email: "", telefono: "", consentimiento: false };

function scrollToQuiz() {
  document.getElementById("cuestionario")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function Check() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#54b678] text-[#18253f]" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  );
}

function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.18em] sm:text-sm ${light ? "text-[#8fd6ad]" : "text-[#1f6b43]"}`}>{children}</p>;
}

export function MesasAliadasInteresApp() {
  const submit = useServerFn(submitMesasAliadasInteres);
  const [step, setStep] = useState(0); // 0-5 preguntas, 6 contacto, 7 final
  const [answers, setAnswers] = useState<Answers>({ recibir: [] });
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [error, setError] = useState<string | null>(null);
  const [finalTipo, setFinalTipo] = useState<"anonima" | "con_contacto">("anonima");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const startedAt = useRef<string | null>(null);
  const saved = useRef(false);
  const advanceTimer = useRef<number | null>(null);
  const ctx = useRef({ origen: "directo", isTest: false });
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const o = (p.get("origen") || "").trim().slice(0, 40);
    ctx.current = { origen: o || "directo", isTest: p.get("prueba") === "1" };
    return () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); };
  }, []);

  const goTo = (n: number) => {
    setVisible(false);
    window.setTimeout(() => { setStep(n); setError(null); setVisible(true); }, 120);
  };

  const finish = (tipo: "anonima" | "con_contacto", c: Contact, answers: Answers = answersRef.current) => {
    setFinalTipo(tipo);
    goTo(7);
    if (saved.current) return;
    saved.current = true;
    const { origen, isTest } = ctx.current;
    const now = new Date().toISOString();
    const payload = {
      id_respuesta: ("m_" + crypto.randomUUID().replace(/-/g, "")).slice(0, 40),
      origen,
      dispositivo: (window.innerWidth < 768 ? "movil" : "escritorio") as "movil" | "escritorio",
      is_test: isTest,
      iniciada_en: startedAt.current ?? now,
      completada_en: now,
      categoria: answers.categoria,
      frecuencia: answers.frecuencia,
      ticket: answers.ticket,
      descuento: answers.descuento,
      recibir: answers.recibir,
      interes: answers.interes,
      tipo,
      negocio: tipo === "con_contacto" ? c.negocio.trim() || null : null,
      instagram: tipo === "con_contacto" ? c.instagram.trim() || null : null,
      email: tipo === "con_contacto" ? c.email.trim() : null,
      telefono: tipo === "con_contacto" ? c.telefono.trim() || null : null,
      consentimiento: tipo === "con_contacto" ? c.consentimiento : false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submit({ data: payload as any }).catch((e) => console.error("No se pudo guardar la respuesta", e));
    if (!isTest) {
      track("gtag", "event", "mesas_aliadas_interes_completada", { origen, interes: answers.interes, tipo });
      if (tipo === "con_contacto") {
        track("gtag", "event", "mesas_aliadas_interes_contacto");
        track("fbq", "track", "Lead");
      }
    }
  };

  const pickSingle = (q: Q, v: string) => {
    if (step === 0 && !startedAt.current) startedAt.current = new Date().toISOString();
    const nextAnswers = { ...answersRef.current, [q.key]: v };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      if (q.key === "interes") {
        if (v === "no") finish("anonima", EMPTY_CONTACT, nextAnswers);
        else goTo(6);
      } else goTo(step + 1);
    }, 280);
  };

  const toggleMulti = (v: string) => {
    setAnswers((a) => {
      const cur = a.recibir;
      if (cur.includes(v)) return { ...a, recibir: cur.filter((x) => x !== v) };
      const next = [...cur, v];
      return { ...a, recibir: next.length > 2 ? next.slice(next.length - 2) : next };
    });
  };

  const sendContact = () => {
    if (!EMAIL_RE.test(contact.email.trim())) return setError("Escribe un correo válido para poder avisarte.");
    if (!contact.consentimiento) return setError("Marca la casilla para que podamos escribirte.");
    finish("con_contacto", contact);
  };

  const skipContact = () => {
    setContact(EMPTY_CONTACT);
    finish("anonima", EMPTY_CONTACT);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(SHARE_LINK); } catch { /* ignore */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const q = step < 6 ? QUESTIONS[step] : null;
  const progress = step >= 7 ? 100 : step === 6 ? 92 : ((step + 1) / 7) * 100;

  const finalText =
    finalTipo === "con_contacto"
      ? `Recibimos tus respuestas. Si lanzamos el programa de Mesas Aliadas, te escribimos primero a ${contact.email.trim()}.`
      : answers.interes === "no"
        ? "Recibimos tus respuestas. Nos ayudan igual a entender qué necesitan las mesas de los mercados."
        : "Recibimos tus respuestas. Si lanzamos el programa, lo anunciaremos en @rutamercadopr.";

  const field = (k: "negocio" | "instagram" | "email" | "telefono", label: string, placeholder: string, type = "text") => (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#18253f]">
      {label}
      <input
        type={type}
        value={contact[k]}
        placeholder={placeholder}
        onChange={(e) => setContact((c) => ({ ...c, [k]: e.target.value }))}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendContact(); } }}
        className={`min-h-[48px] rounded-xl border border-[#d4dbe4] bg-white px-4 text-base font-normal text-[#18253f] placeholder:text-[#8a94a8] ${FOCUS}`}
      />
    </label>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#18253f]" style={SANS}>
      {/* A. HERO */}
      <header className="bg-[#162540] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <img src={logoWhite} alt="RutaMercado" width={180} className="h-auto w-[140px] sm:w-[180px]" />
          <button type="button" onClick={scrollToQuiz} className={`min-h-[44px] rounded-full px-3 text-sm font-semibold text-white underline-offset-4 hover:underline ${FOCUS}`}>
            Ir al cuestionario
          </button>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.25fr_1fr] md:pb-24">
          <div>
            <Eyebrow light>Mesas Aliadas · Programa en exploración</Eyebrow>
            <h1 className="mt-4 text-[40px] leading-[1.05] md:text-[60px]" style={SERIF}>
              Mesas Aliadas: Que los clientes vuelvan a tu mesa <em className="text-[#8fd6ad]">y que sigan apoyando tu negocio</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Estamos evaluando lanzar un producto digital de descuentos para las personas que visitan los mercados locales cada fin de semana. Antes de construirlo, queremos saber si a tu negocio le interesaría ser parte como Mesa Aliada.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={scrollToQuiz} className={`min-h-[52px] rounded-full bg-[#54b678] px-7 text-base font-bold text-[#18253f] hover:-translate-y-0.5 ${MOTION} ${FOCUS}`}>
                Contestar 6 preguntas →
              </button>
              <span className="text-sm text-white/75">2 minutos · Gratis · Sin compromiso</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative max-w-sm rounded-3xl bg-white p-5 text-[#18253f] shadow-xl">
              <p className="text-xs font-bold tracking-[0.18em] text-[#1f6b43]">MRMERCADO</p>
              <p className="mt-2 text-base leading-snug">¿Vendes en los mercados? Cuéntame de tu mesa. Tu respuesta nos ayuda a decidir si lanzamos esto.</p>
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" aria-hidden="true" />
            </div>
            <img src="/encuesta/mrmercado-saludo.png" alt="MrMercado saludando" className="mt-4 h-[340px] w-auto object-contain" />
          </div>
        </div>
      </header>

      {/* B. AVISO */}
      <section className="bg-[#e8f3ec] py-7">
        <div className="mx-auto flex max-w-4xl items-start gap-4 px-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1f6b43" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 11v6M12 7.5h.01" />
          </svg>
          <p className="text-lg leading-relaxed">
            <strong>Esto no es una inscripción.</strong> El programa todavía no existe: estamos midiendo interés. Contestar no te compromete a nada, y si decidimos lanzarlo, te escribimos primero.
          </p>
        </div>
      </section>

      {/* C. LA IDEA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>La idea</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-3xl leading-tight md:text-[44px]" style={SERIF}>
            Una membresía para quienes visitan los mercados. Un descuento en tu mesa.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#44506a]">
            Los visitantes pagarían una <strong className="text-[#18253f]">membresía digital</strong> y recibirían de 5% a 15% de descuento en las Mesas Aliadas de los mercados locales. Tú escoges tu oferta.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["1", "El visitante se hace miembro", "Paga su membresía y recibe una tarjeta digital con un QR personal en su celular."],
              ["2", "Te encuentra cada fin de semana", "Cada jueves recibe el RutaMapa con las Mesas Aliadas que estarán en los mercados de ese fin de semana."],
              ["3", "Escaneas y aplicas tu descuento", "Con la cámara de tu celular, sin descargar ninguna app. Verde: está activo. Le aplicas tu oferta y listo."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-[18px] border border-[#dde3ea] p-6">
                <p className="text-5xl text-[#54b678]" style={SERIF}>{n}</p>
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="mt-2 leading-relaxed text-[#44506a]">{d}</p>
              </div>
            ))}
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["Gratis para tu negocio.", " Sin contrato; sales cuando quieras."],
              ["Clientes que regresan.", " Te buscan porque en tu mesa les rinde más."],
              ["Visibilidad cada semana", " en el RutaMapa que reciben los miembros."],
              ["Tus números.", " Un reporte mensual de cuántos miembros compraron y regresaron."],
            ].map(([b, r]) => (
              <li key={b} className="flex gap-3 leading-relaxed text-[#44506a]">
                <Check /><span><strong className="text-[#18253f]">{b}</strong>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* D. CUESTIONARIO */}
      <section id="cuestionario" className="scroll-mt-4 bg-[#f3f5f8] py-16 md:py-24">
        <div className="mx-auto max-w-[760px] px-5">
          <div className="text-center">
            <Eyebrow>Cuéntanos de tu negocio</Eyebrow>
            <h2 className="mt-3 text-3xl md:text-[44px]" style={SERIF}>6 preguntas. 2 minutos.</h2>
            <p className="mx-auto mt-4 max-w-xl text-[#44506a]">Usamos tus respuestas de forma agrupada para decidir si lanzamos el programa. Nunca publicamos el nombre de tu negocio.</p>
          </div>

          <div className="mt-10">
            {step < 7 && (
              <div className="mb-4">
                <div className="flex min-h-[44px] items-center justify-between">
                  <p className="text-sm font-bold text-[#1f6b43]">{step === 6 ? "Último paso" : `Pregunta ${step + 1} de 6`}</p>
                  {step > 0 && (
                    <button type="button" onClick={() => goTo(step === 6 ? 5 : step - 1)} className={`min-h-[44px] rounded-full px-3 text-sm font-semibold text-[#44506a] hover:text-[#18253f] ${FOCUS}`}>
                      ← Atrás
                    </button>
                  )}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#dde3ea]" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full origin-left rounded-full bg-[#54b678] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className={`rounded-3xl bg-white p-6 shadow-[0_12px_40px_-16px_rgba(22,37,64,0.25)] sm:p-9 ${MOTION} ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
              {q && (
                <div>
                  <h3 className="text-2xl leading-snug sm:text-3xl" style={SERIF}>{q.title}</h3>
                  <p className="mt-2 text-[#44506a]">{q.hint}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {q.opts.map((o) => {
                      const selected = q.multi ? answers.recibir.includes(o.v) : answers[q.key] === o.v;
                      return (
                        <button
                          key={o.v}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => (q.multi ? toggleMulti(o.v) : pickSingle(q, o.v))}
                          className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-medium ${MOTION} ${FOCUS} ${selected ? "border-[#1f6b43] bg-[#e8f3ec]" : "border-[#d4dbe4] bg-white hover:border-[#9fb0c4]"}`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${q.multi ? "rounded-md" : "rounded-full"} ${selected ? "border-[#1f6b43] bg-[#1f6b43]" : "border-[#9fb0c4]"}`} aria-hidden="true">
                            {selected && (q.multi
                              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                              : <span className="h-2 w-2 rounded-full bg-white" />)}
                          </span>
                          {o.l}
                        </button>
                      );
                    })}
                  </div>
                  {q.multi && (
                    <div className="mt-6 flex justify-end">
                      <button type="button" disabled={answers.recibir.length === 0} onClick={() => goTo(step + 1)} className={`min-h-[52px] rounded-full bg-[#54b678] px-7 font-bold text-[#18253f] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}>
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 6 && (
                <div>
                  <h3 className="text-2xl sm:text-3xl" style={SERIF}>¿A dónde te avisamos?</h3>
                  <p className="mt-2 text-[#44506a]">Si lanzamos el programa, serás de los primeros en saberlo. Las primeras 25 Mesas Aliadas llevarán el sello de Fundadora para siempre.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {field("negocio", "Nombre del negocio", "Ej. Dulces de Abuela")}
                    {field("instagram", "Instagram del negocio", "@tunegocio")}
                    {field("email", "Correo electrónico", "tu@correo.com", "email")}
                    {field("telefono", "Teléfono (opcional)", "787-000-0000", "tel")}
                  </div>
                  <label className="mt-5 flex min-h-[44px] cursor-pointer items-start gap-3 text-[15px] leading-snug">
                    <input type="checkbox" checked={contact.consentimiento} onChange={(e) => setContact((c) => ({ ...c, consentimiento: e.target.checked }))} className={`mt-0.5 h-5 w-5 shrink-0 accent-[#1f6b43] ${FOCUS}`} />
                    Acepto que RutaMercado me escriba sobre el programa de Mesas Aliadas. No es una inscripción.
                  </label>
                  {error && <div role="alert" className="mt-4 rounded-xl border border-[#f2c4c4] bg-[#fdf0f0] px-4 py-3 text-sm font-medium text-[#9b2c2c]">{error}</div>}
                  <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <button type="button" onClick={sendContact} className={`min-h-[52px] rounded-full bg-[#54b678] px-7 font-bold text-[#18253f] ${FOCUS}`}>Enviar mis respuestas</button>
                    <button type="button" onClick={skipContact} className={`min-h-[44px] rounded-full px-4 text-sm font-semibold text-[#44506a] underline underline-offset-4 hover:text-[#18253f] ${FOCUS}`}>Ahora no, terminar</button>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div>
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                    <img src="/encuesta/mrmercado-feliz.png" alt="MrMercado feliz" width={150} className="h-auto w-[150px] shrink-0 object-contain" />
                    <div className="text-center sm:text-left">
                      <h3 className="text-3xl" style={SERIF}>¡Gracias por contarnos!</h3>
                      <p className="mt-3 break-words leading-relaxed text-[#44506a]">{finalText}</p>
                    </div>
                  </div>
                  <div className="mt-8 rounded-2xl bg-[#f3f5f8] p-5 text-center sm:text-left">
                    <p className="text-[15px]">¿Conoces otra mesa que venda en los mercados? Compártele este enlace:</p>
                    <button type="button" onClick={copy} className={`mt-3 min-h-[48px] rounded-full bg-[#54b678] px-6 font-bold text-[#18253f] ${FOCUS}`}>
                      {copied ? "¡Copiado!" : "Copiar enlace"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* E. PREGUNTAS RÁPIDAS */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl md:text-[40px]" style={SERIF}>Preguntas rápidas</h2>
          <div className="mt-8 divide-y divide-[#dde3ea] border-y border-[#dde3ea]">
            {[
              ["¿Contestar me inscribe en el programa?", "No. El programa todavía no existe. Estamos midiendo cuántos negocios estarían interesados antes de decidir si lo lanzamos."],
              ["¿Me costaría algo ser Mesa Aliada?", "No. Sería gratis y sin contrato. Solo darías el descuento que tú escojas a los miembros que compren en tu mesa."],
              ["¿Yo decido cuánto descuento doy?", "Sí. Escogerías entre 5%, 10% o 15%, y podrías pedir una compra mínima o limitarlo a una vez por mercado."],
              ["¿Qué hacen con mis respuestas?", "Las usamos de forma agrupada para tomar la decisión. Tu correo solo se usa para avisarte sobre este programa, si nos das permiso."],
            ].map(([t, d]) => (
              <details key={t} className="group py-2">
                <summary className={`flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-lg font-semibold ${FOCUS}`}>
                  {t}
                  <span className="text-2xl text-[#1f6b43] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true">+</span>
                </summary>
                <p className="pb-4 leading-relaxed text-[#44506a]">{d}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* F. FOOTER */}
      <footer className="bg-[#162540] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 sm:flex-row">
          <img src={logoWhite} alt="RutaMercado" width={160} className="h-auto w-[160px]" />
          <div className="flex gap-6 text-sm">
            <a href="https://rutamercadopr.com" className={`inline-flex min-h-[44px] items-center rounded hover:underline ${FOCUS}`}>rutamercadopr.com</a>
            <a href="https://instagram.com/rutamercadopr" target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center rounded hover:underline ${FOCUS}`}>@rutamercadopr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
