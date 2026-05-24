import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Market } from "@/types/market";

export const listMarkets = createServerFn({ method: "GET" }).handler(
  async (): Promise<Market[]> => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .eq("is_active", true)
      .gte("event_date", todayStr)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("listMarkets failed:", error);
      throw new Error(error.message);
    }
    return (data ?? []) as Market[];
  },
);
