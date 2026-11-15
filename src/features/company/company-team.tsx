'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/form';
import { useMeta } from '@/hooks/use-meta';
import { getErrorMessage, getFieldErrors } from '@/lib/http';
import { cn, humanize } from '@/lib/utils';
import { companyApi, type TeamMember } from './api';

function PermissionPicker({ value, onChange, options }: { value: string[]; onChange: (next: string[]) => void; options: Array<{ key: string; label: string; description: string }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((permission) => {
        const on = value.includes(permission.key);
        return <button type="button" key={permission.key} title={permission.description} onClick={() => onChange(on ? value.filter((x) => x !== permission.key) : [...value, permission.key])} className={cn('rounded-full border px-3 py-1 text-xs font-semibold transition', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600 hover:border-brand-400')}>{permission.label}</button>;
      })}
    </div>
  );
}

export function CompanyTeam() {
  const queryClient = useQueryClient();
  const meta = useMeta();
  const members = useQuery({ queryKey: ['team'], queryFn: companyApi.members });
  const [form, setForm] = useState({ name: '', email: '', password: '', memberRole: 'ASSESSMENT_CREATOR', permissions: [] as string[] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['team'] });

  const roleDefaults = (role: string) => meta.data?.memberRoles.find((r) => r.value === role)?.defaultPermissions ?? [];
  const setRole = (memberRole: string) => setForm((prev) => ({ ...prev, memberRole, permissions: [...roleDefaults(memberRole)] }));

  const add = useMutation({
    mutationFn: () => companyApi.addMember(form),
    onSuccess: () => { toast.success('Team member added'); setForm({ name: '', email: '', password: '', memberRole: form.memberRole, permissions: [...roleDefaults(form.memberRole)] }); setErrors({}); refresh(); },
    onError: (e) => { setErrors(getFieldErrors(e)); toast.error(getErrorMessage(e)); },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { permissions?: string[]; active?: boolean } }) => companyApi.updateMember(id, body),
    onSuccess: () => { toast.success('Team member updated'); refresh(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const remove = useMutation({ mutationFn: companyApi.removeMember, onSuccess: () => { toast.success('Team member removed'); refresh(); }, onError: (e) => toast.error(getErrorMessage(e)) });

  const options = meta.data?.permissions ?? [];

  return (
    <>
      <PageHeader title="Team" description="Add employees and control exactly what each person can do." />
      <div className="space-y-8">
        <Card>
          <CardHeader title="Add a team member" description="They sign in with the email and temporary password you set here." />
          <form onSubmit={(e) => { e.preventDefault(); setErrors({}); add.mutate(); }} className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Temporary password" type="password" required minLength={8} value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select label="Role" value={form.memberRole} onChange={(e) => setRole(e.target.value)}>{meta.data?.memberRoles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</Select>
            <div className="md:col-span-2"><p className="mb-1.5 text-sm font-medium text-slate-700">Permissions</p><PermissionPicker value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} options={options} />{errors.permissions && <p className="mt-1 text-xs text-rose-600">{errors.permissions}</p>}</div>
            <div className="md:col-span-2"><Button type="submit" loading={add.isPending} icon={<UserPlus className="h-4 w-4" />}>Add member</Button></div>
          </form>
        </Card>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Current team</h2>
          <QueryState isLoading={members.isLoading} error={members.error} onRetry={members.refetch} isEmpty={members.data?.length === 0} emptyTitle="No team members yet" emptyDescription="Add your first colleague above.">
            <div className="space-y-4">
              {members.data?.map((member: TeamMember) => (
                <Card key={member.id} className={cn(!member.active && 'opacity-60')}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><Avatar name={member.user.name} /><div><p className="font-semibold text-slate-900">{member.user.name}</p><p className="text-sm text-slate-500">{member.user.email}</p></div></div>
                    <div className="flex items-center gap-2"><Badge tone="brand">{humanize(member.memberRole)}</Badge><Button size="sm" variant="outline" onClick={() => update.mutate({ id: member.id, body: { active: !member.active } })}>{member.active ? 'Deactivate' : 'Activate'}</Button><Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" icon={<Trash2 className="h-4 w-4" />} onClick={() => { if (window.confirm(`Remove ${member.user.name} from your team?`)) remove.mutate(member.id); }}>Remove</Button></div>
                  </div>
                  <div className="mt-4"><PermissionPicker value={member.permissions} options={options} onChange={(permissions) => update.mutate({ id: member.id, body: { permissions } })} /></div>
                </Card>
              ))}
            </div>
          </QueryState>
        </div>
      </div>
    </>
  );
}
