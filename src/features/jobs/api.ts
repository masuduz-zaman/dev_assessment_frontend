import { api } from '@/lib/http';
import type { ApplicationStatus, CompanyApplication, Job, JobInput, MyApplication, Offer } from './types';

export const jobsApi = {
  companyJobs: () => api.get<Job[]>('/jobs/mine'),
  create: (body: JobInput) => api.post<Job>('/jobs', body),
  update: (id: string, body: Partial<JobInput>) => api.patch<Job>(`/jobs/${id}`, body),
  remove: (id: string) => api.delete<{ id: string }>(`/jobs/${id}`),

  apply: (body: { jobId: string; coverLetter?: string; cvUrl?: string }) => api.post('/applications', body),
  myApplications: () => api.get<MyApplication[]>('/applications/mine'),
  companyApplications: (params?: { status?: string; jobId?: string }) => api.get<CompanyApplication[]>('/applications/company', params),
  updateApplicationStatus: (id: string, status: Exclude<ApplicationStatus, 'APPLIED'>) => api.patch(`/applications/${id}/status`, { status }),

  sendOffer: (body: { candidateId: string; jobTitle: string; message?: string }) => api.post<Offer>('/offers', body),
  myOffers: () => api.get<Offer[]>('/offers/mine'),
  companyOffers: () => api.get<Offer[]>('/offers/company'),
  respondOffer: (id: string, status: 'ACCEPTED' | 'REJECTED') => api.patch(`/offers/${id}/respond`, { status }),
};
