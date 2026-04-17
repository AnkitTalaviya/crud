export function resolveStockStatus(quantity, reorderLevel) {
  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= reorderLevel) {
    return 'low_stock';
  }

  return 'in_stock';
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

export function parseTags(tagString) {
  return tagString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeInventoryDate(value) {
  const trimmedValue = value?.trim?.() ?? value;
  return trimmedValue ? trimmedValue : null;
}

export function formatInventoryPayload(values) {
  return {
    name: values.name.trim(),
    sku: values.sku.trim().toUpperCase(),
    description: values.description?.trim() ?? '',
    category: values.category.trim(),
    quantity: Number(values.quantity),
    unitPrice: Number(values.unitPrice),
    reorderLevel: Number(values.reorderLevel),
    location: values.location.trim(),
    supplier: values.supplier.trim(),
    tags: parseTags(values.tags ?? ''),
    orderedOn: normalizeInventoryDate(values.orderedOn),
    expectedOn: normalizeInventoryDate(values.expectedOn),
    receivedOn: normalizeInventoryDate(values.receivedOn),
    status: resolveStockStatus(Number(values.quantity), Number(values.reorderLevel)),
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
        },
      })),
    )
    .sort((left, right) => `${left.start}${left.extendedProps.milestoneKey}`.localeCompare(`${right.start}${right.extendedProps.milestoneKey}`));
}

export function buildInventoryMetrics(items = []) {
  const totalSkus = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const totalValue = items.reduce((sum, item) => sum + getInventoryValue(item), 0);
  const lowStock = items.filter((item) => item.status === 'low_stock').length;
  const outOfStock = items.filter((item) => item.status === 'out_of_stock').length;
  const categories = new Set(items.map((item) => item.category)).size;

  return {
    totalSkus,
    totalUnits,
    totalValue,
    lowStock,
    outOfStock,
    categories,
    coverageRate: totalSkus ? Math.round(((totalSkus - lowStock - outOfStock) / totalSkus) * 100) : 100,
  };
}

export function filterItems(items, filters) {
  return items
    .filter((item) => {
      const searchValue = filters.search.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        [item.name, item.sku, item.category, item.location, item.supplier, item.description, ...(item.tags ?? [])]
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
