import { api } from '@/lib/http';
import type {
  AnswerPayload, AssessmentDetail, AssessmentInput, AssessmentListItem, Attempt, CompanyResult, ExecutionOutput, Invitation, MyResult, PendingSubmission, SentInvitation, SubmitOutcome,
} from './types';

export const assessmentsApi = {
  list: (params?: { scope?: 'mine' | 'public'; status?: string; search?: string }) => api.get<AssessmentListItem[]>('/assessments', params),
  get: (id: string) => api.get<AssessmentDetail>(`/assessments/${id}`),
  create: (body: AssessmentInput) => api.post<AssessmentDetail>('/assessments', body),
  update: (id: string, body: Partial<AssessmentInput>) => api.patch<AssessmentDetail>(`/assessments/${id}`, body),
  remove: (id: string) => api.delete(`/assessments/${id}`),
  publish: (id: string) => api.patch(`/assessments/${id}/publish`),
  archive: (id: string) => api.patch(`/assessments/${id}/archive`),

  invite: (assessmentId: string, candidateIds: string[]) => api.post('/invitations', { assessmentId, candidateIds }),
  sentInvitations: (assessmentId: string) => api.get<SentInvitation[]>(`/invitations/assessment/${assessmentId}`),
  myInvitations: () => api.get<Invitation[]>('/invitations/mine'),
  acceptInvitation: (id: string) => api.post(`/invitations/${id}/accept`),

  startAttempt: (assessmentId: string) => api.post<Attempt>('/attempts', { assessmentId }),
  submitAttempt: (attemptId: string, answers: AnswerPayload[]) => api.post<SubmitOutcome>(`/attempts/${attemptId}/submit`, { answers }),
  runCode: (body: { source_code: string; language_id: number; stdin: string }) => api.post<ExecutionOutput>('/coding/execute', body),

  myResults: () => api.get<MyResult[]>('/results/mine'),
  companyResults: () => api.get<CompanyResult[]>('/results/company'),
  pendingEvaluations: () => api.get<PendingSubmission[]>('/evaluations/pending'),
  evaluate: (submissionId: string, body: { marksAwarded: number; feedback?: string }) => api.post(`/evaluations/${submissionId}`, body),
};
