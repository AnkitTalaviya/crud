import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { buildInventoryAlerts } from '@/utils/inventory';

export function useInventoryAlerts(items) {
  const { reminderPreferences } = useAuth();

  return useMemo(() => buildInventoryAlerts(items, reminderPreferences), [items, reminderPreferences]);
}
