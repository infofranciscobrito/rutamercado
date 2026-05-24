import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DashboardMetrics = {
  activeMarkets: number;
  totalViews: number;
  upcomingThisWeek: number;
  totalClicks: number;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function plusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function minusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function throwIfDbError(error: { message: string } | null | undefined, label: string) {
  if (error) {
    console.error(`[Admin data] ${label}: database error`, error);
    throw new Error(`${label}: ${error.message}`);
  }
}

export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardMetrics> => {
    console.log("[Admin data] dashboard metrics: server fetch start");
    const { supabase } = context;
    const today = todayISO();
    const inAWeek = plusDaysISO(7);

    const [activeRes, viewsRes, upcomingRes, clicksRes] = await Promise.all([
      supabase.from("markets").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("markets").select("view_count"),
      supabase
        .from("markets")
        .select("id", { count: "exact", head: true })
        .gte("event_date", today)
        .lte("event_date", inAWeek)
        .eq("is_active", true),
      supabase.from("market_clicks").select("id", { count: "exact", head: true }),
    ]);
    throwIfDbError(activeRes.error, "dashboard active markets");
    throwIfDbError(viewsRes.error, "dashboard total views");
    throwIfDbError(upcomingRes.error, "dashboard upcoming markets");
    throwIfDbError(clicksRes.error, "dashboard total clicks");

    const totalViews = (viewsRes.data ?? []).reduce(
      (s, r) => s + (r.view_count ?? 0),
      0,
    );

    const result = {
      activeMarkets: activeRes.count ?? 0,
      totalViews,
      upcomingThisWeek: upcomingRes.count ?? 0,
      totalClicks: clicksRes.count ?? 0,
    };
    console.log("[Admin data] dashboard metrics: server fetch success", result);
    return result;
  });

export const getViewsPerMarket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("markets")
      .select("id, name, view_count")
      .order("view_count", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({ name: m.name, views: m.view_count ?? 0 }));
  });

export const getClicksPerDay = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number } | undefined) =>
    z.object({ days: z.number().min(1).max(365) }).parse(input ?? { days: 30 }),
  )
  .handler(async ({ data, context }) => {
    const since = minusDaysISO(data.days);
    const { data: rows, error } = await context.supabase
      .from("market_clicks")
      .select("created_at")
      .gte("created_at", since);
    if (error) throw new Error(error.message);
    const buckets = new Map<string, number>();
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows ?? []) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, clicks]) => ({ date, clicks }));
  });

export const getUpcomingMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("markets")
      .select("id, name, event_date, municipality, view_count")
      .gte("event_date", todayISO())
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .limit(5);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAnalyticsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number }) =>
    z.object({ days: z.number().min(1).max(365) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const since = minusDaysISO(data.days);
    const { supabase } = context;

    const [pvRes, clicksRes] = await Promise.all([
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .eq("page", "home")
        .gte("created_at", since),
      supabase.from("market_clicks").select("click_type").gte("created_at", since),
    ]);

    const clicks = clicksRes.data ?? [];
    const counts = { view_detail: 0, click_phone: 0, click_email: 0, click_instagram: 0, click_directions: 0 };
    for (const c of clicks) {
      const k = c.click_type as keyof typeof counts;
      if (k in counts) counts[k]++;
    }
    const contactClicks = counts.click_phone + counts.click_email + counts.click_instagram;
    const engagementRate = counts.view_detail > 0 ? (contactClicks / counts.view_detail) * 100 : 0;

    return {
      homeViews: pvRes.count ?? 0,
      detailViews: counts.view_detail,
      contactClicks,
      directionsClicks: counts.click_directions,
      engagementRate,
    };
  });

export const getTopMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number }) =>
    z.object({ days: z.number().min(1).max(365) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const since = minusDaysISO(data.days);
    const { supabase } = context;
    const [marketsRes, clicksRes] = await Promise.all([
      supabase
        .from("markets")
        .select("id, name, view_count")
        .order("view_count", { ascending: false })
        .limit(10),
      supabase.from("market_clicks").select("market_id, click_type").gte("created_at", since),
    ]);
    if (marketsRes.error) throw new Error(marketsRes.error.message);
    const clicks = clicksRes.data ?? [];
    const byMarket = new Map<string, { contact: number; directions: number }>();
    for (const c of clicks) {
      const cur = byMarket.get(c.market_id) ?? { contact: 0, directions: 0 };
      if (c.click_type === "click_phone" || c.click_type === "click_email" || c.click_type === "click_instagram") cur.contact++;
      if (c.click_type === "click_directions") cur.directions++;
      byMarket.set(c.market_id, cur);
    }
    return (marketsRes.data ?? []).map((m, i) => ({
      rank: i + 1,
      id: m.id,
      name: m.name,
      views: m.view_count ?? 0,
      contactClicks: byMarket.get(m.id)?.contact ?? 0,
      directionsClicks: byMarket.get(m.id)?.directions ?? 0,
    }));
  });

export const getTopOrganizers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number }) =>
    z.object({ days: z.number().min(1).max(365) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const since = minusDaysISO(data.days);
    const { supabase } = context;
    const [marketsRes, clicksRes] = await Promise.all([
      supabase.from("markets").select("id, organizer_name, view_count"),
      supabase.from("market_clicks").select("market_id, click_type").gte("created_at", since),
    ]);
    if (marketsRes.error) throw new Error(marketsRes.error.message);
    const marketToOrg = new Map<string, string>();
    const totals = new Map<string, { views: number; clicks: number; count: number }>();
    for (const m of marketsRes.data ?? []) {
      marketToOrg.set(m.id, m.organizer_name);
      const cur = totals.get(m.organizer_name) ?? { views: 0, clicks: 0, count: 0 };
      cur.views += m.view_count ?? 0;
      cur.count += 1;
      totals.set(m.organizer_name, cur);
    }
    for (const c of clicksRes.data ?? []) {
      const org = marketToOrg.get(c.market_id);
      if (!org) continue;
      const cur = totals.get(org)!;
      cur.clicks += 1;
    }
    return Array.from(totals.entries())
      .map(([organizer, t]) => ({ organizer, views: t.views, clicks: t.clicks, markets: t.count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  });

export const getDistribution = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("markets")
      .select("category, region");
    if (error) throw new Error(error.message);
    const byCategory = new Map<string, number>();
    const byRegion = new Map<string, number>();
    for (const r of data ?? []) {
      byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1);
      byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1);
    }
    return {
      byCategory: Array.from(byCategory.entries()).map(([name, value]) => ({ name, value })),
      byRegion: Array.from(byRegion.entries()).map(([name, value]) => ({ name, value })),
    };
  });

export const getDailyTraffic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number }) =>
    z.object({ days: z.number().min(1).max(365) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const since = minusDaysISO(data.days);
    const { data: rows, error } = await context.supabase
      .from("page_views")
      .select("created_at")
      .gte("created_at", since);
    if (error) throw new Error(error.message);
    const buckets = new Map<string, number>();
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows ?? []) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, views]) => ({ date, views }));
  });
