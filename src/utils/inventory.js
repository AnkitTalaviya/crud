const OPEN_ORDER_STATUSES = ['ordered', 'partial'];
const UPCOMING_RECEIPT_WINDOW_DAYS = 7;

function createDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function resolveStockStatus(quantity, reorderLevel) {
  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= reorderLevel) {
    return 'low_stock';
  }

  return 'in_stock';
}

export function resolveOrderStatus({ orderStatus, quantityOnOrder, receivedOn }) {
  if (orderStatus === 'cancelled') {
    return 'cancelled';
  }

  if (quantityOnOrder > 0 && receivedOn) {
    return 'partial';
  }

  if (quantityOnOrder > 0) {
    return 'ordered';
  }

  if (receivedOn || orderStatus === 'received') {
    return 'received';
  }

  return 'none';
}

export const INVENTORY_SCHEDULE_MILESTONES = [
  { key: 'orderedOn', label: 'Ordered', tone: 'accent', color: '#0369a1' },
  { key: 'expectedOn', label: 'Expected', tone: 'warning', color: '#b45309' },
  { key: 'receivedOn', label: 'Received', tone: 'success', color: '#15803d' },
];

export function getStatusLabel(status) {
  switch (status) {
    case 'out_of_stock':
      return 'Out of stock';
    case 'low_stock':
      return 'Low stock';
    default:
      return 'In stock';
  }
}

export function getStatusTone(status) {
  switch (status) {
    case 'out_of_stock':
      return 'danger';
    case 'low_stock':
      return 'warning';
    default:
      return 'success';
  }
}

export function getOrderStatusLabel(status) {
  switch (status) {
    case 'ordered':
      return 'Ordered';
    case 'partial':
      return 'Partial receipt';
    case 'received':
      return 'Received';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'No open order';
  }
}

