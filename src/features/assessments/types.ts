export type QuestionType = 'MCQ' | 'CODING' | 'WRITTEN';
export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AssessmentListItem {
  id: string;
  title: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: AssessmentStatus;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  maxAttempts: number;
  createdAt: string;
  company: { id: string; name: string } | null;
  _count: { questions: number; attempts: number; invitations: number };
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  marks: number;
  order: number;
  options: Array<{ id: string; text: string; isCorrect?: boolean }>;
  codingConfig: { languageIds: number[]; starterCode: string | null; timeLimitSeconds: number; testCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }> } | null;
}

export interface AssessmentDetail extends Omit<AssessmentListItem, '_count'> {
  questions: ExamQuestion[];
}

export interface Attempt {
  id: string;
  assessmentId: string;
  deadlineAt: string;
  startedAt: string;
  status: string;
}

export interface AnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
  answerText?: string;
  code?: string;
  languageId?: number;
}

export interface SubmitOutcome {
  result: { id: string; obtainedMarks: number; totalMarks: number; percentage: number; status: 'PENDING' | 'PASSED' | 'FAILED' };
  manualReviewPending: boolean;
}

export interface Invitation {
  id: string;
  acceptedAt: string | null;
  createdAt: string;
  assessment: { id: string; title: string; description: string | null; durationMinutes: number; totalMarks: number; status: string; company: { name: string } | null };
}

export interface SentInvitation {
  id: string;
  acceptedAt: string | null;
  candidate: { id: string; name: string; email: string };
}

export interface MyResult {
  id: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  assessment: { id: string; title: string; passMarks: number; company: { name: string } | null };
  attempt: { submittedAt: string | null; status: string };
}

export interface CompanyResult extends Omit<MyResult, 'assessment'> {
  assessment: { id: string; title: string };
  candidate: { id: string; name: string; email: string };
}

export interface PendingSubmission {
  id: string;
  answerText: string | null;
  code: string | null;
  languageId: number | null;
  executionResult: { error?: string } | null;
  question: { id: string; type: QuestionType; prompt: string; marks: number };
  attempt: { id: string; submittedAt: string | null; candidate: { id: string; name: string; email: string }; assessment: { id: string; title: string } };
}

export interface ExecutionOutput {
  status?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
}

/** Shape the builder form edits and sends to the API */
export interface QuestionDraft {
  type: QuestionType;
  prompt: string;
  marks: number;
  options: Array<{ text: string; isCorrect: boolean }>;
  languageIds: number[];
  starterCode: string;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
}

export interface AssessmentInput {
  title: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  durationMinutes: number;
  maxAttempts: number;
  passMarks?: number;
  questions: Array<Partial<QuestionDraft> & Pick<QuestionDraft, 'type' | 'prompt' | 'marks'>>;
}
