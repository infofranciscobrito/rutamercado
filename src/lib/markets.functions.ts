import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Market } from "@/types/market";

export const listMarkets = createServerFn({ method: "GET" }).handler(
  async (): Promise<Market[]> => {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("listMarkets failed:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as Market[];
  },
);
