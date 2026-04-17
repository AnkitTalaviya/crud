import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { InventoryCard } from '@/components/inventory/InventoryCard';
import { InventoryDetailModal } from '@/components/inventory/InventoryDetailModal';
import { InventoryFormModal } from '@/components/inventory/InventoryFormModal';
import { StarterInventoryPanel } from '@/components/inventory/StarterInventoryPanel';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryToolbar } from '@/components/inventory/InventoryToolbar';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { formatDateTime } from '@/utils/formatters';

function downloadInventory(items) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `stockpilot-inventory-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <SkeletonBlock className="h-[88px] w-full rounded-[30px]" />
      <SkeletonBlock className="hidden h-[400px] w-full rounded-[30px] lg:block" />
      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[260px] w-full rounded-[30px]" />
        ))}
      </div>
    </div>
  );
}

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { items, isLoading, isError, refetch, createItem, updateItem, seedItems, deleteItem, isCreating, isUpdating, isSeeding, isDeleting } = useInventoryItems();
  const { filters, filteredItems, categories, updateFilter } = useInventoryFilters(items);

  const focusedItem = useMemo(() => items.find((item) => item.id === searchParams.get('focus')), [items, searchParams]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const editId = searchParams.get('edit');

    if (!editId) {
      return;
    }

    const matchedItem = items.find((item) => item.id === editId);

    if (matchedItem) {
      setSelectedItem(null);
      setEditingItem(matchedItem);
      setIsFormOpen(true);
    }
  }, [items, searchParams]);

  useEffect(() => {
    if (focusedItem) {
      setSelectedItem(focusedItem);
    }
  }, [focusedItem]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    if (searchParams.get('new') || searchParams.get('edit')) {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete('new');
      nextSearchParams.delete('edit');
      setSearchParams(nextSearchParams, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(null);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (values) => {
    try {
      if (editingItem) {
        await updateItem({ itemId: editingItem.id, values });
        toast.success('Inventory item updated');
      } else {
        await createItem(values);
        toast.success('Inventory item created');
      }
      closeForm();
    } catch (error) {
      toast.error(error.message || 'Could not save the item');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteItem(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      setSelectedItem(null);
    } catch (error) {
      toast.error(error.message || 'Could not delete the item');
    }
  };

  const handleExport = () => {
    downloadInventory(items);
    toast.success('Inventory exported as JSON');
  };

  const handleSeed = async () => {
    try {
      await seedItems();
      toast.success('Starter inventory loaded');
    } catch (error) {
      toast.error(error.message || 'Could not load starter inventory');
    }
  };

  const closeDetail = () => {
    setSelectedItem(null);
    if (searchParams.get('focus')) {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete('focus');
      setSearchParams(nextSearchParams, { replace: true });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load inventory"
        description="The Firestore query failed. Confirm your Firebase config and security rules, then retry."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <InventoryToolbar
        filters={filters}
        categories={categories}
        updateFilter={updateFilter}
        onCreate={openCreateModal}
        onExport={handleExport}
      />

      {!items.length ? (
        <StarterInventoryPanel onCreate={openCreateModal} onSeed={handleSeed} isSeeding={isSeeding} />
      ) : filteredItems.length ? (
        <>
          <div className="rounded-[30px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-emerald-400/10 p-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Inventory records</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Browse, update, and search stock records.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                  Use search and filters to review inventory by category, status, and recent updates.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Total records', value: `${items.length}` },
                  { label: 'Filtered results', value: `${filteredItems.length}` },
                  { label: 'Categories', value: `${categories.length}` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[24px] bg-white/70 p-4 dark:bg-slate-950/50">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onView={setSelectedItem}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          <InventoryTable items={filteredItems} onView={setSelectedItem} onEdit={openEditModal} onDelete={setDeleteTarget} />
        </>
      ) : (
        <div className="surface-panel p-8 text-center">
          <h3 className="font-display text-2xl font-semibold tracking-tight">No results match those filters</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Try a different search term or widen the category and status filters to bring records back into view.
          </p>
        </div>
      )}

      <InventoryFormModal
        open={isFormOpen}
        item={editingItem}
        isSaving={isCreating || isUpdating}
        onClose={closeForm}
        onSubmit={handleSaveItem}
      />

      <InventoryDetailModal open={Boolean(selectedItem)} item={selectedItem} onClose={closeDetail} onEdit={openEditModal} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name ?? 'item'}?`}
        description={
          deleteTarget
            ? `This will remove ${deleteTarget.name} from your inventory records. Last updated ${formatDateTime(deleteTarget.updatedAt || deleteTarget.createdAt)}.`
            : ''
        }
        confirmLabel="Delete item"
        loading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
