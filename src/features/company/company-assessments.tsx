'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Clock, Eye, Globe, HelpCircle, Lock, Pencil, Rocket, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { assessmentsApi } from '@/features/assessments/api';
import { InviteModal } from '@/features/assessments/components/invite-modal';
import type { AssessmentListItem } from '@/features/assessments/types';
import { getErrorMessage } from '@/lib/http';

export function CompanyAssessments() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['company-assessments'], queryFn: () => assessmentsApi.list({ scope: 'mine' }) });
  const [inviting, setInviting] = useState<AssessmentListItem | null>(null);
  const [deleting, setDeleting] = useState<AssessmentListItem | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['company-assessments'] });
  const run = (fn: (id: string) => Promise<unknown>, message: string) => ({ mutationFn: fn, onSuccess: () => { toast.success(message); refresh(); }, onError: (e: unknown) => toast.error(getErrorMessage(e)) });

  const publish = useMutation(run(assessmentsApi.publish, 'Assessment published'));
  const archive = useMutation(run(assessmentsApi.archive, 'Assessment archived'));
  const remove = useMutation({ ...run(assessmentsApi.remove, 'Assessment deleted'), onSuccess: () => { toast.success('Assessment deleted'); setDeleting(null); refresh(); } });

  return (
    <>
      <PageHeader title="Assessments" description="Build, publish and share assessments with candidates." actions={<ButtonLink href="/company/assessments/new">Create assessment</ButtonLink>} />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} skeleton="cards" emptyTitle="No assessments yet" emptyDescription="Create your first assessment to start evaluating candidates." emptyAction={<ButtonLink href="/company/assessments/new">Create assessment</ButtonLink>}>
        <Stagger className="grid gap-5 md:grid-cols-2">
          {data?.map((a) => (
            <StaggerItem key={a.id}>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:shadow-xl">
                <div className="mb-3 flex items-center justify-between"><div className="flex gap-2"><StatusBadge status={a.status} /><Badge>{a.visibility === 'PUBLIC' ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}{a.visibility === 'PUBLIC' ? 'Public' : 'Private'}</Badge></div></div>
                <h3 className="text-lg font-semibold text-slate-900">{a.title}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{a.description || 'No description'}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {a.durationMinutes} min</span>
                  <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> {a._count.questions} questions</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {a._count.attempts} attempts</span>
                  <span className="flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" /> {a._count.invitations} invited</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {a.status === 'DRAFT' && <Button size="sm" icon={<Rocket className="h-4 w-4" />} loading={publish.isPending && publish.variables === a.id} onClick={() => publish.mutate(a.id)}>Publish</Button>}
                  {a.status === 'PUBLISHED' && <Button size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={() => setInviting(a)}>Invite</Button>}
                  {a.visibility === 'PUBLIC' && a.status === 'PUBLISHED' && <ButtonLink size="sm" variant="outline" href={`/assessments/${a.id}`} icon={<Eye className="h-4 w-4" />}>View</ButtonLink>}
                  {a._count.attempts === 0 && <ButtonLink size="sm" variant="outline" href={`/company/assessments/${a.id}/edit`} icon={<Pencil className="h-4 w-4" />}>Edit</ButtonLink>}
                  {a.status === 'PUBLISHED' && <Button size="sm" variant="ghost" icon={<Archive className="h-4 w-4" />} onClick={() => archive.mutate(a.id)}>Archive</Button>}
                  {a._count.attempts === 0 && <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleting(a)}>Delete</Button>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>

      <InviteModal assessment={inviting} onClose={() => setInviting(null)} />
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete assessment?" description={deleting?.title} footer={<><Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>Delete</Button></>}>
        <p className="text-sm text-slate-600">This permanently removes the assessment and all of its questions. This cannot be undone.</p>
      </Modal>
    </>
  );
}
