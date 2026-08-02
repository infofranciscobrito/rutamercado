import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const IntentionTypeSchema = z.enum(["will_attend", "interested"]);

export const recordAttendanceIntention = createServerFn({ method: "POST" })
  .inputValidator((input: { marketId: string; intentionType: string; visitorId: string }) =>
    z
      .object({
        marketId: z.string().uuid(),
        intentionType: IntentionTypeSchema,
        visitorId: z.string().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Freeze the market's featured state at event time so the analytics
    // comparison survives the admin toggling `destacado` later.
    const { data: mk } = await supabaseAdmin
      .from("markets")
      .select("destacado")
      .eq("id", data.marketId)
      .maybeSingle();
    const eraDestacado = Boolean(mk?.destacado);

    const { error: insErr } = await supabaseAdmin
      .from("market_attendance_intentions")
      .insert({
        market_id: data.marketId,
        intention_type: data.intentionType,
        visitor_id: data.visitorId,
        era_destacado: eraDestacado,
      });
    if (insErr) {
      console.error("recordAttendanceIntention failed:", insErr);
      return { ok: false as const, error: insErr.message };
    }
    // Best-effort click tracking; do not fail vote if this fails.
    const { error: clickErr } = await supabaseAdmin.from("market_clicks").insert({
      market_id: data.marketId,
      click_type: "click_attendance",
      era_destacado: eraDestacado,
    });
    if (clickErr) console.error("attendance click track failed:", clickErr);
    return { ok: true as const };
  });

export const getMarketIntentionCount = createServerFn({ method: "GET" })
  .inputValidator((input: { marketId: string }) =>
    z.object({ marketId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("market_attendance_intentions")
      .select("intention_type")
      .eq("market_id", data.marketId);
    if (error) {
      console.error("getMarketIntentionCount failed:", error);
      return { total: 0, willAttend: 0, interested: 0 };
    }
    let willAttend = 0;
    let interested = 0;
    for (const r of rows ?? []) {
      if (r.intention_type === "will_attend") willAttend++;
      else if (r.intention_type === "interested") interested++;
    }
    return { total: willAttend + interested, willAttend, interested };
  });
