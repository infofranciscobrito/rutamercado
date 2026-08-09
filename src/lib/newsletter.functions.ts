import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type NewsletterSubscriber =
  Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

export const NEWSLETTER_SOURCE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  ficha_mercado: "Ficha de mercado",
};

const SubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Correo inválido")
    .max(255),
  source: z.enum(["homepage", "ficha_mercado"]),
  marketSlug: z.string().trim().max(200).optional().nullable(),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email: data.email,
          source: data.source,
          market_slug: data.source === "ficha_mercado" ? data.marketSlug ?? null : null,
        },
        { onConflict: "email", ignoreDuplicates: true },
      );

    if (error) throw new Error(error.message);

    return { ok: true as const };
  });

export type NewsletterSubscriberRow = NewsletterSubscriber & {
  market_name: string | null;
};

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as NewsletterSubscriber[];

    const slugs = Array.from(
      new Set(rows.map((r) => r.market_slug).filter((s): s is string => !!s)),
    );
    const nameBySlug = new Map<string, string>();
    if (slugs.length > 0) {
      const { data: markets } = await context.supabase
        .from("markets")
        .select("slug, name")
        .in("slug", slugs);
      for (const m of markets ?? []) {
        if (m.slug) nameBySlug.set(m.slug, m.name);
      }
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const active = rows.filter((r) => r.status === "activo");
    const since = (days: number) =>
      active.filter((r) => now - new Date(r.created_at).getTime() <= days * DAY)
        .length;

    return {
      subscribers: rows.map((r) => ({
        ...r,
        market_name: r.market_slug
          ? nameBySlug.get(r.market_slug) ?? r.market_slug
          : null,
      })) as NewsletterSubscriberRow[],
      stats: {
        totalActive: active.length,
        last7Days: since(7),
        last30Days: since(30),
      },
    };
  });

