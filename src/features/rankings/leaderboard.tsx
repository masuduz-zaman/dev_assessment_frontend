'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';
import { useState } from 'react';
import { QueryState } from '@/components/common/query-state';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { publicApi } from '@/features/public/api';
import type { RankingRow } from '@/features/public/types';
import { cn, formatPercent } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

const podiumStyle = ['from-amber-400 to-yellow-500', 'from-slate-300 to-slate-400', 'from-orange-400 to-amber-600'];

function Podium({ rows }: { rows: RankingRow[] }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <div className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-6">
      {order.map((row) => {
        const index = row.rank - 1;
        return (
          <motion.div key={row.candidateId} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * row.rank, type: 'spring', damping: 18 }} className={cn('flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-soft', row.rank === 1 && 'pb-10 pt-8 shadow-glow')}>
            <div className="relative">
              <Avatar name={row.name} src={row.avatarUrl} size="lg" />
              <span className={cn('absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-white shadow', podiumStyle[index])}>
                {row.rank === 1 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              </span>
            </div>
            <p className="mt-4 max-w-full truncate text-sm font-semibold text-slate-900 sm:text-base">{row.name}</p>
            <p className="gradient-text text-2xl font-extrabold">{formatPercent(row.percentage)}</p>
            <p className="text-xs text-slate-500">{row.passedCount} passed</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState<'public' | 'company'>('public');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['rankings', scope], queryFn: () => publicApi.rankings(scope) });

  return (
    <>
      {user?.role === 'COMPANY' && (
        <div className="mb-6">
          <Tabs value={scope} onChange={setScope} tabs={[{ value: 'public', label: 'Public leaderboard' }, { value: 'company', label: 'My company' }]} />
        </div>
      )}
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No rankings yet" emptyDescription="Rankings appear when candidates complete assessments.">
        {data && (
          <>
            {data.length >= 3 && <Podium rows={data.slice(0, 3)} />}
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Passed</th><th className="px-5 py-3">Completed</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((row, index) => (
                      <motion.tr key={row.candidateId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.04, 0.6) }} className={cn('transition hover:bg-brand-50/40', row.candidateId === user?.id && 'bg-brand-50/70')}>
                        <td className="px-5 py-3.5 font-bold text-slate-700">#{row.rank}</td>
                        <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={row.name} src={row.avatarUrl} size="sm" /><div><p className="font-semibold text-slate-900">{row.name}</p><p className="text-xs text-slate-500">{row.headline ?? 'Developer'}</p></div></div></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3"><span className="w-14 font-semibold">{formatPercent(row.percentage)}</span><div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:block"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(row.percentage, 100)}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" /></div></div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{row.passedCount}</td>
                        <td className="px-5 py-3.5 text-slate-600">{row.completedAttempts}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </QueryState>
    </>
  );
}
