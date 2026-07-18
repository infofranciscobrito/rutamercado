import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const EMPRENDEDOR_CATEGORIES = [
  "Comida y Repostería",
  "Artesanías",
  "Ropa y Accesorios",
  "Arte",
  "Productos Agrícolas",
  "Cuidado Personal",
  "Otro",
] as const;

export type EmprendedorCategory = (typeof EMPRENDEDOR_CATEGORIES)[number];

export const TIEMPO_OPERANDO_OPTIONS = [
  "Menos de 1 año",
  "1-3 años",
  "3-5 años",
  "Más de 5 años",
] as const;

export const REGISTRO_COMERCIANTE_OPTIONS = ["Sí", "No", "En proceso"] as const;

export const FUENTE_INGRESO_OPTIONS = [
  "Principal",
  "Complementaria",
  "Ocasional",
] as const;

export const CANALES_VENTA_OPTIONS = [
  "Tienda física",
  "Tienda en línea",
  "Redes sociales",
  "Solo vendo en mercados",
] as const;

export const TAMANO_EQUIPO_OPTIONS = ["Solo yo", "2-5 personas", "6 o más"] as const;

export const ARTESANO_CERTIFICADO_OPTIONS = ["Sí", "No"] as const;

export type Emprendedor = {
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
};

function serverPublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export const listEmprendedores = createServerFn({ method: "GET" }).handler(
  async (): Promise<Emprendedor[]> => {
    const supabase = serverPublic();
    const { data, error } = await supabase
      .from("emprendedores")
      .select(
        "id, nombre_negocio, logo_url, descripcion, categoria_producto, region, municipio, instagram, email, telefono, persona_contacto, mercados_interes",
      )
      .eq("status", "approved")
      .order("nombre_negocio", { ascending: true });
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
    }));
  },
);

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const optText = (max: number) =>
  z.preprocess(
    (v) => {
      if (v == null) return null;
      if (typeof v === "string") {
        const t = v.trim();
        return t.length === 0 ? null : t;
      }
      return v;
    },
    z.union([z.string().max(max), z.null()]),
  );

const RegisterSchema = z
  .object({
    nombre_negocio: z.string().trim().min(1, "El nombre es obligatorio").max(200),
    descripcion: z.string().trim().min(1, "La descripción es obligatoria").max(500),
    categoria_producto: z.enum(EMPRENDEDOR_CATEGORIES),
    region: optText(100),
    municipio: optText(100),
    instagram: optText(300),
    email: z.preprocess(
      (v) => {
        if (v == null) return null;
        if (typeof v === "string") {
          const t = v.trim();
          return t.length === 0 ? null : t;
        }
        return v;
      },
      z.union([z.string().email().max(255), z.null()]),
    ),
    telefono: optText(50),
    persona_contacto: optText(200),
    mercados_interes: optText(1000),
    tiempo_operando: z.enum(TIEMPO_OPERANDO_OPTIONS).nullable().optional(),
    registro_comerciante: z.enum(REGISTRO_COMERCIANTE_OPTIONS).nullable().optional(),
    fuente_ingreso: z.enum(FUENTE_INGRESO_OPTIONS).nullable().optional(),
    canales_venta: z.array(z.enum(CANALES_VENTA_OPTIONS)).nullable().optional(),
    tamano_equipo: z.enum(TAMANO_EQUIPO_OPTIONS).nullable().optional(),
    logo_base64: z.string().max(8_500_000).optional(),
    logo_filename: z.string().max(200).optional(),
    logo_mime: z.enum(["image/jpeg", "image/png"]).optional(),
  })
  .refine((d) => Boolean(d.instagram || d.email || d.telefono), {
    message: "Provee al menos un contacto (Instagram, email o teléfono).",
    path: ["instagram"],
  });

export const submitEmprendedor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RegisterSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let logoUrl: string | null = null;
    if (data.logo_base64 && data.logo_mime && data.logo_filename) {
      const bytes = Buffer.from(data.logo_base64, "base64");
      if (bytes.byteLength > MAX_LOGO_BYTES) {
        throw new Error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      }
      const ext = data.logo_mime === "image/png" ? "png" : "jpg";
      const safeName = data.logo_filename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 80)
        .replace(/\.[^.]+$/, "");
      const path = `emprendedores/${crypto.randomUUID()}-${safeName}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("market-images")
        .upload(path, bytes, { contentType: data.logo_mime, upsert: false });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabaseAdmin.storage
        .from("market-images")
        .getPublicUrl(path);
      logoUrl = pub.publicUrl;
    }

    const mercadosArray = (data.mercados_interes ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { data: inserted, error } = await supabaseAdmin
      .from("emprendedores")
      .insert({
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
        logo_url: logoUrl,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "RutaMercado <emprendedores@rutamercadopr.com>",
            to: ["productores@rutamercadopr.com"],
            subject: `Nuevo emprendedor — ${data.nombre_negocio}`,
            text:
              `Negocio: ${data.nombre_negocio}\n` +
              `Categoría: ${data.categoria_producto}\n` +
              `Región: ${data.region ?? "—"}\n` +
              `Municipio: ${data.municipio ?? "—"}\n` +
              `Contacto: ${data.persona_contacto ?? "—"}\n` +
              `Instagram: ${data.instagram ?? "—"}\n` +
              `Email: ${data.email ?? "—"}\n` +
              `Teléfono: ${data.telefono ?? "—"}\n` +
              `Mercados de interés: ${mercadosArray.join(", ") || "—"}\n` +
              `\n— Información interna —\n` +
              `Tiempo operando: ${data.tiempo_operando ?? "—"}\n` +
              `Registro de Comerciante: ${data.registro_comerciante ?? "—"}\n` +
              `Fuente de ingreso: ${data.fuente_ingreso ?? "—"}\n` +
              `Canales de venta: ${(data.canales_venta ?? []).join(", ") || "—"}\n` +
              `Tamaño del equipo: ${data.tamano_equipo ?? "—"}\n` +
              `\nDescripción:\n${data.descripcion}\n` +
              (logoUrl ? `\nLogo: ${logoUrl}\n` : ""),
          }),
        });
      } catch (e) {
        console.error("submitEmprendedor Resend send failed", e);
      }
    }

    return { ok: true as const, id: inserted.id };
  });
