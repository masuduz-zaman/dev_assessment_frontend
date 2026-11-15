'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/form';
import { jobsApi } from '@/features/jobs/api';
import { useMeta } from '@/hooks/use-meta';
import { getErrorMessage, getFieldErrors } from '@/lib/http';

export function JobForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = useMeta();
  const [form, setForm] = useState({ title: '', description: '', location: '', employmentType: '', status: 'OPEN' as 'OPEN' | 'DRAFT' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: () => jobsApi.create({ title: form.title, description: form.description, location: form.location || undefined, employmentType: form.employmentType || undefined, status: form.status }),
    onSuccess: () => {
      toast.success(form.status === 'OPEN' ? 'Job published' : 'Job saved as draft');
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      router.push('/company/jobs');
    },
    onError: (e) => {
      setErrors(getFieldErrors(e));
      toast.error(getErrorMessage(e));
    },
  });

  return (
    <>
      <PageHeader title="Post a job" description="Describe the role. Approved candidates can apply right away." />
      <Card className="max-w-2xl">
        <form onSubmit={(e) => { e.preventDefault(); setErrors({}); create.mutate(); }} className="space-y-4">
          <Input label="Job title" required value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Backend Engineer" />
          <Textarea label="Description" required rows={7} value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Dhaka / Remote" />
            <Select label="Employment type" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
              <option value="">Not specified</option>
              {meta.data?.employmentTypes.map((type) => <option key={type}>{type}</option>)}
            </Select>
            <Select label="Visibility" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'OPEN' | 'DRAFT' })}><option value="OPEN">Publish now</option><option value="DRAFT">Save as draft</option></Select>
          </div>
          <Button type="submit" size="lg" loading={create.isPending} icon={<Rocket className="h-4 w-4" />}>{form.status === 'OPEN' ? 'Publish job' : 'Save draft'}</Button>
        </form>
      </Card>
    </>
  );
}
