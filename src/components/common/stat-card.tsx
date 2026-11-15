import { CountUp } from '@/components/motion/count-up';
import { cn } from '@/lib/utils';

const accents = {
  brand: 'from-brand-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  sky: 'from-sky-500 to-cyan-500',
} as const;

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  accent?: keyof typeof accents;
  hint?: string;
}

export function StatCard({ label, value, suffix, decimals, icon, accent = 'brand', hint }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition duration-300 group-hover:scale-125 group-hover:opacity-20', accents[accent])} />
      <div className={cn('mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', accents[accent])}>{icon}</div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        <CountUp value={value} suffix={suffix} decimals={decimals} />
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
