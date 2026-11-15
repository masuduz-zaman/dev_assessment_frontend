import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { Leaderboard } from '@/features/rankings/leaderboard';

export const metadata: Metadata = { title: 'Rankings' };

export default function RankingsPage() {
  return (
    <>
      <PageHeader eyebrow="Leaderboard" title="Top candidates" description="Ranked by verified performance across public assessments." />
      <Leaderboard />
    </>
  );
}
