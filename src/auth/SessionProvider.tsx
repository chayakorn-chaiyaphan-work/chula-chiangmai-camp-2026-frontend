import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { Profile } from "../api/types";

type SessionStatus = "loading" | "authenticated" | "error";

interface SessionContextValue {
  status: SessionStatus;
  profile: Profile | null;
  error: Error | null;
  refreshProfile: () => Promise<Profile>;
  retry: () => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const loadLiff = async () => (await import("@line/liff")).default;

async function establishSession(): Promise<Profile> {
  try {
    return await endpoints.me();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  const liffId = import.meta.env.VITE_LIFF_ID?.trim();
  if (!liffId) {
    throw new Error("VITE_LIFF_ID is not configured for this environment.");
  }

  const liff = await loadLiff();
  await liff.init({ liffId, withLoginOnExternalBrowser: true });
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    return new Promise<Profile>(() => undefined);
  }

  const idToken = liff.getIDToken();
  if (!idToken) {
    throw new Error("LINE did not return an ID token. Check the LIFF OpenID scope.");
  }

  await endpoints.login(idToken);
  return endpoints.me();
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const refreshProfile = useCallback(async () => {
    const next = await endpoints.me();
    setProfile(next);
    return next;
  }, []);

  useEffect(() => {
    let active = true;

    establishSession()
      .then((next) => {
        if (!active) return;
        setProfile(next);
        setStatus("authenticated");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason : new Error("Unable to start the app"));
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((value) => value + 1);
  }, []);
  const logout = useCallback(async () => {
    await endpoints.logout();
    const liffId = import.meta.env.VITE_LIFF_ID?.trim();
    if (liffId) {
      const liff = await loadLiff();
      await liff.init({ liffId, withLoginOnExternalBrowser: true });
      if (liff.isInClient()) {
        liff.closeWindow();
        return;
      }
      if (liff.isLoggedIn()) liff.logout();
    }
    window.location.assign("/");
  }, []);

  const value = useMemo(
    () => ({ status, profile, error, refreshProfile, retry, logout }),
    [status, profile, error, refreshProfile, retry, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// This hook intentionally shares the provider module to keep session state private.
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
