import { Boxes } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LogoMark({ compact = false, className }) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-300 to-emerald-300 text-slate-950 shadow-soft">
        <Boxes className="h-5 w-5" />
      </div>
      {!compact && (
        <div>
          <div className="font-display text-lg font-bold tracking-tight">StockPilot</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Inventory intelligence for small teams</div>
        </div>
      )}
    </div>
  );
}

