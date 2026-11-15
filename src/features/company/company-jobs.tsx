'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/form';
import { jobsApi } from '@/features/jobs/api';
import { getErrorMessage } from '@/lib/http';
import { formatDate } from '@/lib/utils';

export function CompanyJobs() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['company-jobs'], queryFn: jobsApi.companyJobs });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['company-jobs'] });

  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'OPEN' | 'CLOSED' }) => jobsApi.update(id, { status }), onSuccess: () => { toast.success('Job updated'); refresh(); }, onError: (e) => toast.error(getErrorMessage(e)) });
  const remove = useMutation({ mutationFn: jobsApi.remove, onSuccess: () => { toast.success('Job deleted'); refresh(); }, onError: (e) => toast.error(getErrorMessage(e)) });

  return (
    <>
      <PageHeader title="Job openings" description="Publish roles and manage their status." actions={<ButtonLink href="/company/jobs/new">Post a job</ButtonLink>} />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No jobs posted" emptyDescription="Post your first opening to start receiving applications." emptyAction={<ButtonLink href="/company/jobs/new">Post a job</ButtonLink>}>
        {data && (
          <DataTable rows={data} rowKey={(r) => r.id} columns={[
            { header: 'Title', cell: (r) => <div><p className="font-semibold text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.location || 'No location'} · {r.employmentType || 'Type not set'}</p></div> },
            { header: 'Applications', cell: (r) => r._count?.applications ?? 0 },
            { header: 'Posted', cell: (r) => formatDate(r.createdAt) },
            { header: 'Status', cell: (r) => <div className="flex items-center gap-2"><StatusBadge status={r.status} /><Select aria-label="Change status" className="w-28" value={r.status} onChange={(e) => update.mutate({ id: r.id, status: e.target.value as 'DRAFT' | 'OPEN' | 'CLOSED' })}><option value="OPEN">Open</option><option value="DRAFT">Draft</option><option value="CLOSED">Closed</option></Select></div> },
            { header: '', cell: (r) => <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" icon={<Trash2 className="h-4 w-4" />} onClick={() => { if (window.confirm(`Delete "${r.title}"? Its applications will be removed too.`)) remove.mutate(r.id); }}>Delete</Button> },
          ]} />
        )}
      </QueryState>
    </>
  );
}
