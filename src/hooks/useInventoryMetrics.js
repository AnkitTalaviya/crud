import { useMemo } from 'react';
import { buildInventoryMetrics } from '@/utils/inventory';

export function useInventoryMetrics(items) {
  return useMemo(() => buildInventoryMetrics(items), [items]);
}
