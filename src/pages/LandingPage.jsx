import { ArrowRight, CheckCircle2, LayoutDashboard, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyAuthScene } from '@/components/auth/LazyAuthScene';
import { Button } from '@/components/common/Button';
import { LogoMark } from '@/components/common/LogoMark';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { HERO_METRICS } from '@/utils/constants';

const featureCards = [
  {
    title: 'Secure login and protected routes',
    description: 'Email and password authentication, session persistence, and user-scoped inventory data.',
    icon: CheckCircle2,
  },
  {
    title: 'Inventory tracking and reporting',
    description: 'Monitor quantity, value, suppliers, locations, and stock status in one place.',
    icon: LayoutDashboard,
  },
  {
    title: 'Responsive operations interface',
    description: 'Use the same workflows across desktop, tablet, and mobile screens.',
    icon: WalletCards,
  },
];

export function LandingPage() {
  return (
    <div className="page-shell subtle-grid relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 opacity-80">
        <LazyAuthScene />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <LogoMark />
          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <ThemeToggle compact />
            <Link to="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Start free</Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                  <Sparkles className="h-4 w-4" />
                  Inventory management with secure access
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                    Keep inventory accurate, visible, and easy to manage.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                    StockPilot helps teams manage stock with secure authentication, clear dashboards, and streamlined create, update, search,
                    and delete workflows.
                  </p>
                </div>
              </motion.div>

              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary">
                    Sign in
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {HERO_METRICS.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="surface-panel p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-3xl font-bold">{metric.value}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{metric.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-panel overflow-hidden p-6">
                <div className="mb-6 rounded-[28px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-emerald-400/10 p-5">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Interactive overview</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Inventory health overview</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Review stocked coverage, low-stock items, and inventory value from a single summary.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory health</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">92% stocked coverage</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                    Stable this week
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'SKUs tracked', value: '128' },
                    { label: 'Low stock', value: '11' },
                    { label: 'Inventory value', value: '$48k' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {featureCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="surface-panel p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
