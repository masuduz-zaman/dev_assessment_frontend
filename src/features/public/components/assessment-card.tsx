import { Clock, HelpCircle, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import type { PublicAssessment } from '../types';

export function AssessmentCard({ assessment }: { assessment: PublicAssessment }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge tone="brand">{assessment.company?.name ?? 'Platform'}</Badge>
        <span className="flex items-center gap-1 text-xs text-slate-400"><Users className="h-3.5 w-3.5" /> {assessment._count.attempts}</span>
      </div>
      <Link href={`/assessments/${assessment.id}`} className="text-lg font-semibold leading-snug text-slate-900 transition group-hover:text-brand-700">{assessment.title}</Link>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">{assessment.description || 'No description provided.'}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand-500" /> {assessment.durationMinutes} min</span>
        <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-brand-500" /> {assessment._count.questions} questions</span>
        <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-brand-500" /> Pass {assessment.passMarks}/{assessment.totalMarks}</span>
      </div>
      <ButtonLink href={`/assessments/${assessment.id}`} variant="outline" className="mt-5 w-full">View details</ButtonLink>
    </div>
  );
}
