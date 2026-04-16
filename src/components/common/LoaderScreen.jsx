import { LogoMark } from '@/components/common/LogoMark';
import { Spinner } from '@/components/common/Spinner';

export function LoaderScreen({ label = 'Loading...' }) {
  return (
    <div className="page-shell subtle-grid flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel flex w-full max-w-md flex-col items-center gap-6 p-8 text-center">
        <LogoMark />
        <div className="space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
            <Spinner className="h-6 w-6" />
          </div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Syncing your theme, session, and workspace state.</p>
        </div>
      </div>
    </div>
  );
}

