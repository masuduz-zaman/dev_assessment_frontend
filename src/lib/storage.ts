import type { SessionUser } from '@/types/api';

const TOKEN_KEY = 'devassess.token';
const USER_KEY = 'devassess.user';
const isBrowser = () => typeof window !== 'undefined';

export const tokenStorage = {
  get: () => (isBrowser() ? window.localStorage.getItem(TOKEN_KEY) : null),
  set: (token: string) => isBrowser() && window.localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  getUser: (): SessionUser | null => {
    if (!isBrowser()) return null;
    try {
      return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  setUser: (user: SessionUser) => isBrowser() && window.localStorage.setItem(USER_KEY, JSON.stringify(user)),
};
