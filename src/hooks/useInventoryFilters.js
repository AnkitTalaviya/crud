import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { filterItems } from '@/utils/inventory';

const initialFilters = {
  search: '',
  status: 'all',
  category: 'all',
  sort: 'updated',
};

export function useInventoryFilters(items) {
  const [filters, setFilters] = useState(initialFilters);
  const deferredSearch = useDeferredValue(filters.search);

  const filteredItems = useMemo(
    () => filterItems(items, { ...filters, search: deferredSearch }),
    [deferredSearch, filters, items],
  );

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
    [items],
  );

  const updateFilter = (key, value) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [key]: value }));
    });
  };

  const resetFilters = () => setFilters(initialFilters);

  return {
    filters,
    filteredItems,
    categories,
    updateFilter,
    resetFilters,
  };
}

