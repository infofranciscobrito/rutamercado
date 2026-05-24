import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const ClickTypeSchema = z.enum([
  "view_detail",
  "click_phone",
  "click_email",
  "click_instagram",
  "click_directions",
]);

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((input: { page: string; referrer?: string; userAgent?: string }) =>
    z
      .object({
        page: z.string().min(1).max(255),
        referrer: z.string().max(2048).optional(),
        userAgent: z.string().max(1024).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabase.from("page_views").insert({
      page: data.page,
      referrer: data.referrer ?? null,
      user_agent: data.userAgent ?? null,
    });
    if (error) {
      console.error("trackPageView failed:", error);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });

export const trackMarketClick = createServerFn({ method: "POST" })
  .inputValidator((input: { marketId: string; clickType: string }) =>
    z
      .object({
        marketId: z.string().uuid(),
        clickType: ClickTypeSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabase.from("market_clicks").insert({
      market_id: data.marketId,
      click_type: data.clickType,
    });
    if (error) {
      console.error("trackMarketClick failed:", error);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });

export const incrementMarketView = createServerFn({ method: "POST" })
  .inputValidator((input: { marketId: string }) =>
    z.object({ marketId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabase.rpc("increment_view_count", {
      market_id: data.marketId,
    });
    if (error) {
      console.error("incrementMarketView failed:", error);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });
