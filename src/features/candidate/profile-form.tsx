'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { QueryState } from '@/components/common/query-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/form';
import { api, getErrorMessage, getFieldErrors } from '@/lib/http';

interface ProfileData {
  name: string;
  headline: string;
  location: string;
  phone: string;
  portfolioUrl: string;
  bio: string;
  skills: string;
  cvUrl: string;
}

const empty: ProfileData = { name: '', headline: '', location: '', phone: '', portfolioUrl: '', bio: '', skills: '', cvUrl: '' };

export function ProfileForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['profile'], queryFn: () => api.get<{ name: string; candidate: { headline: string | null; location: string | null; phone: string | null; portfolioUrl: string | null; bio: string | null; skills: string[]; cvUrl: string | null } | null }>('/profile') });
  const [form, setForm] = useState<ProfileData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const c = data.candidate;
    setForm({ name: data.name, headline: c?.headline ?? '', location: c?.location ?? '', phone: c?.phone ?? '', portfolioUrl: c?.portfolioUrl ?? '', bio: c?.bio ?? '', skills: (c?.skills ?? []).join(', '), cvUrl: c?.cvUrl ?? '' });
  }, [data]);

  const set = (key: keyof ProfileData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const save = useMutation({
    mutationFn: () => api.patch('/profile', { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
    onSuccess: () => {
      setErrors({});
      toast.success('Profile saved');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => {
      setErrors(getFieldErrors(e));
      toast.error(getErrorMessage(e));
    },
  });

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const result = await api.post<{ url: string }>('/uploads', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((prev) => ({ ...prev, cvUrl: result.url }));
      toast.success('CV uploaded. Remember to save your profile.');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader title="My profile" description="Keep your details and CV up to date. Companies see this when you apply." />
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        <Card className="max-w-3xl">
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.name} onChange={set('name')} error={errors.name} required />
            <Input label="Headline" value={form.headline} onChange={set('headline')} error={errors.headline} placeholder="Full-stack developer" />
            <Input label="Location" value={form.location} onChange={set('location')} error={errors.location} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <Input label="Portfolio URL" value={form.portfolioUrl} onChange={set('portfolioUrl')} error={errors.portfolioUrl} placeholder="https://" className="sm:col-span-2" />
            <Input label="Skills" value={form.skills} onChange={set('skills')} hint="Separate skills with commas" className="sm:col-span-2" />
            <Textarea label="Bio" value={form.bio} onChange={set('bio')} error={errors.bio} className="sm:col-span-2" rows={5} />
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-slate-700">CV / Résumé</p>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4">
                <FileText className="h-5 w-5 text-brand-600" />
                {form.cvUrl ? <a href={form.cvUrl} target="_blank" rel="noreferrer" className="max-w-xs truncate text-sm font-medium text-brand-600 hover:underline">View current CV</a> : <span className="text-sm text-slate-500">No CV uploaded</span>}
                <label className="ml-auto cursor-pointer">
                  <input type="file" className="hidden" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={(e) => void upload(e.target.files?.[0])} />
                  <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-brand-400">{uploading ? 'Uploading…' : <><Upload className="h-4 w-4" /> Upload</>}</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-slate-500">PDF or image, up to 10MB.</p>
            </div>
            <div className="sm:col-span-2"><Button type="submit" size="lg" loading={save.isPending} icon={<Save className="h-4 w-4" />}>Save profile</Button></div>
          </form>
        </Card>
      </QueryState>
    </>
  );
}
