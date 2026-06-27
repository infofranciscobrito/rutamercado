import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const RegisterSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  contacto: optText(200),
  region: optText(100),
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
  website: z.preprocess(
    (v) => {
      if (v == null) return null;
      if (typeof v === "string") {
        const t = v.trim();
        return t.length === 0 ? null : t;
      }
      return v;
    },
    z.union([z.string().url().max(500), z.null()]),
  ),
  pueblo: optText(500),
  mercados: z.string().trim().max(1000).optional().default(""),
  logo_base64: z.string().max(8_500_000).optional(),
  logo_filename: z.string().max(200).optional(),
  logo_mime: z.enum(["image/jpeg", "image/png"]).optional(),
});

export const registerProducer = createServerFn({ method: "POST" })
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
      const path = `producers/registrations/${crypto.randomUUID()}-${safeName}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("market-images")
        .upload(path, bytes, { contentType: data.logo_mime, upsert: false });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabaseAdmin.storage.from("market-images").getPublicUrl(path);
      logoUrl = pub.publicUrl;
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("productores")
      .insert({
        nombre: data.nombre,
        contacto: data.contacto,
        region: data.region ?? null,
        pueblo: data.pueblo ?? null,
        email: data.email,
        telefono: data.telefono,
        website: data.website,
        logo_url: logoUrl,
        status: "pending",
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const mercadosList = (data.mercados ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
      .slice(0, 50);

    if (mercadosList.length > 0) {
      const rows = mercadosList.map((mercado_nombre) => ({
        productor_id: inserted.id,
        mercado_nombre,
      }));
      const { error: mErr } = await supabaseAdmin
        .from("productor_mercados")
        .insert(rows);
      if (mErr) console.error("producer markets insert failed", mErr);
    }

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
            from: "RutaMercado <productores@rutamercadopr.com>",
            to: ["productores@rutamercadopr.com"],
            subject: `Nuevo registro de productor — ${data.nombre}`,
            text:
              `Productor: ${data.nombre}\n` +
              `Contacto: ${data.contacto ?? "—"}\n` +
              `Región: ${data.region ?? "—"}\n` +
              `Email: ${data.email ?? "—"}\n` +
              `Teléfono: ${data.telefono ?? "—"}\n` +
              `Web: ${data.website ?? "—"}\n` +
              `Mercados: ${mercadosList.join(", ") || "—"}\n` +
              (logoUrl ? `Logo: ${logoUrl}\n` : ""),
          }),
        });
      } catch (e) {
        console.error("registerProducer Resend send failed", e);
      }
    }

    return { ok: true as const, id: inserted.id };
  });
