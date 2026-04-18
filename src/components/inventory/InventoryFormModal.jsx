import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { SelectField, TextAreaField, TextInput } from '@/components/common/Field';
import { INVENTORY_DEFAULT_VALUES, ORDER_STATUS_OPTIONS } from '@/utils/constants';
import { inventorySchema } from '@/utils/schemas';

function getInitialValues(item) {
  if (!item) {
    return INVENTORY_DEFAULT_VALUES;
  }

  return {
    name: item.name,
    sku: item.sku,
    description: item.description || '',
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    reorderLevel: item.reorderLevel,
    location: item.location,
    supplierId: item.supplierId ?? '',
    supplier: item.supplier,
    purchaseOrderNumber: item.purchaseOrderNumber ?? '',
    quantityOnOrder: item.quantityOnOrder ?? 0,
    orderStatus: item.orderStatus ?? 'none',
    tags: (item.tags ?? []).join(', '),
    orderedOn: item.orderedOn ?? '',
    expectedOn: item.expectedOn ?? '',
    receivedOn: item.receivedOn ?? '',
  };
}

export function InventoryFormModal({ open, item, suppliers = [], isSaving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: getInitialValues(item),
  });

  const selectedSupplierId = watch('supplierId');

  useEffect(() => {
    reset(getInitialValues(item));
  }, [item, reset]);

  useEffect(() => {
    if (!selectedSupplierId) {
      return;
    }

    const matchedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId);

    if (matchedSupplier) {
      setValue('supplier', matchedSupplier.name, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedSupplierId, setValue, suppliers]);

  return (
    <Modal
      open={open}
      title={item ? `Edit ${item.name}` : 'Create inventory item'}
      description="Capture supplier, pricing, stock levels, and purchase order status for this SKU."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Item name" placeholder="Field service kit" error={errors.name?.message} {...register('name')} />
          <TextInput label="SKU" placeholder="KIT-204" error={errors.sku?.message} {...register('sku')} />
          <TextInput label="Category" placeholder="Field gear" error={errors.category?.message} {...register('category')} />
          <TextInput label="Location" placeholder="Berlin warehouse A1" error={errors.location?.message} {...register('location')} />
          <TextInput label="Quantity" type="number" min="0" placeholder="24" error={errors.quantity?.message} {...register('quantity')} />
          <TextInput
            label="Unit price"
            type="number"
            min="0"
            step="0.01"
            placeholder="149"
            error={errors.unitPrice?.message}
            {...register('unitPrice')}
          />
          <TextInput
            label="Reorder level"
            type="number"
            min="0"
            placeholder="8"
            error={errors.reorderLevel?.message}
            {...register('reorderLevel')}
          />
          <SelectField
            label="Linked supplier"
            description={suppliers.length ? 'Optional' : 'Add suppliers first to link records'}
            error={errors.supplierId?.message}
            {...register('supplierId')}
          >
            <option value="">Manual / not linked</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </SelectField>
          <TextInput
            label="Supplier name"
            placeholder="Northern Tools GmbH"
            error={errors.supplier?.message}
            disabled={Boolean(selectedSupplierId)}
            {...register('supplier')}
          />
          <TextInput
            label="PO number"
            placeholder="PO-2048"
            description="Optional"
            error={errors.purchaseOrderNumber?.message}
            {...register('purchaseOrderNumber')}
          />
          <TextInput
            label="Quantity on order"
            type="number"
            min="0"
            placeholder="12"
            error={errors.quantityOnOrder?.message}
            {...register('quantityOnOrder')}
          />
          <SelectField label="Order status" error={errors.orderStatus?.message} {...register('orderStatus')}>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <TextInput
            label="Ordered on"
            type="date"
            description="Optional"
            error={errors.orderedOn?.message}
            {...register('orderedOn')}
          />
          <TextInput
            label="Expected receipt"
            type="date"
            description="Optional"
            error={errors.expectedOn?.message}
            {...register('expectedOn')}
          />
          <TextInput
            label="Received on"
            type="date"
            description="Optional"
            error={errors.receivedOn?.message}
            {...register('receivedOn')}
          />
        </div>

        <TextAreaField
          label="Description"
          placeholder="What is this item for, and what should teammates know before restocking it?"
          error={errors.description?.message}
          {...register('description')}
        />

        <TextInput
          label="Tags"
          description="Comma separated"
          placeholder="hardware, reorder, q2"
          error={errors.tags?.message}
          {...register('tags')}
        />

        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          Stock health is calculated automatically from on-hand quantity and reorder level. Open purchase orders and delivery dates feed the
          calendar, alerts, and receiving workflow.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {item ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
