import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow hover:brightness-110',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
};

export const buttonStyles = ({ variant = 'primary', size = 'md', className }: { variant?: Variant; size?: Size; className?: string } = {}) =>
  cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold transition duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, icon, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonStyles({ variant, size, className })} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function ButtonLink({ href, variant, size, icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonStyles({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
