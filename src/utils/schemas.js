import { z } from 'zod';

const inventoryDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const optionalInventoryDateField = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Tell us what to call you'),
});

export const inventorySchema = z
  .object({
    name: z.string().min(2, 'Item name should be at least 2 characters'),
    sku: z.string().min(3, 'SKU should be at least 3 characters'),
    description: z
      .string()
      .max(250, 'Keep descriptions concise')
      .optional()
      .transform((value) => value ?? ''),
    category: z.string().min(2, 'Choose a clear category'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
    reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative'),
    location: z.string().min(2, 'Add where this stock lives'),
    supplier: z.string().min(2, 'Add a supplier or source'),
    tags: z.string().optional(),
    orderedOn: optionalInventoryDateField,
    expectedOn: optionalInventoryDateField,
    receivedOn: optionalInventoryDateField,
  })
  .superRefine((values, context) => {
    const dateFields = [
      ['orderedOn', values.orderedOn],
      ['expectedOn', values.expectedOn],
      ['receivedOn', values.receivedOn],
    ];

    dateFields.forEach(([field, value]) => {
      if (value && !inventoryDatePattern.test(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choose a valid date',
          path: [field],
        });
      }
    });

    if (values.orderedOn && values.expectedOn && values.expectedOn < values.orderedOn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected receipt should be on or after the order date',
        path: ['expectedOn'],
      });
    }

    if (values.orderedOn && values.receivedOn && values.receivedOn < values.orderedOn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Received date cannot be earlier than the order date',
        path: ['receivedOn'],
      });
    }
  });
