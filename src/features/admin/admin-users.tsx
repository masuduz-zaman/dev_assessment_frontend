'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { SearchInput } from '@/components/common/search-input';
import { Avatar } from '@/components/ui/avatar';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/form';
import { useDebounce } from '@/hooks/use-debounce';
import { getErrorMessage } from '@/lib/http';
import { formatDate, humanize } from '@/lib/utils';
import { adminApi } from './api';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const debounced = useDebounce(search);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-users', debounced, role], queryFn: () => adminApi.users({ search: debounced || undefined, role: role || undefined }) });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) => adminApi.setUserStatus(id, status),
    onSuccess: (_d, v) => { toast.success(v.status === 'ACTIVE' ? 'User reactivated' : 'User suspended'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <PageHeader title="Users" description="Search accounts and suspend or reactivate access." />
      <div className="mb-6 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" className="w-full max-w-md" />
        <Select aria-label="Filter by role" className="w-44" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option value="CANDIDATE">Candidates</option><option value="COMPANY">Company users</option></Select>
      </div>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.length === 0} emptyTitle="No users match">
        {data && (
          <DataTable rows={data} rowKey={(r) => r.id} columns={[
            { header: 'User', cell: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} src={r.avatarUrl} size="sm" /><div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.email}</p></div></div> },
            { header: 'Role', cell: (r) => <Badge tone="brand">{humanize(r.role)}</Badge> },
            { header: 'Joined', cell: (r) => formatDate(r.createdAt) },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            { header: '', cell: (r) => r.status === 'SUSPENDED' ? <Button size="sm" variant="success" loading={setStatus.isPending && setStatus.variables?.id === r.id} onClick={() => setStatus.mutate({ id: r.id, status: 'ACTIVE' })}>Reactivate</Button> : <Button size="sm" variant="outline" loading={setStatus.isPending && setStatus.variables?.id === r.id} onClick={() => setStatus.mutate({ id: r.id, status: 'SUSPENDED' })}>Suspend</Button> },
          ]} />
        )}
      </QueryState>
    </>
  );
}
