import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeSchedule } from "@/lib/recurrence";

export type DashboardMetrics = {
  activeMarkets: number;
  totalViews: number;
  upcomingThisWeek: number;
  totalClicks: number;
};

function minusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

// Shared range validator: {from, to} ISO strings, with fallback to {days}.
const rangeSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    days: z.number().int().min(1).max(3650).optional(),
    excludeInternal: z.boolean().optional(),
  })
  .transform((v) => {
    let fromISO = v.from;
    const toISO = v.to;
    if (!fromISO) {
      const days = v.days ?? 30;
      fromISO = minusDaysISO(days);
    }
    return { from: fromISO, to: toISO, excludeInternal: v.excludeInternal ?? false };
  });

type RangeInput = {
  from?: string;
  to?: string;
  days?: number;
  excludeInternal?: boolean;
};

export type TrafficKind = "externo" | "interno" | "desarrollo";

/**
 * Clasifica una visita según su referrer:
 * - interno: navegación dentro del propio dominio
 * - desarrollo: previews de Lovable y entornos locales
 * - externo: buscadores, redes, directo, etc.
 */
export function classifyReferrer(referrer: string | null): TrafficKind {
  const raw = (referrer ?? "").trim();
  if (raw === "") return "externo";
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname.toLowerCase();
  } catch {
    host = raw.toLowerCase().split("/")[0]!.split("?")[0]!;
  }
  const bare = host.replace(/^www\./, "").replace(/:\d+$/, "");
  if (bare === "rutamercadopr.com") return "interno";
  const devDomains = [
    "lovable.dev",
    "lovable.app",
    "lovableproject.com",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
  ];
  if (devDomains.some((d) => bare === d || bare.endsWith(`.${d}`))) {
    return "desarrollo";
  }
  return "externo";
}


/** Filtra filas de page_views dejando solo tráfico externo cuando aplica. */
function filterTraffic<T extends { referrer: string | null }>(
  rows: T[],
  excludeInternal: boolean,
): T[] {
  if (!excludeInternal) return rows;
  return rows.filter((r) => classifyReferrer(r.referrer) === "externo");
}


type ScheduledMarket = {
  id: string;
  name: string;
  municipality: string;
  view_count: number;
  nextDate: string | null;
  recurrence_label: string | null;
  upcoming: ReturnType<typeof computeSchedule>["upcoming"];
};

