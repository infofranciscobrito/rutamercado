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
        "id, name, region, municipality, organizer_name, organizer_phone, organizer_email, organizer_instagram, organizer_contact_url, is_active",
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
          markets: [summary],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.organizer_name.localeCompare(b.organizer_name, "es", { sensitivity: "base" }),
    );
  },
);

const UpdateRequestSchema = z.object({
  producer_name: z.string().trim().min(1).max(200),
  market_names: z.string().trim().max(500).optional().or(z.literal("")),
  requester_email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(4000),
});

export const submitProducerUpdateRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpdateRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = serverPublic();
    const { error } = await supabase.from("producer_update_requests").insert({
      producer_name: data.producer_name,
      market_names: data.market_names || null,
      requester_email: data.requester_email,
      message: data.message,
      status: "pending",
    });
    if (error) throw new Error(error.message);

    // Best-effort email notification via Resend (only if RESEND_API_KEY is set).
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
            reply_to: data.requester_email,
            subject: `Solicitud de actualización — ${data.producer_name}`,
            text:
              `Productor: ${data.producer_name}\n` +
              `Mercado(s): ${data.market_names || "—"}\n` +
              `Email del solicitante: ${data.requester_email}\n\n` +
              `Mensaje:\n${data.message}\n`,
          }),
        });
      } catch (e) {
        console.error("submitProducerUpdateRequest: Resend send failed", e);
      }
    }

    return { ok: true as const };
  });
