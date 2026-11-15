import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { CandidatesBrowser } from '@/features/public/components/candidates-browser';

export const metadata: Metadata = { title: 'Candidates' };

export default function CandidatesPage() {
  return (
    <>
      <PageHeader eyebrow="Talent" title="Candidate directory" description="Discover developers by skill, headline and location." />
      <CandidatesBrowser />
    </>
  );
}
