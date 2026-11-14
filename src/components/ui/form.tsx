import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

const controlStyles = (error?: string) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50',
    error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300',
  );

function Wrapper({ label, hint, error, className, children, htmlFor }: FieldProps & { children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input({ label, hint, error, className, id, ...props }, ref) {
  const inputId = id ?? props.name;
  return (
    <Wrapper label={label} hint={hint} error={error} className={className} htmlFor={inputId}>
      <input ref={ref} id={inputId} className={controlStyles(error)} {...props} />
    </Wrapper>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea({ label, hint, error, className, id, rows = 4, ...props }, ref) {
  const inputId = id ?? props.name;
  return (
    <Wrapper label={label} hint={hint} error={error} className={className} htmlFor={inputId}>
      <textarea ref={ref} id={inputId} rows={rows} className={controlStyles(error)} {...props} />
    </Wrapper>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select({ label, hint, error, className, id, children, ...props }, ref) {
  const inputId = id ?? props.name;
  return (
    <Wrapper label={label} hint={hint} error={error} className={className} htmlFor={inputId}>
      <select ref={ref} id={inputId} className={controlStyles(error)} {...props}>
        {children}
      </select>
    </Wrapper>
  );
});
