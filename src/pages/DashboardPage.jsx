import { AlertTriangle, Boxes, BriefcaseBusiness, CircleDollarSign, Layers3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { AttentionQueue } from '@/components/dashboard/AttentionQueue';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { StarterInventoryPanel } from '@/components/inventory/StarterInventoryPanel';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useInventoryMetrics } from '@/hooks/useInventoryMetrics';
import { formatCompactNumber, formatCurrency } from '@/utils/formatters';
import { getInventoryValue } from '@/utils/inventory';

function LoadingState() {
  return (
    <div className="space-y-6">
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
  const { items, isLoading, isError, refetch, seedItems, isSeeding } = useInventoryItems();
  const metrics = useInventoryMetrics(items);

  const recentItems = [...items]
    .sort((left, right) => (right.updatedAt?.getTime?.() ?? 0) - (left.updatedAt?.getTime?.() ?? 0))
    .slice(0, 5);

  const attentionItems = [...items]
    .filter((item) => item.status !== 'in_stock')
    .sort((left, right) => (left.quantity ?? 0) - (right.quantity ?? 0))
    .slice(0, 5);

  const topValueItems = [...items]
    .sort((left, right) => getInventoryValue(right) - getInventoryValue(left))
    .slice(0, 3);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        description="The inventory query failed. This is usually a Firebase configuration or permissions issue."
        onRetry={refetch}
      />
    );
  }

  if (!items.length) {
    const handleSeed = async () => {
      try {
        await seedItems();
        toast.success('Starter inventory loaded');
      } catch (error) {
        toast.error(error.message || 'Could not load starter inventory');
      }
    };

    return <StarterInventoryPanel onCreate={() => navigate('/app/inventory?new=true')} onSeed={handleSeed} isSeeding={isSeeding} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Boxes} title="Tracked SKUs" value={formatCompactNumber(metrics.totalSkus)} note="Live count" delay={0} />
        <SummaryCard
          icon={CircleDollarSign}
          title="Inventory value"
          value={formatCurrency(metrics.totalValue)}
          note="Based on current quantity"
          tone="success"
          delay={0.06}
        />
        <SummaryCard icon={AlertTriangle} title="Low stock" value={formatCompactNumber(metrics.lowStock)} note="Needs review" tone="warning" delay={0.12} />
        <SummaryCard icon={Layers3} title="Coverage rate" value={`${metrics.coverageRate}%`} note="Healthy availability" tone="accent" delay={0.18} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-[color:rgb(var(--border))] px-6 py-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visibility snapshot</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight">Coverage holding steady across {metrics.categories} categories</h2>
              <Button onClick={() => navigate('/app/inventory?new=true')}>
                <Plus className="h-4 w-4" />
                Add inventory
              </Button>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-[1fr_0.92fr]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-emerald-400/10 p-5">
                <div className="max-w-xl space-y-3">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Realtime operating pulse</p>
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Watch stock health, value, and risk move in one place.
                  </h3>
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-300">
                    The dashboard keeps the content flat and readable while ambient Three.js motion now lives behind the full workspace.
                  </p>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
                  style={{ width: `${metrics.coverageRate}%` }}
                />
              </div>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Coverage rate reflects how many of your tracked SKUs are currently above their reorder threshold.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Total units', value: formatCompactNumber(metrics.totalUnits) },
                  { label: 'Out of stock', value: formatCompactNumber(metrics.outOfStock) },
                  { label: 'Categories', value: formatCompactNumber(metrics.categories) },
                ].map((metricItem) => (
                  <div key={metricItem.label} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{metricItem.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{metricItem.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-slate-950 text-white dark:bg-slate-900">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Highest value items</p>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Where capital is sitting</h3>
                  </div>
                </div>
                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300/85">
                  Use this list to understand where inventory spend is concentrated right now.
                </p>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  {topValueItems.map((item) => (
                    <div key={item.id} className="rounded-3xl bg-white/8 p-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.quantity} units / {item.location}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-cyan-200">{formatCurrency(getInventoryValue(item))}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AttentionQueue items={attentionItems} onCreate={() => navigate('/app/inventory?new=true')} onSelect={(item) => navigate(`/app/inventory?focus=${item.id}`)} />
      </section>

      <RecentActivityList items={recentItems} onSelect={(item) => navigate(`/app/inventory?focus=${item.id}`)} />
    </div>
  );
}
