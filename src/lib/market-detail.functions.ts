import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { EnrichedMarket, Market } from "@/types/market";
import {
  computeSchedule,
  type RecException,
  type RecOverride,
} from "@/lib/recurrence";

/** Ficha pública de un mercado por su slug (con próximas fechas calculadas). */
export const getMarketBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<EnrichedMarket | null> => {
    const { data: market, error } = await supabase
      .from("markets")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("getMarketBySlug failed:", error);
      throw new Error(error.message);
    }
    if (!market) return null;

    const m = market as Market;
    const [{ data: exceptions }, { data: overrides }] = await Promise.all([
      supabase
        .from("market_exceptions")
        .select("market_id, exception_date, reason")
        .eq("market_id", m.id),
      supabase
        .from("market_date_overrides")
        .select(
          "market_id, original_date, new_date, new_start_time, new_end_time, note",
        )
        .eq("market_id", m.id),
    ]);

    const ex: RecException[] = (exceptions ?? []).map((e) => ({
      exception_date: e.exception_date,
      reason: e.reason,
    }));
    const ov: RecOverride[] = (overrides ?? []).map((o) => ({
      original_date: o.original_date,
      new_date: o.new_date,
      new_start_time: o.new_start_time,
      new_end_time: o.new_end_time,
      note: o.note,
    }));

    const scheduleDays = m.category === "Feria Artesanal" ? 730 : 90;
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
      ex,
      ov,
      { days: scheduleDays },
    );
    const next = upcoming[0];

    return {
      ...m,
      upcoming,
      cancelled,
      nextDate: next?.date ?? null,
      nextStartTime: next?.startTime ?? m.start_time,
      nextEndTime: next?.endTime ?? m.end_time,
      nextIsOverridden: next?.isOverridden ?? false,
      nextOverrideNote: next?.overrideNote ?? null,
    };
  });

/** Mercados relacionados (misma categoría, o misma región como respaldo). */
export const getRelatedMarkets = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { id: string; category: string; region: string }) => data,
  )
  .handler(async ({ data }): Promise<EnrichedMarket[]> => {
    const pick = async (column: "category" | "region", value: string) => {
      const { data: rows } = await supabase
        .from("markets")
        .select("*")
        .eq("is_active", true)
        .eq(column, value as never)
        .neq("id", data.id)
        .not("slug", "is", null)
        .limit(12);
      return (rows ?? []) as Market[];
    };

    const byCategory = await pick("category", data.category);
    let pool = byCategory;
    if (pool.length < 4) {
      const byRegion = await pick("region", data.region);
      const seen = new Set(pool.map((m) => m.id));
      pool = [...pool, ...byRegion.filter((m) => !seen.has(m.id))];
    }
    if (pool.length === 0) return [];

    const enriched: EnrichedMarket[] = [];
    for (const m of pool) {
      const scheduleDays = m.category === "Feria Artesanal" ? 730 : 90;
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
        [],
        [],
        { days: scheduleDays },
      );
      const next = upcoming[0];
      return {
        ...m,
        upcoming,
        cancelled,
        nextDate: next?.date ?? null,
        nextStartTime: next?.startTime ?? m.start_time,
        nextEndTime: next?.endTime ?? m.end_time,
        nextIsOverridden: next?.isOverridden ?? false,
        nextOverrideNote: next?.overrideNote ?? null,
      };
    });

    enriched.sort((a, b) => {
      const da = a.nextDate ?? "9999-12-31";
      const db = b.nextDate ?? "9999-12-31";
      return da.localeCompare(db);
    });

    return enriched.slice(0, 4);
  });

/** Traduce un id legacy (?market=uuid) al slug actual, para redirigir 301. */
export const getMarketSlugById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<string | null> => {
    const { data: row } = await supabase
      .from("markets")
      .select("slug")
      .eq("id", data.id)
      .maybeSingle();
    return row?.slug ?? null;
  });

/** Slugs activos para el sitemap. */
export const listMarketSlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const { data } = await supabase
      .from("markets")
      .select("slug")
      .eq("is_active", true)
      .not("slug", "is", null);
    return (data ?? []).map((r) => r.slug).filter((s): s is string => !!s);
  },
);
