import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MARKET_CATEGORIES,
  MARKET_REGIONS,
  type Market,
  type MarketCategory,
  type MarketRegion,
} from "@/types/market";
import {
  computeSchedule,
  generateRecurrenceLabel,
  RECURRENCE_TYPES,
  WEEKDAYS_ES,
  WEEKS_OF_MONTH_ES,
  type RecException,
  type RecOverride,
} from "@/lib/recurrence";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

const MarketInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable().optional(),
    category: z.enum(MARKET_CATEGORIES as [string, ...string[]]),
    region: z.enum(MARKET_REGIONS as [string, ...string[]]),
    municipality: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(300),
    start_time: z.string().regex(TIME_RE),
    end_time: z.string().regex(TIME_RE),
    recurrence_type: z.enum(RECURRENCE_TYPES as [string, ...string[]]),
    recurrence_day_of_week: z
      .enum(WEEKDAYS_ES as [string, ...string[]])
      .nullable()
      .optional(),
    recurrence_week_of_month: z
      .enum(WEEKS_OF_MONTH_ES as [string, ...string[]])
      .nullable()
      .optional(),
    recurrence_start_date: z.string().regex(DATE_RE),
    recurrence_end_date: z
      .string()
      .regex(DATE_RE)
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    recurrence_label: z.string().trim().max(200).nullable().optional(),
    image_url: z.string().url().max(2048).nullable().optional(),
    organizer_name: z.string().trim().min(1).max(200),
    organizer_phone: z.string().trim().max(50).nullable().optional(),
    organizer_email: z
      .string()
      .trim()
      .email()
      .max(255)
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    organizer_instagram: z.string().trim().max(100).nullable().optional(),
    organizer_contact_url: z
      .string()
      .trim()
      .max(500)
      .url()
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    is_active: z.boolean(),
    focal_x: z.number().min(0).max(100).default(50),
    focal_y: z.number().min(0).max(100).default(50),
    pets: z.string().trim().max(100).nullable().optional(),
    parking: z.string().trim().max(100).nullable().optional(),
    accessibility: z.string().trim().max(100).nullable().optional(),
    payment_methods: z.array(z.string().trim().max(100)).nullable().optional(),
    family_friendly: z.string().trim().max(100).nullable().optional(),
    food_area: z.string().trim().max(100).nullable().optional(),

  })
  .superRefine((v, ctx) => {
    if (v.recurrence_type === "unico") {
      if (v.recurrence_day_of_week || v.recurrence_week_of_month) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Único no debe tener día/semana de recurrencia",
        });
      }
    } else if (
      v.recurrence_type === "semanal" ||
      v.recurrence_type === "quincenal"
    ) {
      if (!v.recurrence_day_of_week) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recurrence_day_of_week"],
          message: "Día de la semana requerido",
        });
      }
    } else if (v.recurrence_type === "mensual_por_dia") {
      if (!v.recurrence_day_of_week || !v.recurrence_week_of_month) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mensual requiere día y semana del mes",
        });
      }
    }
  });

export const listAllMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Market[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("recurrence_start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Market[];
  });

export const upsertMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MarketInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const label =
      (data.recurrence_label ?? "").trim() ||
      generateRecurrenceLabel(
        data.recurrence_type,
        data.recurrence_day_of_week ?? null,
        data.recurrence_week_of_month ?? null,
      );
    const payload = {
      name: data.name,
      description: data.description ?? null,
      category: data.category as MarketCategory,
      region: data.region as MarketRegion,
      municipality: data.municipality,
      address: data.address,
      start_time: data.start_time,
      end_time: data.end_time,
      recurrence_type: data.recurrence_type,
      recurrence_day_of_week: data.recurrence_day_of_week ?? null,
      recurrence_week_of_month: data.recurrence_week_of_month ?? null,
      recurrence_start_date: data.recurrence_start_date,
      recurrence_end_date: data.recurrence_end_date ?? null,
      recurrence_label: label,
      image_url: data.image_url ?? null,
      organizer_name: data.organizer_name,
      organizer_phone: data.organizer_phone ?? null,
      organizer_email: data.organizer_email ?? null,
      organizer_instagram: data.organizer_instagram ?? null,
      organizer_contact_url: data.organizer_contact_url ?? null,
      is_active: data.is_active,
      focal_x: data.focal_x,
      focal_y: data.focal_y,
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
    const { supabase } = context;

    // 1. Load market to retrieve its image_url (so we can delete the file after).
    const { data: market, error: loadErr } = await supabase
      .from("markets")
      .select("image_url")
      .eq("id", data.id)
      .single();
    if (loadErr) throw new Error(loadErr.message);

    // 2. Delete linked submissions (no CASCADE FK on published_market_id).
    const { error: subErr } = await supabase
      .from("market_submissions")
      .delete()
      .eq("published_market_id", data.id);
    if (subErr) throw new Error(subErr.message);

    // 3. Delete the market itself. CASCADE removes market_clicks,
    //    market_exceptions, market_date_overrides.
    //    Note: not a real cross-table transaction — if this fails after
    //    step 2, retrying is idempotent (no submissions left to re-delete).
    const { error: delErr } = await supabase.from("markets").delete().eq("id", data.id);
    if (delErr) throw new Error(delErr.message);

    // 4. Best-effort storage cleanup. An orphan file is preferable to a
    //    half-deleted market, so storage errors are logged, not thrown.
    if (market?.image_url) {
      const marker = "/market-images/";
      const idx = market.image_url.indexOf(marker);
      if (idx !== -1) {
        const path = market.image_url.slice(idx + marker.length);
        const { error: storageErr } = await supabase.storage
          .from("market-images")
          .remove([path]);
        if (storageErr) {
          console.error("deleteMarket: storage cleanup failed", storageErr);
        }
      }
    }

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

export const getMarketRecurrencePreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: m, error } = await supabase
      .from("markets")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const [{ data: exs }, { data: ovs }] = await Promise.all([
      supabase
        .from("market_exceptions")
        .select("id, exception_date, reason")
        .eq("market_id", data.id),
      supabase
        .from("market_date_overrides")
        .select("id, original_date, new_date, new_start_time, new_end_time, note")
        .eq("market_id", data.id),
    ]);
    const exceptions: RecException[] = (exs ?? []).map((e) => ({
      exception_date: e.exception_date,
      reason: e.reason,
    }));
    const overrides: RecOverride[] = (ovs ?? []).map((o) => ({
      original_date: o.original_date,
      new_date: o.new_date,
      new_start_time: o.new_start_time,
      new_end_time: o.new_end_time,
      note: o.note,
    }));
    const { upcoming, cancelled } = computeSchedule(
      {
        recurrence_type: m.recurrence_type,
        recurrence_day_of_week: m.recurrence_day_of_week,
        recurrence_week_of_month: m.recurrence_week_of_month,
        recurrence_start_date: m.recurrence_start_date,
        recurrence_end_date: m.recurrence_end_date,
        start_time: m.start_time,
        end_time: m.end_time,
      },
      exceptions,
      overrides,
      { days: 180 },
    );
    return {
      upcoming: upcoming.slice(0, 10),
      cancelled,
      exceptions: exs ?? [],
      overrides: ovs ?? [],
    };
  });
