import { useMemo, useState } from 'react';
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { logoutCurrentUser } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const profile = useMemo(
    () => ({
      name: user?.displayName || 'Warehouse Lead',
      email: user?.email || '',
      initials: getInitials(user?.displayName || user?.email || 'SP'),
    }),
    [user?.displayName, user?.email],
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutCurrentUser();
      toast.success('Signed out safely');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Could not sign out');
    } finally {
      setIsLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="ring-focus inline-flex items-center gap-3 rounded-2xl border border-[color:rgb(var(--border))] bg-white/75 px-3 py-2 text-left transition hover:bg-white dark:bg-slate-900/65 dark:hover:bg-slate-800"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-sky-400 dark:text-slate-950">
          {profile.initials}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold">{profile.name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-3 w-64 rounded-3xl border border-[color:rgb(var(--border))] bg-[rgb(var(--background-panel))] p-3 shadow-panel">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
          </div>
          <div className="mt-3 grid gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => navigate('/app/settings')}>
              <UserCircle2 className="h-4 w-4" />
              Profile & settings
            </Button>
            <Button variant="ghost" className="justify-start text-rose-500 hover:text-rose-600" onClick={handleLogout} loading={isLoggingOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

