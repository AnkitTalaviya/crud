import { BarChart3, Boxes, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { LazyAuthScene } from '@/components/auth/LazyAuthScene';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const highlights = [
  {
    title: 'Live stock visibility',
    description: 'Know what is healthy, low, or out of stock without flipping between spreadsheets.',
    icon: Boxes,
  },
  {
    title: 'Fast operator decisions',
    description: 'See recent updates, inventory value, and priority items in one focused dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Secure by default',
    description: 'Firebase authentication and security rules keep each account limited to its own records.',
    icon: ShieldCheck,
  },
];

export function AuthLayout({ children }) {
  return (
    <div className="page-shell subtle-grid relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-90">
        <LazyAuthScene />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/75 p-6 text-white shadow-panel backdrop-blur lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">StockPilot</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Manage inventory with a clear and secure workflow.
              </h2>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle compact />
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;

              return (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                  className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200/80">{highlight.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-auto hidden items-end justify-between gap-6 pt-10 lg:flex">
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Built for day-to-day operations</p>
              <p className="mt-3 text-sm leading-6 text-slate-200/80">
                Secure authentication, responsive layouts, and user-scoped inventory records support daily stock management.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-2xl font-bold">Scoped</p>
              <p className="text-sm text-slate-200/75">Each account only accesses its own inventory records</p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center lg:max-w-[520px]">
          <div className="w-full space-y-4">
            <div className="flex justify-end lg:hidden">
              <ThemeToggle compact />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
