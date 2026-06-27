import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Producer = {
  id: string;
  nombre: string;
  contacto: string | null;
  region: string | null;
  pueblo: string | null;
  email: string | null;
  telefono: string | null;
  website: string | null;
  logo_url: string | null;
  tipo_mercado: string | null;
  mercados: string[];
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

export const listProducers = createServerFn({ method: "GET" }).handler(
  async (): Promise<Producer[]> => {
    const supabase = serverPublic();
    const { data, error } = await supabase
      .from("productores")
      .select(
        "id, nombre, contacto, email, telefono, website, region, pueblo, logo_url, productor_mercados(mercado_nombre)",
      )
      .order("nombre", { ascending: true });
    if (error) throw new Error(error.message);

    return (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      contacto: p.contacto ?? null,
      region: p.region ?? null,
      pueblo: (p as { pueblo?: string | null }).pueblo ?? null,
      email: p.email ?? null,
      telefono: p.telefono ?? null,
      website: p.website ?? null,
      logo_url: p.logo_url ?? null,
      mercados: (p.productor_mercados ?? [])
        .map((m) => m.mercado_nombre)
        .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
    }));

  },
);

export const listProducerRegions = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const supabase = serverPublic();
    const { data, error } = await supabase
      .from("productores")
      .select("region")
      .not("region", "is", null);
    if (error) throw new Error(error.message);
    const set = new Set<string>();
    for (const row of data ?? []) {
      const r = (row.region ?? "").trim();
      if (r) set.add(r);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  },
);

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const UpdateRequestSchema = z.object({
  producer_name: z.string().trim().min(1).max(200),
  market_names: z.string().trim().max(500).optional().or(z.literal("")),
  pueblo: z.string().trim().max(500).optional().or(z.literal("")),
  requester_email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(4000),
  logo_base64: z.string().max(8_500_000).optional(),
  logo_filename: z.string().max(200).optional(),
  logo_mime: z.enum(["image/jpeg", "image/png"]).optional(),
});

export const submitProducerUpdateRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpdateRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = serverPublic();

    let logoUrl: string | null = null;
    let logoBytes: Buffer | null = null;
    if (data.logo_base64 && data.logo_mime && data.logo_filename) {
      logoBytes = Buffer.from(data.logo_base64, "base64");
      if (logoBytes.byteLength > MAX_LOGO_BYTES) {
        throw new Error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      }
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const ext = data.logo_mime === "image/png" ? "png" : "jpg";
        const safeName = data.logo_filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
        const path = `producers/updates/${crypto.randomUUID()}-${safeName.replace(/\.[^.]+$/, "")}.${ext}`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("market-images")
          .upload(path, logoBytes, { contentType: data.logo_mime, upsert: false });
        if (!upErr) {
          const { data: pub } = supabaseAdmin.storage.from("market-images").getPublicUrl(path);
          logoUrl = pub.publicUrl;
        } else {
          console.error("logo upload failed", upErr);
        }
      } catch (e) {
        console.error("logo upload threw", e);
      }
    }

    const pueblo = (data.pueblo ?? "").trim();
    const messageWithPueblo = pueblo
      ? `${data.message}\n\nPueblo(s) donde opera: ${pueblo}`
      : data.message;

    const { error } = await supabase.from("producer_update_requests").insert({
      producer_name: data.producer_name,
      market_names: data.market_names || null,
      requester_email: data.requester_email,
      message: messageWithPueblo,
      status: "pending",
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    });
    if (error) throw new Error(error.message);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const body: Record<string, unknown> = {
          from: "RutaMercado <productores@rutamercadopr.com>",
          to: ["productores@rutamercadopr.com"],
          reply_to: data.requester_email,
          subject: `Solicitud de actualización — ${data.producer_name}`,
          text:
            `Productor: ${data.producer_name}\n` +
            `Mercado(s): ${data.market_names || "—"}\n` +
            `Pueblo(s): ${pueblo || "—"}\n` +
            `Email del solicitante: ${data.requester_email}\n` +
            (logoUrl ? `Logo adjunto: ${logoUrl}\n` : "") +
            `\nMensaje:\n${data.message}\n`,
        };
        if (logoBytes && data.logo_filename && data.logo_mime) {
          body.attachments = [
            {
              filename: data.logo_filename,
              content: logoBytes.toString("base64"),
            },
          ];
        }
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        console.error("submitProducerUpdateRequest: Resend send failed", e);
      }
    }

    return { ok: true as const, logo_url: logoUrl };
  });
