'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { notificationsApi } from '@/features/notifications/api';
import { useAuth } from '@/providers/auth-provider';

export function NotificationBell() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list, enabled: Boolean(user), refetchInterval: 60_000 });
  const unread = data?.unread ?? 0;

  return (
    <Link href="/notifications" aria-label="Notifications" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-rose-400" />
          <span className="relative">{unread > 9 ? '9+' : unread}</span>
        </span>
      )}
    </Link>
  );
}
