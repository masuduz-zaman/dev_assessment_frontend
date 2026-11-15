'use client';

import { Building2, CheckCircle2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { getErrorMessage, getFieldErrors } from '@/lib/http';
import { cn, roleHome } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { GoogleButton } from './google-button';

type AccountRole = 'CANDIDATE' | 'COMPANY';

const roleOptions: Array<{ value: AccountRole; title: string; description: string; icon: typeof UserRound }> = [
  { value: 'CANDIDATE', title: 'Candidate', description: 'Take assessments and get hired', icon: UserRound },
  { value: 'COMPANY', title: 'Company', description: 'Assess and recruit developers', icon: Building2 },
];

export function RegisterForm() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>('CANDIDATE');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const companyNameMissing = role === 'COMPANY' && form.companyName.trim().length < 2;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const { requiresApproval } = await register({ ...form, role, companyName: role === 'COMPANY' ? form.companyName : undefined });
      if (requiresApproval) return setPendingApproval(true);
      toast.success('Account created. Please sign in.');
      router.push('/login');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle(idToken: string) {
    if (companyNameMissing) return toast.error('Enter your company name first, then continue with Google');
    try {
      const result = await loginWithGoogle({ idToken, role, companyName: role === 'COMPANY' ? form.companyName : undefined });
      if (result.requiresApproval || !result.user) return setPendingApproval(true);
      toast.success('Signed in with Google');
      router.push(roleHome(result.user.role));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (pendingApproval) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Company registered</h1>
        <p className="mx-auto mb-6 mt-2 max-w-sm text-slate-500">A Super Admin will review your company shortly. You will be able to sign in as soon as it is approved.</p>
        <Button onClick={() => router.push('/login')}>Go to sign in</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mb-6 mt-2 text-slate-500">Join DevAssess in less than a minute.</p>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {roleOptions.map((option) => (
          <button key={option.value} type="button" onClick={() => setRole(option.value)} className={cn('rounded-2xl border-2 p-4 text-left transition', role === option.value ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300')}>
            <option.icon className={cn('mb-2 h-5 w-5', role === option.value ? 'text-brand-600' : 'text-slate-400')} />
            <span className="block text-sm font-semibold text-slate-900">{option.title}</span>
            <span className="block text-xs text-slate-500">{option.description}</span>
          </button>
        ))}
      </div>

      {role === 'COMPANY' && (
        <Input className="mb-4" label="Company name" name="companyName" value={form.companyName} error={errors.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Labs" />
      )}

      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or with email <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" name="name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" name="email" type="email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" name="password" type="password" required minLength={8} value={form.password} error={errors.password} hint="At least 8 characters with a letter and a number" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" size="lg" loading={busy} className="w-full" disabled={companyNameMissing}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
