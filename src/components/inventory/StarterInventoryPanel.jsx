import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, DatabaseZap, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { STARTER_INVENTORY_ITEMS } from '@/utils/sampleInventory';

function PreviewCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      className="rounded-[28px] border border-[color:rgb(var(--border))] bg-white/70 p-5 dark:bg-slate-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">{item.name}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {item.sku} / {item.category}
          </p>
        </div>
        <Badge tone={item.quantity === 0 ? 'danger' : item.quantity <= item.reorderLevel ? 'warning' : 'success'}>
          {item.quantity === 0 ? 'Out' : item.quantity <= item.reorderLevel ? 'Low' : 'Healthy'}
        </Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{item.location}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{item.quantity} units</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Reorder {item.reorderLevel}</span>
      </div>
    </motion.div>
  );
}

export function StarterInventoryPanel({ onCreate, onSeed, isSeeding, canManage = true }) {
  const primaryColumnRef = useRef(null);
  const [previewMaxHeight, setPreviewMaxHeight] = useState(null);

  useEffect(() => {
    const updatePreviewMaxHeight = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setPreviewMaxHeight(null);
        return;
      }

      const measuredHeight = primaryColumnRef.current?.clientHeight ?? 0;
      setPreviewMaxHeight(measuredHeight > 0 ? measuredHeight : null);
    };

    updatePreviewMaxHeight();

    if (typeof ResizeObserver === 'undefined') {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updatePreviewMaxHeight);
        return () => {
          window.removeEventListener('resize', updatePreviewMaxHeight);
        };
      }

      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updatePreviewMaxHeight();
    });

    if (primaryColumnRef.current) {
      observer.observe(primaryColumnRef.current);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updatePreviewMaxHeight);
    }

    return () => {
      observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updatePreviewMaxHeight);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden">
        <div className="grid gap-8 px-5 py-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:px-8 lg:py-8">
          <div ref={primaryColumnRef} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              Getting started
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-balance">
                No inventory records yet.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Add your first item manually, or load demo workspace data to review dashboard metrics, suppliers, purchase orders, alerts,
                and activity history.
              </p>
            </div>

            <div className="rounded-[30px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-violet-400/10 p-5">
              <div className="max-w-lg space-y-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Demo dataset</p>
                <h3 className="font-display text-2xl font-semibold tracking-tight">Load a full workspace preview with realistic records.</h3>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-300">
                  The seeded data includes suppliers, open and cancelled purchase orders, low stock, overdue deliveries, and history entries.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Sample records', value: `${STARTER_INVENTORY_ITEMS.length}`, icon: DatabaseZap },
                { label: 'Alert examples', value: '4+', icon: Wand2 },
                { label: 'Workspace preview', value: 'Ready', icon: Boxes },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-[28px] bg-slate-50 p-4 dark:bg-slate-900/60">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onSeed} loading={isSeeding} size="lg" disabled={!canManage}>
                <DatabaseZap className="h-4 w-4" />
                Load demo workspace data
              </Button>
              <Button variant="secondary" onClick={onCreate} size="lg" disabled={!canManage}>
                Create first item manually
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className="themed-scrollbar grid gap-4 lg:overflow-y-auto lg:pr-1"
            style={{ maxHeight: previewMaxHeight ? `${previewMaxHeight}px` : undefined }}
          >
            {STARTER_INVENTORY_ITEMS.map((item, index) => (
              <PreviewCard key={item.sku} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