async function fetchActiveMarketsWithSchedule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  days = 90,
): Promise<ScheduledMarket[]> {
  const { data: markets, error } = await supabase
    .from("markets")
    .select(
      "id, name, municipality, view_count, start_time, end_time, recurrence_type, recurrence_day_of_week, recurrence_week_of_month, recurrence_start_date, recurrence_end_date, recurrence_label",
    )
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  if (!markets || markets.length === 0) return [];

  const ids = markets.map((m: { id: string }) => m.id);
  const [{ data: exs }, { data: ovs }] = await Promise.all([
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
  const exByM = new Map<string, { exception_date: string; reason: string | null }[]>();
  for (const e of exs ?? []) {
    const arr = exByM.get(e.market_id) ?? [];
    arr.push({ exception_date: e.exception_date, reason: e.reason });
    exByM.set(e.market_id, arr);
  }
  const ovByM = new Map<
    string,
    {
      original_date: string;
      new_date: string;
      new_start_time: string | null;
      new_end_time: string | null;
      note: string | null;
    }[]
  >();
  for (const o of ovs ?? []) {
    const arr = ovByM.get(o.market_id) ?? [];
    arr.push({
      original_date: o.original_date,
      new_date: o.new_date,
      new_start_time: o.new_start_time,
      new_end_time: o.new_end_time,
      note: o.note,
    });
    ovByM.set(o.market_id, arr);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return markets.map((m: any) => {
    const { upcoming } = computeSchedule(
      {
        recurrence_type: m.recurrence_type,
        recurrence_day_of_week: m.recurrence_day_of_week,
        recurrence_week_of_month: m.recurrence_week_of_month,
        recurrence_start_date: m.recurrence_start_date,
        recurrence_end_date: m.recurrence_end_date,
        start_time: m.start_time,
        end_time: m.end_time,
      },
      exByM.get(m.id) ?? [],
      ovByM.get(m.id) ?? [],
      { days },
    );
    return {
      id: m.id,
      name: m.name,
      municipality: m.municipality,
      view_count: m.view_count ?? 0,
      nextDate: upcoming[0]?.date ?? null,
      recurrence_label: m.recurrence_label,
      upcoming,
    };
  });
}


export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardMetrics> => {
    const { supabase } = context;
    const [activeRes, viewsRes, clicksRes, withSchedule] = await Promise.all([
      supabase.from("markets").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("markets").select("view_count"),
      supabase.from("market_clicks").select("id", { count: "exact" }),
      fetchActiveMarketsWithSchedule(supabase, 7),
    ]);
    if (activeRes.error) throw new Error(activeRes.error.message);
    if (viewsRes.error) throw new Error(viewsRes.error.message);
    if (clicksRes.error) throw new Error(clicksRes.error.message);

    const totalViews = (viewsRes.data ?? []).reduce(
      (s, r) => s + (r.view_count ?? 0),
      0,
    );
    const today = startOfToday();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    const upcomingThisWeek = withSchedule.filter((m) =>
      m.upcoming.some((u) => {
        const [y, mo, d] = u.date.split("-").map(Number);
        const dt = new Date(y, (mo ?? 1) - 1, d ?? 1);
        return dt >= today && dt <= weekEnd;
      }),
    ).length;

    return {
      activeMarkets: activeRes.count ?? 0,
      totalViews,
      upcomingThisWeek,
      totalClicks: clicksRes.count ?? 0,
    };
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
    const all = await fetchActiveMarketsWithSchedule(context.supabase, 30);
    return all
      .filter((m) => m.nextDate !== null)
      .sort((a, b) => (a.nextDate! < b.nextDate! ? -1 : 1))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        name: m.name,
        municipality: m.municipality,
        view_count: m.view_count,
        nextDate: m.nextDate,
        recurrence_label: m.recurrence_label,
      }));
  });

// Helper to apply a range to a Supabase query.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRange(query: any, range: { from: string; to?: string }) {
  let q = query.gte("created_at", range.from);
  if (range.to) q = q.lte("created_at", range.to);
  return q;
}

export const getAnalyticsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [pvRes, clicksRes, intRes, activeRes, inactiveRes, pendingRes] = await Promise.all([
      // Misma fuente que "Actividad por Página": leemos las páginas del rango
      // y derivamos la home ('/') de ahí, para que ambos números no se desincronicen.
      applyRange(supabase.from("page_views").select("page, referrer"), data),
      applyRange(supabase.from("market_clicks").select("click_type"), data),
      applyRange(
        supabase.from("market_attendance_intentions").select("intention_type"),
        data,
      ),
      supabase.from("markets").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("markets").select("id", { count: "exact", head: true }).eq("is_active", false),
      supabase.from("market_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    const rawPageRows = (pvRes.data ?? []) as {
      page: string | null;
      referrer: string | null;
    }[];
    const pageRows = filterTraffic(rawPageRows, data.excludeInternal);
    const rawPageViews = rawPageRows.length;
    const totalPageViews = pageRows.length;
    const homeViews = pageRows.filter((r) => r.page === "/").length;
    const clicks = clicksRes.data ?? [];
    const counts = {
      view_detail: 0,
      click_phone: 0,
      click_email: 0,
      click_instagram: 0,
      click_directions: 0,
      click_contact: 0,
      click_attendance: 0,
    };
    for (const c of clicks) {
      const k = c.click_type as keyof typeof counts;
      if (k in counts) counts[k]++;
    }
    let willAttend = 0;
    let interested = 0;
    for (const r of intRes.data ?? []) {
      if (r.intention_type === "will_attend") willAttend++;
      else if (r.intention_type === "interested") interested++;
    }
    const contactClicksAll =
      counts.click_phone + counts.click_email + counts.click_instagram + counts.click_contact;
    const engagementRate =
      counts.view_detail > 0 ? (contactClicksAll / counts.view_detail) * 100 : 0;
    return {
      homeViews,
      totalPageViews,
      rawPageViews,
      detailViews: counts.view_detail,
      clickPhone: counts.click_phone,
      clickEmail: counts.click_email,
      clickInstagram: counts.click_instagram,
      clickContact: counts.click_contact,
      contactClicks: contactClicksAll,
      directionsClicks: counts.click_directions,
      willAttend,
      interested,
      engagementRate,
      activeMarkets: activeRes.count ?? 0,
      inactiveMarkets: inactiveRes.count ?? 0,
      pendingSubmissions: pendingRes.count ?? 0,
    };
  });

