'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, CreditCard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getErrorMessage } from '@/lib/http';
import { cn, formatDate, formatMoney } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { paymentsApi } from './api';

export function PaymentsView() {
  const { user } = useAuth();
  const plans = useQuery({ queryKey: ['plans'], queryFn: paymentsApi.plans });
  const history = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.mine, enabled: user?.role !== 'SUPER_ADMIN' });

  const checkout = useMutation({
    mutationFn: (planId: string) => paymentsApi.checkout(planId),
    onSuccess: ({ checkoutUrl }) => {
      toast.success('Redirecting to the secure payment page…');
      window.location.href = checkoutUrl;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const featured = plans.data && plans.data.length > 1 ? plans.data[Math.floor(plans.data.length / 2)].id : null;

  return (
    <>
      <PageHeader title="Plans & payments" description="Pay securely through the payment gateway. Payments are confirmed server-to-server before they count." />
      <QueryState isLoading={plans.isLoading} error={plans.error} onRetry={plans.refetch} isEmpty={plans.data?.length === 0} skeleton="cards" emptyTitle="No plans available">
        <Stagger className="mb-12 grid gap-5 md:grid-cols-3">
          {plans.data?.map((plan) => (
            <StaggerItem key={plan.id}>
              <div className={cn('relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-xl', plan.id === featured ? 'border-brand-400 shadow-glow' : 'border-slate-200')}>
                {plan.id === featured && <Badge tone="brand" className="absolute -top-3 left-6 bg-brand-600 text-white ring-0"><Sparkles className="mr-1 h-3 w-3" /> Most popular</Badge>}
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-sm text-slate-500">{plan.description}</p>
                <p className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">{formatMoney(plan.amount, plan.currency)}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {feature}</li>)}
                </ul>
                <Button className="mt-6 w-full" variant={plan.id === featured ? 'primary' : 'outline'} disabled={user?.role === 'SUPER_ADMIN'} loading={checkout.isPending && checkout.variables === plan.id} onClick={() => checkout.mutate(plan.id)} icon={<CreditCard className="h-4 w-4" />}>Choose {plan.name}</Button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>

      {user?.role !== 'SUPER_ADMIN' && (
        <>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Payment history</h2>
          <QueryState isLoading={history.isLoading} error={history.error} onRetry={history.refetch} isEmpty={history.data?.length === 0} emptyTitle="No payments yet" emptyDescription="Your confirmed and pending payments will be listed here.">
            {history.data && (
              <DataTable rows={history.data} rowKey={(row) => row.id} columns={[
                { header: 'Plan', cell: (row) => <span className="font-semibold text-slate-900">{row.plan?.name ?? row.purpose}</span> },
                { header: 'Amount', cell: (row) => formatMoney(row.amount, row.currency) },
                { header: 'Provider', cell: (row) => <span className="capitalize">{row.provider}</span> },
                { header: 'Date', cell: (row) => formatDate(row.createdAt, true) },
                { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
              ]} />
            )}
          </QueryState>
        </>
      )}
    </>
  );
}
