"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createAuthSupabaseClient } from "@/lib/supabase-auth";
import { buildSsoRedirectUrl, SSO_EXCHANGE_ENDPOINT } from "@/lib/sso";
import { persistSarayaAccount, persistSarayaSession, readSarayaAccount } from "@/lib/saraya-account";

const STATE_KEY = "saraya_sso_state";
const ATTEMPT_KEY = "saraya_sso_attempt";

function safeRandomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function SsoBootstrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createAuthSupabaseClient(), []);
  const [ready, setReady] = useState(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(ATTEMPT_KEY)) return true;
    }
    return false;
  });

  const cleanUrlParams = (paramsToRemove: string[]) => {
    const url = new URL(window.location.href);
    paramsToRemove.forEach(param => url.searchParams.delete(param));
    window.history.replaceState({}, "", url.pathname + (url.search || ""));
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateSarayaAccount = async (
      accessToken?: string,
      options: { force?: boolean } = {}
    ) => {
      if (!accessToken) return;
      if (!options.force && readSarayaAccount()) return;

      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          console.warn('Failed to refresh Saraya account profile');
          return;
        }

        const payload = await response.json();
        if (payload?.account) {
          persistSarayaAccount(payload.account);
        }
      } catch (error) {
        console.warn('Unable to hydrate Saraya account', error);
      }
    };

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      const code = searchParams.get("code");
      const returnedState = searchParams.get("state");
      const storedState = sessionStorage.getItem(STATE_KEY);

      if (code) {
        try {
          if (storedState && returnedState && storedState !== returnedState) {
            throw new Error("State mismatch");
          }

          const response = await fetch(SSO_EXCHANGE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error("Exchange failed");
          }

          const payload = await response.json();
          await supabase.auth.setSession({
            access_token: payload.session.access_token,
            refresh_token: payload.session.refresh_token,
          });

          // Persist session for AuthContext
          persistSarayaSession({
            access_token: payload.session.access_token,
            refresh_token: payload.session.refresh_token,
            expires_at: payload.session.expires_at,
          });

          if (payload.account) {
            persistSarayaAccount(payload.account);
          } else {
            await hydrateSarayaAccount(payload.session?.access_token, { force: true });
          }

          sessionStorage.removeItem(STATE_KEY);
          sessionStorage.removeItem(ATTEMPT_KEY);

          cleanUrlParams(["code", "state"]);
          setReady(true);
        } catch (error) {
          console.warn('SSO bootstrap failed', error);
          sessionStorage.removeItem(STATE_KEY);
          sessionStorage.removeItem(ATTEMPT_KEY);
          setReady(true);
        }
        return;
      }

      if (data.session) {
        await hydrateSarayaAccount(data.session.access_token, { force: !readSarayaAccount() });
        
        // Persist session for AuthContext
        persistSarayaSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        });
        
        sessionStorage.removeItem(STATE_KEY);
        sessionStorage.removeItem(ATTEMPT_KEY);
        setReady(true);
        return;
      }

      if (sessionStorage.getItem(ATTEMPT_KEY)) {
        setReady(true);
        return;
      }

      const state = safeRandomId();
      sessionStorage.setItem(STATE_KEY, state);
      sessionStorage.setItem(ATTEMPT_KEY, '1');
      const redirectUrl = buildSsoRedirectUrl(window.location.href, state);
      window.location.href = redirectUrl;
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
