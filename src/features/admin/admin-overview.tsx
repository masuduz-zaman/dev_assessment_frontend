'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, ClipboardList, FileText, ShieldAlert, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatCard } from '@/components/common/stat-card';
import { FadeIn } from '@/components/motion/fade-in';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { dashboardApi } from '@/features/dashboard/api';
import { formatDate, formatMoney, humanize } from '@/lib/utils';

export function AdminOverview() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin });

  return (
    <>
      <PageHeader title="Platform overview" description="Everything happening across companies, candidates and payments." actions={data && data.stats.pendingCompanies > 0 ? <ButtonLink href="/admin/companies" icon={<ShieldAlert className="h-4 w-4" />}>{data.stats.pendingCompanies} awaiting approval</ButtonLink> : undefined} />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="space-y-8">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StaggerItem><StatCard label="Total users" value={data.stats.users} icon={<Users className="h-5 w-5" />} hint={`${data.stats.candidates} candidates`} /></StaggerItem>
              <StaggerItem><StatCard label="Companies" value={data.stats.companies} icon={<Building2 className="h-5 w-5" />} accent="sky" hint={`${data.stats.pendingCompanies} pending`} /></StaggerItem>
              <StaggerItem><StatCard label="Assessments" value={data.stats.assessments} icon={<ClipboardList className="h-5 w-5" />} accent="emerald" /></StaggerItem>
              <StaggerItem><StatCard label="Jobs" value={data.stats.jobs} icon={<Briefcase className="h-5 w-5" />} accent="amber" /></StaggerItem>
              <StaggerItem><StatCard label="Applications" value={data.stats.applications} icon={<FileText className="h-5 w-5" />} accent="rose" /></StaggerItem>
              <StaggerItem>
                {data.revenue.length === 0 ? <StatCard label="Revenue" value={0} icon={<Wallet className="h-5 w-5" />} accent="emerald" hint="No paid payments yet" /> : <StatCard label={`Revenue (${data.revenue[0].currency})`} value={data.revenue[0].amount / 100} decimals={2} icon={<Wallet className="h-5 w-5" />} accent="emerald" hint={`${data.revenue[0].payments} paid payments`} />}
              </StaggerItem>
            </Stagger>
            <FadeIn>
              <Card>
                <CardHeader title="Newest members" action={<Link href="/admin/users" className="text-sm font-semibold text-brand-600 hover:underline">Manage users</Link>} />
                <ul className="divide-y divide-slate-100">
                  {data.recentUsers.map((user) => (
                    <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span><span className="font-medium text-slate-800">{user.name}</span> <span className="text-sm text-slate-500">{user.email}</span></span><span className="flex items-center gap-3 text-xs text-slate-500">{formatDate(user.createdAt)}<Badge tone="brand">{humanize(user.role)}</Badge></span></li>
                  ))}
                </ul>
              </Card>
            </FadeIn>
            {data.revenue.length > 1 && <p className="text-xs text-slate-400">Other currencies: {data.revenue.slice(1).map((r) => formatMoney(r.amount, r.currency)).join(', ')}</p>}
          </div>
        )}
      </QueryState>
    </>
  );
}
