import { api } from '@/lib/http';
import type { Plan } from '@/features/public/types';

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  purpose: string;
  createdAt: string;
  plan: { id: string; name: string } | null;
}

export interface AdminPayment extends PaymentRecord {
  user: { id: string; name: string; email: string };
}

export const paymentsApi = {
  plans: () => api.get<Plan[]>('/plans'),
  checkout: (planId: string) => api.post<{ paymentId: string; provider: string; checkoutUrl: string }>('/payments/checkout', { planId }),
  mine: () => api.get<PaymentRecord[]>('/payments'),
  verify: (id: string) => api.post<PaymentRecord>(`/payments/${id}/verify`),
  adminAll: () => api.get<AdminPayment[]>('/admin/payments'),
};
