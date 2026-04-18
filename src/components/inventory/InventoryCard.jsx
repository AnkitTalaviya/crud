import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatRelativeTime, formatTags } from '@/utils/formatters';
import {
  getInventoryValue,
  getOrderStatusLabel,
  getOrderStatusTone,
  getStatusLabel,
  getStatusTone,
} from '@/utils/inventory';

export function InventoryCard({ item, canManage, onView, onEdit, onDelete }) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold tracking-tight">{item.name}</h3>
            <Badge tone={getStatusTone(item.status)}>{getStatusLabel(item.status)}</Badge>
            <Badge tone={getOrderStatusTone(item.orderStatus)}>{getOrderStatusLabel(item.orderStatus)}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {item.sku} / {item.category} / {item.location}
          </p>
        </div>
        <p className="text-right text-xs text-slate-500 dark:text-slate-400">{formatRelativeTime(item.updatedAt || item.createdAt)}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description || 'No description added yet.'}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">On hand</p>
          <p className="mt-2 text-2xl font-semibold">{item.quantity}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">On order</p>
          <p className="mt-2 text-2xl font-semibold">{item.quantityOnOrder ?? 0}</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-200">{item.supplier}</p>
        <p className="mt-1">{item.purchaseOrderNumber || 'No purchase order linked'}</p>
        <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(getInventoryValue(item))}</p>
      </div>

      {Boolean(item.tags?.length) && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">Tags:</span> {formatTags(item.tags)}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => onView(item)}>
          <Eye className="h-4 w-4" />
          Details
        </Button>
        {canManage && (
          <>
            <Button variant="ghost" className="flex-1" onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost" className="text-rose-500 hover:text-rose-600" onClick={() => onDelete(item)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
