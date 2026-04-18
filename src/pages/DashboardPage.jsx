import { AlertTriangle, Boxes, CircleDollarSign, ClipboardList, DatabaseZap, Plus, Truck, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { AttentionQueue } from '@/components/dashboard/AttentionQueue';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { StarterInventoryPanel } from '@/components/inventory/StarterInventoryPanel';
import { useAuth } from '@/context/AuthContext';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useInventoryMetrics } from '@/hooks/useInventoryMetrics';
import { useInventoryTransactions } from '@/hooks/useInventoryTransactions';
import { useSuppliers } from '@/hooks/useSuppliers';
import { formatCompactNumber, formatCurrency } from '@/utils/formatters';
import { buildReorderSuggestions, getInventoryValue } from '@/utils/inventory';

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-40 w-full rounded-[30px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SkeletonBlock className="h-[320px] w-full rounded-[30px]" />
        <SkeletonBlock className="h-[320px] w-full rounded-[30px]" />
      </div>
      <SkeletonBlock className="h-[280px] w-full rounded-[30px]" />
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { canManageWorkspace } = useAuth();
  const { items, isLoading, isError, refetch, seedItems, isSeeding } = useInventoryItems();
  const { transactions } = useInventoryTransactions();
  const { suppliers } = useSuppliers();
  const metrics = useInventoryMetrics(items);
  const alerts = useInventoryAlerts(items);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const topValueItems = useMemo(
    () =>
      [...items]
        .sort((left, right) => getInventoryValue(right) - getInventoryValue(left))
        .slice(0, 3),
    [items],
  );
  const reorderSuggestions = useMemo(() => buildReorderSuggestions(items).slice(0, 4), [items]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        description="The inventory workspace could not be loaded right now. Please retry in a moment."
        onRetry={refetch}
      />
    );
  }

  if (!items.length) {
    const handleSeed = async () => {
      try {
        const result = await seedItems();
        toast.success(
          result?.itemsAdded || result?.suppliersAdded || result?.transactionsAdded
            ? `Demo data loaded: ${result.itemsAdded} items, ${result.suppliersAdded} suppliers, ${result.transactionsAdded} history entries`
            : 'Demo data is already loaded',
        );
      } catch (error) {
        toast.error(error.message || 'Could not load demo workspace data');
      }
    };

    return (
      <StarterInventoryPanel
        onCreate={() => navigate('/app/inventory?new=true')}
        onSeed={handleSeed}
        isSeeding={isSeeding}
        canManage={canManageWorkspace}
      />
    );
  }

  const handleSeed = async () => {
    try {
      const result = await seedItems();
      toast.success(
        result?.itemsAdded || result?.suppliersAdded || result?.transactionsAdded
          ? `Demo data loaded: ${result.itemsAdded} items, ${result.suppliersAdded} suppliers, ${result.transactionsAdded} history entries`
          : 'Demo data is already loaded',
      );
    } catch (error) {
      toast.error(error.message || 'Could not load demo workspace data');
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Boxes} title="Tracked SKUs" value={formatCompactNumber(metrics.totalSkus)} note="Live item count" delay={0} />
        <SummaryCard
          icon={CircleDollarSign}
          title="Inventory value"
          value={formatCurrency(metrics.totalValue)}
          note="Current on-hand value"
          tone="success"
          delay={0.06}
        />
        <SummaryCard
          icon={Truck}
          title="Open PO lines"
          value={formatCompactNumber(metrics.openPurchaseOrders)}
          note={`${formatCompactNumber(metrics.onOrderUnits)} units on order`}
          tone="accent"
          delay={0.12}
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Active alerts"
          value={formatCompactNumber(alerts.length)}
          note={`${metrics.overdueReceipts} overdue receipts`}
          tone="warning"
          delay={0.18}
        />
      </section>

      <section className="grid gap-5 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-[color:rgb(var(--border))] px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Operations snapshot</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Stock health, inbound orders, and supplier activity in one view
              </h2>
              {canManageWorkspace && (
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={handleSeed} loading={isSeeding}>
                    <DatabaseZap className="h-4 w-4" />
                    Load demo data
                  </Button>
                  <Button onClick={() => navigate('/app/inventory?new=true')}>
                    <Plus className="h-4 w-4" />
                    Add inventory
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 px-4 py-4 sm:px-6 sm:py-5 2xl:grid-cols-[1fr_0.9fr]">
            <div className="space-y-3">
              <div className="rounded-[28px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-emerald-400/10 p-4 sm:p-5">
                <div className="max-w-xl space-y-2.5">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Operational summary</p>
                  <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                    Low-stock recovery and inbound planning stay visible throughout the day.
                  </h3>
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-300">
                    Review reorder suggestions, open PO lines, supplier count, and overdue deliveries without leaving the dashboard.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Coverage rate', value: `${metrics.coverageRate}%` },
                  { label: 'Suppliers', value: formatCompactNumber(suppliers.length) },
                  { label: 'Due this week', value: formatCompactNumber(metrics.dueThisWeek) },
                ].map((metricItem) => (
                  <div key={metricItem.label} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{metricItem.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{metricItem.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-[color:rgb(var(--border))] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reorder suggestions</p>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Where to buy next</h3>
                  </div>
                  <Button variant="secondary" onClick={() => navigate('/app/notifications')}>
                    Review alerts
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {reorderSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="ring-focus flex w-full flex-col gap-3 rounded-3xl bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => navigate(`/app/inventory?focus=${item.id}`)}
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.quantity} on hand / {item.quantityOnOrder ?? 0} on order / reorder target {item.reorderLevel}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold">Suggested order</p>
                        <p className="mt-1 text-2xl font-semibold">{item.suggestedOrderQuantity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-slate-950 text-white dark:bg-[linear-gradient(180deg,rgba(14,20,35,0.98),rgba(10,16,30,0.96))]">
              <div className="border-b border-white/10 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Highest value items</p>
                    <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Where capital is sitting</h3>
                  </div>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300/90">
                  Use this list to understand where inventory spend is concentrated and which suppliers are tied to those items.
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="space-y-3">
                  {topValueItems.map((item) => (
                    <div key={item.id} className="rounded-3xl bg-white/8 p-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.quantity} units / {item.supplier}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-cyan-200">{formatCurrency(getInventoryValue(item))}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AttentionQueue
          alerts={alerts.slice(0, 5)}
          onCreate={() => navigate('/app/inventory?new=true')}
          onSelect={(alert) => navigate(`/app/inventory?focus=${alert.itemId}`)}
        />
      </section>

      <div className="grid gap-5 2xl:grid-cols-[1.05fr_0.95fr]">
        <RecentActivityList
          transactions={recentTransactions}
          onSelect={(transaction) => navigate(`/app/inventory?focus=${transaction.inventoryItemId}`)}
        />

        <div className="surface-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Audit log coverage</p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Recent operational checks</h2>
            </div>
            <Button variant="secondary" onClick={() => navigate('/app/history')}>
              <ClipboardList className="h-4 w-4" />
              Open history
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {[
              `${metrics.lowStock} items are at or below their reorder target.`,
              `${metrics.openPurchaseOrders} PO-linked inventory lines are still open.`,
              `${metrics.overdueReceipts} deliveries are overdue and need follow-up.`,
              `${transactions.length} audit entries are available in the history view.`,
            ].map((line) => (
              <div key={line} className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
