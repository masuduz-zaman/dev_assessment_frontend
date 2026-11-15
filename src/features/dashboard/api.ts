import { api } from '@/lib/http';

export interface CandidateDashboard {
  role: 'CANDIDATE';
  stats: { attempts: number; passed: number; averageScore: number; applications: number; pendingOffers: number; unreadNotifications: number };
  ranking: { position: number | null; percentage: number; passedCount: number } | null;
  recentResults: Array<{ id: string; title: string; assessmentId: string; percentage: number; status: string }>;
}

export interface CompanyDashboard {
  role: 'COMPANY';
  stats: { assessments: number; publishedAssessments: number; jobs: number; openJobs: number; applications: number; employees: number; pendingEvaluations: number };
  recentApplications: Array<{ id: string; status: string; createdAt: string; job: { title: string }; candidate: { name: string } }>;
}

export interface AdminDashboard {
  role: 'SUPER_ADMIN';
  stats: { users: number; companies: number; candidates: number; assessments: number; pendingCompanies: number; jobs: number; applications: number };
  revenue: Array<{ currency: string; amount: number; payments: number }>;
  recentUsers: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>;
}

export const dashboardApi = {
  candidate: () => api.get<CandidateDashboard>('/dashboard'),
  company: () => api.get<CompanyDashboard>('/dashboard'),
  admin: () => api.get<AdminDashboard>('/dashboard'),
};
