import { cn } from '@/utils/cn';

const toneClasses = {
  success: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
  danger: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
  neutral: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  accent: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', toneClasses[tone], className)}>
      {children}
    </span>
  );
}

