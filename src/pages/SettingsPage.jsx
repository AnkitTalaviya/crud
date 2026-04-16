import { BellRing, Palette, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { isFirebaseConfigured } from '@/lib/firebase';

const settingCards = [
  {
    title: 'Responsive by design',
    description: 'Optimized layouts for handheld devices, laptops, and large monitors.',
    icon: Zap,
  },
  {
    title: 'Secure inventory isolation',
    description: 'Firestore security rules keep each user scoped to their own records.',
    icon: ShieldCheck,
  },
  {
    title: 'Product-grade feedback',
    description: 'Action toasts, loading states, confirmation dialogs, and focused empty states are built in.',
    icon: BellRing,
  },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Profile</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{user?.displayName || 'Warehouse Operator'}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <Badge tone={isFirebaseConfigured ? 'success' : 'warning'}>
              {isFirebaseConfigured ? 'Firebase configured' : 'Firebase env missing'}
            </Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Theme preference</p>
              <p className="mt-2 text-xl font-semibold capitalize">{theme}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resolved to {resolvedTheme} right now.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Backend stack</p>
              <p className="mt-2 text-xl font-semibold">Firebase Auth + Firestore</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Free-tier friendly and easy to deploy for portfolio apps.</p>
            </div>
          </div>
        </div>

        <div className="surface-panel overflow-hidden p-6">
          <div className="mb-6 rounded-[28px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-fuchsia-400/10 p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Appearance preview</p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Theme controls with a subtle motion layer</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              The interface stays flat and readable while Three.js remains in page-level ambient motion behind the workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Appearance</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Theme controls</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Theme preference is saved to localStorage, with system preference as a fallback when you choose the system option.
          </p>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {settingCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="surface-panel p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
