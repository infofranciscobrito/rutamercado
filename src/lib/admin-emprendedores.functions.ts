import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  EMPRENDEDOR_CATEGORIES,
  TIEMPO_OPERANDO_OPTIONS,
  REGISTRO_COMERCIANTE_OPTIONS,
  FUENTE_INGRESO_OPTIONS,
  CANALES_VENTA_OPTIONS,
  TAMANO_EQUIPO_OPTIONS,
  ARTESANO_CERTIFICADO_OPTIONS,
} from "./emprendedores.functions";

export type AdminEmprendedor = {
  id: string;
  nombre_negocio: string;
  logo_url: string | null;
  descripcion: string;
  categoria_producto: string;
  region: string | null;
  municipio: string | null;
  instagram: string | null;
  email: string | null;
  telefono: string | null;
  persona_contacto: string | null;
  mercados_interes: string[];
  tiempo_operando: string | null;
  registro_comerciante: string | null;
  fuente_ingreso: string | null;
  canales_venta: string[];
  tamano_equipo: string | null;
  categoria_otro: string | null;
  artesano_certificado: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const optText = (max: number) =>
  z.preprocess(
    (v) => (v == null ? null : typeof v === "string" ? v.trim() : v),
    z
      .union([z.string().max(max), z.null()])
      .transform((v) => (v && v.length > 0 ? v : null)),
  );

const optEmail = z.preprocess(
  (v) => {
    if (v == null) return null;
    if (typeof v === "string") {
      const t = v.trim();
      return t.length === 0 ? null : t;
    }
    return v;
  },
  z.union([z.string().email().max(255), z.null()]),
);

const UpsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre_negocio: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().min(1).max(500),
  categoria_producto: z.enum(EMPRENDEDOR_CATEGORIES),
  region: optText(100),
  municipio: optText(100),
  instagram: optText(300),
  email: optEmail,
  telefono: optText(50),
  persona_contacto: optText(200),
  mercados_interes: optText(1000),
  tiempo_operando: z.enum(TIEMPO_OPERANDO_OPTIONS).nullable().optional(),
  registro_comerciante: z.enum(REGISTRO_COMERCIANTE_OPTIONS).nullable().optional(),
  fuente_ingreso: z.enum(FUENTE_INGRESO_OPTIONS).nullable().optional(),
  canales_venta: z.array(z.enum(CANALES_VENTA_OPTIONS)).nullable().optional(),
  tamano_equipo: z.enum(TAMANO_EQUIPO_OPTIONS).nullable().optional(),
  logo_url: optText(1000),
});

export const adminListEmprendedores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminEmprendedor[]> => {
    const { data, error } = await context.supabase
      .from("emprendedores")
      .select(
        "id, nombre_negocio, logo_url, descripcion, categoria_producto, region, municipio, instagram, email, telefono, persona_contacto, mercados_interes, tiempo_operando, registro_comerciante, fuente_ingreso, canales_venta, tamano_equipo, status, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      nombre_negocio: r.nombre_negocio,
      logo_url: r.logo_url ?? null,
      descripcion: r.descripcion,
      categoria_producto: r.categoria_producto,
      region: r.region ?? null,
      municipio: r.municipio ?? null,
      instagram: r.instagram ?? null,
      email: r.email ?? null,
      telefono: r.telefono ?? null,
      persona_contacto: r.persona_contacto ?? null,
      mercados_interes: (r.mercados_interes ?? []) as string[],
      tiempo_operando: (r as { tiempo_operando?: string | null }).tiempo_operando ?? null,
      registro_comerciante: (r as { registro_comerciante?: string | null }).registro_comerciante ?? null,
      fuente_ingreso: (r as { fuente_ingreso?: string | null }).fuente_ingreso ?? null,
      canales_venta: ((r as { canales_venta?: string[] | null }).canales_venta ?? []) as string[],
      tamano_equipo: (r as { tamano_equipo?: string | null }).tamano_equipo ?? null,
      status: (r.status === "pending"
        ? "pending"
        : r.status === "rejected"
          ? "rejected"
          : "approved") as "pending" | "approved" | "rejected",
      created_at: r.created_at,
    }));
  });

export const adminCountPendingEmprendedores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("emprendedores")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  });

export const adminUpsertEmprendedor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const mercadosArray = (data.mercados_interes ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      nombre_negocio: data.nombre_negocio,
      descripcion: data.descripcion,
      categoria_producto: data.categoria_producto,
      region: data.region,
      municipio: data.municipio,
      instagram: data.instagram,
      email: data.email,
      telefono: data.telefono,
      persona_contacto: data.persona_contacto,
      mercados_interes: mercadosArray.length > 0 ? mercadosArray : null,
      tiempo_operando: data.tiempo_operando ?? null,
      registro_comerciante: data.registro_comerciante ?? null,
      fuente_ingreso: data.fuente_ingreso ?? null,
      canales_venta:
        data.canales_venta && data.canales_venta.length > 0
          ? data.canales_venta
          : null,
      tamano_equipo: data.tamano_equipo ?? null,
      logo_url: data.logo_url,
    };

    if (data.id) {
      const { error } = await context.supabase
        .from("emprendedores")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    } else {
      const { data: inserted, error } = await context.supabase
        .from("emprendedores")
        .insert({ ...payload, status: "approved" })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true as const, id: inserted.id };
    }
  });

export const adminApproveEmprendedor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("emprendedores")
      .update({ status: "approved" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminRejectEmprendedor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("emprendedores")
      .update({ status: "rejected" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteEmprendedor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("emprendedores")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
