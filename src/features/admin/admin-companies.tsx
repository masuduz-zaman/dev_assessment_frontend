'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pause, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { getErrorMessage } from '@/lib/http';
import { formatDate } from '@/lib/utils';
import { adminApi, type AdminCompany } from './api';

type Filter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

export function AdminCompanies() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [rejecting, setRejecting] = useState<AdminCompany | null>(null);
  const [reason, setReason] = useState('');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-companies', filter], queryFn: () => adminApi.companies(filter === 'ALL' ? undefined : { status: filter }) });

  const setStatus = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'APPROVED' | 'REJECTED' | 'SUSPENDED'; note?: string }) => adminApi.setCompanyStatus(id, status, note),
    onSuccess: (_d, v) => {
      toast.success(`Company ${v.status.toLowerCase()}`);
      setRejecting(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <PageHeader title="Company approvals" description="Review registrations. Companies can only sign in after approval." />
      <div className="mb-6"><Tabs value={filter} onChange={setFilter} tabs={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }, { value: 'ALL', label: 'All' }]} /></div>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No companies in this view">
        <Stagger key={filter} className="space-y-3">
          {data?.map((company) => (
            <StaggerItem key={company.id}>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-4"><Avatar name={company.name} size="lg" /><div><p className="text-lg font-semibold text-slate-900">{company.name}</p><p className="text-sm text-slate-500">{company.owner.name} · {company.owner.email}</p><p className="mt-1 text-xs text-slate-400">Registered {formatDate(company.createdAt)} · {company._count.assessments} assessments · {company._count.jobs} jobs</p>{company.rejectionReason && <p className="mt-1 text-xs text-rose-600">Reason: {company.rejectionReason}</p>}</div></div>
                <div className="flex items-center gap-2"><StatusBadge status={company.status} />
                  {company.status !== 'APPROVED' && <Button size="sm" variant="success" icon={<Check className="h-4 w-4" />} loading={setStatus.isPending && setStatus.variables?.id === company.id} onClick={() => setStatus.mutate({ id: company.id, status: 'APPROVED' })}>Approve</Button>}
                  {company.status === 'PENDING' && <Button size="sm" variant="danger" icon={<X className="h-4 w-4" />} onClick={() => setRejecting(company)}>Reject</Button>}
                  {company.status === 'APPROVED' && <Button size="sm" variant="outline" icon={<Pause className="h-4 w-4" />} onClick={() => setStatus.mutate({ id: company.id, status: 'SUSPENDED' })}>Suspend</Button>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Reject company" description={rejecting?.name} footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" loading={setStatus.isPending} onClick={() => rejecting && setStatus.mutate({ id: rejecting.id, status: 'REJECTED', note: reason || undefined })}>Reject company</Button></>}>
        <Textarea label="Reason (shared with the owner)" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </>
  );
}
