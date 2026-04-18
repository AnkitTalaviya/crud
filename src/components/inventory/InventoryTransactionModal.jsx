import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextAreaField, TextInput } from '@/components/common/Field';
import { inventoryMovementSchema } from '@/utils/schemas';

const copyByMode = {
  receive: {
    title: 'Receive stock',
    description: 'Increase on-hand stock and reduce outstanding quantity on order.',
    quantityLabel: 'Units received',
    submitLabel: 'Save receipt',
  },
  issue: {
    title: 'Issue stock',
    description: 'Record stock leaving inventory for fulfillment, installation, or usage.',
    quantityLabel: 'Units issued',
    submitLabel: 'Save issue',
  },
  adjust: {
    title: 'Adjust stock',
    description: 'Set a corrected on-hand quantity after a count or reconciliation.',
    quantityLabel: 'New on-hand quantity',
    submitLabel: 'Save adjustment',
  },
};

function getInitialValues(item, mode) {
  return {
    mode,
    quantity: mode === 'adjust' ? item?.quantity ?? 0 : 1,
    note: '',
    effectiveOn: '',
  };
}

export function InventoryTransactionModal({ open, item, mode, isSaving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryMovementSchema),
    defaultValues: getInitialValues(item, mode),
  });

  useEffect(() => {
    reset(getInitialValues(item, mode));
  }, [item, mode, reset]);

  if (!item || !mode) {
    return null;
  }

  const copy = copyByMode[mode];

  return (
    <Modal open={open} title={`${copy.title}: ${item.name}`} description={copy.description} onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('mode')} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label={copy.quantityLabel}
            type="number"
            min="0"
            step="1"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
          <TextInput
            label="Effective on"
            type="date"
            description="Optional"
            error={errors.effectiveOn?.message}
            {...register('effectiveOn')}
          />
        </div>

        <TextAreaField
          label="Notes"
          placeholder="Optional context for receiving, issuing, or correcting stock."
          error={errors.note?.message}
          {...register('note')}
        />

        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          Current stock: {item.quantity} units. On order: {item.quantityOnOrder ?? 0} units.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {copy.submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
