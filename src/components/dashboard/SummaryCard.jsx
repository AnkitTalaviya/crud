import { motion } from 'framer-motion';
import { Badge } from '@/components/common/Badge';

export function SummaryCard({ icon: Icon, title, value, note, tone = 'accent', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="surface-panel p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-sky-300 dark:text-slate-950">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={tone}>{note}</Badge>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <p className="mt-1 font-display text-[2rem] font-semibold tracking-tight sm:text-3xl">{value}</p>
    </motion.div>
  );
}
