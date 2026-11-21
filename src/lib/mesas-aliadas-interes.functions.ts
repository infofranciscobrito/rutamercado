import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const iso = z.string().datetime({ offset: true });
const opt = (max: number) => z.string().trim().max(max).optional().nullable();

export const InteresSchema = z
  .object({
    id_respuesta: z.string().min(6).max(40),
    origen: z.string().trim().max(40),
    dispositivo: z.enum(["movil", "escritorio"]),
    is_test: z.boolean().default(false),
    iniciada_en: iso,
    completada_en: iso,
    categoria: z.enum(["comida", "reposteria", "bebidas", "agricola", "artesania", "joyeria", "ropa", "cuidado", "plantas", "mascotas", "otro"]),
    frecuencia: z.enum(["1_menos", "2_3", "4_6", "7_mas"]),
    ticket: z.enum(["menos_10", "10_25", "25_50", "mas_50"]),
    descuento: z.enum(["5", "10", "15", "no_se"]),
    recibir: z.array(z.enum(["regresan", "nuevos", "rutamapa", "reporte"])).min(1).max(2),
    interes: z.enum(["si", "info", "no"]),
    tipo: z.enum(["anonima", "con_contacto"]),
    negocio: opt(120),
    instagram: opt(60),
    email: z.string().trim().toLowerCase().email().max(255).optional().nullable(),
    telefono: opt(30),
    consentimiento: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.tipo === "con_contacto") {
      if (!d.email) ctx.addIssue({ code: "custom", path: ["email"], message: "falta el correo" });
      if (!d.consentimiento) ctx.addIssue({ code: "custom", path: ["consentimiento"], message: "falta el permiso" });
      if (d.interes === "no") ctx.addIssue({ code: "custom", path: ["tipo"], message: "con interés 'no' la respuesta es anónima" });
    }
  });

export const submitMesasAliadasInteres = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InteresSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const anonima = data.tipo === "anonima";
    const row = {
      ...data,
      origen: data.origen || "directo",
      negocio: anonima ? null : data.negocio || null,
      instagram: anonima ? null : data.instagram || null,
      email: anonima ? null : data.email ?? null,
      telefono: anonima ? null : data.telefono || null,
      consentimiento: anonima ? false : data.consentimiento,
    };
    const { error } = await supabaseAdmin
      .from("mesas_aliadas_interes")
      .upsert(row, { onConflict: "id_respuesta" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listMesasAliadasInteres = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mesas_aliadas_interes")
      .select("id, id_respuesta, origen, dispositivo, is_test, iniciada_en, completada_en, categoria, frecuencia, ticket, descuento, recibir, interes, tipo, negocio, instagram, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const exportContactosMesasAliadas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mesas_aliadas_interes")
      .select("negocio, instagram, email, telefono, interes, descuento, categoria, frecuencia, completada_en")
      .eq("tipo", "con_contacto")
      .eq("is_test", false)
      .order("completada_en", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteTestMesasAliadas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("mesas_aliadas_interes").delete().eq("is_test", true).select("id");
    if (error) throw new Error(error.message);
    return { deleted: data?.length ?? 0 };
  });

