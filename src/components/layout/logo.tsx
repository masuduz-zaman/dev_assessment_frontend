import { Code2 } from 'lucide-react';
import Link from 'next/link';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glow transition group-hover:rotate-6 group-hover:scale-105">
        <Code2 className="h-5 w-5" />
      </span>
      <span className={cn('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-slate-900')}>{site.name}</span>
    </Link>
  );
}
