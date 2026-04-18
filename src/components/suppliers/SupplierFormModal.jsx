import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextAreaField, TextInput } from '@/components/common/Field';
import { SUPPLIER_DEFAULT_VALUES } from '@/utils/constants';
import { supplierSchema } from '@/utils/schemas';

function getInitialValues(supplier) {
  if (!supplier) {
    return SUPPLIER_DEFAULT_VALUES;
  }

  return {
    name: supplier.name,
    contactName: supplier.contactName ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    leadTimeDays: supplier.leadTimeDays ?? 0,
    address: supplier.address ?? '',
    notes: supplier.notes ?? '',
  };
}

export function SupplierFormModal({ open, supplier, isSaving, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: getInitialValues(supplier),
  });

  useEffect(() => {
    reset(getInitialValues(supplier));
  }, [supplier, reset]);

  return (
    <Modal
      open={open}
      title={supplier ? `Edit ${supplier.name}` : 'Add supplier'}
      description="Store contact information, lead time, and delivery notes for purchasing workflows."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Supplier name" placeholder="Northern Tools GmbH" error={errors.name?.message} {...register('name')} />
          <TextInput label="Primary contact" placeholder="Leonie Hartmann" error={errors.contactName?.message} {...register('contactName')} />
          <TextInput label="Email" type="email" placeholder="orders@supplier.com" error={errors.email?.message} {...register('email')} />
          <TextInput label="Phone" placeholder="+49 30 5550 1201" error={errors.phone?.message} {...register('phone')} />
          <TextInput
            label="Lead time"
            type="number"
            min="0"
            placeholder="7"
            description="Days"
            error={errors.leadTimeDays?.message}
            {...register('leadTimeDays')}
          />
          <TextInput label="Address" placeholder="Street, city, region" error={errors.address?.message} {...register('address')} />
        </div>

        <TextAreaField
          label="Notes"
          placeholder="Contract terms, preferred ordering channels, or receiving instructions."
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {supplier ? 'Save supplier' : 'Create supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
