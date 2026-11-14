import { cn, initials } from '@/lib/utils';

const gradients = ['from-brand-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-orange-500', 'from-sky-500 to-indigo-500', 'from-fuchsia-500 to-pink-500'];

export function Avatar({ name, src, size = 'md', className }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn('rounded-full object-cover', dimension, className)} referrerPolicy="no-referrer" />;
  }
  const gradient = gradients[name.charCodeAt(0) % gradients.length];
  return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white', gradient, dimension, className)}>{initials(name)}</span>;
}
