'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/common/search-input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { publicApi } from '@/features/public/api';
import { getErrorMessage } from '@/lib/http';
import { cn } from '@/lib/utils';
import { assessmentsApi } from '../api';

export function InviteModal({ assessment, onClose }: { assessment: { id: string; title: string } | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const candidates = useQuery({ queryKey: ['public-candidates', ''], queryFn: () => publicApi.candidates(), enabled: Boolean(assessment) });
  const sent = useQuery({ queryKey: ['sent-invitations', assessment?.id], queryFn: () => assessmentsApi.sentInvitations(assessment!.id), enabled: Boolean(assessment) });

  const invited = new Map(sent.data?.map((i) => [i.candidate.id, i.acceptedAt]));
  const visible = (candidates.data ?? []).filter((c) => `${c.user.name} ${c.headline ?? ''} ${c.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase()));

  const invite = useMutation({
    mutationFn: () => assessmentsApi.invite(assessment!.id, selected),
    onSuccess: () => {
      toast.success(`${selected.length} invitation${selected.length > 1 ? 's' : ''} sent`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ['sent-invitations', assessment?.id] });
      queryClient.invalidateQueries({ queryKey: ['company-assessments'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Modal open={Boolean(assessment)} onClose={onClose} size="lg" title="Invite candidates" description={assessment?.title} footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button disabled={selected.length === 0} loading={invite.isPending} onClick={() => invite.mutate()} icon={<Send className="h-4 w-4" />}>Send {selected.length || ''} invitation{selected.length === 1 ? '' : 's'}</Button></>}>
      <SearchInput value={search} onChange={setSearch} placeholder="Filter candidates…" className="mb-4" />
      <ul className="space-y-2">
        {visible.map((candidate) => {
          const id = candidate.user.id;
          const status = invited.has(id) ? (invited.get(id) ? 'Accepted' : 'Invited') : null;
          const on = selected.includes(id);
          return (
            <li key={id}>
              <button type="button" disabled={Boolean(status)} onClick={() => setSelected((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]))} className={cn('flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition', on ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300', status && 'opacity-60')}>
                <Avatar name={candidate.user.name} src={candidate.user.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{candidate.user.name}</span><span className="block truncate text-xs text-slate-500">{candidate.headline || candidate.skills.join(', ') || 'Developer'}</span></span>
                {status ? <Badge tone={status === 'Accepted' ? 'success' : 'info'}>{status}</Badge> : on && <Check className="h-5 w-5 text-brand-600" />}
              </button>
            </li>
          );
        })}
        {visible.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No candidates found.</p>}
      </ul>
    </Modal>
  );
}
