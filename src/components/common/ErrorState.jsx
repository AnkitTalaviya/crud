import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function ErrorState({ title, description, onRetry }) {
  return (
    <div className="surface-panel flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}

