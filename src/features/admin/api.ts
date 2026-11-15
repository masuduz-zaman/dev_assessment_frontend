import { api } from '@/lib/http';
import type { AssessmentListItem } from '@/features/assessments/types';

export interface AdminCompany {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { members: number; assessments: number; jobs: number };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY' | 'CANDIDATE';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  avatarUrl: string | null;
  createdAt: string;
}

type Count = Array<{ label: string; value: number }>;

export interface Reports {
  usersByRole: Count;
  companiesByStatus: Count;
  assessmentsByStatus: Count;
  applicationsByStatus: Count;
  paymentsByStatus: Count;
  signupsByMonth: Array<{ month: string; users: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  revenueCurrency: string | null;
}

export const adminApi = {
  companies: (params?: { status?: string; search?: string }) => api.get<AdminCompany[]>('/admin/companies', params),
  setCompanyStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reason?: string) => api.patch(`/admin/companies/${id}/status`, { status, reason }),
  users: (params?: { role?: string; status?: string; search?: string }) => api.get<AdminUser[]>('/admin/users', params),
  setUserStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') => api.patch(`/admin/users/${id}/status`, { status }),
  assessments: () => api.get<Array<AssessmentListItem>>('/admin/assessments'),
  reports: () => api.get<Reports>('/admin/reports'),
};
