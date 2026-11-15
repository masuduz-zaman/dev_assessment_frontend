'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { notificationsApi } from './api';

export function NotificationsList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: refresh });
  const markAll = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: refresh });

  return (
    <>
      <PageHeader
        title="Notifications"
        description={data ? `${data.unread} unread` : 'Updates about invitations, results, applications and payments.'}
        actions={data && data.unread > 0 ? <Button variant="outline" loading={markAll.isPending} onClick={() => markAll.mutate()} icon={<CheckCheck className="h-4 w-4" />}>Mark all as read</Button> : undefined}
      />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.items.length === 0} emptyTitle="You are all caught up" emptyDescription="New updates will appear here.">
        <ul className="space-y-3">
          {data?.items.map((item) => (
            <li key={item.id}>
              <button onClick={() => !item.readAt && markRead.mutate(item.id)} className={cn('flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition hover:shadow-md', item.readAt ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/60')}>
                <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', item.readAt ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-brand-500 to-violet-500 text-white')}><BellRing className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="font-semibold text-slate-900">{item.title}</span><span className="shrink-0 text-xs text-slate-400">{formatDate(item.createdAt, true)}</span></span>
                  <span className="mt-0.5 block text-sm text-slate-600">{item.message}</span>
                </span>
                {!item.readAt && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
              </button>
            </li>
          ))}
        </ul>
      </QueryState>
    </>
  );
}
