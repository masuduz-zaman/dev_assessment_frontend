'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, ClipboardCheck, ClipboardList, FileText, Hourglass, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { StatCard } from '@/components/common/stat-card';
import { FadeIn } from '@/components/motion/fade-in';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { StatusBadge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { dashboardApi } from '@/features/dashboard/api';
import { formatDate } from '@/lib/utils';

export function CompanyOverview() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard', 'company'], queryFn: dashboardApi.company });

  return (
    <>
      <PageHeader title="Company dashboard" description="Your assessments, hiring pipeline and team at a glance." actions={<><ButtonLink href="/company/assessments/new">New assessment</ButtonLink><ButtonLink href="/company/jobs/new" variant="outline">Post a job</ButtonLink></>} />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="space-y-8">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StaggerItem><StatCard label="Assessments" value={data.stats.assessments} hint={`${data.stats.publishedAssessments} published`} icon={<ClipboardList className="h-5 w-5" />} /></StaggerItem>
              <StaggerItem><StatCard label="Pending evaluations" value={data.stats.pendingEvaluations} icon={<Hourglass className="h-5 w-5" />} accent="amber" /></StaggerItem>
              <StaggerItem><StatCard label="Job openings" value={data.stats.jobs} hint={`${data.stats.openJobs} open`} icon={<Briefcase className="h-5 w-5" />} accent="sky" /></StaggerItem>
              <StaggerItem><StatCard label="Applications" value={data.stats.applications} icon={<FileText className="h-5 w-5" />} accent="emerald" /></StaggerItem>
              <StaggerItem><StatCard label="Team members" value={data.stats.employees} icon={<Users className="h-5 w-5" />} accent="rose" /></StaggerItem>
              <StaggerItem><StatCard label="Published" value={data.stats.publishedAssessments} icon={<ClipboardCheck className="h-5 w-5" />} accent="emerald" /></StaggerItem>
            </Stagger>
            <FadeIn>
              <Card>
                <CardHeader title="Latest applications" action={<Link href="/company/applications" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>} />
                {data.recentApplications.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No applications yet.</p> : (
                  <ul className="divide-y divide-slate-100">
                    {data.recentApplications.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span><span className="font-medium text-slate-800">{a.candidate.name}</span><span className="text-slate-500"> applied for {a.job.title}</span></span><span className="flex items-center gap-3 text-xs text-slate-500">{formatDate(a.createdAt)}<StatusBadge status={a.status} /></span></li>
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
