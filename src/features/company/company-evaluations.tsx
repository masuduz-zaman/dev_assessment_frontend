'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input, Textarea } from '@/components/ui/form';
import { Tabs } from '@/components/ui/tabs';
import { assessmentsApi } from '@/features/assessments/api';
import type { PendingSubmission } from '@/features/assessments/types';
import { getErrorMessage } from '@/lib/http';
import { formatDate, humanize } from '@/lib/utils';

function EvaluationCard({ submission }: { submission: PendingSubmission }) {
  const queryClient = useQueryClient();
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const grade = useMutation({
    mutationFn: () => assessmentsApi.evaluate(submission.id, { marksAwarded: Number(marks), feedback: feedback || undefined }),
    onSuccess: () => {
      toast.success('Evaluation saved');
      queryClient.invalidateQueries({ queryKey: ['pending-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['company-results'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="font-semibold text-slate-900">{submission.attempt.candidate.name}</p><p className="text-xs text-slate-500">{submission.attempt.assessment.title} · submitted {formatDate(submission.attempt.submittedAt, true)}</p></div>
        <Badge tone="brand">{humanize(submission.question.type)} · {submission.question.marks} marks</Badge>
      </div>
      <p className="rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">{submission.question.prompt}</p>
      {submission.question.type === 'CODING' ? (
        <pre className="scroll-thin max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-300">{submission.code || '(no code submitted)'}</pre>
      ) : (
        <p className="whitespace-pre-line rounded-xl border border-slate-200 p-3 text-sm text-slate-700">{submission.answerText || '(no answer submitted)'}</p>
      )}
      {submission.executionResult?.error && <p className="text-xs text-amber-600">{submission.executionResult.error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); grade.mutate(); }} className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
        <Input label={`Marks (max ${submission.question.marks})`} type="number" min={0} max={submission.question.marks} step="0.5" required value={marks} onChange={(e) => setMarks(e.target.value)} />
        <Textarea label="Feedback (optional)" rows={1} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <Button type="submit" loading={grade.isPending} icon={<CheckCircle2 className="h-4 w-4" />}>Save grade</Button>
      </form>
    </Card>
  );
}

export function CompanyEvaluations() {
  const [tab, setTab] = useState<'pending' | 'results'>('pending');
  const pending = useQuery({ queryKey: ['pending-evaluations'], queryFn: assessmentsApi.pendingEvaluations });
  const results = useQuery({ queryKey: ['company-results'], queryFn: assessmentsApi.companyResults });

  return (
    <>
      <PageHeader title="Evaluations" description="Grade written and coding answers and review candidate results." />
      <div className="mb-6"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'pending', label: 'To review', count: pending.data?.length }, { value: 'results', label: 'All results', count: results.data?.length }]} /></div>

      {tab === 'pending' ? (
        <QueryState isLoading={pending.isLoading} error={pending.error} onRetry={pending.refetch} isEmpty={pending.data?.length === 0} emptyTitle="Nothing to review" emptyDescription="Written answers appear here after candidates submit.">
          <div className="space-y-4">{pending.data?.map((s) => <EvaluationCard key={s.id} submission={s} />)}</div>
        </QueryState>
      ) : (
        <QueryState isLoading={results.isLoading} error={results.error} onRetry={results.refetch} isEmpty={results.data?.length === 0} emptyTitle="No results yet">
          {results.data && (
            <DataTable rows={results.data} rowKey={(r) => r.id} columns={[
              { header: 'Candidate', cell: (r) => <div><p className="font-semibold text-slate-900">{r.candidate.name}</p><p className="text-xs text-slate-500">{r.candidate.email}</p></div> },
              { header: 'Assessment', cell: (r) => r.assessment.title },
              { header: 'Score', cell: (r) => `${r.obtainedMarks}/${r.totalMarks} (${Math.round(r.percentage)}%)` },
              { header: 'Result', cell: (r) => <StatusBadge status={r.status} /> },
              { header: 'Submitted', cell: (r) => formatDate(r.attempt.submittedAt, true) },
            ]} />
          )}
        </QueryState>
      )}
    </>
  );
}
