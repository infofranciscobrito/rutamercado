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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      // INITIAL_SESSION can come from local storage before the session is validated.
      // Do not redirect from /admin/login based on this event.
      if (event === "INITIAL_SESSION") return;

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

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.user) {
        setSession(null);
        setUser(null);
        console.log("Auth state: unauthenticated");
        setStatus("unauthenticated");
        return;
      }

      supabase.auth.getSession().then(({ data: sessionData }) => {
        if (!mounted) return;
        setSession(sessionData.session);
        setUser(data.user);
        console.log("Auth state: authenticated");
        setStatus("authenticated");
      });
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
