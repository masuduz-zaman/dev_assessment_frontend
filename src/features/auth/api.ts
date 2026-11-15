import { api } from '@/lib/http';
import type { Role, SessionUser } from '@/types/api';

export interface Session {
  token: string;
  user: SessionUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, 'SUPER_ADMIN'>;
  companyName?: string;
}

export interface GooglePayload {
  idToken: string;
  role?: Exclude<Role, 'SUPER_ADMIN'>;
  companyName?: string;
}

export interface GoogleResult extends Partial<Session> {
  user: SessionUser;
  requiresApproval: boolean;
  created: boolean;
}

export interface DemoAccount {
  role: Role;
  label: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (email: string, password: string) => api.post<Session>('/auth/login', { email, password }),
  register: (payload: RegisterPayload) => api.post<{ user: SessionUser; requiresApproval: boolean }>('/auth/register', payload),
  google: (payload: GooglePayload) => api.post<GoogleResult>('/auth/google', payload),
  me: () => api.get<SessionUser & { company?: { id: string; name: string; status: string } | null }>('/auth/me'),
  googleConfig: () => api.get<{ enabled: boolean; clientId: string | null }>('/auth/google/config'),
  demoAccounts: () => api.get<DemoAccount[]>('/auth/demo-accounts'),
};
