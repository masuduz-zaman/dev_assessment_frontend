import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { AssessmentsBrowser } from '@/features/public/components/assessments-browser';

export const metadata: Metadata = { title: 'Assessments' };

export default function AssessmentsPage() {
  return (
    <>
      <PageHeader eyebrow="Public library" title="Skill assessments" description="Browse published assessments and test your skills against real questions." />
      <AssessmentsBrowser />
    </>
  );
}
