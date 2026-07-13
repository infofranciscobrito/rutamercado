import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];

const CONTACT_ROLES = ["productor", "vendor", "publico_general"] as const;
export const CONTACT_ROLE_LABELS: Record<(typeof CONTACT_ROLES)[number], string> = {
  productor: "Productor",
  vendor: "Vendor",
  publico_general: "Público en general",
};

const ContactInputSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(100),
  role: z.enum(CONTACT_ROLES),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono muy corto").max(20),
  message: z.string().trim().min(5, "Mensaje muy corto").max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContactInputSchema.parse(input))
  .handler(async ({ data }) => {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      throw new Error(
        "Has enviado varios mensajes en la última hora. Inténtalo más tarde.",
      );
    }

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ContactMessage[];
  });

export const countNewContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "new" | "read" | "archived" }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "read", "archived"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
