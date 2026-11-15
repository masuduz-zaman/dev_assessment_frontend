'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, type GooglePayload, type RegisterPayload } from '@/features/auth/api';
import { tokenStorage } from '@/lib/storage';
import type { SessionUser } from '@/types/api';

interface AuthContextValue {
  user: SessionUser | null;
  /** false until the stored session has been checked with the server */
  ready: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  loginWithGoogle: (payload: GooglePayload) => Promise<{ user: SessionUser | null; requiresApproval: boolean }>;
  register: (payload: RegisterPayload) => Promise<{ requiresApproval: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((token: string, nextUser: SessionUser) => {
    tokenStorage.set(token);
    tokenStorage.setUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  // Restore the session: show the cached user instantly, then confirm it with the API.
  useEffect(() => {
    const cached = tokenStorage.getUser();
    if (!tokenStorage.get()) {
      setReady(true);
      return;
    }
    if (cached) setUser(cached);
    authApi
      .me()
      .then((me) => {
        const fresh: SessionUser = { id: me.id, name: me.name, email: me.email, role: me.role, avatarUrl: me.avatarUrl };
        tokenStorage.setUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      router.push('/login');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      logout,
      async login(email, password) {
        const session = await authApi.login(email, password);
        persist(session.token, session.user);
        return session.user;
      },
      async loginWithGoogle(payload) {
        const result = await authApi.google(payload);
        if (result.token) persist(result.token, result.user);
        return { user: result.token ? result.user : null, requiresApproval: result.requiresApproval };
      },
      async register(payload) {
        const { requiresApproval } = await authApi.register(payload);
        return { requiresApproval };
      },
    }),
    [user, ready, logout, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
