'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatusBadge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { paymentsApi } from '@/features/payments/api';
import { formatDate, formatMoney } from '@/lib/utils';

export function AdminPayments() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-payments'], queryFn: paymentsApi.adminAll });
  return (
    <>
      <PageHeader title="Payments" description="Gateway-confirmed and pending payments from every user." />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No payments yet">
        {data && (
          <DataTable rows={data} rowKey={(r) => r.id} columns={[
            { header: 'Payer', cell: (r) => <div><p className="font-semibold text-slate-900">{r.user.name}</p><p className="text-xs text-slate-500">{r.user.email}</p></div> },
            { header: 'Plan', cell: (r) => r.plan?.name ?? r.purpose },
            { header: 'Amount', cell: (r) => <span className="font-semibold">{formatMoney(r.amount, r.currency)}</span> },
            { header: 'Provider', cell: (r) => <span className="capitalize">{r.provider}</span> },
            { header: 'Date', cell: (r) => formatDate(r.createdAt, true) },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]} />
        )}
      </QueryState>
    </>
  );
}
