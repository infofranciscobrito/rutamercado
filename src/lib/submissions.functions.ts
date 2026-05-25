import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MARKET_CATEGORIES, MARKET_REGIONS } from "@/types/market";
import {
  generateRecurrenceLabel,
  RECURRENCE_TYPES,
  WEEKDAYS_ES,
  WEEKS_OF_MONTH_ES,
} from "@/lib/recurrence";
import type { Database } from "@/integrations/supabase/types";

export type Submission =
  Database["public"]["Tables"]["market_submissions"]["Row"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

const SubmissionInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.enum(MARKET_CATEGORIES as [string, ...string[]]),
  region: z.enum(MARKET_REGIONS as [string, ...string[]]),
  municipality: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(300),
  start_time: z.string().regex(TIME_RE),
  end_time: z.string().regex(TIME_RE),
  recurrence_type: z.enum(RECURRENCE_TYPES as [string, ...string[]]),
  recurrence_day_of_week: z
    .enum(WEEKDAYS_ES as [string, ...string[]])
    .optional(),
  recurrence_week_of_month: z
    .enum(WEEKS_OF_MONTH_ES as [string, ...string[]])
    .optional(),
  recurrence_start_date: z.string().regex(DATE_RE),
  recurrence_end_date: z.string().regex(DATE_RE).optional().or(z.literal("")),
  image_url: z.string().url().max(2048).optional().or(z.literal("")),
  organizer_name: z.string().trim().min(1).max(200),
  organizer_phone: z.string().trim().max(50).optional().or(z.literal("")),
  organizer_email: z
    .string()
    .trim()
    .max(255)
    .email()
    .optional()
    .or(z.literal("")),
  organizer_instagram: z.string().trim().max(100).optional().or(z.literal("")),
});

export const createMarketSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmissionInputSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.organizer_email) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("market_submissions")
        .select("id", { count: "exact", head: true })
        .eq("organizer_email", data.organizer_email)
        .gte("created_at", since);
      if ((count ?? 0) >= 3) {
        throw new Error(
          "Has enviado varios mercados en la última hora. Inténtalo más tarde.",
        );
      }
    }
    const label = generateRecurrenceLabel(
      data.recurrence_type,
      data.recurrence_day_of_week ?? null,
      data.recurrence_week_of_month ?? null,
    );

    const { error } = await supabaseAdmin.from("market_submissions").insert({
      name: data.name,
      description: data.description || null,
      category: data.category as Database["public"]["Enums"]["market_category"],
      region: data.region as Database["public"]["Enums"]["market_region"],
      municipality: data.municipality,
      address: data.address,
      start_time: data.start_time,
      end_time: data.end_time,
      recurrence_type: data.recurrence_type,
      recurrence_day_of_week: data.recurrence_day_of_week || null,
      recurrence_week_of_month: data.recurrence_week_of_month || null,
      recurrence_start_date: data.recurrence_start_date,
      recurrence_end_date: data.recurrence_end_date || null,
      recurrence_label: label,
      image_url: data.image_url || null,
      organizer_name: data.organizer_name,
      organizer_phone: data.organizer_phone || null,
      organizer_email: data.organizer_email || null,
      organizer_instagram: data.organizer_instagram || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("market_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Submission[];
  });

export const countPendingSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("market_submissions")
      .select("id", { count: "exact" })
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  });

export const approveSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: sub, error: fetchErr } = await supabase
      .from("market_submissions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);
    if (sub.status !== "pending")
      throw new Error("Este envío ya fue revisado.");

    const { data: inserted, error: insErr } = await supabase
      .from("markets")
      .insert({
        name: sub.name,
        description: sub.description,
        category: sub.category,
        region: sub.region,
        municipality: sub.municipality,
        address: sub.address,
        start_time: sub.start_time,
        end_time: sub.end_time,
        recurrence_type: sub.recurrence_type,
        recurrence_day_of_week: sub.recurrence_day_of_week,
        recurrence_week_of_month: sub.recurrence_week_of_month,
        recurrence_start_date: sub.recurrence_start_date,
        recurrence_end_date: sub.recurrence_end_date,
        recurrence_label: sub.recurrence_label,
        image_url: sub.image_url,
        organizer_name: sub.organizer_name,
        organizer_phone: sub.organizer_phone,
        organizer_email: sub.organizer_email,
        organizer_instagram: sub.organizer_instagram,
        is_active: true,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const { error: updErr } = await supabase
      .from("market_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        published_market_id: inserted.id,
      })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, marketId: inserted.id };
  });

export const rejectSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; notes?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        notes: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("market_submissions")
      .update({
        status: "rejected",
        admin_notes: data.notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