export const getTopMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [marketsRes, clicksRes, intRes] = await Promise.all([
      supabase
        .from("markets")
        .select("id, name, view_count, recurrence_type")
        .order("view_count", { ascending: false })
        .limit(10),
      applyRange(supabase.from("market_clicks").select("market_id, click_type"), data),
      applyRange(
        supabase.from("market_attendance_intentions").select("market_id, intention_type"),
        data,
      ),
    ]);
    if (marketsRes.error) throw new Error(marketsRes.error.message);
    const clicks = clicksRes.data ?? [];
    const byMarket = new Map<
      string,
      { phone: number; email: number; contact: number; directions: number }
    >();
    for (const c of clicks) {
      const cur =
        byMarket.get(c.market_id) ?? { phone: 0, email: 0, contact: 0, directions: 0 };
      if (c.click_type === "click_phone") cur.phone++;
      else if (c.click_type === "click_email") cur.email++;
      else if (c.click_type === "click_contact") cur.contact++;
      else if (c.click_type === "click_directions") cur.directions++;
      byMarket.set(c.market_id, cur);
    }
    const intByMarket = new Map<string, { willAttend: number; interested: number }>();
    for (const r of intRes.data ?? []) {
      const cur = intByMarket.get(r.market_id) ?? { willAttend: 0, interested: 0 };
      if (r.intention_type === "will_attend") cur.willAttend++;
      else if (r.intention_type === "interested") cur.interested++;
      intByMarket.set(r.market_id, cur);
    }
    return (marketsRes.data ?? []).map((m, i) => {
      const c = byMarket.get(m.id) ?? { phone: 0, email: 0, contact: 0, directions: 0 };
      const ai = intByMarket.get(m.id) ?? { willAttend: 0, interested: 0 };
      return {
        rank: i + 1,
        id: m.id,
        name: m.name,
        views: m.view_count ?? 0,
        clickPhone: c.phone,
        clickEmail: c.email,
        clickContact: c.contact,
        directionsClicks: c.directions,
        willAttend: ai.willAttend,
        interested: ai.interested,
        recurrenceType: m.recurrence_type ?? "",
      };
    });
  });

export const getTopOrganizers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [marketsRes, clicksRes] = await Promise.all([
      supabase.from("markets").select("id, organizer_name, view_count"),
      applyRange(supabase.from("market_clicks").select("market_id, click_type"), data),
    ]);
    if (marketsRes.error) throw new Error(marketsRes.error.message);
    const marketToOrg = new Map<string, string>();
    const totals = new Map<string, { views: number; clicks: number; count: number }>();
    for (const m of marketsRes.data ?? []) {
      const orgName = m.organizer_name ?? "Sin organizador";
      marketToOrg.set(m.id, orgName);
      const cur = totals.get(orgName) ?? { views: 0, clicks: 0, count: 0 };
      cur.views += m.view_count ?? 0;
      cur.count += 1;
      totals.set(orgName, cur);
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
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allRows, error } = await applyRange(
      context.supabase.from("page_views").select("created_at, referrer"),
      data,
    );
    if (error) throw new Error(error.message);
    const rows = filterTraffic(
      (allRows ?? []) as { created_at: string; referrer: string | null }[],
      data.excludeInternal,
    );
    const fromDay = data.from.slice(0, 10);
    const toDay = (data.to ?? new Date().toISOString()).slice(0, 10);
    const buckets = new Map<string, number>();
    const start = new Date(fromDay + "T00:00:00");
    const end = new Date(toDay + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows ?? []) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, views]) => ({ date, views }));
  });

export type AttendanceMetrics = {
  willAttend: number;
  interested: number;
  total: number;
  uniqueVisitors: number;
  intentionRate: number;
};

