export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  createdAt: string;
  _count?: { applications: number };
}

export interface CandidateSummary {
  id: string;
  name: string;
  email: string;
  candidate: { headline: string | null; skills: string[]; location: string | null; cvUrl: string | null; portfolioUrl: string | null } | null;
}

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface CompanyApplication {
  id: string;
  status: ApplicationStatus;
  cvUrl: string | null;
  coverLetter: string | null;
  createdAt: string;
  job: { id: string; title: string };
  candidate: CandidateSummary;
}

export interface MyApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  job: { id: string; title: string; location: string | null; employmentType: string | null; company: { name: string } };
}

export interface Offer {
  id: string;
  jobTitle: string;
  message: string | null;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  company?: { name: string };
  candidate?: { id: string; name: string; email: string };
}

export interface JobInput {
  title: string;
  description: string;
  location?: string;
  employmentType?: string;
  status?: 'DRAFT' | 'OPEN' | 'CLOSED';
}
