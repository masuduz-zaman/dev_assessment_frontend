'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2, FileText, ListChecks, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useMeta } from '@/hooks/use-meta';
import { getErrorMessage, getFieldErrors } from '@/lib/http';
import { cn, humanize } from '@/lib/utils';
import { assessmentsApi } from '../api';
import type { AssessmentDetail, AssessmentInput, QuestionDraft, QuestionType } from '../types';

const icons: Record<QuestionType, typeof ListChecks> = { MCQ: ListChecks, CODING: Code2, WRITTEN: FileText };

const blankQuestion = (type: QuestionType, firstLanguage?: number): QuestionDraft => ({
  type,
  prompt: '',
  marks: type === 'MCQ' ? 5 : 10,
  options: type === 'MCQ' ? [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] : [],
  languageIds: type === 'CODING' && firstLanguage ? [firstLanguage] : [],
  starterCode: '',
  testCases: type === 'CODING' ? [{ input: '', expectedOutput: '', isHidden: false }] : [],
});

function fromDetail(detail: AssessmentDetail): QuestionDraft[] {
  return detail.questions.map((q) => ({
    type: q.type,
    prompt: q.prompt,
    marks: q.marks,
    options: q.options.map((o) => ({ text: o.text, isCorrect: Boolean(o.isCorrect) })),
    languageIds: q.codingConfig?.languageIds ?? [],
    starterCode: q.codingConfig?.starterCode ?? '',
    testCases: (q.codingConfig?.testCases ?? []).map((t) => ({ input: t.input, expectedOutput: t.expectedOutput, isHidden: Boolean(t.isHidden) })),
  }));
}

