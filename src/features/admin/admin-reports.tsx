'use client';

import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { FadeIn } from '@/components/motion/fade-in';
import { Card, CardHeader } from '@/components/ui/card';
import { humanize } from '@/lib/utils';
import { adminApi } from './api';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b'];

function Donut({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const rows = data.map((d) => ({ name: humanize(d.label), value: d.value }));
  const empty = rows.every((r) => r.value === 0);
  return (
    <Card>
      <CardHeader title={title} />
      {empty ? <p className="py-16 text-center text-sm text-slate-400">No data yet</p> : (
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} animationDuration={900}>{rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">{rows.map((r, i) => <span key={r.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{r.name} ({r.value})</span>)}</div>
    </Card>
  );
}

export function AdminReports() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-reports'], queryFn: adminApi.reports });

  return (
    <>
      <PageHeader title="Reports" description="Growth, hiring activity and revenue over the last six months." />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FadeIn>
                <Card>
                  <CardHeader title="New users per month" />
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart data={data.signupsByMonth}>
                        <defs><linearGradient id="signups" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fill="url(#signups)" animationDuration={1000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader title={`Revenue per month${data.revenueCurrency ? ` (${data.revenueCurrency})` : ''}`} />
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={data.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeIn>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <FadeIn><Donut title="Users by role" data={data.usersByRole} /></FadeIn>
              <FadeIn delay={0.05}><Donut title="Companies by status" data={data.companiesByStatus} /></FadeIn>
              <FadeIn delay={0.1}><Donut title="Assessments by status" data={data.assessmentsByStatus} /></FadeIn>
              <FadeIn><Donut title="Applications by status" data={data.applicationsByStatus} /></FadeIn>
              <FadeIn delay={0.05}><Donut title="Payments by status" data={data.paymentsByStatus} /></FadeIn>
            </div>
          </div>
        )}
      </QueryState>
    </>
  );
}
