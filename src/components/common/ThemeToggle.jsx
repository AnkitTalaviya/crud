import { Monitor, MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

const options = [
  { value: 'light', icon: SunMedium, label: 'Light mode' },
  { value: 'dark', icon: MoonStar, label: 'Dark mode' },
  { value: 'system', icon: Monitor, label: 'System theme' },
];

export function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('inline-flex items-center rounded-2xl border border-[color:rgb(var(--border))] bg-white/75 p-1 dark:bg-slate-900/70', compact && 'w-full justify-between')}>
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'ring-focus inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition',
              theme === option.value
                ? 'bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
            )}
            onClick={() => setTheme(option.value)}
            aria-label={option.label}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span>{option.value}</span>}
          </button>
        );
      })}
    </div>
  );
}

