import { Suspense, lazy } from 'react';

const AuthScene = lazy(() => import('@/components/auth/AuthScene').then((module) => ({ default: module.AuthScene })));

function SceneFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-[10%] top-[12%] h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-[10%] right-[6%] h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute right-[24%] top-[18%] h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
    </div>
  );
}

export function LazyAuthScene() {
  return (
    <Suspense fallback={<SceneFallback />}>
      <AuthScene />
    </Suspense>
  );
}
