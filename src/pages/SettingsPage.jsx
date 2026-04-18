import { BellRing, Palette, ShieldCheck, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { useTheme } from '@/context/ThemeContext';
import { MEMBER_STATUS_OPTIONS, ROLE_OPTIONS } from '@/utils/constants';
import { updateUserProfile } from '@/services/profile.service';
import { STARTER_ACTIVITY_LOG, STARTER_INVENTORY_ITEMS, STARTER_SUPPLIERS } from '@/utils/sampleInventory';

const settingCards = [
  {
    title: 'Purchase order workflow',
    description: 'Track PO numbers, quantity on order, partial receipts, and overdue deliveries from inventory records.',
    icon: ShieldCheck,
  },
  {
    title: 'Audit-ready activity',
    description: 'Every create, edit, issue, receipt, adjustment, delete, and CSV import is added to the activity history.',
    icon: BellRing,
  },
  {
    title: 'Role-aware access',
    description: 'Admins manage invitations and roles while managers and viewers stay within their assigned permissions.',
    icon: UserCog,
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, userProfile, role, accountStatus, workspaceId, reminderPreferences, canManageWorkspace, canManageRoles } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const { seedItems, isSeeding } = useInventoryItems();
  const [preferences, setPreferences] = useState(reminderPreferences);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    setPreferences(reminderPreferences);
  }, [reminderPreferences]);

  const handleTogglePreference = async (key) => {
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPreferences);

    try {
      setIsSavingPreferences(true);
      await updateUserProfile(user.uid, { reminderPreferences: nextPreferences });
      toast.success('Reminder preferences updated');
    } catch (error) {
      setPreferences(reminderPreferences);
      toast.error(error.message || 'Could not update reminders');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleSeedDemoData = async () => {
    try {
      const result = await seedItems();
      toast.success(
        result?.itemsAdded || result?.suppliersAdded || result?.transactionsAdded
          ? `Demo data loaded: ${result.itemsAdded} items, ${result.suppliersAdded} suppliers, ${result.transactionsAdded} history entries`
          : 'Demo data is already loaded',
      );
    } catch (error) {
      toast.error(error.message || 'Could not load demo workspace data');
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-5 2xl:grid-cols-[1.16fr_0.84fr] 2xl:items-start">
        <div className="surface-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Profile</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{userProfile?.displayName || user?.displayName || 'Workspace member'}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{userProfile?.email || user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">{ROLE_OPTIONS.find((option) => option.value === role)?.label || 'Member'}</Badge>
              <Badge tone={accountStatus === 'active' ? 'success' : 'neutral'}>
                {MEMBER_STATUS_OPTIONS.find((option) => option.value === accountStatus)?.label || 'Active'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Theme preference</p>
              <p className="mt-2 text-xl font-semibold capitalize">{theme}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Currently rendering as {resolvedTheme}.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Workspace</p>
              <p className="mt-2 text-xl font-semibold">{workspaceId || 'Not assigned'}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This ID is used to scope inventory, suppliers, alerts, and history.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[28px] border border-[color:rgb(var(--border))] p-5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Access level</p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Role-based access</h3>
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {ROLE_OPTIONS.find((option) => option.value === role)?.description}
                </p>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                  {canManageRoles
                    ? 'Admin access can manage invitations, change teammate roles, and pause workspace access from the Team screen.'
                    : canManageWorkspace
                      ? 'Manager access can operate inventory, suppliers, imports, and transactions, but cannot change teammate roles.'
                      : 'Viewer access is read-only across dashboard, inventory, history, and notifications.'}
                </div>
                {canManageRoles && (
                  <Button variant="secondary" onClick={() => navigate('/app/team')}>
                    Open team access
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:rgb(var(--border))] p-5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reminder preferences</p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">In-app alerts</h3>
              <div className="mt-4 space-y-3">
                {[
                  ['inAppLowStock', 'Low-stock and out-of-stock alerts'],
                  ['inAppOverdue', 'Overdue delivery reminders'],
                  ['inAppUpcoming', 'Upcoming receipt reminders'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="ring-focus flex w-full items-center justify-between rounded-2xl border border-[color:rgb(var(--border))] px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    onClick={() => handleTogglePreference(key)}
                    disabled={isSavingPreferences}
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <Badge tone={preferences[key] ? 'success' : 'neutral'}>{preferences[key] ? 'On' : 'Off'}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[color:rgb(var(--border))] p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Demo workspace data</p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Seed Firebase with test records</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Load realistic suppliers, inventory items, purchase-order states, alerts, and history entries directly into your Firebase data so
              you can inspect every screen quickly. Running it again only adds missing demo records.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Demo suppliers', value: `${STARTER_SUPPLIERS.length}` },
                { label: 'Demo inventory', value: `${STARTER_INVENTORY_ITEMS.length}` },
                { label: 'History entries', value: `${STARTER_ACTIVITY_LOG.length}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button onClick={handleSeedDemoData} loading={isSeeding} disabled={!canManageWorkspace}>
                Load demo workspace data
              </Button>
            </div>
          </div>
        </div>

        <div className="surface-panel overflow-hidden p-5 sm:p-6">
          <div className="mb-5 rounded-[28px] border border-[color:rgb(var(--border))] bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-fuchsia-400/10 p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Appearance</p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">Theme controls and display preferences</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Choose the mode that fits your environment without changing operational behavior.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Appearance</p>
              <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Theme controls</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Theme preference is stored locally with system preference as a fallback when you choose the system option.
          </p>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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
