'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Play, Send, Terminal, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { QueryState } from '@/components/common/query-state';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, Textarea } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { useMeta } from '@/hooks/use-meta';
import { getErrorMessage } from '@/lib/http';
import { cn, humanize } from '@/lib/utils';
import { assessmentsApi } from '../api';
import type { AnswerPayload, Attempt, ExamQuestion, SubmitOutcome } from '../types';

type Answers = Record<string, AnswerPayload>;

const formatClock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export function ExamRunner({ id }: { id: string }) {
  const meta = useMeta();
  const { data: assessment, isLoading, error, refetch } = useQuery({ queryKey: ['exam', id], queryFn: () => assessmentsApi.get(id) });

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [output, setOutput] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);
  const submitted = useRef(false);

  const questions = assessment?.questions ?? [];
  const question = questions[current];

  const answerFor = useCallback(
    (q: ExamQuestion): AnswerPayload =>
      answers[q.id] ?? { questionId: q.id, selectedOptionIds: [], answerText: '', code: q.codingConfig?.starterCode ?? '', languageId: q.codingConfig?.languageIds[0] },
    [answers],
  );
  const patch = (q: ExamQuestion, value: Partial<AnswerPayload>) => setAnswers((prev) => ({ ...prev, [q.id]: { ...answerFor(q), ...value } }));

  const isAnswered = (q: ExamQuestion) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === 'MCQ') return a.selectedOptionIds.length > 0;
    if (q.type === 'WRITTEN') return Boolean(a.answerText?.trim());
    return Boolean(a.code?.trim()) && a.code !== (q.codingConfig?.starterCode ?? '');
  };
  const answeredCount = questions.filter(isAnswered).length;

  const start = useMutation({
    mutationFn: () => assessmentsApi.startAttempt(id),
    onSuccess: (data) => setAttempt(data),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const submit = useMutation({
    mutationFn: () => assessmentsApi.submitAttempt(attempt!.id, questions.map((q) => answerFor(q))),
    onSuccess: (data) => {
      setOutcome(data);
      setConfirmOpen(false);
    },
    onError: (e) => {
      submitted.current = false;
      toast.error(getErrorMessage(e));
    },
  });

  // Countdown, derived from the server deadline so refreshes and clock drift do not matter.
  useEffect(() => {
    if (!attempt || outcome) return;
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attempt, outcome]);

  // Auto-submit when time runs out.
  useEffect(() => {
    if (attempt && !outcome && remaining === 0 && !submitted.current && new Date(attempt.deadlineAt).getTime() <= Date.now()) {
      submitted.current = true;
      toast.warning("Time's up. Submitting your answers…");
      submit.mutate();
    }
  }, [remaining, attempt, outcome, submit]);

  // Warn before leaving mid-exam.
  useEffect(() => {
    if (!attempt || outcome) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [attempt, outcome]);

  async function runCode(q: ExamQuestion) {
    const a = answerFor(q);
    if (!a.code?.trim() || !a.languageId) return toast.error('Write some code first');
    setRunning(q.id);
    try {
      const sample = q.codingConfig?.testCases.find((t) => !t.isHidden);
      const result = await assessmentsApi.runCode({ source_code: a.code, language_id: a.languageId, stdin: sample?.input ?? '' });
      setOutput((prev) => ({ ...prev, [q.id]: result.compile_output || result.stderr || result.stdout || result.status || 'Finished with no output' }));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setRunning(null);
    }
  }

  const languageName = useMemo(() => new Map(meta.data?.codingLanguages.map((l) => [l.id, l.name])), [meta.data]);
  const urgent = remaining > 0 && remaining <= 60;

  // ---------------- result screen ----------------
  if (outcome) {
    const { result, manualReviewPending } = outcome;
    const passed = result.status === 'PASSED';
    return (
      <div className="mx-auto max-w-lg py-16">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 16 }}>
          <Card className="p-10 text-center">
            <div className={cn('mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full', manualReviewPending ? 'bg-sky-50 text-sky-600' : passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
              {manualReviewPending ? <Clock className="h-12 w-12" /> : passed ? <Trophy className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{manualReviewPending ? 'Submitted for review' : passed ? 'Congratulations, you passed!' : 'Assessment completed'}</h1>
            <p className="mt-2 text-slate-500">{manualReviewPending ? 'Some answers need a manual review. You will be notified once your final result is ready.' : `You scored ${result.obtainedMarks} out of ${result.totalMarks}.`}</p>
            <p className="gradient-text mt-4 text-5xl font-extrabold">{Math.round(result.percentage)}%</p>
            <p className="mb-8 mt-1 text-sm text-slate-500">{manualReviewPending ? 'Provisional score (auto-graded part)' : 'Final score'}</p>
            <div className="flex justify-center gap-3">
              <ButtonLink href="/candidate/results">View my results</ButtonLink>
              <ButtonLink href="/assessments" variant="outline">More assessments</ButtonLink>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      {assessment && !attempt && (
        <div className="mx-auto max-w-2xl py-12">
          <Card className="p-8">
            <Badge tone="brand">{assessment.company?.name ?? 'Platform'}</Badge>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{assessment.title}</h1>
            <p className="mt-2 text-slate-600">{assessment.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-600" /> You have <b>{assessment.durationMinutes} minutes</b>. The timer starts when you press Start.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600" /> {questions.length} questions · {assessment.totalMarks} marks · pass at {assessment.passMarks}</li>
              <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Your answers are submitted automatically when time runs out.</li>
            </ul>
            <div className="mt-8 flex gap-3">
              <Button size="lg" loading={start.isPending} onClick={() => start.mutate()} icon={<Play className="h-4 w-4" />}>Start assessment</Button>
              <Link href={`/assessments/${id}`} className="inline-flex h-12 items-center px-4 text-sm font-semibold text-slate-500 hover:text-slate-800">Cancel</Link>
            </div>
          </Card>
        </div>
      )}

      {assessment && attempt && question && (
        <div className="mx-auto max-w-5xl">
          <div className="glass sticky top-3 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3 shadow-soft">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{assessment.title}</p>
              <p className="text-xs text-slate-500">{answeredCount} of {questions.length} answered</p>
            </div>
            <div className={cn('flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold', urgent ? 'animate-pulse bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-700')}>
              <Clock className="h-5 w-5" /> {formatClock(remaining)}
            </div>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200"><motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500" animate={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>

          <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
            <AnimatePresence mode="wait">
              <motion.div key={question.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
                <Card className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge tone="brand">Question {current + 1}</Badge>
                    <Badge>{humanize(question.type)}</Badge>
                    <Badge tone="info">{question.marks} marks</Badge>
                  </div>
                  <p className="whitespace-pre-line text-lg font-semibold leading-relaxed text-slate-900">{question.prompt}</p>

                  <div className="mt-6">
                    {question.type === 'MCQ' && (
                      <div className="space-y-2.5">
                        {question.options.map((option) => {
                          const selected = answerFor(question).selectedOptionIds.includes(option.id);
                          return (
                            <button key={option.id} type="button" onClick={() => patch(question, { selectedOptionIds: selected ? answerFor(question).selectedOptionIds.filter((x) => x !== option.id) : [...answerFor(question).selectedOptionIds, option.id] })} className={cn('flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition', selected ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')}>
                              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition', selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>{selected && <CheckCircle2 className="h-3.5 w-3.5" />}</span>
                              {option.text}
                            </button>
                          );
                        })}
                        <p className="pt-1 text-xs text-slate-400">Select every option that applies.</p>
                      </div>
                    )}

                    {question.type === 'WRITTEN' && <Textarea rows={10} value={answerFor(question).answerText ?? ''} onChange={(e) => patch(question, { answerText: e.target.value })} placeholder="Write your answer here…" />}

                    {question.type === 'CODING' && question.codingConfig && (
                      <div className="space-y-3">
                        {question.codingConfig.testCases.length > 0 && (
                          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                            <p className="mb-1 font-semibold text-slate-700">Sample test cases</p>
                            {question.codingConfig.testCases.map((t, i) => <p key={i} className="font-mono">input: {t.input || '(empty)'} → expected: {t.expectedOutput}</p>)}
                          </div>
                        )}
                        <Select label="Language" value={answerFor(question).languageId} onChange={(e) => patch(question, { languageId: Number(e.target.value) })}>
                          {question.codingConfig.languageIds.map((lid) => <option key={lid} value={lid}>{languageName.get(lid) ?? `Language ${lid}`}</option>)}
                        </Select>
                        <textarea spellCheck={false} value={answerFor(question).code ?? ''} onChange={(e) => patch(question, { code: e.target.value })} className="scroll-thin h-64 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-emerald-300 focus:outline-none focus:ring-4 focus:ring-brand-200" />
                        <Button variant="secondary" size="sm" loading={running === question.id} onClick={() => runCode(question)} icon={<Terminal className="h-4 w-4" />}>Run on sample input</Button>
                        {output[question.id] && <pre className="scroll-thin max-h-48 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">{output[question.id]}</pre>}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Previous</Button>
                    {current < questions.length - 1 ? (
                      <Button onClick={() => setCurrent((c) => c + 1)} className="flex-row-reverse" icon={<ChevronRight className="h-4 w-4" />}>Next</Button>
                    ) : (
                      <Button variant="success" onClick={() => setConfirmOpen(true)} icon={<Send className="h-4 w-4" />}>Finish &amp; submit</Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            <Card className="h-fit lg:sticky lg:top-28">
              <p className="mb-3 text-sm font-semibold text-slate-700">Questions</p>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
                {questions.map((q, index) => (
                  <button key={q.id} onClick={() => setCurrent(index)} className={cn('flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition', index === current ? 'bg-brand-600 text-white shadow-glow' : isAnswered(q) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{index + 1}</button>
                ))}
              </div>
              <Button variant="success" className="mt-5 w-full" onClick={() => setConfirmOpen(true)} icon={<Send className="h-4 w-4" />}>Submit</Button>
            </Card>
          </div>

          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Submit your assessment?" description={`${answeredCount} of ${questions.length} questions answered.`} footer={<><Button variant="ghost" onClick={() => setConfirmOpen(false)}>Keep working</Button><Button variant="success" loading={submit.isPending} onClick={() => { submitted.current = true; submit.mutate(); }}>Yes, submit</Button></>}>
            <p className="text-sm text-slate-600">{answeredCount < questions.length ? 'Some questions are still unanswered. ' : ''}You cannot change your answers after submitting.</p>
          </Modal>
        </div>
      )}
    </QueryState>
  );
}
