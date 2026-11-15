import { api } from '@/lib/http';
import type { AssessmentOverview, Meta, Plan, PlatformStats, PublicAssessment, PublicCandidate, PublicCompany, PublicJob, RankingRow } from './types';

export const publicApi = {
  stats: () => api.get<PlatformStats>('/public/stats'),
  meta: () => api.get<Meta>('/public/meta'),
  assessments: (search?: string) => api.get<PublicAssessment[]>('/public/assessments', { search }),
  assessment: (id: string) => api.get<AssessmentOverview>(`/public/assessments/${id}`),
  companies: (search?: string) => api.get<PublicCompany[]>('/public/companies', { search }),
  jobs: (params: { search?: string; type?: string }) => api.get<PublicJob[]>('/public/jobs', params),
  candidates: (search?: string) => api.get<PublicCandidate[]>('/public/candidates', { search }),
  plans: () => api.get<Plan[]>('/plans'),
  rankings: (scope: 'public' | 'company') => api.get<RankingRow[]>('/rankings', { scope }),
};
