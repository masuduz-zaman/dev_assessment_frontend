'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarClock, CheckCircle2, Clock, Play, RotateCw, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { QueryState } from '@/components/common/query-state';
import { FadeIn } from '@/components/motion/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate, humanize } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { publicApi } from '../api';

export function AssessmentDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['public-assessment', id], queryFn: () => publicApi.assessment(id) });

  function start() {
    if (!user) {
      toast.info('Sign in as a candidate to take this assessment');
      return router.push(`/login?next=${encodeURIComponent(`/exam/${id}`)}`);
    }
    if (user.role !== 'CANDIDATE') return toast.error('Only candidate accounts can take assessments');
    router.push(`/exam/${id}`);
  }

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      {data && (
        <div className="mx-auto max-w-4xl">
          <FadeIn immediate>
            <Card className="relative overflow-hidden p-8">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 opacity-10 blur-2xl" />
              <Badge tone="brand"><Building2 className="mr-1 h-3 w-3" /> {data.company?.name ?? 'Platform'}</Badge>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{data.title}</h1>
              <p className="mt-3 whitespace-pre-line text-slate-600">{data.description || 'No description provided.'}</p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: Clock, label: 'Duration', value: `${data.durationMinutes} min` },
                  { icon: Target, label: 'Pass marks', value: `${data.passMarks} / ${data.totalMarks}` },
                  { icon: RotateCw, label: 'Attempts', value: String(data.maxAttempts) },
                  { icon: CheckCircle2, label: 'Questions', value: String(data.questionCount) },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                    <item.icon className="mb-2 h-5 w-5 text-brand-600" />
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {Object.keys(data.questionCounts).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {Object.entries(data.questionCounts).map(([type, count]) => <Badge key={type}>{count} × {humanize(type)}</Badge>)}
                </div>
              )}
              {(data.startsAt || data.endsAt) && (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CalendarClock className="h-4 w-4" /> Available {data.startsAt ? `from ${formatDate(data.startsAt, true)}` : ''} {data.endsAt ? `until ${formatDate(data.endsAt, true)}` : ''}</p>
              )}

              <Button size="lg" onClick={start} icon={<Play className="h-4 w-4" />} className="mt-8">Start assessment</Button>
            </Card>
          </FadeIn>
        </div>
      )}
    </QueryState>
  );
}
