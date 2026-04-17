import { Boxes, LayoutDashboard, Settings, ShieldCheck, TrendingUp } from 'lucide-react';

export const APP_NAME = 'StockPilot';

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/app/inventory', icon: Boxes },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export const HERO_METRICS = [
  { label: 'Core actions', value: 'CRUD', icon: Boxes },
  { label: 'User access', value: 'Protected', icon: ShieldCheck },
  { label: 'Stock status', value: 'Live', icon: TrendingUp },
];

export const INVENTORY_SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Recently updated', value: 'updated' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Quantity high to low', value: 'quantity' },
  { label: 'Highest value', value: 'value' },
];

export const STOCK_STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'In stock', value: 'in_stock' },
  { label: 'Low stock', value: 'low_stock' },
  { label: 'Out of stock', value: 'out_of_stock' },
];

export const INVENTORY_DEFAULT_VALUES = {
  name: '',
  sku: '',
  description: '',
  category: '',
  quantity: 0,
  unitPrice: 0,
  reorderLevel: 5,
  location: '',
  supplier: '',
  tags: '',
};

export const DASHBOARD_FILTER_PRESETS = [
  { label: 'All inventory', value: 'all' },
  { label: 'Needs attention', value: 'attention' },
  { label: 'Recently updated', value: 'recent' },
];
