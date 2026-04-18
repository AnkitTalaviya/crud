import { Clock3 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { formatDateTime } from '@/utils/formatters';
import { getTransactionLabel, getTransactionTone } from '@/utils/inventory';

export function RecentActivityList({ transactions, onSelect }) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent activity</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Latest stock movements</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
          <Clock3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {transactions.length ? (
          transactions.map((transaction) => (
            <button
              key={transaction.id}
              type="button"
              className="ring-focus flex w-full items-center justify-between gap-4 rounded-3xl border border-[color:rgb(var(--border))] bg-slate-50/90 px-4 py-4 text-left transition hover:border-sky-500/30 hover:bg-sky-50/70 dark:bg-slate-900/60 dark:hover:bg-slate-900"
              onClick={() => onSelect(transaction)}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{transaction.inventoryItemName}</p>
                  <Badge tone={getTransactionTone(transaction.type)}>{getTransactionLabel(transaction.type)}</Badge>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {transaction.sku} / {transaction.note || 'No notes recorded'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {transaction.quantityDelta > 0 ? '+' : ''}
                  {transaction.quantityDelta}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(transaction.createdAt)}</p>
              </div>
            </button>
          ))
        ) : (
          <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            Activity will show up here after you create or update stock records.
          </p>
        )}
      </div>
    </div>
  );
}
