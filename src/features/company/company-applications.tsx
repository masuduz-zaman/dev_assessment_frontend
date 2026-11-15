'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Gift } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Select, Textarea } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { jobsApi } from '@/features/jobs/api';
import type { ApplicationStatus, CompanyApplication } from '@/features/jobs/types';
import { getErrorMessage } from '@/lib/http';
import { formatDate, humanize } from '@/lib/utils';

const statuses: Array<Exclude<ApplicationStatus, 'APPLIED'>> = ['REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];

export function CompanyApplications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [offerFor, setOfferFor] = useState<CompanyApplication | null>(null);
  const [message, setMessage] = useState('');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['company-applications', filter], queryFn: () => jobsApi.companyApplications(filter ? { status: filter } : undefined) });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Exclude<ApplicationStatus, 'APPLIED'> }) => jobsApi.updateApplicationStatus(id, status),
    onSuccess: () => { toast.success('Status updated and candidate notified'); queryClient.invalidateQueries({ queryKey: ['company-applications'] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const sendOffer = useMutation({
    mutationFn: () => jobsApi.sendOffer({ candidateId: offerFor!.candidate.id, jobTitle: offerFor!.job.title, message: message || undefined }),
    onSuccess: () => { toast.success('Offer sent'); setOfferFor(null); setMessage(''); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <PageHeader title="Applications" description="Review candidates, move them through your pipeline and send offers." actions={
        <Select aria-label="Filter by status" className="w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {['APPLIED', ...statuses].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </Select>
      } />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No applications found" emptyDescription="Applications appear here when candidates apply to your jobs.">
        {data && (
          <DataTable rows={data} rowKey={(r) => r.id} columns={[
            { header: 'Candidate', cell: (r) => (
              <div className="flex items-center gap-3"><Avatar name={r.candidate.name} size="sm" /><div className="min-w-0"><p className="font-semibold text-slate-900">{r.candidate.name}</p><p className="truncate text-xs text-slate-500">{r.candidate.candidate?.headline || r.candidate.email}</p></div></div>
            ) },
            { header: 'Job', cell: (r) => r.job.title },
            { header: 'Skills', cell: (r) => <div className="flex max-w-48 flex-wrap gap-1">{(r.candidate.candidate?.skills ?? []).slice(0, 3).map((s) => <Badge key={s} tone="brand">{s}</Badge>)}</div> },
            { header: 'CV', cell: (r) => r.cvUrl ? <a href={r.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">Open <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-slate-400">-</span> },
            { header: 'Applied', cell: (r) => formatDate(r.createdAt) },
            { header: 'Status', cell: (r) => (
              <Select aria-label="Application status" className="w-36" value={r.status} onChange={(e) => setStatus.mutate({ id: r.id, status: e.target.value as Exclude<ApplicationStatus, 'APPLIED'> })}>
                {r.status === 'APPLIED' && <option value="APPLIED" disabled>Applied</option>}
                {statuses.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
              </Select>
            ) },
            { header: '', cell: (r) => <Button size="sm" variant="outline" icon={<Gift className="h-4 w-4" />} onClick={() => setOfferFor(r)}>Offer</Button> },
          ]} />
        )}
      </QueryState>

      <Modal open={Boolean(offerFor)} onClose={() => setOfferFor(null)} title="Send employment offer" description={offerFor ? `${offerFor.candidate.name} · ${offerFor.job.title}` : undefined} footer={<><Button variant="ghost" onClick={() => setOfferFor(null)}>Cancel</Button><Button loading={sendOffer.isPending} onClick={() => sendOffer.mutate()} icon={<Gift className="h-4 w-4" />}>Send offer</Button></>}>
        <Textarea label="Message to the candidate" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share compensation, start date and next steps…" />
      </Modal>
    </>
  );
}
