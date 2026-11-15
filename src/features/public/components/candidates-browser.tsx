'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, MapPin } from 'lucide-react';
import { useState } from 'react';
import { QueryState } from '@/components/common/query-state';
import { SearchInput } from '@/components/common/search-input';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { publicApi } from '../api';

export function CandidatesBrowser() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['public-candidates', debounced], queryFn: () => publicApi.candidates(debounced || undefined) });

  return (
    <>
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, headline, location or skill…" className="mb-6 max-w-xl" />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} skeleton="cards" emptyTitle="No candidates found">
        <Stagger key={debounced} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((candidate) => (
            <StaggerItem key={candidate.user.id}>
              <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
                <div className="flex items-center gap-3">
                  <Avatar name={candidate.user.name} src={candidate.user.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{candidate.user.name}</h3>
                    <p className="truncate text-sm text-slate-500">{candidate.headline || 'Developer'}</p>
                  </div>
                </div>
                {candidate.location && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> {candidate.location}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">{candidate.skills.slice(0, 6).map((skill) => <Badge key={skill} tone="brand">{skill}</Badge>)}</div>
                {candidate.portfolioUrl && (
                  <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">Portfolio <ExternalLink className="h-3.5 w-3.5" /></a>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>
    </>
  );
}
