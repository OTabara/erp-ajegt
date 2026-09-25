import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getSession, login as loginRequest, logout as logoutRequest } from "../api/auth";
import type { SessionUser } from "../api/auth";
import { ApiError } from "../api/http";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setUser(await getSession()); } catch (error) { if (error instanceof ApiError && error.status === 401) setUser(null); else setUser(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void refresh(); }, 0); return () => window.clearTimeout(timer); }, [refresh]);
  const login = useCallback(async (email: string, password: string) => { setUser(await loginRequest(email, password)); }, []);
  const logout = useCallback(async () => { await logoutRequest(); setUser(null); }, []);
  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
