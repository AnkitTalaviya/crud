import { motion } from 'framer-motion';
import { LogoMark } from '@/components/common/LogoMark';

export function AuthFormShell({ eyebrow, title, description, footer, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="surface-panel relative overflow-hidden p-6 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300" />
      <div className="space-y-8">
        <div className="space-y-5">
          <LogoMark />
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-sky-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
              {eyebrow}
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>
        </div>
        {children}
        {footer && <div className="text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
      </div>
    </motion.div>
  );
}
