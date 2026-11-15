'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Briefcase, ClipboardCheck, Gift, Percent, Trophy } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatCard } from '@/components/common/stat-card';
import { FadeIn } from '@/components/motion/fade-in';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { dashboardApi } from '@/features/dashboard/api';
import { useAuth } from '@/providers/auth-provider';

export function CandidateOverview() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'candidate'], queryFn: dashboardApi.candidate });

  return (
    <>
      <PageHeader title={`Hello, ${user?.name.split(' ')[0] ?? 'there'} 👋`} description="Here is how your assessments and applications are going." actions={<ButtonLink href="/assessments">Browse assessments</ButtonLink>} />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="space-y-8">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StaggerItem><StatCard label="Attempts" value={data.stats.attempts} icon={<ClipboardCheck className="h-5 w-5" />} /></StaggerItem>
              <StaggerItem><StatCard label="Assessments passed" value={data.stats.passed} icon={<Award className="h-5 w-5" />} accent="emerald" /></StaggerItem>
              <StaggerItem><StatCard label="Average score" value={data.stats.averageScore} suffix="%" decimals={1} icon={<Percent className="h-5 w-5" />} accent="sky" /></StaggerItem>
              <StaggerItem><StatCard label="Applications" value={data.stats.applications} icon={<Briefcase className="h-5 w-5" />} accent="amber" /></StaggerItem>
              <StaggerItem><StatCard label="Pending offers" value={data.stats.pendingOffers} icon={<Gift className="h-5 w-5" />} accent="rose" /></StaggerItem>
              <StaggerItem>
                <StatCard label="Public rank" value={data.ranking?.position ?? 0} icon={<Trophy className="h-5 w-5" />} accent="amber" hint={data.ranking ? `${Math.round(data.ranking.percentage)}% overall` : 'Complete a public assessment to get ranked'} />
              </StaggerItem>
            </Stagger>

            <FadeIn>
              <Card>
                <CardHeader title="Recent results" action={<Link href="/candidate/results" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>} />
                {data.recentResults.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No results yet. Take your first assessment!</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data.recentResults.map((result) => (
                      <li key={result.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="font-medium text-slate-800">{result.title}</span>
                        <span className="flex items-center gap-3"><span className="text-sm font-semibold text-slate-700">{Math.round(result.percentage)}%</span><StatusBadge status={result.status} /></span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </FadeIn>
          </div>
        )}
      </QueryState>
    </>
  );
}
