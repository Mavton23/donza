'use client';
import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, refreshSession, request, tokenStore } from '@/lib/api/client';
import type { AuthResponse, User } from '@/lib/api/types';

type Status = 'loading' | 'authenticated' | 'anonymous';
interface AuthContext {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  adopt: (res: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (u: User) => void;
  /** true depois de o utilizador terminar a sessão de propósito (a guarda de rotas não deve redireccionar para o login). */
  explicitLogout: boolean;
}
const Ctx = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatus] = React.useState<Status>('loading');
  const [user, setUserState] = React.useState<User | null>(null);
  const [explicitLogout, setExplicit] = React.useState(false);
  const statusRef = React.useRef(status);
  statusRef.current = status;

  const fetchMe = React.useCallback(async () => {
    const me = await request<User>('/auth/me');
    setUserState(me); setStatus('authenticated');
    return me;
  }, []);

  // Arranque: o cookie de refresh restaura a sessão (o access token não sobrevive a um reload).
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const t = await refreshSession();
      if (!alive) return;
      if (!t) { setStatus('anonymous'); return; }
      try { await fetchMe(); } catch { if (alive) { tokenStore.set(null); setStatus('anonymous'); } }
    })();
    return () => { alive = false; };
  }, [fetchMe]);

  // Sessão terminada noutro separador / refresh falhado a meio da utilização.
  React.useEffect(() => tokenStore.subscribe((t) => {
    if (t === null && statusRef.current === 'authenticated') { setUserState(null); setStatus('anonymous'); qc.clear(); }
  }), [qc]);

  const adopt = React.useCallback((res: AuthResponse) => { setExplicit(false); tokenStore.set(res.accessToken); setUserState(res.user); setStatus('authenticated'); }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    qc.clear(); adopt(res);
    return res.user;
  }, [adopt, qc]);

  const logout = React.useCallback(async () => {
    setExplicit(true);
    try { await api.post('/auth/logout'); } catch { /* terminar localmente de qualquer forma */ }
    tokenStore.set(null); setUserState(null); setStatus('anonymous'); qc.clear();
  }, [qc]);

  const value = React.useMemo<AuthContext>(() => ({
    status, user, login, adopt, logout, setUser: setUserState, explicitLogout,
    refreshUser: async () => { try { return await fetchMe(); } catch { return null; } },
  }), [status, user, login, adopt, logout, fetchMe, explicitLogout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}
