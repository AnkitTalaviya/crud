import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SearchField } from '@/components/common/SearchField';
import { INVENTORY_SORT_OPTIONS, STOCK_STATUS_OPTIONS } from '@/utils/constants';

function ToolbarSelect({ value, onChange, options, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="ring-focus h-11 rounded-2xl border border-[color:rgb(var(--border-strong))] bg-white/70 px-4 text-sm text-slate-900 dark:bg-slate-950/50 dark:text-slate-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function InventoryToolbar({ filters, categories, updateFilter, onCreate, onExport }) {
  return (
    <div className="surface-panel p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          className="flex-1"
          placeholder="Search by name, SKU, supplier, tag..."
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
          <ToolbarSelect
            ariaLabel="Filter by status"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={STOCK_STATUS_OPTIONS}
          />
          <ToolbarSelect
            ariaLabel="Filter by category"
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
            options={[
              { label: 'All categories', value: 'all' },
              ...categories.map((category) => ({ label: category, value: category })),
            ]}
          />
          <ToolbarSelect
            ariaLabel="Sort inventory"
            value={filters.sort}
            onChange={(value) => updateFilter('sort', value)}
            options={INVENTORY_SORT_OPTIONS}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <Button variant="secondary" onClick={onExport} className="w-full lg:w-auto">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button onClick={onCreate} className="w-full lg:w-auto">
            <Plus className="h-4 w-4" />
            New item
          </Button>
        </div>
      </div>
    </div>
  );
}
