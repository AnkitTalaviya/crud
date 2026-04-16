import { Suspense, lazy } from 'react';
import { cn } from '@/utils/cn';

const ShowcaseScene = lazy(() => import('@/components/common/ShowcaseScene').then((module) => ({ default: module.ShowcaseScene })));

function SceneFallback({ variant }) {
  const styles = {
    workspace: ['bg-sky-400/16', 'bg-violet-300/12', 'bg-emerald-300/12'],
    dashboard: ['bg-sky-400/18', 'bg-cyan-300/12', 'bg-emerald-300/12'],
    sidebar: ['bg-white/18', 'bg-lime-200/14', 'bg-cyan-200/16'],
    starter: ['bg-sky-400/18', 'bg-violet-300/14', 'bg-emerald-300/14'],
    settings: ['bg-sky-400/18', 'bg-fuchsia-300/12', 'bg-cyan-300/14'],
  };

  const palette = styles[variant] ?? styles.dashboard;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={cn('absolute left-[12%] top-[15%] h-28 w-28 rounded-full blur-3xl', palette[0])} />
      <div className={cn('absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full blur-3xl', palette[1])} />
      <div className={cn('absolute right-[28%] top-[24%] h-24 w-24 rounded-full blur-3xl', palette[2])} />
    </div>
  );
}

export function LazyShowcaseScene({ variant = 'dashboard', className }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Suspense fallback={<SceneFallback variant={variant} />}>
        <ShowcaseScene variant={variant} />
      </Suspense>
    </div>
  );
}
