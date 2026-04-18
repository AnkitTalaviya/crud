import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export function AttentionQueue({ alerts, onCreate, onSelect }) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority queue</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Needs attention</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {alerts.length ? (
          alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              className="ring-focus flex w-full items-center justify-between gap-4 rounded-3xl border border-[color:rgb(var(--border))] px-4 py-4 text-left transition hover:border-amber-500/25 hover:bg-amber-500/5"
              onClick={() => onSelect(alert)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{alert.title}</p>
                  <Badge tone={alert.tone}>{alert.type.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{alert.description}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl bg-emerald-500/8 p-5">
            <p className="font-semibold text-emerald-600 dark:text-emerald-300">Everything looks healthy.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Once an item drops below its reorder level or a delivery slips past due, it will appear here automatically.
            </p>
            <Button className="mt-4" variant="secondary" onClick={onCreate}>
              Add another SKU
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
