import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { InventoryCard } from '@/components/inventory/InventoryCard';
import { InventoryDetailModal } from '@/components/inventory/InventoryDetailModal';
import { InventoryFormModal } from '@/components/inventory/InventoryFormModal';
import { InventoryTransactionModal } from '@/components/inventory/InventoryTransactionModal';
import { StarterInventoryPanel } from '@/components/inventory/StarterInventoryPanel';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryToolbar } from '@/components/inventory/InventoryToolbar';
import { useAuth } from '@/context/AuthContext';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useSuppliers } from '@/hooks/useSuppliers';
import { downloadInventoryAsCsv, downloadInventoryAsJson, parseInventoryCsvFile } from '@/utils/csv';
import { formatDateTime } from '@/utils/formatters';

function LoadingState() {
  return (
    <div className="space-y-4 sm:space-y-5">
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
  const fileInputRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [movementTarget, setMovementTarget] = useState(null);
  const { canManageWorkspace } = useAuth();
  const {
    items,
    isLoading,
    isError,
    refetch,
    createItem,
    updateItem,
    seedItems,
    deleteItem,
    importItems,
    applyTransaction,
    isCreating,
    isUpdating,
    isSeeding,
    isDeleting,
    isApplyingTransaction,
  } = useInventoryItems();
  const { suppliers } = useSuppliers();
  const { filters, filteredItems, categories, updateFilter } = useInventoryFilters(items);

  const focusedItem = useMemo(() => items.find((item) => item.id === searchParams.get('focus')), [items, searchParams]);

  useEffect(() => {
    if (searchParams.get('new') === 'true' && canManageWorkspace) {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [canManageWorkspace, searchParams]);

  useEffect(() => {
    const editId = searchParams.get('edit');

    if (!editId || !canManageWorkspace) {
      return;
    }

    const matchedItem = items.find((item) => item.id === editId);

    if (matchedItem) {
      setSelectedItem(null);
      setEditingItem(matchedItem);
      setIsFormOpen(true);
    }
  }, [canManageWorkspace, items, searchParams]);

  useEffect(() => {
    if (focusedItem) {
      setSelectedItem(focusedItem);
    }
  }, [focusedItem]);

  useEffect(() => {
    if (selectedItem) {
      const refreshedSelectedItem = items.find((item) => item.id === selectedItem.id);
      if (refreshedSelectedItem) {
        setSelectedItem(refreshedSelectedItem);
      }
    }
  }, [items, selectedItem]);

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
    if (!canManageWorkspace) {
      toast.error('Your current role cannot create inventory.');
      return;
    }

    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    if (!canManageWorkspace) {
      toast.error('Your current role cannot edit inventory.');
      return;
    }

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

  const handleExportJson = () => {
    downloadInventoryAsJson(items);
    toast.success('Inventory exported as JSON');
  };

  const handleExportCsv = () => {
    downloadInventoryAsCsv(items);
    toast.success('Inventory exported as CSV');
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const { validRows, errors } = await parseInventoryCsvFile(file);

      if (!validRows.length) {
        throw new Error(errors[0] || 'No valid CSV rows were found.');
      }

      await importItems(validRows);
      toast.success(`Imported ${validRows.length} inventory rows`);

      if (errors.length) {
        toast.error(errors[0]);
      }
    } catch (error) {
      toast.error(error.message || 'Could not import the CSV file');
    } finally {
      event.target.value = '';
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seedItems();
      toast.success(
        result?.itemsAdded || result?.suppliersAdded || result?.transactionsAdded
          ? `Demo data loaded: ${result.itemsAdded} items, ${result.suppliersAdded} suppliers, ${result.transactionsAdded} history entries`
          : 'Demo data is already loaded',
      );
    } catch (error) {
      toast.error(error.message || 'Could not load demo workspace data');
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

  const handleSaveMovement = async (values) => {
    if (!movementTarget) {
      return;
    }

    try {
      await applyTransaction({ itemId: movementTarget.item.id, values });
      toast.success('Stock movement recorded');
      setMovementTarget(null);
    } catch (error) {
      toast.error(error.message || 'Could not record the stock movement');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load inventory"
        description="The inventory workspace could not be loaded right now. Please retry."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />

      <InventoryToolbar
        filters={filters}
        categories={categories}
        updateFilter={updateFilter}
        canManage={canManageWorkspace}
        onCreate={openCreateModal}
        onImport={() => fileInputRef.current?.click()}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />

      {!items.length ? (
        <StarterInventoryPanel onCreate={openCreateModal} onSeed={handleSeed} isSeeding={isSeeding} canManage={canManageWorkspace} />
      ) : filteredItems.length ? (
        <>
          <div className="rounded-[30px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-emerald-400/10 p-4 sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
              <div className="space-y-2.5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Inventory records</p>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Track stock, open purchase orders, and receiving progress.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                  Search by SKU, supplier, PO number, or category to review inventory and update operational records quickly.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Total records', value: `${items.length}` },
                  { label: 'Filtered results', value: `${filteredItems.length}` },
                  { label: 'Linked suppliers', value: `${suppliers.length}` },
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
                canManage={canManageWorkspace}
                onView={setSelectedItem}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          <InventoryTable
            items={filteredItems}
            canManage={canManageWorkspace}
            onView={setSelectedItem}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
          />
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
        suppliers={suppliers}
        isSaving={isCreating || isUpdating}
        onClose={closeForm}
        onSubmit={handleSaveItem}
      />

      <InventoryDetailModal
        open={Boolean(selectedItem)}
        item={selectedItem}
        canManage={canManageWorkspace}
        onClose={closeDetail}
        onEdit={openEditModal}
        onTransaction={(mode, item) => setMovementTarget({ mode, item })}
      />

      <InventoryTransactionModal
        open={Boolean(movementTarget)}
        item={movementTarget?.item}
        mode={movementTarget?.mode}
        isSaving={isApplyingTransaction}
        onClose={() => setMovementTarget(null)}
        onSubmit={handleSaveMovement}
      />

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
