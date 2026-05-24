import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuthReady(): {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
} {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;

    console.log("Auth state: loading");

    // Set listener BEFORE calling getSession to avoid missing events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        console.log("Auth state: authenticated");
        setStatus("authenticated");
      } else {
        console.log("Auth state: unauthenticated");
        setStatus("unauthenticated");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        console.log("Auth state: authenticated");
        setStatus("authenticated");
      } else {
        console.log("Auth state: unauthenticated");
        setStatus("unauthenticated");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { status, user, session };
}

export function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="h-10 w-10 rounded-full border-4 border-[#f8b625]/20 border-t-[#f8b625] animate-spin" />
    </div>
  );
}