export const getAttendanceMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }): Promise<AttendanceMetrics> => {
    const { supabase } = context;
    const [intRes, viewsRes] = await Promise.all([
      applyRange(
        supabase.from("market_attendance_intentions").select("intention_type, visitor_id"),
        data,
      ),
      applyRange(
        supabase.from("market_clicks").select("id", { count: "exact", head: true }).eq("click_type", "view_detail"),
        data,
      ),
    ]);
    if (intRes.error) throw new Error(intRes.error.message);
    const rows = intRes.data ?? [];
    let willAttend = 0;
    let interested = 0;
    const visitors = new Set<string>();
    for (const r of rows) {
      if (r.intention_type === "will_attend") willAttend++;
      else if (r.intention_type === "interested") interested++;
      visitors.add(r.visitor_id);
    }
    const total = willAttend + interested;
    const detailViews = viewsRes.count ?? 0;
    const intentionRate = detailViews > 0 ? (total / detailViews) * 100 : 0;
    return {
      willAttend,
      interested,
      total,
      uniqueVisitors: visitors.size,
      intentionRate,
    };
  });

export const getTopMarketsByIntention = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(1000).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [intRes, marketsRes, viewsClicksRes] = await Promise.all([
      supabase
        .from("market_attendance_intentions")
        .select("market_id, intention_type"),
      supabase
        .from("markets")
        .select("id, name, category, municipality, view_count"),
      supabase
        .from("market_clicks")
        .select("market_id")
        .eq("click_type", "view_detail"),
    ]);
    if (intRes.error) throw new Error(intRes.error.message);
    if (marketsRes.error) throw new Error(marketsRes.error.message);

    const byMarket = new Map<string, { will: number; interested: number }>();
    for (const r of intRes.data ?? []) {
      const cur = byMarket.get(r.market_id) ?? { will: 0, interested: 0 };
      if (r.intention_type === "will_attend") cur.will++;
      else if (r.intention_type === "interested") cur.interested++;
      byMarket.set(r.market_id, cur);
    }
    const detailViewsByMarket = new Map<string, number>();
    for (const r of viewsClicksRes.data ?? []) {
      detailViewsByMarket.set(
        r.market_id,
        (detailViewsByMarket.get(r.market_id) ?? 0) + 1,
      );
    }

    const rows = (marketsRes.data ?? [])
      .map((m: { id: string; name: string; category: string; municipality: string; view_count: number | null }) => {
        const c = byMarket.get(m.id) ?? { will: 0, interested: 0 };
        const total = c.will + c.interested;
        const detailViews = detailViewsByMarket.get(m.id) ?? 0;
        const rate = detailViews > 0 ? (total / detailViews) * 100 : 0;
        return {
          id: m.id,
          name: m.name,
          category: m.category,
          municipality: m.municipality,
          willAttend: c.will,
          interested: c.interested,
          total,
          detailViews,
          intentionRate: rate,
        };
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);

    const limited = data.limit ? rows.slice(0, data.limit) : rows;
    return limited.map((r, i) => ({ rank: i + 1, ...r }));
  });

export const getIntentionMarketDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { marketId: string; days?: number }) =>
    z
      .object({
        marketId: z.string().uuid(),
        days: z.number().int().min(1).max(365).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const days = data.days ?? 30;
    const since = minusDaysISO(days);

    const [marketRes, intRes, viewsRes] = await Promise.all([
      supabase
        .from("markets")
        .select("id, name, category, municipality, view_count")
        .eq("id", data.marketId)
        .maybeSingle(),
      supabase
        .from("market_attendance_intentions")
        .select("intention_type, visitor_id, created_at")
        .eq("market_id", data.marketId),
      supabase
        .from("market_clicks")
        .select("id", { count: "exact", head: true })
        .eq("click_type", "view_detail")
        .eq("market_id", data.marketId),
    ]);
    if (marketRes.error) throw new Error(marketRes.error.message);
    if (intRes.error) throw new Error(intRes.error.message);
    if (!marketRes.data) throw new Error("Mercado no encontrado");

    let willAttend = 0;
    let interested = 0;
    const visitors = new Set<string>();
    const buckets = new Map<string, { willAttend: number; interested: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), { willAttend: 0, interested: 0 });
    }
    for (const r of intRes.data ?? []) {
      if (r.intention_type === "will_attend") willAttend++;
      else if (r.intention_type === "interested") interested++;
      visitors.add(r.visitor_id);
      if (r.created_at >= since) {
        const day = new Date(r.created_at).toISOString().slice(0, 10);
        const cur = buckets.get(day);
        if (cur) {
          if (r.intention_type === "will_attend") cur.willAttend++;
          else if (r.intention_type === "interested") cur.interested++;
        }
      }
    }
    const total = willAttend + interested;
    const detailViews = viewsRes.count ?? 0;
    const intentionRate = detailViews > 0 ? (total / detailViews) * 100 : 0;
    return {
      market: marketRes.data,
      willAttend,
      interested,
      total,
      detailViews,
      uniqueVisitors: visitors.size,
      intentionRate,
      daily: Array.from(buckets.entries()).map(([date, v]) => ({
        date,
        willAttend: v.willAttend,
        interested: v.interested,
      })),
    };
  });

