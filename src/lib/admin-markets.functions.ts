import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Market, MarketCategory, MarketRegion, MarketFrequency } from "@/types/market";

const MarketInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  category: z.enum(MARKET_CATEGORIES as [string, ...string[]]),
  region: z.enum(MARKET_REGIONS as [string, ...string[]]),
  municipality: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(300),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  frequency: z.enum(MARKET_FREQUENCIES as [string, ...string[]]).nullable().optional(),
  image_url: z.string().url().max(2048).nullable().optional(),
  organizer_name: z.string().trim().min(1).max(200),
  organizer_phone: z.string().trim().max(50).nullable().optional(),
  organizer_email: z.string().trim().email().max(255).nullable().optional().or(z.literal("").transform(() => null)),
  organizer_instagram: z.string().trim().max(100).nullable().optional(),
  is_active: z.boolean(),
});

export const listAllMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Market[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("event_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Market[];
  });

export const upsertMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MarketInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const payload = {
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      region: data.region,
      municipality: data.municipality,
      address: data.address,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      frequency: data.frequency ?? null,
      image_url: data.image_url ?? null,
      organizer_name: data.organizer_name,
      organizer_phone: data.organizer_phone ?? null,
      organizer_email: data.organizer_email ?? null,
      organizer_instagram: data.organizer_instagram ?? null,
      is_active: data.is_active,
    };
    if (data.id) {
      const { error } = await supabase.from("markets").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    }
    const { data: inserted, error } = await supabase
      .from("markets")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: inserted.id };
  });

export const deleteMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("markets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const toggleMarketActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; isActive: boolean }) =>
    z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("markets")
      .update({ is_active: data.isActive })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
