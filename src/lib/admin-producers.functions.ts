import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MARKET_REGIONS, type MarketRegion } from "@/types/market";

export type AdminProducer = {
  key: string;
  organizer_name: string;
  region: MarketRegion | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_instagram: string | null;
  organizer_contact_url: string | null;
  market_ids: string[];
  market_names: string[];
};

const optStr = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : null));

const EditSchema = z.object({
  original_name: z.string().trim().min(1).max(200),
  organizer_name: z.string().trim().min(1).max(200),
  region: z.enum(MARKET_REGIONS as [string, ...string[]]).nullable().optional(),
  organizer_phone: optStr,
  organizer_email: z
    .string()
    .trim()
    .email()
    .max(255)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  organizer_instagram: optStr,
  organizer_contact_url: z
    .string()
    .trim()
    .url()
    .max(500)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export const listAdminProducers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProducer[]> => {
    const { data, error } = await context.supabase
      .from("markets")
      .select(
        "id, name, region, organizer_name, organizer_phone, organizer_email, organizer_instagram, organizer_contact_url",
      );
    if (error) throw new Error(error.message);

    const map = new Map<string, AdminProducer>();
    for (const m of data ?? []) {
      const name = (m.organizer_name ?? "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.market_ids.push(m.id);
        existing.market_names.push(m.name);
        if (!existing.organizer_phone && m.organizer_phone)
          existing.organizer_phone = m.organizer_phone;
        if (!existing.organizer_email && m.organizer_email)
          existing.organizer_email = m.organizer_email;
        if (!existing.organizer_instagram && m.organizer_instagram)
          existing.organizer_instagram = m.organizer_instagram;
        if (!existing.organizer_contact_url && m.organizer_contact_url)
          existing.organizer_contact_url = m.organizer_contact_url;
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
          market_ids: [m.id],
          market_names: [m.name],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.organizer_name.localeCompare(b.organizer_name, "es", { sensitivity: "base" }),
    );
  });

export const updateAdminProducer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EditSchema.parse(input))
  .handler(async ({ data, context }) => {
    const update = {
      organizer_name: data.organizer_name,
      organizer_phone: data.organizer_phone,
      organizer_email: data.organizer_email,
      organizer_instagram: data.organizer_instagram,
      organizer_contact_url: data.organizer_contact_url,
      ...(data.region ? { region: data.region as MarketRegion } : {}),
    };

    const { error, count } = await context.supabase
      .from("markets")
      .update(update, { count: "exact" })
      .ilike("organizer_name", data.original_name);
    if (error) throw new Error(error.message);
    return { ok: true as const, updated: count ?? 0 };
  });

export const deleteAdminProducer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { original_name: string; hardDelete?: boolean }) =>
    z
      .object({
        original_name: z.string().trim().min(1).max(200),
        hardDelete: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.hardDelete) {
      // Find market IDs to delete cascading dependents first.
      const { data: rows, error: selErr } = await context.supabase
        .from("markets")
        .select("id")
        .ilike("organizer_name", data.original_name);
      if (selErr) throw new Error(selErr.message);
      const ids = (rows ?? []).map((r) => r.id);
      if (ids.length === 0) return { ok: true as const, affected: 0 };

      // Detach submissions then delete markets (cascades remove clicks/intentions).
      await context.supabase
        .from("market_submissions")
        .delete()
        .in("published_market_id", ids);
      const { error: delErr } = await context.supabase
        .from("markets")
        .delete()
        .in("id", ids);
      if (delErr) throw new Error(delErr.message);
      return { ok: true as const, affected: ids.length };
    }

    // Soft remove: deactivate and clear organizer contact fields.
    const { error, count } = await context.supabase
      .from("markets")
      .update(
        {
          is_active: false,
          organizer_phone: null,
          organizer_email: null,
          organizer_instagram: null,
          organizer_contact_url: null,
        },
        { count: "exact" },
      )
      .ilike("organizer_name", data.original_name);
    if (error) throw new Error(error.message);
    return { ok: true as const, affected: count ?? 0 };
  });
