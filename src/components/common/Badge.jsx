import { cn } from '@/utils/cn';

const toneClasses = {
  success: 'border-emerald-500/15 bg-emerald-500/12 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-200',
  warning: 'border-amber-500/15 bg-amber-500/12 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/12 dark:text-amber-200',
  danger: 'border-rose-500/15 bg-rose-500/12 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-200',
  neutral: 'border-slate-500/12 bg-slate-500/10 text-slate-700 dark:border-slate-400/18 dark:bg-slate-400/10 dark:text-slate-200',
  accent: 'border-sky-500/15 bg-sky-500/12 text-sky-700 dark:border-sky-300/20 dark:bg-sky-300/12 dark:text-sky-200',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
