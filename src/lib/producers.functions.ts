import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { MarketRegion } from "@/types/market";

export type ProducerMarketSummary = {
  id: string;
  name: string;
  region: MarketRegion | null;
  municipality: string | null;
};

export type Producer = {
  key: string;
  organizer_name: string;
  region: MarketRegion | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_instagram: string | null;
  organizer_contact_url: string | null;
  organizer_logo_url: string | null;
  markets: ProducerMarketSummary[];
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

function pickNonEmpty(a: string | null, b: string | null | undefined): string | null {
  if (a && a.trim()) return a;
  if (b && b.trim()) return b;
  return null;
}

export const listProducers = createServerFn({ method: "GET" }).handler(
  async (): Promise<Producer[]> => {
    const supabase = serverPublic();
    const { data, error } = await supabase
      .from("markets")
      .select(
        "id, name, region, municipality, organizer_name, organizer_phone, organizer_email, organizer_instagram, organizer_contact_url, organizer_logo_url, is_active",
      )
      .eq("is_active", true);
    if (error) throw new Error(error.message);

    const map = new Map<string, Producer>();
    for (const m of data ?? []) {
      const name = (m.organizer_name ?? "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = map.get(key);
      const summary: ProducerMarketSummary = {
        id: m.id,
        name: m.name,
        region: (m.region as MarketRegion | null) ?? null,
        municipality: m.municipality ?? null,
      };
      if (existing) {
        existing.markets.push(summary);
        existing.organizer_phone = pickNonEmpty(existing.organizer_phone, m.organizer_phone);
        existing.organizer_email = pickNonEmpty(existing.organizer_email, m.organizer_email);
        existing.organizer_instagram = pickNonEmpty(
          existing.organizer_instagram,
          m.organizer_instagram,
        );
        existing.organizer_contact_url = pickNonEmpty(
          existing.organizer_contact_url,
          m.organizer_contact_url,
        );
        existing.organizer_logo_url = pickNonEmpty(
          existing.organizer_logo_url,
          (m as { organizer_logo_url?: string | null }).organizer_logo_url,
        );
        if (!existing.region && m.region) existing.region = m.region as MarketRegion;
      } else {
        map.set(key, {
          key,
          organizer_name: name,
          region: (m.region as MarketRegion | null) ?? null,
          organizer_phone: m.organizer_phone ?? null,
          organizer_email: m.organizer_email ?? null,
          organizer_instagram: m.organizer_instagram ?? null,
          organizer_contact_url: m.organizer_contact_url ?? null,
          organizer_logo_url:
            (m as { organizer_logo_url?: string | null }).organizer_logo_url ?? null,
          markets: [summary],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.organizer_name.localeCompare(b.organizer_name, "es", { sensitivity: "base" }),
    );
  },
);

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const UpdateRequestSchema = z.object({
  producer_name: z.string().trim().min(1).max(200),
  market_names: z.string().trim().max(500).optional().or(z.literal("")),
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

    // Optional logo upload via service role (storage bucket already public).
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

    const { error } = await supabase.from("producer_update_requests").insert({
      producer_name: data.producer_name,
      market_names: data.market_names || null,
      requester_email: data.requester_email,
      message: data.message,
      status: "pending",
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    });
    if (error) throw new Error(error.message);

    // Best-effort email notification via Resend (only if RESEND_API_KEY is set).
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
