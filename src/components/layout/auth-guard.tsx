'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { roleHome } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { Role } from '@/types/api';

const SECTION_ROLE: Record<string, Role> = { '/admin': 'SUPER_ADMIN', '/company': 'COMPANY', '/candidate': 'CANDIDATE' };

/** Blocks the dashboard until a session exists and the user is inside the section their role allows. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const section = Object.keys(SECTION_ROLE).find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const allowed = !section || user?.role === SECTION_ROLE[section];

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!allowed) router.replace(roleHome(user.role));
  }, [ready, user, allowed, router, pathname]);

  if (!ready || !user || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  return <>{children}</>;
}
