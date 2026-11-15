'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { jobsApi } from '@/features/jobs/api';
import { getErrorMessage } from '@/lib/http';
import { formatDate } from '@/lib/utils';

export function MyApplications() {
  const queryClient = useQueryClient();
  const applications = useQuery({ queryKey: ['my-applications'], queryFn: jobsApi.myApplications });
  const offers = useQuery({ queryKey: ['my-offers'], queryFn: jobsApi.myOffers });

  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => jobsApi.respondOffer(id, status),
    onSuccess: (_data, { status }) => {
      toast.success(status === 'ACCEPTED' ? 'Offer accepted. Congratulations!' : 'Offer declined');
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <PageHeader title="Applications & offers" description="Track every job you applied to and respond to employment offers." actions={<ButtonLink href="/jobs">Find jobs</ButtonLink>} />
      <div className="space-y-8">
        <Card>
          <CardHeader title="Employment offers" />
          <QueryState isLoading={offers.isLoading} error={offers.error} onRetry={offers.refetch} isEmpty={offers.data?.length === 0} emptyTitle="No offers yet" emptyDescription="Offers from companies will show up here.">
            <div className="space-y-3">
              {offers.data?.map((offer) => (
                <div key={offer.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold text-slate-900">{offer.jobTitle}</p><p className="text-sm text-slate-500">{offer.company?.name} · {formatDate(offer.createdAt)}</p></div><StatusBadge status={offer.status} /></div>
                  {offer.message && <p className="mt-2 text-sm text-slate-600">{offer.message}</p>}
                  {offer.status === 'SENT' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="success" icon={<Check className="h-4 w-4" />} loading={respond.isPending && respond.variables?.id === offer.id} onClick={() => respond.mutate({ id: offer.id, status: 'ACCEPTED' })}>Accept</Button>
                      <Button size="sm" variant="outline" icon={<X className="h-4 w-4" />} onClick={() => respond.mutate({ id: offer.id, status: 'REJECTED' })}>Decline</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </QueryState>
        </Card>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Applications</h2>
          <QueryState isLoading={applications.isLoading} error={applications.error} onRetry={applications.refetch} isEmpty={applications.data?.length === 0} emptyTitle="You have not applied yet" emptyAction={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}>
            {applications.data && (
              <DataTable rows={applications.data} rowKey={(row) => row.id} columns={[
                { header: 'Job', cell: (row) => <div><p className="font-semibold text-slate-900">{row.job.title}</p><p className="text-xs text-slate-500">{row.job.company.name}</p></div> },
                { header: 'Type', cell: (row) => row.job.employmentType ?? '-' },
                { header: 'Applied', cell: (row) => formatDate(row.createdAt) },
                { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
              ]} />
            )}
          </QueryState>
        </div>
      </div>
    </>
  );
}
