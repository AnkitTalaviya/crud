import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReorderSuggestions, resolveOrderStatus, resolveStockStatus } from '../src/utils/inventory.js';

test('resolve stock status follows quantity and reorder level', () => {
  assert.equal(resolveStockStatus(0, 5), 'out_of_stock');
  assert.equal(resolveStockStatus(4, 5), 'low_stock');
  assert.equal(resolveStockStatus(12, 5), 'in_stock');
});

test('resolve order status keeps cancelled and partial states consistent', () => {
  assert.equal(resolveOrderStatus({ orderStatus: 'cancelled', quantityOnOrder: 0, receivedOn: null }), 'cancelled');
  assert.equal(resolveOrderStatus({ orderStatus: 'ordered', quantityOnOrder: 4, receivedOn: '2026-04-18' }), 'partial');
  assert.equal(resolveOrderStatus({ orderStatus: 'received', quantityOnOrder: 0, receivedOn: '2026-04-18' }), 'received');
});

test('reorder suggestions account for quantity already on order', () => {
  const [suggestion] = buildReorderSuggestions([
    {
      id: '1',
      name: 'Scanner Dock',
      quantity: 1,
      quantityOnOrder: 3,
      reorderLevel: 5,
      status: 'low_stock',
    },
  ]);

  assert.equal(suggestion.suggestedOrderQuantity, 6);
});
