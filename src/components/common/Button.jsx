import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from '@/components/common/Spinner';

const styles = {
  primary:
    'bg-slate-950 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-sky-300 dark:text-slate-950 dark:hover:bg-sky-200',
  secondary:
    'border border-[color:rgb(var(--border-strong))] bg-white/78 text-slate-900 hover:bg-white dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-800/95',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/85 dark:hover:text-white',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-400',
};

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'ring-focus inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'h-10 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        styles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});
