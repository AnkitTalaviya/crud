import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

function FieldWrapper({ label, description, error, children }) {
  return (
    <label className="block space-y-2">
      {label && (
        <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>{label}</span>
          {description && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      )}
      {children}
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </label>
  );
}

const baseFieldClassName =
  'ring-focus w-full rounded-2xl border border-[color:rgb(var(--border-strong))] bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500';

export const TextInput = forwardRef(function TextInput({ label, description, error, className, ...props }, ref) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <input ref={ref} className={cn(baseFieldClassName, className)} {...props} />
    </FieldWrapper>
  );
});

export const TextAreaField = forwardRef(function TextAreaField({ label, description, error, className, ...props }, ref) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <textarea ref={ref} className={cn(baseFieldClassName, 'min-h-[120px] resize-none', className)} {...props} />
    </FieldWrapper>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, description, error, className, children, ...props },
  ref,
) {
  return (
    <FieldWrapper label={label} description={description} error={error}>
      <select ref={ref} className={cn(baseFieldClassName, className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
});

