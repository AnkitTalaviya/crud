import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { LazyShowcaseScene } from '@/components/common/LazyShowcaseScene';
import { LogoMark } from '@/components/common/LogoMark';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserMenu } from '@/components/common/UserMenu';
import { NAV_LINKS } from '@/utils/constants';
import { cn } from '@/utils/cn';

const pageMeta = {
  '/app/dashboard': {
    title: 'Operations dashboard',
    description: 'Watch stock health, recent movement, and value coverage at a glance.',
  },
  '/app/inventory': {
    title: 'Inventory workspace',
    description: 'Create, update, and review every SKU with filters built for real workflows.',
  },
  '/app/settings': {
    title: 'Workspace settings',
    description: 'Personalize your theme, review account details, and confirm backend readiness.',
  },
};

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentMeta = useMemo(() => {
    return pageMeta[location.pathname] ?? pageMeta['/app/dashboard'];
  }, [location.pathname]);

  return (
    <div className="page-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <LazyShowcaseScene variant="workspace" className="h-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_28%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col border-r border-[color:rgb(var(--border))] bg-[rgb(var(--background-panel))]/95 px-5 py-6 shadow-panel backdrop-blur-xl transition-transform duration-200 lg:sticky lg:inset-y-auto lg:left-auto lg:top-0 lg:h-screen lg:self-start lg:translate-x-0 lg:shadow-none',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:pointer-events-auto',
          )}
        >
          <div className="flex items-center justify-between">
            <Link to="/app/dashboard" onClick={() => setIsSidebarOpen(false)}>
              <LogoMark />
            </Link>
            <button
              type="button"
              className="ring-focus rounded-full p-2 text-slate-400 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 space-y-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-slate-950 text-white shadow-soft dark:bg-sky-400 dark:text-slate-950'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 rounded-[28px] bg-gradient-to-br from-sky-500 to-cyan-400 p-5 text-slate-950 shadow-soft">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">Keep your floor one step ahead</h3>
            <p className="mt-2 text-sm leading-6 text-slate-900/75">
              Move faster on replenishment, spot risk early, and keep the team aligned with one source of truth.
            </p>
            <Button
              variant="secondary"
              className="mt-5 w-full border-black/10 bg-white/78 text-slate-950 hover:bg-white"
              onClick={() => navigate('/app/inventory?new=true')}
            >
              <Plus className="h-4 w-4" />
              New inventory item
            </Button>
          </div>

          <div className="mt-8 pt-0 lg:mt-auto lg:pt-8">
            <ThemeToggle compact />
          </div>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-20 border-b border-[color:rgb(var(--border))] bg-[rgb(var(--background))]/90 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-3 py-4 sm:gap-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="ring-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:rgb(var(--border))] bg-white/75 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workspace</p>
                <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{currentMeta.title}</h1>
                <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{currentMeta.description}</p>
              </div>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <UserMenu />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
