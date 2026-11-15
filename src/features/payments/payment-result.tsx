'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatMoney } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { paymentsApi } from './api';

/**
 * The browser redirect never marks a payment as paid. This page asks the API to re-check the payment
 * with the gateway (server to server) and only shows success when the gateway confirmed it.
 */
export function PaymentResult({ variant }: { variant: 'success' | 'cancel' }) {
  const params = useSearchParams();
  const paymentId = params.get('payment');
  const reason = params.get('reason');
  const { user, ready } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-verify', paymentId],
    queryFn: () => paymentsApi.verify(paymentId as string),
    enabled: Boolean(paymentId && user && ready),
    // SSLCommerz / Stripe may need a few seconds before the gateway reports the payment
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' && variant === 'success' ? 3000 : false),
    retry: 1,
  });

  const paid = data?.status === 'PAID';
  const pending = variant === 'success' && (isLoading || data?.status === 'PENDING');

  const view = paid
    ? { icon: <CheckCircle2 className="h-12 w-12" />, tone: 'bg-emerald-50 text-emerald-600', title: 'Payment confirmed', text: 'Your payment was verified with the payment provider. A receipt is available in your payment history.' }
    : pending
      ? { icon: <Loader2 className="h-12 w-12 animate-spin" />, tone: 'bg-sky-50 text-sky-600', title: 'Confirming your payment…', text: 'We are checking the result with the payment provider. This usually takes a few seconds.' }
      : variant === 'cancel'
        ? { icon: <XCircle className="h-12 w-12" />, tone: 'bg-rose-50 text-rose-600', title: reason === 'validation_failed' ? 'Payment could not be verified' : 'Checkout not completed', text: 'No payment was taken. You can pick a plan again whenever you are ready.' }
        : { icon: <Clock className="h-12 w-12" />, tone: 'bg-amber-50 text-amber-600', title: 'Payment not confirmed', text: error ? 'We could not confirm this payment. Check your payment history in a moment.' : 'The provider has not confirmed this payment.' };

  return (
    <div className="mx-auto max-w-lg py-10">
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>
        <Card className="p-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', damping: 10 }} className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${view.tone}`}>
            {view.icon}
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900">{view.title}</h1>
          <p className="mt-2 text-slate-500">{view.text}</p>
          {data && paid && <p className="mt-4 text-3xl font-extrabold text-slate-900">{formatMoney(data.amount, data.currency)}</p>}
          {data && <p className="mt-1 text-sm text-slate-500">{data.purpose}</p>}
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/payments">Payment history</ButtonLink>
            <ButtonLink href="/" variant="outline">Home</ButtonLink>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
