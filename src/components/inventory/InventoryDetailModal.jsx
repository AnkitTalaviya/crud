import { CalendarClock, CheckCircle2, ClipboardList, MapPin, PackageSearch, Tag, Truck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDateOnly, formatDateTime, formatTags } from '@/utils/formatters';
import {
  getInventoryValue,
  getOrderStatusLabel,
  getOrderStatusTone,
  getStatusLabel,
  getStatusTone,
} from '@/utils/inventory';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

export function InventoryDetailModal({ item, open, canManage = true, onClose, onEdit, onTransaction }) {
  if (!item) {
    return null;
  }

  return (
    <Modal open={open} title={item.name} description={item.description || 'No description available for this item yet.'} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={getStatusTone(item.status)}>{getStatusLabel(item.status)}</Badge>
          <Badge tone={getOrderStatusTone(item.orderStatus)}>{getOrderStatusLabel(item.orderStatus)}</Badge>
          <Badge tone="neutral">{item.category}</Badge>
          <Badge tone="accent">{item.sku}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailRow icon={PackageSearch} label="Supplier" value={item.supplier} />
          <DetailRow icon={MapPin} label="Location" value={item.location} />
          <DetailRow icon={ClipboardList} label="PO number" value={item.purchaseOrderNumber || 'Not assigned'} />
          <DetailRow
            icon={CalendarClock}
            label="Updated"
            value={`${formatDateTime(item.updatedAt || item.createdAt)} / created ${formatDateTime(item.createdAt)}`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailRow icon={CalendarClock} label="Ordered on" value={formatDateOnly(item.orderedOn)} />
          <DetailRow icon={Truck} label="Expected receipt" value={formatDateOnly(item.expectedOn)} />
          <DetailRow icon={CheckCircle2} label="Received on" value={formatDateOnly(item.receivedOn)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'On hand', value: `${item.quantity} units` },
            { label: 'On order', value: `${item.quantityOnOrder ?? 0} units` },
            { label: 'Reorder level', value: `${item.reorderLevel} units` },
            { label: 'Inventory value', value: formatCurrency(getInventoryValue(item)) },
          ].map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-[color:rgb(var(--border))] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{metric.value}</p>
            </div>
          ))}
        </div>

        <DetailRow icon={Tag} label="Tags" value={formatTags(item.tags) || 'No tags'} />

        {canManage && (
          <div className="rounded-[28px] border border-[color:rgb(var(--border))] p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Stock movements</p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Record receiving, issues, and adjustments</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => onTransaction?.('receive', item)}>
                Receive stock
              </Button>
              <Button variant="secondary" onClick={() => onTransaction?.('issue', item)}>
                Issue stock
              </Button>
              <Button variant="secondary" onClick={() => onTransaction?.('adjust', item)}>
                Adjust stock
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {canManage && <Button onClick={() => onEdit(item)}>Edit item</Button>}
        </div>
      </div>
    </Modal>
  );
}
