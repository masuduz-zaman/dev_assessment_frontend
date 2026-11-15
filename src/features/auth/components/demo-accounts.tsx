'use client';

import { useQuery } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { roleIcon } from '@/config/navigation';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { authApi } from '../api';

/** Demo credentials come from the backend (seed configuration), never from frontend code. */
export function DemoAccounts({ onPick }: { onPick: (email: string, password: string) => void }) {
  const { data } = useQuery({ queryKey: ['demo-accounts'], queryFn: authApi.demoAccounts, staleTime: Infinity });
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-700">
        <KeyRound className="h-3.5 w-3.5" /> Demo accounts
      </p>
      <Stagger className="grid gap-2 sm:grid-cols-3">
        {data.map((account) => {
          const Icon = roleIcon[account.role];
          return (
            <StaggerItem key={account.email}>
              <button type="button" onClick={() => onPick(account.email, account.password)} className="group w-full rounded-xl border border-white bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                <Icon className="mb-1.5 h-4 w-4 text-brand-600 transition group-hover:scale-110" />
                <span className="block text-sm font-semibold text-slate-800">{account.label}</span>
                <span className="block truncate text-[11px] text-slate-500">{account.email}</span>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-2 text-[11px] text-slate-500">Click a card to fill the form, then press Sign in.</p>
    </div>
  );
}
