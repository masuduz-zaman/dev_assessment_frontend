'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { QueryState } from '@/components/common/query-state';
import { SearchInput } from '@/components/common/search-input';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { ApplyModal } from '@/features/jobs/components/apply-modal';
import { JobCard } from '@/features/jobs/components/job-card';
import { useJobApply } from '@/features/jobs/use-job-apply';
import { useDebounce } from '@/hooks/use-debounce';
import { useMeta } from '@/hooks/use-meta';
import { cn } from '@/lib/utils';
import { publicApi } from '../api';

export function JobsBrowser() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>();
  const debounced = useDebounce(search);
  const meta = useMeta();
  const apply = useJobApply();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['public-jobs', debounced, type], queryFn: () => publicApi.jobs({ search: debounced || undefined, type }) });

  return (
    <>
      <div className="mb-6 space-y-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search jobs by title, skill or location…" className="max-w-xl" />
        <div className="flex flex-wrap gap-2">
          {[undefined, ...(meta.data?.employmentTypes ?? [])].map((option) => (
            <button key={option ?? 'all'} onClick={() => setType(option)} className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition', type === option ? 'border-brand-600 bg-brand-600 text-white shadow-glow' : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400')}>
              {option ?? 'All types'}
            </button>
          ))}
        </div>
      </div>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} skeleton="cards" emptyTitle="No jobs match your filters" emptyDescription="Try clearing the search or choosing another employment type.">
        <Stagger key={`${debounced}-${type}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((job) => (
            <StaggerItem key={job.id}><JobCard job={job} onApply={() => apply.start(job)} /></StaggerItem>
          ))}
        </Stagger>
      </QueryState>
      <ApplyModal job={apply.target} onClose={apply.close} />
    </>
  );
}
