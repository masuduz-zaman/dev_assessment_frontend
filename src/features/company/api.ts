import { api } from '@/lib/http';

export interface TeamMember {
  id: string;
  memberRole: string;
  permissions: string[];
  active: boolean;
  user: { id: string; name: string; email: string };
}

export interface AddMemberPayload {
  name: string;
  email: string;
  password: string;
  memberRole: string;
  permissions: string[];
}

export const companyApi = {
  members: () => api.get<TeamMember[]>('/company/members'),
  addMember: (body: AddMemberPayload) => api.post('/company/members', body),
  updateMember: (id: string, body: { permissions?: string[]; active?: boolean; memberRole?: string }) => api.patch(`/company/members/${id}`, body),
  removeMember: (id: string) => api.delete(`/company/members/${id}`),
};
