'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PublicJob } from '@/features/public/types';
import { useAuth } from '@/providers/auth-provider';

/** Shared "Apply" behaviour: guests are sent to sign in, only candidates can open the application form. */
export function useJobApply() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [target, setTarget] = useState<{ id: string; title: string; companyName: string } | null>(null);

  return {
    target,
    close: () => setTarget(null),
    start(job: PublicJob) {
      if (!user) {
        toast.info('Sign in as a candidate to apply');
        return router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }
      if (user.role !== 'CANDIDATE') return toast.error('Only candidate accounts can apply for jobs');
      setTarget({ id: job.id, title: job.title, companyName: job.company.name });
    },
  };
}
