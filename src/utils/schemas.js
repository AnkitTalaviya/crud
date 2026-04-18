import { z } from 'zod';
import { canSelfBootstrapWorkspace } from '@/utils/access';

const inventoryDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const optionalInventoryDateField = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '');

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '');

const optionalEmailField = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '')
  .refine((value) => !value || z.string().email().safeParse(value).success, 'Enter a valid email address');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Tell us what to call you'),
  requestedRole: z.enum(['admin', 'manager', 'viewer']),
  workspaceId: optionalTrimmedString,
}).superRefine((values, context) => {
  if (!canSelfBootstrapWorkspace(values.requestedRole, values.workspaceId) && !values.workspaceId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a workspace ID when joining an existing team.',
      path: ['workspaceId'],
    });
  }
});

export const workspaceInviteSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  role: z.enum(['admin', 'manager', 'viewer']),
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
    supplierId: optionalTrimmedString,
    supplier: z.string().min(2, 'Select a supplier or add a clear supplier name'),
    purchaseOrderNumber: optionalTrimmedString,
    quantityOnOrder: z.coerce.number().min(0, 'Quantity on order cannot be negative'),
    orderStatus: z.enum(['none', 'ordered', 'partial', 'received', 'cancelled']),
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

    if (values.quantityOnOrder > 0 && values.orderStatus === 'none') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose an order status when quantity on order is greater than zero',
        path: ['orderStatus'],
      });
    }

    if (values.orderStatus === 'received' && values.quantityOnOrder > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Received orders should not have quantity remaining on order',
        path: ['quantityOnOrder'],
      });
    }

    if (values.orderStatus === 'cancelled' && values.quantityOnOrder > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cancelled orders should not keep quantity on order',
        path: ['quantityOnOrder'],
      });
    }

    if ((values.orderStatus === 'ordered' || values.orderStatus === 'partial') && !values.purchaseOrderNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add a PO number for open orders',
        path: ['purchaseOrderNumber'],
      });
    }
  });

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name should be at least 2 characters'),
  contactName: optionalTrimmedString,
  email: optionalEmailField,
  phone: optionalTrimmedString,
  leadTimeDays: z.coerce.number().min(0, 'Lead time cannot be negative'),
  address: optionalTrimmedString,
  notes: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? '')
    .refine((value) => value.length <= 280, 'Keep notes concise'),
});

export const inventoryMovementSchema = z
  .object({
    mode: z.enum(['receive', 'issue', 'adjust']),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    note: optionalTrimmedString,
    effectiveOn: optionalInventoryDateField,
  })
  .superRefine((values, context) => {
    if ((values.mode === 'receive' || values.mode === 'issue') && values.quantity <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a quantity greater than zero',
        path: ['quantity'],
      });
    }
  });
