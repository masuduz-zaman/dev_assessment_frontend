'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Play, Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { assessmentsApi } from '@/features/assessments/api';
import { publicApi } from '@/features/public/api';
import { AssessmentCard } from '@/features/public/components/assessment-card';
import { getErrorMessage } from '@/lib/http';

export function MyAssessments() {
  const [tab, setTab] = useState<'invitations' | 'public'>('invitations');
  const queryClient = useQueryClient();
  const invitations = useQuery({ queryKey: ['my-invitations'], queryFn: assessmentsApi.myInvitations });
  const library = useQuery({ queryKey: ['public-assessments', ''], queryFn: () => publicApi.assessments() });

  const accept = useMutation({
    mutationFn: (id: string) => assessmentsApi.acceptInvitation(id),
    onSuccess: () => {
      toast.success('Invitation accepted. You can start whenever you are ready.');
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <PageHeader title="My assessments" description="Accept private company invitations or practise with public assessments." />
      <div className="mb-6"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'invitations', label: 'Invitations', count: invitations.data?.length }, { value: 'public', label: 'Public library', count: library.data?.length }]} /></div>

      {tab === 'invitations' ? (
        <QueryState isLoading={invitations.isLoading} error={invitations.error} onRetry={invitations.refetch} isEmpty={invitations.data?.length === 0} emptyTitle="No invitations yet" emptyDescription="When a company invites you to a private assessment it will appear here.">
          <Stagger className="grid gap-4 md:grid-cols-2">
            {invitations.data?.map((invitation) => (
              <StaggerItem key={invitation.id}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
                  <div className="mb-2 flex items-center justify-between"><Badge tone="brand">{invitation.assessment.company?.name ?? 'Company'}</Badge><Badge tone={invitation.acceptedAt ? 'success' : 'warning'}>{invitation.acceptedAt ? 'Accepted' : 'Awaiting you'}</Badge></div>
                  <h3 className="text-lg font-semibold text-slate-900">{invitation.assessment.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{invitation.assessment.description}</p>
                  <div className="mt-3 flex gap-4 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {invitation.assessment.durationMinutes} min</span><span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> {invitation.assessment.totalMarks} marks</span></div>
                  <div className="mt-5">
                    {invitation.acceptedAt ? <ButtonLink href={`/exam/${invitation.assessment.id}`} icon={<Play className="h-4 w-4" />}>Start assessment</ButtonLink> : <Button loading={accept.isPending && accept.variables === invitation.id} onClick={() => accept.mutate(invitation.id)}>Accept invitation</Button>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </QueryState>
      ) : (
        <QueryState isLoading={library.isLoading} error={library.error} onRetry={library.refetch} isEmpty={library.data?.length === 0} skeleton="cards" emptyTitle="No public assessments yet">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {library.data?.map((assessment) => <StaggerItem key={assessment.id}><AssessmentCard assessment={assessment} /></StaggerItem>)}
          </Stagger>
        </QueryState>
      )}
    </>
  );
}
