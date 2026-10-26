import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitEncuesta } from "@/lib/encuesta.functions";
import { CH, EMAIL_RE, ICON, POSES, SPEND, STEPS, VISITS, type Answers, type Step } from "./steps";
import "./encuesta.css";

type W = { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
const track = (fn: "gtag" | "fbq", ...args: unknown[]) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as W;
  w[fn]?.(...args);
};

const SHARE_URL = "https://rutamercadopr.com/encuesta?origen=compartido";
const PIN_CHECK = (
  <span className="pin" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  </span>
);

function freshAnswers(): Answers {
  let origen = "directo";
  try {
    origen = new URLSearchParams(window.location.search).get("origen") || "directo";
  } catch { /* noop */ }
  return {
    origen: origen.slice(0, 40),
    id_respuesta: "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    dispositivo: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "movil" : "escritorio",
    iniciada_en: new Date().toISOString(),
  };
}

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    setR(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return r;
}

export function EncuestaApp() {
  const reduce = useReduced();
  const send = useServerFn(submitEncuesta);
  const A = useRef<Answers | null>(null);
  const hist = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stageRef = useRef<HTMLElement>(null);

  const [view, setView] = useState<"hero" | "survey">("hero");
  const [current, setCurrent] = useState(0);
  const [panelKey, setPanelKey] = useState(0);
  const [pose, setPoseState] = useState({ name: "pregunta", anim: "", n: 0 });
  const [say, setSay] = useState({ text: "", react: false, n: 0 });

  useEffect(() => {
    Object.values(POSES).forEach((src) => { const im = new Image(); im.src = src; });
    return () => clearTimeout(timer.current);
  }, []);

  const setPose = useCallback((name: string, hop: boolean) => {
    setPoseState((p) => {
      const nm = POSES[name] ? name : "pregunta";
      if (p.name !== nm) return { name: nm, anim: reduce ? "" : hop ? "hop" : "swap", n: p.n + 1 };
      if (hop) return { name: nm, anim: reduce ? "" : "hop", n: p.n + 1 };
      return p;
    });
  }, [reduce]);

  const speak = useCallback((text: string, react: boolean) => {
    setSay((s) => ({ text, react, n: s.n + 1 }));
  }, []);

  const submit = useCallback(async () => {
    const a = A.current;
    if (!a) return;
    const get = (k: string) => (a[k] as string | undefined) ?? null;
    try {
      await send({
        data: {
          id_respuesta: a.id_respuesta,
          origen: a.origen,
          dispositivo: a.dispositivo,
          iniciada_en: a.iniciada_en,
          completada_en: a.completada_en ?? new Date().toISOString(),
          frecuencia: get("frecuencia"),
          cantidad_mercados: get("cantidad_mercados"),
          gasto: get("gasto"),
          categorias: (a.categorias as string[]) ?? [],
          lealtad: get("lealtad"),
          descubrimiento: (a.descubrimiento as string[]) ?? [],
          motivadores: (a.motivadores as string[]) ?? [],
          precio_maximo: get("precio_maximo"),
          intencion_24: get("intencion_24"),
          plan: get("plan"),
          dudas: get("dudas"),
          dudas_otro: get("dudas_otro"),
          region: get("region"),
          edad: get("edad"),
          sexo: get("sexo"),
          email: a.email ?? null,
          consentimiento_email: !!a.consentimiento_email,
          email_momento: a.email_momento ?? null,
        },
      });
    } catch (e) {
      console.error("submitEncuesta failed", e);
    }
  }, [send]);

  const go = useCallback((i: number, push = true, from?: number) => {
    clearTimeout(timer.current);
    if (push && from !== undefined) hist.current.push(from);
    const s = STEPS[i];
    setCurrent(i);
    setPanelKey((k) => k + 1);
    setPose(s.pose, false);
    if (s.type !== "final" && s.lead) speak(s.lead, false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [setPose, speak]);

  const nextIndex = useCallback((i: number) => {
    const a = A.current!;
    i++;
    while (i < STEPS.length && STEPS[i].when && !STEPS[i].when!(a)) {
      delete a[STEPS[i].id];
      delete a[STEPS[i].id + "_otro"];
      i++;
    }
    return i;
  }, []);

  const toTop = useCallback(() => {
    const st = stageRef.current;
    if (!st) return;
    const y = st.getBoundingClientRect().top + window.scrollY - 140;
    if (window.scrollY > y + 10) window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);

  const answered = useCallback((s: Step, from: number, reaction?: string) => {
    const n = nextIndex(from);
    if (s.fast || !reaction) {
      setPose(s.pose, true);
      timer.current = setTimeout(() => go(n, true, from), 2380);
      return;
    }
    setPose(s.ch === 3 ? "anotando" : "feliz", true);
    speak(reaction, true);
    toTop();
    timer.current = setTimeout(() => go(n, true, from), reduce ? 2900 : 3500);
  }, [go, nextIndex, reduce, setPose, speak, toTop]);

  const start = () => {
    A.current = freshAnswers();
    hist.current = [];
    setView("survey");
    go(0, false);
  };
  const goHome = () => {
    clearTimeout(timer.current);
    A.current = freshAnswers();
    hist.current = [];
    setView("hero");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const back = () => {
    if (!hist.current.length) return;
    go(hist.current.pop()!, false);
  };

  const step = STEPS[current];
  const ch = step.ch;

  return (
    <div className="enc-app">
      <div className="bg" aria-hidden="true" />

      {view === "hero" && (
        <main className="view hero">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <img className="hero__logo" src="/encuesta/logo-rutamercado-vertical.png" alt="RutaMercado: Mercados, Bazares y PopUp" width={880} height={398} />
              <p className="eyebrow">Encuesta para quienes van a los mercados</p>
              <h1 className="hero__title">Cuéntanos tu <em>ruta</em>.</h1>
              <p className="hero__sub"><strong>RutaMercado</strong> es el directorio de los mercados locales de Puerto Rico. Seguimos creando herramientas y productos digitales para hacerle la vida más fácil a las mesas que venden, a los productores que organizan los mercados y a ti, que los visitas.</p>
              <div className="hero__why">
                <span className="pin" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg></span>
                <p><b>Tu opinión marca el camino.</b>Antes de lanzar algo nuevo, queremos entender cómo vives los mercados. Lo que nos digas decide qué construimos primero.</p>
              </div>
              <div className="hero__go">
                <button className="btn btn-green" type="button" onClick={start}>Empezar la ruta con MrMercado <span className="arrow" aria-hidden="true">→</span></button>
                <div className="hero__meta"><span>2 minutos</span><span>15 preguntas rápidas</span><span>Anónima</span></div>
              </div>
            </div>
            <div className="host-hero">
              <div className="say"><span className="who">MrMercado</span>¡Hola! Soy MrMercado. Me paso los fines de semana recorriendo los mercados de la isla. ¿Me acompañas?</div>
              <div className="host-hero__fig"><img src={POSES.saludo} alt="MrMercado saludando, con gorra y sudadera de RutaMercado" width={516} height={1000} /></div>
            </div>
          </div>
        </main>
      )}

      {view === "survey" && (
        <div className="view survey">
          <header className="bar">
            <div className="wrap">
              <div className="bar__in">
                <button className="home-link" type="button" aria-label="Volver al inicio" onClick={goHome}><img className="bar__logo" src="/encuesta/logo-rutamercado-horizontal.png" alt="RutaMercado" width={520} height={80} /></button>
                <button className="back" type="button" disabled={hist.current.length === 0 || step.type === "final"} onClick={back}>← Atrás</button>
              </div>
              <nav className="route" aria-label="Progreso">
                <ol>
                  <span className="route__track" />
                  <span className="route__fill" style={{ width: (Math.min(ch, 4) / 4) * 80 + "%" }} />
                  {["Llegada", "Las mesas", "Lo que mueve", "La idea", "Tú"].map((l, i) => (
                    <li key={l} className={i < ch ? "done" : i === ch ? "now" : ""}><span className="dot" /><small>{l}</small></li>
                  ))}
                </ol>
              </nav>
            </div>
          </header>
          <section className="stage" ref={stageRef}>
            <div className="wrap stage__grid">
              <aside className="host" aria-live="polite">
                <div className="host__fig portrait">
                  <img key={pose.n} className={pose.anim} src={POSES[pose.name]} alt="MrMercado" width={600} height={743} />
                </div>
                <div key={say.n} className={"say" + (say.react ? " react" : "") + (reduce ? "" : " fade")}>
                  <span className="who">MrMercado</span>
                  <span dangerouslySetInnerHTML={{ __html: say.text }} />
                </div>
              </aside>
              <div key={panelKey} className={"panel" + (reduce ? "" : " fade")}>
                {step.type === "concept" ? (
                  <Concept step={step} onNext={() => go(nextIndex(current), true, current)} />
                ) : step.type === "email" ? (
                  <EmailStep
                    step={step}
                    A={A.current!}
                    onDone={(left) => {
                      if (left) {
                        track("gtag", "event", "encuesta_lista_espera", { momento: "pregunta" });
                        track("fbq", "track", "Lead");
                      }
                      go(nextIndex(current), true, current);
                    }}
                  />
                ) : step.type === "final" ? (
                  <Final
                    A={A.current!}
                    reduce={reduce}
                    setPose={setPose}
                    speak={speak}
                    submit={submit}
                    goHome={goHome}
                  />
                ) : (
                  <Question
                    step={step}
                    A={A.current!}
                    onAnswered={(reaction) => answered(step, current, reaction)}
                    timer={timer}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Header({ step }: { step: Step }) {
  return (
    <>
      <p className="chapter">{CH[step.ch]}</p>
      {step.q && <h2 className="q" id={"q_" + step.id} dangerouslySetInnerHTML={{ __html: step.q }} />}
    </>
  );
}

function Question({ step: s, A, onAnswered, timer }: {
  step: Step; A: Answers; onAnswered: (r?: string) => void;
  timer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
}) {
  const multi = !!s.multi;
  const opts = s.opts ?? [];
  const [picked, setPicked] = useState<string[]>(() =>
    multi ? (Array.isArray(A[s.id]) ? [...(A[s.id] as string[])] : []) : A[s.id] ? [A[s.id] as string] : [],
  );
  const [locked, setLocked] = useState(false);
  const [showOther, setShowOther] = useState(A[s.id] === "otro");
  const [otherVal, setOtherVal] = useState((A[s.id + "_otro"] as string) || "");
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (showOther) otherRef.current?.focus(); }, [showOther]);

  const click = (o: (typeof opts)[number]) => {
    if (locked) return;
    if (!multi) {
      setPicked([o.v]);
      if (s.other && o.v === "otro") { setShowOther(true); return; }
      setShowOther(false);
      A[s.id] = o.v;
      delete A[s.id + "_otro"];
      setLocked(true);
      onAnswered(o.r || s.react);
      return;
    }
    let next = [...picked];
    const k = next.indexOf(o.v);
    if (k > -1) next.splice(k, 1);
    else if (o.solo) next = [o.v];
    else {
      next = next.filter((v) => !opts.find((z) => z.v === v)?.solo);
      if (next.length >= s.multi!) next.shift();
      next.push(o.v);
    }
    setPicked(next);
    if (next.length >= s.multi! || (o.solo && next.includes(o.v))) {
      A[s.id] = [...next];
      setLocked(true);
      const first = opts.find((z) => z.v === next[0]);
      timer.current = setTimeout(() => onAnswered(first?.r || s.react), 350);
    }
  };

  const commitOther = () => {
    const v = otherVal.trim();
    if (!v || locked) return;
    A[s.id] = "otro";
    A[s.id + "_otro"] = v;
    setLocked(true);
    onAnswered(s.react);
  };

  return (
    <>
      <Header step={s} />
      {s.hint && (
        <p className="hint">
          {s.hint}
          {multi && picked.length > 0 && <> · <b>{picked.length} de {s.multi}</b></>}
        </p>
      )}
      <div
        className={"opts" + (s.two ? " two" : "") + (multi ? " multi" : "") + (locked ? " locked" : "")}
        role={multi ? "group" : "radiogroup"}
        aria-labelledby={"q_" + s.id}
      >
        {opts.map((o) => (
          <button key={o.v} type="button" className="opt" aria-pressed={picked.includes(o.v)} disabled={locked} onClick={() => click(o)}>
            <span className="tick" aria-hidden="true" />
            <span>{o.l}{o.s && <span className="sub">{o.s}</span>}</span>
          </button>
        ))}
      </div>
      {s.other && (
        <div className="otherrow" hidden={!showOther}>
          <input
            ref={otherRef}
            className="other"
            type="text"
            maxLength={160}
            placeholder="Cuéntame qué te frena"
            value={otherVal}
            disabled={locked}
            onChange={(e) => setOtherVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitOther(); } }}
          />
          <button className="send" type="button" aria-label="Enviar" disabled={locked || !otherVal.trim()} onClick={commitOther}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}

function Concept({ step, onNext }: { step: Step; onNext: () => void }) {
  return (
    <>
      <Header step={step} />
      <h2 className="q">Una membresía para quienes aman los <em>mercados</em>.</h2>
      <div className="mcard">
        <div className="mcard__brand"><img src={ICON} alt="" width={180} height={190} />RutaLover</div>
        <div className="mcard__big">5% a 15%<small>de descuento en las Mesas Aliadas de mercados por todo Puerto Rico</small></div>
        <ul>
          <li>Una tarjeta digital con tu código QR, siempre en tu celular.</li>
          <li>La enseñas en las Mesas Aliadas y te aplican el descuento.</li>
          <li>Cada Mesa Aliada pone su propia oferta.</li>
        </ul>
      </div>
      <div className="actions">
        <button className="btn btn-green" type="button" onClick={onNext}>Te digo lo que pienso <span className="arrow" aria-hidden="true">→</span></button>
      </div>
    </>
  );
}

function useEmailForm(initial = "", initialChecked = false) {
  const [email, setEmail] = useState(initial);
  const [checked, setChecked] = useState(initialChecked);
  const [err, setErr] = useState<string | null>(null);
  const [need, setNeed] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const validate = () => {
    setNeed(false);
    const v = email.trim();
    if (!EMAIL_RE.test(v)) { setErr("Revisa el email: parece que le falta algo, como la @ o el .com."); ref.current?.focus(); return null; }
    if (!checked) { setErr('Marca la casilla de "Acepto recibir emails" para que te pueda avisar.'); setNeed(true); return null; }
    setErr(null);
    return v;
  };
  const onCheck = (c: boolean) => {
    setChecked(c);
    if (c) { setNeed(false); if (err && /casilla/.test(err)) setErr(null); }
  };
  return { email, setEmail, checked, onCheck, err, need, ref, validate };
}

function EmailFields({ f, id, onEnter }: { f: ReturnType<typeof useEmailForm>; id: string; onEnter: () => void }) {
  return (
    <>
      <div className="field">
        <label htmlFor={id}>Tu email</label>
        <input
          ref={f.ref} type="email" id={id} autoComplete="email" inputMode="email" placeholder="nombre@correo.com"
          value={f.email} onChange={(e) => f.setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
        />
      </div>
      <label className={"check" + (f.need ? " need" : "")}>
        <input type="checkbox" checked={f.checked} onChange={(e) => f.onCheck(e.target.checked)} />
        <span>Acepto recibir emails de RutaMercado. Puedo darme de baja cuando quiera.</span>
      </label>
      {f.err && <p className="err">{f.err}</p>}
    </>
  );
}

function EmailStep({ step, A, onDone }: { step: Step; A: Answers; onDone: (left: boolean) => void }) {
  const f = useEmailForm(A.email ?? "", !!A.email);
  const notify = () => {
    const v = f.validate();
    if (!v) return;
    A.email = v;
    A.consentimiento_email = true;
    A.email_momento = "pregunta";
    onDone(true);
  };
  const skip = () => {
    delete A.email;
    delete A.email_momento;
    A.consentimiento_email = false;
    onDone(false);
  };
  return (
    <>
      <Header step={step} />
      <div style={{ display: "grid", gap: "1rem" }}>
        <EmailFields f={f} id="enc-email" onEnter={notify} />
        <div className="actions">
          <button className="btn btn-green" type="button" onClick={notify}>Avísame primero <span className="arrow" aria-hidden="true">→</span></button>
          <button className="textlink" type="button" onClick={skip}>Ahora no, terminar</button>
        </div>
      </div>
    </>
  );
}

function ThanksNote({ email }: { email: string }) {
  return (
    <div className="note fade">
      {PIN_CHECK}
      <div><b>¡Gracias por tu tiempo y tu interés!</b><p>Gracias por participar. Ya estás en la lista de espera de la membresía: te aviso primero a <span>{email}</span> cuando la lancemos.</p></div>
    </div>
  );
}

function Final({ A, reduce, setPose, speak, submit, goHome }: {
  A: Answers; reduce: boolean;
  setPose: (n: string, hop: boolean) => void;
  speak: (t: string, r: boolean) => void;
  submit: () => Promise<void>;
  goHome: () => void;
}) {
  const [joined, setJoined] = useState(!!A.email);
  const [copied, setCopied] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLInputElement>(null);
  const f = useEmailForm();

  const spend = SPEND[A.gasto as string];
  const vpm = VISITS[A.frecuencia as string];
  const low = !spend || !vpm;

  useEffect(() => {
    if (!A.completada_en) {
      A.completada_en = new Date().toISOString();
      void submit();
      track("gtag", "event", "encuesta_completada", { origen: A.origen });
    }
    setPose("feliz", true);
    speak(low ? "Tu respuesta me ayuda a diseñar algo que funcione para todo tipo de visitante." : "Hice los números con lo que me contaste. ¡Mira esto!", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = () => {
    const v = f.validate();
    if (!v) return;
    A.email = v;
    A.consentimiento_email = true;
    A.email_momento = "final";
    void submit();
    track("gtag", "event", "encuesta_lista_espera", { momento: "final" });
    track("fbq", "track", "Lead");
    setJoined(true);
    setPose("feliz", true);
    speak("¡Listo, ya estás en mi lista! Gracias por darme otra oportunidad.", true);
    setTimeout(() => noteRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }), 0);
  };

  let saving: React.ReactNode = null;
  if (!low) {
    const save = spend * 0.1;
    const visits = Math.ceil(24 / save);
    const months = visits / vpm;
    const yrs = Math.round(months / 12);
    const when = months <= 1 ? "este mismo mes" : months <= 12 ? "en unos " + Math.round(months) + " meses" : yrs <= 1 ? "en poco más de un año" : "en unos " + yrs + " años";
    const tail = months <= 12 ? " Lo demás del año sería ahorro." : " Mientras más vayas a los mercados, más rápido lo recuperas.";
    saving = (
      <div className="saving">
        <div className="ledger">
          <div><strong>${spend}</strong><span>gastas por visita</span></div>
          <div><strong>${save % 1 ? save.toFixed(2) : save}</strong><span>ahorrarías con 10%</span></div>
          <div><strong>{visits}</strong><span>visitas para recuperar $24</span></div>
        </div>
        <p>Al ritmo que vas, recuperarías los $24 de la membresía <b>{when}</b>.{tail}</p>
        <p className="fine">Cálculo aproximado con tu gasto promedio y un descuento conservador de 10%. Cada Mesa Aliada pone su oferta.</p>
      </div>
    );
  }

  const copy = () => {
    const ok = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(SHARE_URL).then(ok, () => shareRef.current?.select());
    else shareRef.current?.select();
  };

  return (
    <>
      <p className="chapter">Fin de la ruta</p>
      <h2 className="q">¡Gracias por darte la vuelta <em>conmigo</em>!</h2>
      {saving}
      {joined ? (
        <div ref={noteRef}><ThanksNote email={A.email ?? ""} /></div>
      ) : (
        <div className="wait">
          <div className="wait__head">
            {low ? (
              <><b>¿Te anoto en la <em>lista de espera</em>?</b><p>Te aviso primero cuando lancemos la membresía, sin compromiso.</p></>
            ) : (
              <><b>Ahora que sabes cuánto puedes <em>ahorrar</em>...</b><p>Ya viste cómo ese ahorro paga tu membresía. ¿Te anoto en la lista de espera? Te aviso primero cuando la lancemos, sin compromiso.</p></>
            )}
          </div>
          <div className="wform">
            <EmailFields f={f} id="enc-email2" onEnter={join} />
            <div className="actions">
              <button className="btn btn-green" type="button" onClick={join}>Anótame en la lista <span className="arrow" aria-hidden="true">→</span></button>
            </div>
          </div>
        </div>
      )}
      <div className="share">
        <b>¿Conoces a alguien que vive los mercados?</b>
        <p>Pásale la encuesta. Mientras más voces, mejor la ruta.</p>
        <div className="share__row">
          <input ref={shareRef} className="share__url" readOnly value={SHARE_URL} aria-label="Enlace de la encuesta" />
          <button className="btn btn-ghost" type="button" onClick={copy}>{copied ? "¡Copiado!" : "Copiar enlace"}</button>
        </div>
      </div>
      <div className="restart">
        <button className="btn btn-ghost" type="button" onClick={goHome}><span aria-hidden="true">←</span> Volver al inicio</button>
      </div>
      <div className="out">
        <a href="https://www.instagram.com/rutamercadopr" target="_blank" rel="noopener">Sígueme en @rutamercadopr</a>
        <a href="https://rutamercadopr.com" target="_blank" rel="noopener">Busca mercados en rutamercadopr.com</a>
      </div>
    </>
  );
}