export const getIntentionsPerDay = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await applyRange(
      context.supabase
        .from("market_attendance_intentions")
        .select("created_at, intention_type"),
      data,
    );
    if (error) throw new Error(error.message);
    const fromDay = data.from.slice(0, 10);
    const toDay = (data.to ?? new Date().toISOString()).slice(0, 10);
    const buckets = new Map<string, { willAttend: number; interested: number }>();
    const start = new Date(fromDay + "T00:00:00");
    const end = new Date(toDay + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      buckets.set(d.toISOString().slice(0, 10), { willAttend: 0, interested: 0 });
    }
    for (const r of rows ?? []) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      const cur = buckets.get(day);
      if (!cur) continue;
      if (r.intention_type === "will_attend") cur.willAttend++;
      else if (r.intention_type === "interested") cur.interested++;
    }
    return Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      willAttend: v.willAttend,
      interested: v.interested,
    }));
  });

export const getIntentionsPerMarketAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("market_attendance_intentions")
      .select("market_id, intention_type");
    if (error) throw new Error(error.message);
    const byMarket = new Map<string, { willAttend: number; interested: number }>();
    for (const r of data ?? []) {
      const cur = byMarket.get(r.market_id) ?? { willAttend: 0, interested: 0 };
      if (r.intention_type === "will_attend") cur.willAttend++;
      else if (r.intention_type === "interested") cur.interested++;
      byMarket.set(r.market_id, cur);
    }
    return Object.fromEntries(byMarket);
  });

// ============================================================
// New analytics functions for expanded panel
// ============================================================

export const getClicksByType = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await applyRange(
      context.supabase.from("market_clicks").select("click_type"),
      data,
    );
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = {
      view_detail: 0,
      click_phone: 0,
      click_email: 0,
      click_directions: 0,
      click_contact: 0,
      click_attendance: 0,
      click_instagram: 0,
    };
    for (const r of rows ?? []) {
      const k = r.click_type as string;
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const labels: Record<string, string> = {
      view_detail: "Ver detalle",
      click_phone: "Teléfono",
      click_email: "Email",
      click_directions: "Cómo llegar",
      click_contact: "URL contacto",
      click_attendance: "Asistencia",
      click_instagram: "Instagram",
    };
    return Object.entries(counts)
      .map(([type, count]) => ({ type, label: labels[type] ?? type, count }))
      .sort((a, b) => b.count - a.count);
  });

function categorizeReferrer(referrer: string | null): { category: string; host: string } {
  if (!referrer || referrer.trim() === "") return { category: "Directo", host: "(directo)" };
  const kind = classifyReferrer(referrer);
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { category: "Otro", host: referrer.slice(0, 80) };
  }
  if (kind === "interno") return { category: "Interno", host };
  if (kind === "desarrollo") return { category: "Desarrollo", host };
  if (host.includes("google.")) return { category: "Google", host };
  if (host.includes("instagram.")) return { category: "Instagram", host };
  if (host.includes("facebook.") || host.includes("fb.") || host === "l.facebook.com")
    return { category: "Facebook", host };
  return { category: "Otro", host };
}

