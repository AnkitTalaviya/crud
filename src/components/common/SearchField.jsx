import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export function SearchField({ className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        className="ring-focus h-11 w-full rounded-2xl border border-[color:rgb(var(--border-strong))] bg-white/80 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm dark:bg-slate-950/85 dark:text-slate-50 dark:placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}
