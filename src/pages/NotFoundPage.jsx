import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LogoMark } from '@/components/common/LogoMark';

export function NotFoundPage() {
  return (
    <div className="page-shell subtle-grid flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel max-w-xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
          <Compass className="h-8 w-8" />
        </div>
        <div className="mt-6 flex justify-center">
          <LogoMark />
        </div>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">Page not found.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
