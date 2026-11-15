export interface PlatformStats {
  companies: number;
  candidates: number;
  assessments: number;
  openJobs: number;
  evaluatedResults: number;
}

export interface PermissionOption {
  key: string;
  label: string;
  description: string;
}

export interface Meta {
  permissions: PermissionOption[];
  memberRoles: Array<{ value: string; label: string; defaultPermissions: string[] }>;
  codingLanguages: Array<{ id: number; name: string }>;
  employmentTypes: string[];
  questionTypes: Array<{ value: 'MCQ' | 'CODING' | 'WRITTEN'; label: string }>;
  assessmentVisibility: Array<{ value: 'PUBLIC' | 'PRIVATE'; label: string }>;
}

export interface PublicAssessment {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  createdAt: string;
  company: { name: string } | null;
  _count: { questions: number; attempts: number };
}

export interface AssessmentOverview {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  maxAttempts: number;
  startsAt: string | null;
  endsAt: string | null;
  company: { name: string } | null;
  questionCount: number;
  questionCounts: Record<string, number>;
}

export interface PublicCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  _count: { jobs: number; assessments: number };
}

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  createdAt: string;
  company: { id: string; name: string; logoUrl: string | null };
}

export interface PublicCandidate {
  headline: string | null;
  location: string | null;
  skills: string[];
  portfolioUrl: string | null;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  features: string[];
}

export interface RankingRow {
  rank: number;
  candidateId: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  percentage: number;
  passedCount: number;
  completedAttempts: number;
}
