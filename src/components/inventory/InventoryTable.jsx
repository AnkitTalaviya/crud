import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { getInventoryValue, getStatusLabel, getStatusTone } from '@/utils/inventory';

export function InventoryTable({ items, onView, onEdit, onDelete }) {
  return (
    <div className="surface-panel hidden overflow-hidden lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:rgb(var(--border))]">
          <thead className="bg-slate-50/80 dark:bg-slate-900/70">
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400">
              {['Item', 'Category', 'Stock', 'Value', 'Updated', 'Actions'].map((heading) => (
                <th key={heading} className="px-6 py-4 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:rgb(var(--border))]">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-sky-500/[0.04]">
                <td className="px-6 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <Badge tone={getStatusTone(item.status)}>{getStatusLabel(item.status)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.sku} / {item.supplier}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                  <p>{item.category}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.location}</p>
                </td>
                <td className="px-6 py-5 text-sm">
                  <p className="font-semibold">{item.quantity} units</p>
                  <p className="mt-1 text-xs text-slate-400">Reorder at {item.reorderLevel}</p>
                </td>
                <td className="px-6 py-5 text-sm font-semibold">{formatCurrency(getInventoryValue(item))}</td>
                <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{formatRelativeTime(item.updatedAt || item.createdAt)}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="ring-focus rounded-xl border border-[color:rgb(var(--border))] p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      onClick={() => onView(item)}
                      aria-label={`View ${item.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="ring-focus rounded-xl border border-[color:rgb(var(--border))] p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="ring-focus rounded-xl border border-[color:rgb(var(--border))] p-2 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-600"
                      onClick={() => onDelete(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
