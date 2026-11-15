'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { formatDate } from '@/lib/utils';
import { adminApi } from './api';

export function AdminAssessments() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-assessments'], queryFn: adminApi.assessments });
  return (
    <>
      <PageHeader title="All assessments" description="Every assessment created across the platform." />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No assessments yet">
        {data && (
          <DataTable rows={data} rowKey={(r) => r.id} columns={[
            { header: 'Title', cell: (r) => <div><p className="font-semibold text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.company?.name ?? 'Platform'}</p></div> },
            { header: 'Visibility', cell: (r) => <Badge>{r.visibility === 'PUBLIC' ? 'Public' : 'Private'}</Badge> },
            { header: 'Questions', cell: (r) => r._count.questions },
            { header: 'Attempts', cell: (r) => r._count.attempts },
            { header: 'Created', cell: (r) => formatDate(r.createdAt) },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]} />
        )}
      </QueryState>
    </>
  );
}