export const getTrafficSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allRows, error } = await applyRange(
      context.supabase.from("page_views").select("referrer"),
      data,
    );
    if (error) throw new Error(error.message);
    const rawRows = (allRows ?? []) as { referrer: string | null }[];
    const rows = filterTraffic(rawRows, data.excludeInternal);
    const byCategory = new Map<string, number>();
    const byHost = new Map<string, { host: string; category: string; count: number }>();
    for (const r of rows) {
      const { category, host } = categorizeReferrer(r.referrer);
      byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
      const cur = byHost.get(host) ?? { host, category, count: 0 };
      cur.count++;
      byHost.set(host, cur);
    }
    return {
      totalRaw: rawRows.length,
      totalFiltered: rows.length,
      byCategory: Array.from(byCategory.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      topReferrers: Array.from(byHost.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  });

export const getPageActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allRows, error } = await applyRange(
      context.supabase.from("page_views").select("page, referrer"),
      data,
    );
    if (error) throw new Error(error.message);
    const rows = filterTraffic(
      (allRows ?? []) as { page: string | null; referrer: string | null }[],
      data.excludeInternal,
    );
    const byPage = new Map<string, number>();
    for (const r of rows) {
      const p = (r.page ?? "(desconocido)") as string;
      byPage.set(p, (byPage.get(p) ?? 0) + 1);
    }
    return Array.from(byPage.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views);
  });

export const getSubmissionsStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const baseFilter = (q: ReturnType<typeof supabase.from>) => applyRange(q, data);
    const [allRes, recentRes] = await Promise.all([
      baseFilter(supabase.from("market_submissions").select("status")),
      baseFilter(
        supabase
          .from("market_submissions")
          .select("id, name, municipality, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ),
    ]);
    if (allRes.error) throw new Error(allRes.error.message);
    if (recentRes.error) throw new Error(recentRes.error.message);
    const rows = allRes.data ?? [];
    const counts = { pending: 0, approved: 0, rejected: 0 };
    for (const r of rows) {
      const k = r.status as keyof typeof counts;
      if (k in counts) counts[k]++;
    }
    return {
      total: rows.length,
      pending: counts.pending,
      approved: counts.approved,
      rejected: counts.rejected,
      recent: recentRes.data ?? [],
    };
  });

// ============================================================
// Amenities distribution (pets, parking, accessibility, family,
// food area, payment methods) across active markets
// ============================================================

type AmenityGroup = {
  key: string;
  label: string;
  total: number;
  withData: number;
  options: { value: string; count: number; percent: number }[];
};

