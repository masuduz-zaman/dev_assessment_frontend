import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { JobsBrowser } from '@/features/public/components/jobs-browser';

export const metadata: Metadata = { title: 'Jobs' };

export default function JobsPage() {
  return (
    <>
      <PageHeader eyebrow="Careers" title="Open positions" description="Real openings published by approved companies. Apply in one click." />
      <JobsBrowser />
    </>
  );
}
