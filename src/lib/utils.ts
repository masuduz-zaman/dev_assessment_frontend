import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export function formatDate(value?: string | Date | null, withTime = false) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(new Date(value));
}

/** Amounts from the API are in minor units (poisha / cents). */
export function formatMoney(minor: number, currency = 'BDT') {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: major % 1 === 0 ? 0 : 2 }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

export const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`;

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';

export const humanize = (value: string) => value.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<string, Tone> = {
  APPROVED: 'success', ACTIVE: 'success', PUBLISHED: 'success', PASSED: 'success', PAID: 'success', OPEN: 'success', ACCEPTED: 'success', HIRED: 'success', EVALUATED: 'success',
  PENDING: 'warning', DRAFT: 'warning', REVIEWING: 'warning', SENT: 'info', APPLIED: 'info', SUBMITTED: 'info', IN_PROGRESS: 'info', SHORTLISTED: 'brand',
  REJECTED: 'danger', SUSPENDED: 'danger', FAILED: 'danger', CANCELLED: 'danger', CLOSED: 'neutral', ARCHIVED: 'neutral', EXPIRED: 'neutral', WITHDRAWN: 'neutral', REFUNDED: 'neutral',
};

export const statusTone = (status: string): Tone => TONES[status] ?? 'neutral';

export function roleHome(role: string) {
  if (role === 'SUPER_ADMIN') return '/admin';
  if (role === 'COMPANY') return '/company';
  return '/candidate';
}

export const buildQuery = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value && search.set(key, value));
  const query = search.toString();
  return query ? `?${query}` : '';
};
