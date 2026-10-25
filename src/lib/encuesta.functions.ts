import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const iso = z.string().datetime({ offset: true });

export const EncuestaSchema = z.object({
  id_respuesta: z.string().min(6).max(40),
  origen: z.string().trim().max(40),
  dispositivo: z.enum(["movil", "escritorio"]),
  iniciada_en: iso,
  completada_en: iso,
  frecuencia: z.enum(["fines_semana", "2_3_mes", "1_mes", "2_3_meses", "casi_nunca"]),
  cantidad_mercados: z.enum(["0", "1", "2_3", "4_6", "7_mas"]),
  gasto: z.enum(["menos_15", "15_30", "31_50", "51_80", "mas_80"]),
  categorias: z
    .array(z.enum(["comida", "cafe_postres", "agricola", "despensa", "artesania", "ropa", "plantas", "cuidado", "mascotas"]))
    .max(3),
  lealtad: z.enum(["favoritas", "a_veces", "nuevas"]),
  descubrimiento: z
    .array(z.enum(["redes_mercado", "rutamercado", "amistades", "whatsapp", "de_paso", "email"]))
    .max(2),
  motivadores: z
    .array(z.enum(["descuentos", "info_anticipada", "cercania", "estacionamiento", "familia", "ambiente", "nada"]))
    .max(3),
  precio_maximo: z.enum(["0", "12", "18", "24", "36", "mas_36"]),
  intencion_24: z.enum(["seguro", "probable_si", "no_se", "probable_no", "no"]).optional().nullable(),
  plan: z.enum(["anual", "mensual", "ninguno"]).optional().nullable(),
  dudas: z
    .enum(["poco_uso", "que_mesas", "pago_por_uso", "descuento_bajo", "no_membresias", "otro"])
    .optional()
    .nullable(),
  dudas_otro: z.string().trim().max(160).optional().nullable(),
  region: z.enum(["metro", "norte", "sur", "este", "oeste", "centro", "islas", "visita"]),
  edad: z.enum(["18_24", "25_34", "35_44", "45_54", "55_64", "65_mas"]),
  sexo: z.enum(["mujer", "hombre", "no_decir"]),
  email: z.string().trim().toLowerCase().email().max(255).optional().nullable(),
  consentimiento_email: z.boolean(),
  email_momento: z.enum(["pregunta", "final"]).optional().nullable(),
});

export const submitEncuesta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EncuestaSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      ...data,
      origen: data.origen || "directo",
      intencion_24: data.intencion_24 ?? null,
      plan: data.plan ?? null,
      dudas: data.dudas ?? null,
      dudas_otro: data.dudas_otro ?? null,
      email: data.consentimiento_email ? data.email ?? null : null,
      email_momento: data.email_momento ?? null,
    };
    const { error } = await supabaseAdmin
      .from("encuesta_respuestas")
      .upsert(row, { onConflict: "id_respuesta" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const COLUMNS_SIN_EMAIL =
  "id, id_respuesta, origen, dispositivo, iniciada_en, completada_en, frecuencia, cantidad_mercados, gasto, categorias, lealtad, descubrimiento, motivadores, precio_maximo, intencion_24, plan, dudas, dudas_otro, region, edad, sexo, consentimiento_email, email_momento, created_at, updated_at";

export const listEncuestaRespuestas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("encuesta_respuestas")
      .select(COLUMNS_SIN_EMAIL)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { count, error: cErr } = await context.supabase
      .from("encuesta_respuestas")
      .select("id", { count: "exact", head: true })
      .not("email", "is", null);
    if (cErr) throw new Error(cErr.message);
    return { respuestas: data ?? [], conEmail: count ?? 0 };
  });

export const exportListaEspera = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("encuesta_respuestas")
      .select("email, email_momento, completada_en, plan")
      .eq("consentimiento_email", true)
      .not("email", "is", null)
      .order("completada_en", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