export const getAmenitiesDistribution = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ groups: AmenityGroup[]; totalActive: number }> => {
    const { data, error } = await context.supabase
      .from("markets")
      .select("pets, parking, accessibility, family_friendly, food_area, payment_methods")
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const totalActive = rows.length;

    const singleFields: { key: keyof (typeof rows)[number]; label: string }[] = [
      { key: "pets", label: "Mascotas" },
      { key: "parking", label: "Estacionamiento" },
      { key: "accessibility", label: "Accesibilidad" },
      { key: "family_friendly", label: "Familiar" },
      { key: "food_area", label: "Área de comida" },
    ];

    const groups: AmenityGroup[] = singleFields.map(({ key, label }) => {
      const counts = new Map<string, number>();
      let withData = 0;
      for (const r of rows) {
        const v = r[key] as string | null | undefined;
        if (v && v.trim() !== "") {
          counts.set(v, (counts.get(v) ?? 0) + 1);
          withData++;
        }
      }
      const options = Array.from(counts.entries())
        .map(([value, count]) => ({
          value,
          count,
          percent: totalActive > 0 ? (count / totalActive) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
      return { key: String(key), label, total: totalActive, withData, options };
    });

    // payment_methods is a text[]
    const payCounts = new Map<string, number>();
    let payWithData = 0;
    for (const r of rows) {
      const arr = (r.payment_methods ?? []) as string[] | null;
      if (arr && arr.length > 0) {
        payWithData++;
        for (const v of arr) payCounts.set(v, (payCounts.get(v) ?? 0) + 1);
      }
    }
    groups.push({
      key: "payment_methods",
      label: "Métodos de pago",
      total: totalActive,
      withData: payWithData,
      options: Array.from(payCounts.entries())
        .map(([value, count]) => ({
          value,
          count,
          percent: totalActive > 0 ? (count / totalActive) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count),
    });

    return { groups, totalActive };
  });

/* ============================================================== */
/*  Mercados destacados: performance vs. no destacados             */
/* ============================================================== */

const CONTACT_CLICKS = new Set([
  "click_phone",
  "click_email",
  "click_instagram",
  "click_contact",
]);

export const getFeaturedPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RangeInput) => rangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [marketsRes, clicksRes, intRes] = await Promise.all([
      supabase
        .from("markets")
        .select("id, name, municipality, category, destacado, destacado_desde, is_active"),
      applyRange(
        supabase.from("market_clicks").select("market_id, click_type, era_destacado"),
        data,
      ),
      applyRange(
        supabase
          .from("market_attendance_intentions")
          .select("market_id, intention_type, era_destacado"),
        data,
      ),
    ]);
    if (marketsRes.error) throw new Error(marketsRes.error.message);

    type Seg = { views: number; contact: number; intentions: number };
    const seg: Record<"featured" | "regular", Seg> = {
      featured: { views: 0, contact: 0, intentions: 0 },
      regular: { views: 0, contact: 0, intentions: 0 },
    };
    // Per-market tallies restricted to the events captured while featured.
    const perMarket = new Map<string, Seg>();
    const bump = (id: string, key: keyof Seg) => {
      const cur = perMarket.get(id) ?? { views: 0, contact: 0, intentions: 0 };
      cur[key] += 1;
      perMarket.set(id, cur);
    };

    for (const c of clicksRes.data ?? []) {
      // Legacy rows (era_destacado = null) predate the flag; count as regular.
      const key = c.era_destacado === true ? "featured" : "regular";
      if (c.click_type === "view_detail") {
        seg[key].views += 1;
        if (key === "featured") bump(c.market_id, "views");
      } else if (CONTACT_CLICKS.has(c.click_type)) {
        seg[key].contact += 1;
        if (key === "featured") bump(c.market_id, "contact");
      }
    }
    for (const r of intRes.data ?? []) {
      if (r.intention_type !== "will_attend" && r.intention_type !== "interested") continue;
      const key = r.era_destacado === true ? "featured" : "regular";
      seg[key].intentions += 1;
      if (key === "featured") bump(r.market_id, "intentions");
    }

    const allMarkets = marketsRes.data ?? [];
    const featuredMarkets = allMarkets.filter((m) => m.destacado);
    const featuredCount = featuredMarkets.length;
    const regularCount = Math.max(0, allMarkets.length - featuredCount);

    const rate = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
    const summarize = (s: Seg, markets: number) => ({
      views: s.views,
      contactClicks: s.contact,
      intentions: s.intentions,
      markets,
      avgViewsPerMarket: markets > 0 ? s.views / markets : 0,
      contactRate: rate(s.contact, s.views),
      intentionRate: rate(s.intentions, s.views),
    });

    const now = Date.now();
    const rows = featuredMarkets
      .map((m) => {
        const t = perMarket.get(m.id) ?? { views: 0, contact: 0, intentions: 0 };
        const since = m.destacado_desde as string | null;
        return {
          id: m.id as string,
          name: m.name as string,
          municipality: (m.municipality as string) ?? "",
          category: (m.category as string) ?? "",
          isActive: Boolean(m.is_active),
          views: t.views,
          contactClicks: t.contact,
          intentions: t.intentions,
          contactRate: rate(t.contact, t.views),
          destacadoDesde: since,
          daysFeatured: since
            ? Math.max(0, Math.floor((now - new Date(since).getTime()) / 86400000))
            : null,
        };
      })
      .sort((a, b) => b.views - a.views);

    const withDays = rows.filter((r) => r.daysFeatured !== null);
    const avgDaysFeatured =
      withDays.length > 0
        ? withDays.reduce((s, r) => s + (r.daysFeatured ?? 0), 0) / withDays.length
        : 0;

    const totalViews = seg.featured.views + seg.regular.views;
    return {
      featured: summarize(seg.featured, featuredCount),
      regular: summarize(seg.regular, regularCount),
      totalViews,
      featuredShareOfViews: rate(seg.featured.views, totalViews),
      rows,
      avgDaysFeatured,
    };
  });