export function getOrderStatusTone(status) {
  switch (status) {
    case 'ordered':
      return 'accent';
    case 'partial':
      return 'warning';
    case 'received':
      return 'success';
    case 'cancelled':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function getTransactionLabel(type) {
  switch (type) {
    case 'create':
      return 'Created';
    case 'update':
      return 'Updated';
    case 'receive':
      return 'Received';
    case 'issue':
      return 'Issued';
    case 'adjust':
      return 'Adjusted';
    case 'delete':
      return 'Deleted';
    case 'csv_import':
      return 'CSV import';
    case 'seed':
      return 'Starter data';
    default:
      return 'Activity';
  }
}

export function getTransactionTone(type) {
  switch (type) {
    case 'receive':
    case 'create':
    case 'seed':
      return 'success';
    case 'issue':
    case 'delete':
      return 'danger';
    case 'adjust':
      return 'warning';
    default:
      return 'accent';
  }
}

export function parseTags(tagString) {
  return String(tagString ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeInventoryDate(value) {
  const trimmedValue = value?.trim?.() ?? value;
  return trimmedValue ? trimmedValue : null;
}

export function formatInventoryPayload(values, suppliersById = new Map()) {
  const supplierId = values.supplierId?.trim?.() || '';
  const linkedSupplierName = supplierId ? suppliersById.get(supplierId)?.name : '';
  const supplierName = (values.supplier?.trim?.() || linkedSupplierName || '').trim();
  const quantity = Number(values.quantity);
  const reorderLevel = Number(values.reorderLevel);
  const quantityOnOrder = Number(values.quantityOnOrder ?? 0);
  const receivedOn = normalizeInventoryDate(values.receivedOn);

  return {
    name: values.name.trim(),
    sku: values.sku.trim().toUpperCase(),
    description: values.description?.trim() ?? '',
    category: values.category.trim(),
    quantity,
    unitPrice: Number(values.unitPrice),
    reorderLevel,
    location: values.location.trim(),
    supplierId: supplierId || null,
    supplier: supplierName,
    purchaseOrderNumber: values.purchaseOrderNumber?.trim?.() || null,
    quantityOnOrder,
    orderStatus: resolveOrderStatus({
      orderStatus: values.orderStatus,
      quantityOnOrder,
      receivedOn,
    }),
    tags: parseTags(values.tags ?? ''),
    orderedOn: normalizeInventoryDate(values.orderedOn),
    expectedOn: normalizeInventoryDate(values.expectedOn),
    receivedOn,
    status: resolveStockStatus(quantity, reorderLevel),
  };
}

export function getInventoryValue(item) {
  return (item.quantity ?? 0) * (item.unitPrice ?? 0);
}

export function getInventoryScheduleMilestones(item = {}) {
  return INVENTORY_SCHEDULE_MILESTONES.filter((milestone) => Boolean(item[milestone.key])).map((milestone) => ({
    ...milestone,
    date: item[milestone.key],
  }));
}

export function buildInventoryCalendarEvents(items = []) {
  return items
    .flatMap((item) =>
      getInventoryScheduleMilestones(item).map((milestone) => ({
        id: `${item.id ?? item.sku}-${milestone.key}`,
        title: item.name,
        start: milestone.date,
        allDay: true,
        backgroundColor: milestone.color,
        borderColor: milestone.color,
        textColor: '#ffffff',
        extendedProps: {
          itemId: item.id,
          itemName: item.name,
          milestoneKey: milestone.key,
          milestoneLabel: milestone.label,
          supplier: item.supplier,
          sku: item.sku,
          purchaseOrderNumber: item.purchaseOrderNumber,
          orderStatus: item.orderStatus,
          quantityOnOrder: item.quantityOnOrder,
        },
      })),
    )
    .sort((left, right) => `${left.start}${left.extendedProps.milestoneKey}`.localeCompare(`${right.start}${right.extendedProps.milestoneKey}`));
}

export function isOpenOrder(item = {}) {
  return OPEN_ORDER_STATUSES.includes(item.orderStatus);
}

export function isOverdueReceipt(item = {}, todayKey = createDateKey(new Date())) {
  return Boolean(item.expectedOn && item.expectedOn < todayKey && isOpenOrder(item));
}

export function isUpcomingReceipt(item = {}, todayKey = createDateKey(new Date()), nextWindowKey = createDateKey(addDays(new Date(), UPCOMING_RECEIPT_WINDOW_DAYS))) {
  return Boolean(item.expectedOn && item.expectedOn >= todayKey && item.expectedOn <= nextWindowKey && isOpenOrder(item));
}

export function getLowStockShortfall(item = {}) {
  return Math.max((item.reorderLevel ?? 0) - (item.quantity ?? 0), 0);
}

export function buildReorderSuggestions(items = []) {
  return [...items]
    .filter((item) => item.status !== 'in_stock')
    .map((item) => ({
      ...item,
      suggestedOrderQuantity: Math.max((item.reorderLevel ?? 0) * 2 - (item.quantity ?? 0) - (item.quantityOnOrder ?? 0), getLowStockShortfall(item), 1),
    }))
    .sort((left, right) => {
      const leftScore = (left.quantity ?? 0) + (left.quantityOnOrder ?? 0);
      const rightScore = (right.quantity ?? 0) + (right.quantityOnOrder ?? 0);
      return leftScore - rightScore;
    });
}

export function buildInventoryAlerts(items = [], reminderPreferences = {}, today = new Date()) {
  const todayKey = createDateKey(today);
  const nextWindowKey = createDateKey(addDays(today, UPCOMING_RECEIPT_WINDOW_DAYS));
  const preferences = {
    inAppLowStock: reminderPreferences.inAppLowStock ?? true,
    inAppOverdue: reminderPreferences.inAppOverdue ?? true,
    inAppUpcoming: reminderPreferences.inAppUpcoming ?? true,
  };

  return items
    .flatMap((item) => {
      const alerts = [];

      if (preferences.inAppLowStock && item.status !== 'in_stock') {
        alerts.push({
          id: `low-stock-${item.id}`,
          type: item.status,
          tone: item.status === 'out_of_stock' ? 'danger' : 'warning',
          title: `${item.name} needs replenishment`,
          description: `${item.quantity} on hand, reorder target ${item.reorderLevel}, ${item.quantityOnOrder ?? 0} currently on order.`,
          itemId: item.id,
          sortKey: `2-${item.quantity ?? 0}`,
        });
      }

      if (preferences.inAppOverdue && isOverdueReceipt(item, todayKey)) {
        alerts.push({
          id: `overdue-${item.id}`,
          type: 'overdue_receipt',
          tone: 'danger',
          title: `${item.name} delivery is overdue`,
          description: `Expected on ${item.expectedOn}. PO ${item.purchaseOrderNumber || 'not specified'} is still open.`,
          itemId: item.id,
          sortKey: `0-${item.expectedOn}`,
        });
      }

      if (preferences.inAppUpcoming && isUpcomingReceipt(item, todayKey, nextWindowKey)) {
        alerts.push({
          id: `upcoming-${item.id}`,
          type: 'upcoming_receipt',
          tone: 'accent',
          title: `${item.name} is due soon`,
          description: `${item.quantityOnOrder ?? 0} units expected on ${item.expectedOn}.`,
          itemId: item.id,
          sortKey: `1-${item.expectedOn}`,
        });
      }

      return alerts;
    })
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey));
}

export function buildInventoryMetrics(items = []) {
  const totalSkus = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const totalValue = items.reduce((sum, item) => sum + getInventoryValue(item), 0);
  const lowStock = items.filter((item) => item.status === 'low_stock').length;
  const outOfStock = items.filter((item) => item.status === 'out_of_stock').length;
  const categories = new Set(items.map((item) => item.category)).size;
  const onOrderUnits = items.reduce((sum, item) => sum + (item.quantityOnOrder ?? 0), 0);
  const openPurchaseOrders = items.filter((item) => isOpenOrder(item)).length;
  const todayKey = createDateKey(new Date());
  const nextWindowKey = createDateKey(addDays(new Date(), UPCOMING_RECEIPT_WINDOW_DAYS));

  return {
    totalSkus,
    totalUnits,
    totalValue,
    lowStock,
    outOfStock,
    categories,
    onOrderUnits,
    openPurchaseOrders,
    overdueReceipts: items.filter((item) => isOverdueReceipt(item, todayKey)).length,
    dueThisWeek: items.filter((item) => isUpcomingReceipt(item, todayKey, nextWindowKey)).length,
    coverageRate: totalSkus ? Math.round(((totalSkus - lowStock - outOfStock) / totalSkus) * 100) : 100,
  };
}

export function filterItems(items, filters) {
  return items
    .filter((item) => {
      const searchValue = filters.search.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        [
          item.name,
          item.sku,
          item.category,
          item.location,
          item.supplier,
          item.description,
          item.purchaseOrderNumber,
          ...(item.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue));

      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case 'name':
          return left.name.localeCompare(right.name);
        case 'quantity':
          return (right.quantity ?? 0) - (left.quantity ?? 0);
        case 'value':
          return getInventoryValue(right) - getInventoryValue(left);
        case 'updated':
          return (right.updatedAt?.getTime?.() ?? 0) - (left.updatedAt?.getTime?.() ?? 0);
        default:
          return (right.createdAt?.getTime?.() ?? 0) - (left.createdAt?.getTime?.() ?? 0);
      }
    });
}
