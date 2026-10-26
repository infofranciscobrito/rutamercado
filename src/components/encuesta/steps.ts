// Contenido de la encuesta, copiado tal cual del HTML de referencia.
export type Answers = Record<string, unknown> & {
  origen: string;
  id_respuesta: string;
  dispositivo: "movil" | "escritorio";
  iniciada_en: string;
  completada_en?: string;
  email?: string;
  consentimiento_email?: boolean;
  email_momento?: "pregunta" | "final";
};

export type Opt = { v: string; l: string; r?: string; s?: string; solo?: boolean };
export type Step = {
  id: string;
  ch: number;
  pose: string;
  lead?: string;
  q?: string;
  hint?: string;
  react?: string;
  two?: boolean;
  multi?: number;
  fast?: boolean;
  other?: boolean;
  type?: "concept" | "email" | "final";
  when?: (a: Answers) => boolean;
  opts?: Opt[];
};

export const POSES: Record<string, string> = {
  saludo: "/encuesta/mrmercado-saludo.png",
  pregunta: "/encuesta/mrmercado-pregunta.png",
  mercado: "/encuesta/mrmercado-mercado.png",
  celular: "/encuesta/mrmercado-celular.png",
  pensando: "/encuesta/mrmercado-pensando.png",
  feliz: "/encuesta/mrmercado-feliz.png",
  anotando: "/encuesta/mrmercado-anotando.png",
  celebrando: "/encuesta/mrmercado-celebrando.png",
};
export const ICON = "/encuesta/icono-rutamercado.png";

export const CH = [
  "Parada 1 · La llegada",
  "Parada 2 · Entre las mesas",
  "Parada 3 · Lo que te mueve",
  "Parada 4 · Mi idea",
  "Parada 5 · Para conocerte",
];
const NEUTRAL = "Anotado. Gracias por decírmelo claro.";

export const SPEND: Record<string, number> = { menos_15: 10, "15_30": 22, "31_50": 40, "51_80": 65, mas_80: 100 };
export const VISITS: Record<string, number> = { fines_semana: 4, "2_3_mes": 2.5, "1_mes": 1, "2_3_meses": 0.4, casi_nunca: 0.2 };

