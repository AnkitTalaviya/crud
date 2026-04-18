import { useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Plus, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { Badge } from '@/components/common/Badge';
import { SearchField } from '@/components/common/SearchField';
import { SupplierFormModal } from '@/components/suppliers/SupplierFormModal';
import { useAuth } from '@/context/AuthContext';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useSuppliers } from '@/hooks/useSuppliers';

function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-[240px] w-full rounded-[30px]" />
      ))}
    </div>
  );
}

export function SuppliersPage() {
  const { canManageWorkspace } = useAuth();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { items } = useInventoryItems();
  const {
    suppliers,
    isLoading,
    isError,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSuppliers();

  const supplierUsage = useMemo(() => {
    const usageMap = new Map();

    items.forEach((item) => {
      if (item.supplierId) {
        usageMap.set(item.supplierId, (usageMap.get(item.supplierId) ?? 0) + 1);
      }
    });

    return usageMap;
  }, [items]);

  const filteredSuppliers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [supplier.name, supplier.contactName, supplier.email, supplier.phone, supplier.address, supplier.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue)),
    );
  }, [search, suppliers]);

  const handleSaveSupplier = async (values) => {
    try {
      if (editingSupplier) {
        await updateSupplier({ supplierId: editingSupplier.id, values });
        toast.success('Supplier updated');
      } else {
        await createSupplier(values);
        toast.success('Supplier created');
      }

      setEditingSupplier(null);
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error.message || 'Could not save the supplier');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteTarget) {
      return;
    }

    if ((supplierUsage.get(deleteTarget.id) ?? 0) > 0) {
      toast.error('Unlink this supplier from inventory items before deleting it.');
      return;
    }

    try {
      await deleteSupplier(deleteTarget.id);
      toast.success('Supplier removed');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message || 'Could not delete the supplier');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState title="Could not load suppliers" description="The supplier directory could not be loaded. Please try again." onRetry={refetch} />;
  }

  if (!suppliers.length) {
    return (
      <>
        <EmptyState
          icon={Building2}
          title="No suppliers yet"
          description="Create supplier profiles to link PO records, lead times, and vendor contacts to inventory items."
          actionLabel={canManageWorkspace ? 'Add supplier' : undefined}
          onAction={canManageWorkspace ? () => setIsFormOpen(true) : undefined}
        />
        <SupplierFormModal
          open={isFormOpen}
          supplier={editingSupplier}
          isSaving={isCreating || isUpdating}
          onClose={() => {
            setEditingSupplier(null);
            setIsFormOpen(false);
          }}
          onSubmit={handleSaveSupplier}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendor directory</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Supplier relationships, contacts, and lead times</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Link inventory items to supplier records so purchasing, receiving, and overdue deliveries stay organized.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <SearchField
                className="min-w-[220px] flex-1"
                placeholder="Search by supplier, contact, email, phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {canManageWorkspace && (
                <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add supplier
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Suppliers', value: suppliers.length },
                { label: 'Visible results', value: filteredSuppliers.length },
                {
                  label: 'Linked inventory',
                  value: Array.from(supplierUsage.values()).reduce((sum, current) => sum + current, 0),
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!filteredSuppliers.length ? (
        <div className="surface-panel p-8 text-center">
          <h3 className="font-display text-2xl font-semibold tracking-tight">No suppliers match that search</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Try a broader term like a company name, contact, or email domain.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredSuppliers.map((supplier) => {
            const linkedItems = supplierUsage.get(supplier.id) ?? 0;

            return (
              <div key={supplier.id} className="surface-panel flex h-full flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl font-semibold tracking-tight">{supplier.name}</h3>
                      <Badge tone="accent">{linkedItems} linked items</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{supplier.contactName || 'No primary contact added yet.'}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-700 dark:text-sky-200">
                    {supplier.leadTimeDays} day lead time
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{supplier.email || 'Not provided'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{supplier.phone || 'Not provided'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <MapPin className="h-4 w-4" />
                      Address
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{supplier.address || 'Not provided'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <Truck className="h-4 w-4" />
                      Linked inventory
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{linkedItems} active records</p>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                  {supplier.notes || 'No notes added'}
                </div>

                {canManageWorkspace && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setIsFormOpen(true);
                      }}
                    >
                      Edit supplier
                    </Button>
                    <Button variant="ghost" className="text-rose-500 hover:text-rose-600" onClick={() => setDeleteTarget(supplier)}>
                      Delete supplier
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      <SupplierFormModal
        open={isFormOpen}
        supplier={editingSupplier}
        isSaving={isCreating || isUpdating}
        onClose={() => {
          setEditingSupplier(null);
          setIsFormOpen(false);
        }}
        onSubmit={handleSaveSupplier}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name ?? 'supplier'}?`}
        description={
          deleteTarget
            ? `This removes the supplier profile. Linked inventory items must be reassigned first.`
            : ''
        }
        confirmLabel="Delete supplier"
        loading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSupplier}
      />
    </div>
  );
}
