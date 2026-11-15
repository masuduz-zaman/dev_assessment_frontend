export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: ApiFieldError[];
}

export type Role = 'SUPER_ADMIN' | 'COMPANY' | 'CANDIDATE';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  avatarUrl?: string | null;
}
