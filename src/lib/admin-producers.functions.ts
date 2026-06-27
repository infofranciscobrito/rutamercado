import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminProducer = {
  id: string;
  nombre: string;
  contacto: string | null;
  region: string | null;
  email: string | null;
  telefono: string | null;
  website: string | null;
  logo_url: string | null;
  status: "pending" | "approved";
  mercados: { id: string; nombre: string }[];
};


const optText = (max: number) =>
  z.preprocess(
    (v) => (v == null ? null : typeof v === "string" ? v.trim() : v),
    z.union([z.string().max(max), z.null()]).transform((v) => (v && v.length > 0 ? v : null)),
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

const optUrl = (max: number) =>
  z.preprocess(
    (v) => {
      if (v == null) return null;
      if (typeof v === "string") {
        const t = v.trim();
        return t.length === 0 ? null : t;
      }
      return v;
    },
    z.union([z.string().url().max(max), z.null()]),
  );

const LogoSchema = z
  .object({
    logo_base64: z.string().max(8_500_000),
    logo_filename: z.string().max(200),
    logo_mime: z.enum(["image/jpeg", "image/png"]),
  })
  .partial()
  .optional();

const UpsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().trim().min(1).max(200),
  contacto: optText(200),
  region: optText(100),
  email: optEmail,
  telefono: optText(500),
  website: optUrl(500),
  logo_url: optUrl(1000),
  logo: LogoSchema,
});


const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export const adminListProducers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProducer[]> => {
    const { data, error } = await context.supabase
      .from("productores")
      .select(
        "id, nombre, contacto, email, telefono, website, region, logo_url, productor_mercados(id, mercado_nombre)",
      )
      .order("nombre", { ascending: true });
    if (error) throw new Error(error.message);

    return (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      contacto: p.contacto ?? null,
      region: p.region ?? null,
      email: p.email ?? null,
      telefono: p.telefono ?? null,
      website: p.website ?? null,
      logo_url: p.logo_url ?? null,
      mercados: (p.productor_mercados ?? [])
        .map((m) => ({ id: m.id, nombre: m.mercado_nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })),
    }));

  });

async function uploadLogoIfPresent(logo: {
  logo_base64?: string;
  logo_filename?: string;
  logo_mime?: "image/jpeg" | "image/png";
}): Promise<string | null> {
  if (!logo.logo_base64 || !logo.logo_mime || !logo.logo_filename) return null;
  const bytes = Buffer.from(logo.logo_base64, "base64");
  if (bytes.byteLength > MAX_LOGO_BYTES) {
    throw new Error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ext = logo.logo_mime === "image/png" ? "png" : "jpg";
  const safeName = logo.logo_filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const path = `producers/${crypto.randomUUID()}-${safeName.replace(/\.[^.]+$/, "")}.${ext}`;
  const { error: upErr } = await supabaseAdmin.storage
    .from("market-images")
    .upload(path, bytes, { contentType: logo.logo_mime, upsert: false });
  if (upErr) throw new Error(upErr.message);
  const { data: pub } = supabaseAdmin.storage.from("market-images").getPublicUrl(path);
  return pub.publicUrl;
}

export const adminUpsertProducer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    let logoUrl: string | null = data.logo_url;
    if (data.logo && data.logo.logo_base64) {
      logoUrl = await uploadLogoIfPresent(data.logo);
    }

    const payload = {
      nombre: data.nombre,
      contacto: data.contacto,
      region: data.region,
      email: data.email,
      telefono: data.telefono,
      website: data.website,
      logo_url: logoUrl,
    };


    if (data.id) {
      const { error } = await context.supabase
        .from("productores")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    } else {
      const { data: inserted, error } = await context.supabase
        .from("productores")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true as const, id: inserted.id };
    }
  });

export const adminDeleteProducer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("productores")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminAddProducerMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productor_id: string; mercado_nombre: string }) =>
    z
      .object({
        productor_id: z.string().uuid(),
        mercado_nombre: z.string().trim().min(1).max(300),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("productor_mercados")
      .insert({
        productor_id: data.productor_id,
        mercado_nombre: data.mercado_nombre,
      })
      .select("id, mercado_nombre")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: row.id, mercado_nombre: row.mercado_nombre };
  });

export const adminRemoveProducerMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("productor_mercados")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
