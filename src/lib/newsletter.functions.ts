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

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as NewsletterSubscriber[];
  });
