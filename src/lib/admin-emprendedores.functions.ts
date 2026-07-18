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
import { MARKET_REGIONS } from "@/types/market";


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
  categoria_otro: optText(200),
  artesano_certificado: z.enum(ARTESANO_CERTIFICADO_OPTIONS).nullable().optional(),
  logo_url: optText(1000),
});

export const adminListEmprendedores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminEmprendedor[]> => {
    const { data, error } = await context.supabase
      .from("emprendedores")
      .select(
        "id, nombre_negocio, logo_url, descripcion, categoria_producto, region, municipio, instagram, email, telefono, persona_contacto, mercados_interes, tiempo_operando, registro_comerciante, fuente_ingreso, canales_venta, tamano_equipo, categoria_otro, artesano_certificado, status, created_at",
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
      categoria_otro: (r as { categoria_otro?: string | null }).categoria_otro ?? null,
      artesano_certificado: (r as { artesano_certificado?: string | null }).artesano_certificado ?? null,
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
      categoria_otro:
        data.categoria_producto === "Otro" ? (data.categoria_otro ?? null) : null,
      artesano_certificado:
        data.categoria_producto === "Artesanías"
          ? (data.artesano_certificado ?? null)
          : null,
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

// ==================== Business registration analytics ====================

const AnalyticsFilterSchema = z.object({
  from: z.string().datetime().nullable().optional(),
  to: z.string().datetime().nullable().optional(),
  region: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
  status: z.enum(["approved", "pending", "rejected"]).nullable().optional(),
});

export type AnalyticsFilters = z.infer<typeof AnalyticsFilterSchema>;

type Row = {
  id: string;
  nombre_negocio: string;
  categoria_producto: string;
  region: string | null;
  municipio: string | null;
  mercados_interes: string[] | null;
  tiempo_operando: string | null;
  registro_comerciante: string | null;
  fuente_ingreso: string | null;
  canales_venta: string[] | null;
  tamano_equipo: string | null;
  categoria_otro: string | null;
  artesano_certificado: string | null;
  status: string;
  created_at: string;
};

export type BusinessAnalytics = {
  kpis: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    newThisMonth: number;
    newPrevMonth: number;
  };
  trendMonthly: { month: string; count: number }[];
  funnel: { approved: number; pending: number; rejected: number };
  byCategoria: { label: string; count: number }[];
  byRegion: { label: string; count: number }[];
  byCanalVenta: { label: string; count: number }[];
  byFormalidad: { label: string; count: number }[];
  byDependencia: { label: string; count: number }[];
  byTiempoOperando: { label: string; count: number }[];
  byTamanoEquipo: { label: string; count: number }[];
  empleosEstimados: number;
  topMercados: { label: string; count: number }[];
};

function applyFilters<T extends { created_at: string; region: string | null; categoria_producto: string; status: string }>(
  rows: T[],
  f: AnalyticsFilters,
): T[] {
  return rows.filter((r) => {
    if (f.from && r.created_at < f.from) return false;
    if (f.to && r.created_at > f.to) return false;
    if (f.region && r.region !== f.region) return false;
    if (f.categoria && r.categoria_producto !== f.categoria) return false;
    if (f.status && r.status !== f.status) return false;
    return true;
  });
}

function countBy(values: (string | null | undefined)[], order?: readonly string[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  if (order) {
    return order.map((o) => ({ label: o, count: map.get(o) ?? 0 }));
  }
  return Array.from(map, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count,
  );
}

export const getBusinessRegistrationAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyticsFilterSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<BusinessAnalytics> => {
    const { data: rowsAll, error } = await context.supabase
      .from("emprendedores")
      .select(
        "id, nombre_negocio, categoria_producto, region, municipio, mercados_interes, tiempo_operando, registro_comerciante, fuente_ingreso, canales_venta, tamano_equipo, categoria_otro, artesano_certificado, status, created_at",
      );
    if (error) throw new Error(error.message);

    const all = (rowsAll ?? []) as Row[];
    const rows = applyFilters(all, data);

    const approved = rows.filter((r) => r.status === "approved").length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;

    const now = new Date();
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const newThisMonth = rows.filter((r) => r.created_at >= startThis).length;
    const newPrevMonth = rows.filter(
      (r) => r.created_at >= startPrev && r.created_at < startThis,
    ).length;

    // Trend: last 12 months (independent of date-range filter, honoring region/categoria/status)
    const trendRows = all.filter((r) => {
      if (data.region && r.region !== data.region) return false;
      if (data.categoria && r.categoria_producto !== data.categoria) return false;
      if (data.status && r.status !== data.status) return false;
      return true;
    });
    const months: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ month: key, count: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.month, i]));
    for (const r of trendRows) {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const i = idx.get(key);
      if (i != null) months[i].count += 1;
    }

    // Multi-value canales
    const canales: string[] = [];
    for (const r of rows) for (const c of r.canales_venta ?? []) canales.push(c);

    // Top mercados
    const mercadoMap = new Map<string, { label: string; count: number }>();
    for (const r of rows) {
      const raw = r.mercados_interes ?? [];
      for (const chunk of raw) {
        for (const piece of String(chunk).split(",")) {
          const t = piece.trim();
          if (!t) continue;
          const key = t.toLowerCase();
          const cur = mercadoMap.get(key);
          if (cur) cur.count += 1;
          else mercadoMap.set(key, { label: t, count: 1 });
        }
      }
    }
    const topMercados = Array.from(mercadoMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Empleos estimados: 1 · Solo yo, 4 · 2-5, 6 · 6+
    const midpoint: Record<string, number> = {
      "Solo yo": 1,
      "2-5 personas": 4,
      "6 o más": 6,
    };
    let empleosEstimados = 0;
    for (const r of rows) {
      if (r.tamano_equipo && midpoint[r.tamano_equipo] != null) {
        empleosEstimados += midpoint[r.tamano_equipo];
      }
    }

    return {
      kpis: {
        total: rows.length,
        approved,
        pending,
        rejected,
        newThisMonth,
        newPrevMonth,
      },
      trendMonthly: months,
      funnel: { approved, pending, rejected },
      byCategoria: countBy(
        rows.map((r) => r.categoria_producto),
        EMPRENDEDOR_CATEGORIES,
      ).filter((x) => x.count > 0).sort((a, b) => b.count - a.count),
      byRegion: countBy(
        rows.map((r) => r.region),
        MARKET_REGIONS as readonly string[],
      ).filter((x) => x.count > 0).sort((a, b) => b.count - a.count),
      byCanalVenta: countBy(canales, CANALES_VENTA_OPTIONS).filter((x) => x.count > 0),
      byFormalidad: countBy(
        rows.map((r) => r.registro_comerciante),
        REGISTRO_COMERCIANTE_OPTIONS,
      ),
      byDependencia: countBy(
        rows.map((r) => r.fuente_ingreso),
        FUENTE_INGRESO_OPTIONS,
      ),
      byTiempoOperando: countBy(
        rows.map((r) => r.tiempo_operando),
        TIEMPO_OPERANDO_OPTIONS,
      ),
      byTamanoEquipo: countBy(
        rows.map((r) => r.tamano_equipo),
        TAMANO_EQUIPO_OPTIONS,
      ),
      empleosEstimados,
      topMercados,
    };
  });

export type ExportedBusinessRow = Row & {
  logo_url: string | null;
  descripcion: string;
  instagram: string | null;
  email: string | null;
  telefono: string | null;
  persona_contacto: string | null;
};

export const exportBusinessRegistrationsRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyticsFilterSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<ExportedBusinessRow[]> => {
    const { data: rows, error } = await context.supabase
      .from("emprendedores")
      .select(
        "id, nombre_negocio, logo_url, descripcion, categoria_producto, categoria_otro, artesano_certificado, region, municipio, instagram, email, telefono, persona_contacto, mercados_interes, tiempo_operando, registro_comerciante, fuente_ingreso, canales_venta, tamano_equipo, status, created_at",
      );
    if (error) throw new Error(error.message);
    const filtered = applyFilters((rows ?? []) as ExportedBusinessRow[], data);
    return filtered;
  });

// Convenience re-exports for the dashboard
export {
  EMPRENDEDOR_CATEGORIES,
  TIEMPO_OPERANDO_OPTIONS,
  REGISTRO_COMERCIANTE_OPTIONS,
  FUENTE_INGRESO_OPTIONS,
  CANALES_VENTA_OPTIONS,
  TAMANO_EQUIPO_OPTIONS,
};

