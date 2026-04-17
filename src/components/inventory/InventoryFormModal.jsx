import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextAreaField, TextInput } from '@/components/common/Field';
import { INVENTORY_DEFAULT_VALUES } from '@/utils/constants';
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
    supplier: item.supplier,
    tags: (item.tags ?? []).join(', '),
  };
}

export function InventoryFormModal({ open, item, isSaving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: getInitialValues(item),
  });

  useEffect(() => {
    reset(getInitialValues(item));
  }, [item, reset]);

  return (
      <Modal
        open={open}
        title={item ? `Edit ${item.name}` : 'Create inventory item'}
        description="Enter supplier, quantity, pricing, and reorder details for this item."
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
          <TextInput label="Supplier" placeholder="Northern Tools GmbH" error={errors.supplier?.message} {...register('supplier')} />
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
          Stock status is calculated automatically from quantity and reorder level, so your dashboard stays consistent.
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
