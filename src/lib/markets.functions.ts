import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { EnrichedMarket, Market } from "@/types/market";
import {
  computeSchedule,
  type RecException,
  type RecOverride,
} from "@/lib/recurrence";

export const listMarkets = createServerFn({ method: "GET" }).handler(
  async (): Promise<EnrichedMarket[]> => {
    const { data: markets, error } = await supabase
      .from("markets")
      .select("*")
      .eq("is_active", true);
    if (error) {
      console.error("listMarkets failed:", error);
      throw new Error(error.message);
    }
    if (!markets || markets.length === 0) return [];

    const ids = markets.map((m) => m.id);
    const [{ data: exceptions }, { data: overrides }] = await Promise.all([
      supabase
        .from("market_exceptions")
        .select("market_id, exception_date, reason")
        .in("market_id", ids),
      supabase
        .from("market_date_overrides")
        .select(
          "market_id, original_date, new_date, new_start_time, new_end_time, note",
        )
        .in("market_id", ids),
    ]);

    const exByMarket = new Map<string, RecException[]>();
    for (const e of exceptions ?? []) {
      const arr = exByMarket.get(e.market_id) ?? [];
      arr.push({ exception_date: e.exception_date, reason: e.reason });
      exByMarket.set(e.market_id, arr);
    }
    const ovByMarket = new Map<string, RecOverride[]>();
    for (const o of overrides ?? []) {
      const arr = ovByMarket.get(o.market_id) ?? [];
      arr.push({
        original_date: o.original_date,
        new_date: o.new_date,
        new_start_time: o.new_start_time,
        new_end_time: o.new_end_time,
        note: o.note,
      });
      ovByMarket.set(o.market_id, arr);
    }

    const enriched: EnrichedMarket[] = [];
    for (const m of markets as Market[]) {
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
        exByMarket.get(m.id) ?? [],
        ovByMarket.get(m.id) ?? [],
        { days: 90 },
      );
      if (upcoming.length === 0) continue;
      const next = upcoming[0];
      enriched.push({
        ...m,
        upcoming,
        cancelled,
        nextDate: next.date,
        nextStartTime: next.startTime,
        nextEndTime: next.endTime,
        nextIsOverridden: next.isOverridden,
        nextOverrideNote: next.overrideNote,
      });
    }

    enriched.sort((a, b) =>
      (a.nextDate ?? "") < (b.nextDate ?? "")
        ? -1
        : (a.nextDate ?? "") > (b.nextDate ?? "")
          ? 1
          : 0,
    );
    return enriched;
  },
);
