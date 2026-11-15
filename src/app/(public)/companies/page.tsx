import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { CompaniesBrowser } from '@/features/public/components/companies-browser';

export const metadata: Metadata = { title: 'Companies' };

export default function CompaniesPage() {
  return (
    <>
      <PageHeader eyebrow="Directory" title="Companies hiring on DevAssess" description="Discover approved companies, their open roles and public assessments." />
      <CompaniesBrowser />
    </>
  );
}
