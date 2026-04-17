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
    description: 'Review stock health, recent activity, and inventory value in one view.',
  },
  '/app/inventory': {
    title: 'Inventory records',
    description: 'Create, update, and review each SKU with search and filter controls.',
  },
  '/app/calendar': {
    title: 'Inventory calendar',
    description: 'Track order dates, expected receipts, and received inventory on one schedule.',
  },
  '/app/settings': {
    title: 'Account settings',
    description: 'Review account details, theme preferences, and backend status.',
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
            'fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col overflow-y-auto border-r border-[color:rgb(var(--border))] bg-[rgb(var(--background-panel))]/95 px-5 py-6 shadow-panel backdrop-blur-xl transition-transform duration-200 lg:left-[max(0px,calc((100vw-1600px)/2))] lg:translate-x-0 lg:shadow-none',
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
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">Add inventory quickly</h3>
            <p className="mt-2 text-sm leading-6 text-slate-900/75">
              Create a new record and keep stock levels current from the main navigation.
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

        <div aria-hidden="true" className="hidden w-[290px] shrink-0 lg:block" />

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <header className="fixed left-0 right-0 top-0 z-20 border-b border-[color:rgb(var(--border))] bg-[rgb(var(--background))]/90 backdrop-blur-xl lg:left-[max(290px,calc((100vw-1020px)/2))] lg:right-auto lg:w-[min(calc(100vw-290px),1310px)]">
            <div className="flex items-center gap-3 px-3 py-4 sm:gap-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="ring-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:rgb(var(--border))] bg-white/75 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">StockPilot</p>
                <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{currentMeta.title}</h1>
                <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{currentMeta.description}</p>
              </div>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <UserMenu />
            </div>
          </header>

          <div aria-hidden="true" className="h-[88px] shrink-0 sm:h-[104px]" />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
