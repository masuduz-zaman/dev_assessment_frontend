'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatusBadge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { assessmentsApi } from '@/features/assessments/api';
import { formatDate } from '@/lib/utils';

export function MyResults() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['my-results'], queryFn: assessmentsApi.myResults });

  return (
    <>
      <PageHeader title="My results" description="Verified scores and manual review status for every attempt." />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No results yet" emptyDescription="Complete an assessment to see your score here." emptyAction={<ButtonLink href="/assessments">Find an assessment</ButtonLink>}>
        {data && (
          <DataTable
            rows={data}
            rowKey={(row) => row.id}
            columns={[
              { header: 'Assessment', cell: (row) => <div><p className="font-semibold text-slate-900">{row.assessment.title}</p><p className="text-xs text-slate-500">{row.assessment.company?.name ?? 'Platform'}</p></div> },
              { header: 'Score', cell: (row) => <div className="flex items-center gap-3"><span className="w-20 font-semibold">{row.obtainedMarks}/{row.totalMarks}</span><div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:block"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(row.percentage, 100)}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" /></div><span className="text-xs text-slate-500">{Math.round(row.percentage)}%</span></div> },
              { header: 'Result', cell: (row) => <StatusBadge status={row.status} /> },
              { header: 'Submitted', cell: (row) => formatDate(row.attempt.submittedAt, true) },
            ]}
          />
        )}
      </QueryState>
    </>
  );
}
