import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SearchField } from '@/components/common/SearchField';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { useInventoryTransactions } from '@/hooks/useInventoryTransactions';
import { formatDateTime } from '@/utils/formatters';
import { getTransactionLabel, getTransactionTone } from '@/utils/inventory';

const filterOptions = [
  { label: 'All activity', value: 'all' },
  { label: 'Creates', value: 'create' },
  { label: 'Updates', value: 'update' },
  { label: 'Receipts', value: 'receive' },
  { label: 'Issues', value: 'issue' },
  { label: 'Adjustments', value: 'adjust' },
  { label: 'Deletes', value: 'delete' },
];

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-[120px] w-full rounded-[30px]" />
      ))}
    </div>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { transactions, isLoading, isError, refetch } = useInventoryTransactions();

  const filteredTransactions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesFilter = filter === 'all' || transaction.type === filter;
      const matchesSearch =
        !searchValue ||
        [transaction.inventoryItemName, transaction.sku, transaction.note, transaction.purchaseOrderNumber]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue));

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, transactions]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState title="Could not load activity history" description="The audit log could not be loaded. Please try again." onRetry={refetch} />;
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No audit history yet"
        description="Create inventory, receive stock, or import a CSV to start building an activity trail."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="surface-panel p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchField
            className="flex-1"
            placeholder="Search by item, SKU, note, or PO..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Filter history by type"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="ring-focus h-11 rounded-2xl border border-[color:rgb(var(--border-strong))] bg-white/70 px-4 text-sm text-slate-900 dark:bg-slate-950/50 dark:text-slate-100"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        {filteredTransactions.map((transaction) => {
          const isArchivedRecord = transaction.inventoryItemId?.startsWith?.('archived-');

          return (
            <button
              key={transaction.id}
              type="button"
              className={`surface-panel flex w-full flex-col gap-4 p-5 text-left transition ${
                isArchivedRecord ? '' : 'hover:border-sky-500/30'
              }`}
              onClick={() => {
                if (!isArchivedRecord) {
                  navigate(`/app/inventory?focus=${transaction.inventoryItemId}`);
                }
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-2xl font-semibold tracking-tight">{transaction.inventoryItemName}</p>
                  <Badge tone={getTransactionTone(transaction.type)}>{getTransactionLabel(transaction.type)}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(transaction.createdAt)}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SKU</p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{transaction.sku || 'Not available'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quantity change</p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {transaction.quantityDelta > 0 ? '+' : ''}
                    {transaction.quantityDelta}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Before / after</p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {transaction.previousQuantity} to {transaction.nextQuantity}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PO</p>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{transaction.purchaseOrderNumber || 'Not linked'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                <p>{transaction.note || 'No notes recorded.'}</p>
                <p>{isArchivedRecord ? 'Archived record' : transaction.actorName || 'Signed-in user'}</p>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
