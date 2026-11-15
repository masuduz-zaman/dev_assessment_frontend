'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { QueryState } from '@/components/common/query-state';
import { SearchInput } from '@/components/common/search-input';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { useDebounce } from '@/hooks/use-debounce';
import { publicApi } from '../api';
import { AssessmentCard } from './assessment-card';

export function AssessmentsBrowser() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['public-assessments', debounced], queryFn: () => publicApi.assessments(debounced || undefined) });

  return (
    <>
      <SearchInput value={search} onChange={setSearch} placeholder="Search assessments by title or topic…" className="mb-6 max-w-xl" />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} skeleton="cards" emptyTitle="No assessments found" emptyDescription="Try a different search or check back soon.">
        <Stagger key={debounced} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((assessment) => (
            <StaggerItem key={assessment.id}><AssessmentCard assessment={assessment} /></StaggerItem>
          ))}
        </Stagger>
      </QueryState>
    </>
  );
}
