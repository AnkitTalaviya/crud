import { Button } from '@/components/common/Button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="surface-panel flex flex-col items-center gap-5 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