export const STEPS: Step[] = [
  { id: "frecuencia", ch: 0, pose: "pregunta", lead: "Primero lo primero.", q: "¿Cada cuánto vas a mercados locales?", opts: [
    { v: "fines_semana", l: "Casi todos los fines de semana", r: "¡Eres de los míos! Fin de semana sin mercado no es fin de semana." },
    { v: "2_3_mes", l: "2 o 3 veces al mes", r: "Buen ritmo. Seguro ya te conocen en varias mesas." },
    { v: "1_mes", l: "Una vez al mes", r: "Una cita fija al mes. Me gusta ese compromiso." },
    { v: "2_3_meses", l: "Cada 2 o 3 meses", r: "Vas cuando se da, y eso también cuenta." },
    { v: "casi_nunca", l: "Casi nunca", r: "¡Pues hoy te llevo yo de paseo!" }] },
  { id: "cantidad_mercados", ch: 0, pose: "pregunta", two: true, lead: "Ahora cuéntame de tu ruta.", q: "En los últimos 3 meses, ¿a cuántos mercados <em>distintos</em> has ido?", opts: [
    { v: "0", l: "Ninguno", r: "Tranquilidad, para eso estoy yo." },
    { v: "1", l: "1", r: "Un mercado favorito. Eso se respeta." },
    { v: "2_3", l: "2 o 3", r: "Te gusta variar un poco. ¡Bien!" },
    { v: "4_6", l: "4 a 6", r: "Se nota que te gusta explorar." },
    { v: "7_mas", l: "7 o más", r: "¡Me vas a tener que enseñar la ruta a mí!" }] },
  { id: "gasto", ch: 1, pose: "mercado", lead: "Entre tú y yo...", q: "Cada vez que vas a un mercado, ¿cuánto gastas más o menos?", opts: [
    { v: "menos_15", l: "Menos de $15", r: "Gasto medido. Eso es disciplina." },
    { v: "15_30", l: "$15 a $30", r: "Lo justo para salir con algo rico." },
    { v: "31_50", l: "$31 a $50", r: "Se nota que apoyas lo local." },
    { v: "51_80", l: "$51 a $80", r: "¡Las mesas te deben querer mucho!" },
    { v: "mas_80", l: "Más de $80", r: "¡Tú eres el corazón del mercado!" }] },
  { id: "categorias", ch: 1, pose: "mercado", multi: 3, lead: "Esta parte me encanta.", q: "¿En qué se te va más el dinero?", hint: "Escoge 3", opts: [
    { v: "comida", l: "Comida para comer ahí", r: "La comida del mercado no tiene competencia." },
    { v: "cafe_postres", l: "Café, postres y bebidas", r: "Yo tampoco salgo sin mi cafecito." },
    { v: "agricola", l: "Productos agrícolas y frescos", r: "De la finca a tu mesa. Así mismo." },
    { v: "despensa", l: "Despensa: salsas, mieles, panes, especias", r: "Una despensa con sabor local. ¡Buen gusto!" },
    { v: "artesania", l: "Artesanía y arte", r: "Apoyar a quien crea con sus manos. Me encanta." },
    { v: "ropa", l: "Ropa y accesorios", r: "Estilo con sello local. ¡Bien!" },
    { v: "plantas", l: "Plantas", r: "Siempre cabe una plantita más, ¿verdad?" },
    { v: "cuidado", l: "Cuidado personal: jabones, velas, cremas", r: "Lo hecho a mano huele distinto." },
    { v: "mascotas", l: "Cosas para mascotas", r: "Las mascotas también merecen lo local." }] },
  { id: "lealtad", ch: 1, pose: "pregunta", lead: "Pregunta de corazón.", q: "¿Le vuelves a comprar a las mismas mesas?", opts: [
    { v: "favoritas", l: "Sí, tengo mis favoritas y las busco", r: "Eso es lealtad, y las mesas lo agradecen." },
    { v: "a_veces", l: "A veces", r: "Un poco de las dos cosas. Perfecto." },
    { v: "nuevas", l: "No, me gusta probar mesas nuevas", r: "Siempre buscando lo nuevo. ¡Me encanta!" }] },
  { id: "descubrimiento", ch: 1, pose: "celular", multi: 2, lead: "Yo vivo pegado al celular buscando mercados.", q: "¿Cómo decides a qué mercado ir?", hint: "Escoge 2", react: "Anotado. Así sé dónde encontrarte la próxima vez.", opts: [
    { v: "redes_mercado", l: "Instagram o Facebook del mercado" },
    { v: "rutamercado", l: "RutaMercado" },
    { v: "amistades", l: "Amigos o familia" },
    { v: "whatsapp", l: "Grupos de WhatsApp" },
    { v: "de_paso", l: "Lo veo cuando paso por ahí" },
    { v: "email", l: "Newsletter o email" }] },
  { id: "motivadores", ch: 2, pose: "pensando", multi: 3, lead: "Ahora, en serio.", q: "¿Qué te haría ir a <em>más</em> mercados?", hint: "Escoge 3", react: "Mmm... eso me da una idea. Ven, que te cuento.", opts: [
    { v: "descuentos", l: "Descuentos en las mesas" },
    { v: "info_anticipada", l: "Saber con tiempo dónde y cuándo hay" },
    { v: "cercania", l: "Que haya mercados más cerca de mí" },
    { v: "estacionamiento", l: "Mejor estacionamiento" },
    { v: "familia", l: "Actividades para niños o mascotas" },
    { v: "ambiente", l: "Música y buen ambiente" },
    { v: "nada", l: "Nada, voy lo que quiero ir", solo: true }] },
  { id: "concepto", ch: 3, pose: "celebrando", type: "concept", lead: "Te cuento algo en lo que estoy trabajando. No estoy vendiendo nada todavía: solo quiero tu opinión sincera." },
  { id: "precio_maximo", ch: 3, pose: "pensando", two: true, lead: "Sin presión. Dime lo que de verdad piensas.", q: "Si existiera, ¿cuánto es lo <em>máximo</em> que pagarías al año por algo así?", react: NEUTRAL, opts: [
    { v: "0", l: "No pagaría nada" }, { v: "12", l: "Hasta $12" }, { v: "18", l: "Hasta $18" },
    { v: "24", l: "Hasta $24" }, { v: "36", l: "Hasta $36" }, { v: "mas_36", l: "Más de $36" }] },
  { id: "intencion_24", ch: 3, pose: "pregunta", when: (A) => !["0", "24"].includes(A.precio_maximo as string), lead: "Ahora con un precio sobre la mesa.", q: "Si costara <em>$24 al año</em> (son $2 al mes), ¿qué tan probable es que la compres?", react: "Gracias por tu sinceridad. Eso es lo que más necesito.", opts: [
    { v: "seguro", l: "La compraría seguro" }, { v: "probable_si", l: "Probablemente sí" }, { v: "no_se", l: "No sé todavía" },
    { v: "probable_no", l: "Probablemente no" }, { v: "no", l: "No la compraría" }] },
  { id: "plan", ch: 3, pose: "pregunta", when: (A) => A.precio_maximo !== "0" && !["no_se", "probable_no", "no"].includes(A.intencion_24 as string), lead: "Supongamos que te unes.", q: "¿Qué plan escogerías?", react: "Anotado.", opts: [
    { v: "anual", l: "Anual: $24", s: "Un solo pago al año" },
    { v: "mensual", l: "Mensual: $3.99", s: "Son $47.88 al año" },
    { v: "ninguno", l: "Ninguno" }] },
  { id: "dudas", ch: 3, pose: "pensando", other: true, when: (A) => A.precio_maximo === "0", lead: "Dímelo sin miedo, que para eso pregunto.", q: "¿Qué es lo que más te haría dudar?", react: "Eso es oro para mí. ¡Gracias!", opts: [
    { v: "poco_uso", l: "No voy suficiente como para aprovecharla" },
    { v: "que_mesas", l: "Quiero saber primero qué mesas participan" },
    { v: "pago_por_uso", l: "Prefiero pagar solo cuando voy" },
    { v: "descuento_bajo", l: "Un descuento de 15% no me mueve" },
    { v: "no_membresias", l: "No me gustan las membresías" },
    { v: "otro", l: "Otro" }] },
  { id: "region", ch: 4, pose: "anotando", two: true, fast: true, lead: "Ya casi llegamos. Un poquito sobre ti.", q: "¿Por dónde vives?", opts: [
    { v: "metro", l: "Área metro" }, { v: "norte", l: "Norte" }, { v: "sur", l: "Sur" }, { v: "este", l: "Este" },
    { v: "oeste", l: "Oeste" }, { v: "centro", l: "Centro / montaña" }, { v: "islas", l: "Vieques o Culebra" }, { v: "visita", l: "Estoy de visita en PR" }] },
  { id: "edad", ch: 4, pose: "anotando", two: true, fast: true, lead: "Sigo anotando.", q: "¿Qué edad tienes?", opts: [
    { v: "18_24", l: "18 a 24" }, { v: "25_34", l: "25 a 34" }, { v: "35_44", l: "35 a 44" },
    { v: "45_54", l: "45 a 54" }, { v: "55_64", l: "55 a 64" }, { v: "65_mas", l: "65 o más" }] },
  { id: "sexo", ch: 4, pose: "anotando", fast: true, lead: "La última de estas.", q: "¿Cuál es tu sexo?", opts: [
    { v: "mujer", l: "Mujer" }, { v: "hombre", l: "Hombre" }, { v: "no_decir", l: "Prefiero no decir" }] },
  { id: "email", ch: 4, pose: "celular", type: "email", lead: "¡Llegamos! Una última cosa, y es opcional.", q: "¿Quieres enterarte primero cuando lancemos la membresía?" },
  { id: "final", ch: 5, pose: "feliz", type: "final" },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
