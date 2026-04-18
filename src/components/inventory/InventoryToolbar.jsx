import { Download, FileDown, FileUp, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SearchField } from '@/components/common/SearchField';
import { INVENTORY_SORT_OPTIONS, STOCK_STATUS_OPTIONS } from '@/utils/constants';

function ToolbarSelect({ value, onChange, options, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="ring-focus h-11 rounded-2xl border border-[color:rgb(var(--border-strong))] bg-white/80 px-4 text-sm text-slate-900 shadow-sm dark:bg-slate-950/85 dark:text-slate-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function InventoryToolbar({
  filters,
  categories,
  updateFilter,
  canManage,
  onCreate,
  onImport,
  onExportCsv,
  onExportJson,
}) {
  return (
    <div className="surface-panel p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField
          className="flex-1"
          placeholder="Search by name, SKU, supplier, PO number, tag..."
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:w-auto">
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
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:flex 2xl:flex-wrap">
        <Button variant="secondary" onClick={onExportCsv} className="w-full 2xl:w-auto">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="secondary" onClick={onExportJson} className="w-full 2xl:w-auto">
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="secondary" onClick={onImport} disabled={!canManage} className="w-full 2xl:w-auto">
          <FileUp className="h-4 w-4" />
          Import CSV
        </Button>
        <Button onClick={onCreate} disabled={!canManage} className="w-full 2xl:w-auto">
          <Plus className="h-4 w-4" />
          New item
        </Button>
      </div>
    </div>
  );
}
