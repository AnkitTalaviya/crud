import { cn } from '@/utils/cn';

export function SkeletonBlock({ className }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80', className)} />;
}

