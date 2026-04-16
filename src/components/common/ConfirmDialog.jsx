import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

export function ConfirmDialog({ open, title, description, confirmLabel, confirmVariant = 'danger', loading, onClose, onConfirm }) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose} className="max-w-lg">
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
          This action updates your live inventory collection. You can recreate the record later, but its historical timestamps will be lost.
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

