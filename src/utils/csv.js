import Papa from 'papaparse';
import { INVENTORY_CSV_COLUMNS } from '@/utils/constants';
import { inventorySchema } from '@/utils/schemas';

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeCsvRow(row = {}) {
  return {
    name: String(row.name ?? '').trim(),
    sku: String(row.sku ?? '').trim(),
    description: String(row.description ?? '').trim(),
    category: String(row.category ?? '').trim(),
    quantity: row.quantity ?? 0,
    unitPrice: row.unitPrice ?? 0,
    reorderLevel: row.reorderLevel ?? 0,
    location: String(row.location ?? '').trim(),
    supplierId: '',
    supplier: String(row.supplier ?? '').trim(),
    purchaseOrderNumber: String(row.purchaseOrderNumber ?? '').trim(),
    quantityOnOrder: row.quantityOnOrder ?? 0,
    orderStatus: String(row.orderStatus ?? 'none').trim() || 'none',
    orderedOn: String(row.orderedOn ?? '').trim(),
    expectedOn: String(row.expectedOn ?? '').trim(),
    receivedOn: String(row.receivedOn ?? '').trim(),
    tags: String(row.tags ?? '').trim(),
  };
}

export function downloadInventoryAsJson(items) {
  downloadBlob(
    JSON.stringify(items, null, 2),
    `stockpilot-inventory-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json',
  );
}

export function downloadInventoryAsCsv(items) {
  const rows = items.map((item) => ({
    name: item.name,
    sku: item.sku,
    description: item.description ?? '',
    category: item.category,
    quantity: item.quantity ?? 0,
    unitPrice: item.unitPrice ?? 0,
    reorderLevel: item.reorderLevel ?? 0,
    location: item.location ?? '',
    supplier: item.supplier ?? '',
    purchaseOrderNumber: item.purchaseOrderNumber ?? '',
    quantityOnOrder: item.quantityOnOrder ?? 0,
    orderStatus: item.orderStatus ?? 'none',
    orderedOn: item.orderedOn ?? '',
    expectedOn: item.expectedOn ?? '',
    receivedOn: item.receivedOn ?? '',
    tags: (item.tags ?? []).join(', '),
  }));

  const csv = Papa.unparse({
    fields: INVENTORY_CSV_COLUMNS,
    data: rows,
  });

  downloadBlob(csv, `stockpilot-inventory-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function parseInventoryCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors?.length) {
          reject(new Error(results.errors[0].message || 'Could not read the CSV file'));
          return;
        }

        const validRows = [];
        const errors = [];

        (results.data ?? []).forEach((row, index) => {
          const normalizedRow = normalizeCsvRow(row);
          const parsedRow = inventorySchema.safeParse(normalizedRow);

          if (parsedRow.success) {
            validRows.push(parsedRow.data);
            return;
          }

          errors.push(`Row ${index + 2}: ${parsedRow.error.issues[0]?.message || 'Invalid data'}`);
        });

        resolve({ validRows, errors });
      },
      error: () => reject(new Error('Could not parse the CSV file')),
    });
  });
}
