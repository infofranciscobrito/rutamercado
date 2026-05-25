import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

export const addMarketException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        marketId: z.string().uuid(),
        exceptionDate: z.string().regex(DATE_RE),
        reason: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("market_exceptions").insert({
      market_id: data.marketId,
      exception_date: data.exceptionDate,
      reason: data.reason ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removeMarketException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("market_exceptions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const addMarketDateOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        marketId: z.string().uuid(),
        originalDate: z.string().regex(DATE_RE),
        newDate: z.string().regex(DATE_RE),
        newStartTime: z.string().regex(TIME_RE).optional(),
        newEndTime: z.string().regex(TIME_RE).optional(),
        note: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("market_date_overrides")
      .insert({
        market_id: data.marketId,
        original_date: data.originalDate,
        new_date: data.newDate,
        new_start_time: data.newStartTime ?? null,
        new_end_time: data.newEndTime ?? null,
        note: data.note ?? null,
      });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removeMarketDateOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("market_date_overrides")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
