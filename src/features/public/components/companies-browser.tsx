'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, ClipboardList, Globe } from 'lucide-react';
import { useState } from 'react';
import { QueryState } from '@/components/common/query-state';
import { SearchInput } from '@/components/common/search-input';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Avatar } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { publicApi } from '../api';

export function CompaniesBrowser() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['public-companies', debounced], queryFn: () => publicApi.companies(debounced || undefined) });

  return (
    <>
      <SearchInput value={search} onChange={setSearch} placeholder="Search companies…" className="mb-6 max-w-xl" />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} skeleton="cards" emptyTitle="No companies found">
        <Stagger key={debounced} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((company) => (
            <StaggerItem key={company.id}>
              <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
                <div className="flex items-center gap-3">
                  <Avatar name={company.name} src={company.logoUrl} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{company.name}</h3>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-sm text-brand-600 hover:underline"><Globe className="h-3.5 w-3.5" /> Website</a>
                    )}
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-slate-500">{company.description || 'This company has not added a description yet.'}</p>
                <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-brand-500" /> {company._count.jobs} open jobs</span>
                  <span className="flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-brand-500" /> {company._count.assessments} assessments</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>
    </>
  );
}