export function AssessmentBuilder({ assessmentId }: { assessmentId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = useMeta();
  const editing = Boolean(assessmentId);
  const existing = useQuery({ queryKey: ['assessment-edit', assessmentId], queryFn: () => assessmentsApi.get(assessmentId as string), enabled: editing });

  const [form, setForm] = useState({ title: '', description: '', visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE', durationMinutes: 45, maxAttempts: 1, passMarks: '' });
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!existing.data) return;
    const a = existing.data;
    setForm({ title: a.title, description: a.description ?? '', visibility: a.visibility, durationMinutes: a.durationMinutes, maxAttempts: a.maxAttempts, passMarks: String(a.passMarks) });
    setQuestions(fromDetail(a));
  }, [existing.data]);

  const firstLanguage = meta.data?.codingLanguages[0]?.id;
  const totalMarks = useMemo(() => questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0), [questions]);
  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));

  const save = useMutation({
    mutationFn: () => {
      const payload: AssessmentInput = {
        title: form.title,
        description: form.description || undefined,
        visibility: form.visibility,
        durationMinutes: Number(form.durationMinutes),
        maxAttempts: Number(form.maxAttempts),
        passMarks: form.passMarks === '' ? undefined : Number(form.passMarks),
        questions: questions.map((q) => ({
          type: q.type,
          prompt: q.prompt,
          marks: Number(q.marks),
          ...(q.type === 'MCQ' ? { options: q.options } : {}),
          ...(q.type === 'CODING' ? { languageIds: q.languageIds, starterCode: q.starterCode || undefined, testCases: q.testCases } : {}),
        })),
      };
      return editing ? assessmentsApi.update(assessmentId as string, payload) : assessmentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Assessment updated' : 'Assessment saved as draft. Publish it when you are ready.');
      queryClient.invalidateQueries({ queryKey: ['company-assessments'] });
      router.push('/company/assessments');
    },
    onError: (e) => {
      setErrors(getFieldErrors(e));
      toast.error(getErrorMessage(e));
    },
  });

  return (
    <>
      <PageHeader title={editing ? 'Edit assessment' : 'Assessment builder'} description="Compose multiple-choice, written and coding questions. Total marks are calculated automatically." />
      <QueryState isLoading={editing && existing.isLoading} error={existing.error} onRetry={existing.refetch}>
        <form onSubmit={(e) => { e.preventDefault(); if (questions.length === 0) return toast.error('Add at least one question'); setErrors({}); save.mutate(); }} className="space-y-6">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input className="sm:col-span-2" label="Title" required value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Node.js Backend Screening" />
              <Textarea className="sm:col-span-2" label="Description" value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              <Select label="Visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}>
                {meta.data?.assessmentVisibility.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              <Input label="Duration (minutes)" type="number" min={1} required value={form.durationMinutes} error={errors.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
              <Input label="Attempts allowed" type="number" min={1} max={10} value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })} />
              <Input label="Pass marks" type="number" min={0} value={form.passMarks} error={errors.passMarks} onChange={(e) => setForm({ ...form, passMarks: e.target.value })} hint={`Leave empty for 40% (${Math.ceil(totalMarks * 0.4)} of ${totalMarks})`} />
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><h2 className="text-lg font-bold text-slate-900">Questions</h2><Badge tone="brand">{questions.length} · {totalMarks} marks</Badge></div>
            <div className="flex flex-wrap gap-2">
              {meta.data?.questionTypes.map((type) => {
                const Icon = icons[type.value];
                return <Button key={type.value} size="sm" variant="outline" icon={<Icon className="h-4 w-4" />} onClick={() => setQuestions((prev) => [...prev, blankQuestion(type.value, firstLanguage)])}>Add {type.label}</Button>;
              })}
            </div>
          </div>

          {questions.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-14 text-center text-sm text-slate-500">No questions yet. Use the buttons above to add your first question.</div>}

          <AnimatePresence initial={false}>
            {questions.map((q, index) => {
              const Icon = icons[q.type];
              return (
                <motion.div key={index} layout initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                  <Card className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span><span className="font-semibold text-slate-900">Question {index + 1}</span><Badge>{humanize(q.type)}</Badge></div>
                      <button type="button" onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== index))} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Remove question"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <Textarea label="Prompt" required rows={3} value={q.prompt} error={errors[`questions.${index}.prompt`]} onChange={(e) => updateQuestion(index, { prompt: e.target.value })} />
                    <Input className="max-w-40" label="Marks" type="number" min={1} value={q.marks} error={errors[`questions.${index}.marks`]} onChange={(e) => updateQuestion(index, { marks: Number(e.target.value) })} />

                    {q.type === 'MCQ' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">Options <span className="font-normal text-slate-400">· tick every correct answer</span></p>
                        {q.options.map((option, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="checkbox" checked={option.isCorrect} onChange={(e) => updateQuestion(index, { options: q.options.map((o, i) => (i === oi ? { ...o, isCorrect: e.target.checked } : o)) })} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" aria-label="Correct answer" />
                            <input value={option.text} onChange={(e) => updateQuestion(index, { options: q.options.map((o, i) => (i === oi ? { ...o, text: e.target.value } : o)) })} placeholder={`Option ${oi + 1}`} className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
                            <button type="button" disabled={q.options.length <= 2} onClick={() => updateQuestion(index, { options: q.options.filter((_, i) => i !== oi) })} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30" aria-label="Remove option"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        ))}
                        {errors[`questions.${index}.options`] && <p className="text-xs font-medium text-rose-600">{errors[`questions.${index}.options`]}</p>}
                        <Button type="button" size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />} disabled={q.options.length >= 10} onClick={() => updateQuestion(index, { options: [...q.options, { text: '', isCorrect: false }] })}>Add option</Button>
                      </div>
                    )}

                    {q.type === 'CODING' && (
                      <div className="space-y-4">
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-slate-700">Allowed languages</p>
                          <div className="flex flex-wrap gap-2">
                            {meta.data?.codingLanguages.map((language) => {
                              const on = q.languageIds.includes(language.id);
                              return <button type="button" key={language.id} onClick={() => updateQuestion(index, { languageIds: on ? q.languageIds.filter((x) => x !== language.id) : [...q.languageIds, language.id] })} className={cn('rounded-full border px-3 py-1 text-xs font-semibold transition', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600 hover:border-brand-400')}>{language.name}</button>;
                            })}
                          </div>
                          {errors[`questions.${index}.languageIds`] && <p className="mt-1 text-xs font-medium text-rose-600">{errors[`questions.${index}.languageIds`]}</p>}
                        </div>
                        <Textarea label="Starter code (optional)" rows={3} value={q.starterCode} onChange={(e) => updateQuestion(index, { starterCode: e.target.value })} className="font-mono" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Test cases</p>
                          {q.testCases.map((t, ti) => (
                            <div key={ti} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                              <input value={t.input} onChange={(e) => updateQuestion(index, { testCases: q.testCases.map((x, i) => (i === ti ? { ...x, input: e.target.value } : x)) })} placeholder="Input (stdin)" className="rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
                              <input value={t.expectedOutput} onChange={(e) => updateQuestion(index, { testCases: q.testCases.map((x, i) => (i === ti ? { ...x, expectedOutput: e.target.value } : x)) })} placeholder="Expected output" className="rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
                              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={t.isHidden} onChange={(e) => updateQuestion(index, { testCases: q.testCases.map((x, i) => (i === ti ? { ...x, isHidden: e.target.checked } : x)) })} className="rounded border-slate-300 text-brand-600" /> Hidden</label>
                              <button type="button" disabled={q.testCases.length <= 1} onClick={() => updateQuestion(index, { testCases: q.testCases.filter((_, i) => i !== ti) })} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30" aria-label="Remove test case"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <Button type="button" size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={() => updateQuestion(index, { testCases: [...q.testCases, { input: '', expectedOutput: '', isHidden: true }] })}>Add test case</Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button type="submit" size="lg" loading={save.isPending} icon={<Save className="h-4 w-4" />}>{editing ? 'Save changes' : 'Save as draft'}</Button>
            <Button type="button" size="lg" variant="ghost" onClick={() => router.push('/company/assessments')}>Cancel</Button>
          </div>
        </form>
      </QueryState>
    </>
  );
}
