import {
  BellRing,
  Boxes,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserCog,
  Users,
} from 'lucide-react';

export const APP_NAME = 'StockPilot';

export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin', description: 'Full workspace access, including role changes and destructive actions.' },
  { label: 'Manager', value: 'manager', description: 'Can manage inventory, suppliers, imports, and stock movements.' },
  { label: 'Viewer', value: 'viewer', description: 'Read-only access for dashboards, inventory, history, and alerts.' },
];

export const MEMBER_STATUS_OPTIONS = [
  { label: 'Active', value: 'active', description: 'Can access the shared workspace based on the assigned role.' },
  { label: 'Suspended', value: 'inactive', description: 'Access is paused until an admin reactivates the member.' },
];

export const PROFILE_STATUS_OPTIONS = [
  { label: 'Pending approval', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'inactive' },
  { label: 'Rejected', value: 'rejected' },
];

export const ORDER_STATUS_OPTIONS = [
  { label: 'No open order', value: 'none' },
  { label: 'Ordered', value: 'ordered' },
  { label: 'Partially received', value: 'partial' },
  { label: 'Received', value: 'received' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const INVENTORY_TRANSACTION_ACTIONS = [
  { label: 'Receive stock', value: 'receive' },
  { label: 'Issue stock', value: 'issue' },
  { label: 'Adjust stock', value: 'adjust' },
];

export const INVENTORY_CSV_COLUMNS = [
  'name',
  'sku',
  'description',
  'category',
  'quantity',
  'unitPrice',
  'reorderLevel',
  'location',
  'supplier',
  'purchaseOrderNumber',
  'quantityOnOrder',
  'orderStatus',
  'orderedOn',
  'expectedOn',
  'receivedOn',
  'tags',
];

export const REMINDER_DEFAULT_VALUES = {
  inAppLowStock: true,
  inAppOverdue: true,
  inAppUpcoming: true,
};

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/app/inventory', icon: Boxes },
  { label: 'Calendar', path: '/app/calendar', icon: CalendarDays },
  { label: 'Suppliers', path: '/app/suppliers', icon: Users },
  { label: 'History', path: '/app/history', icon: ClipboardList },
  { label: 'Notifications', path: '/app/notifications', icon: BellRing },
  { label: 'Team', path: '/app/team', icon: UserCog, roles: ['admin'] },
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
  supplierId: '',
  supplier: '',
  purchaseOrderNumber: '',
  quantityOnOrder: 0,
  orderStatus: 'none',
  tags: '',
  orderedOn: '',
  expectedOn: '',
  receivedOn: '',
};

export const SUPPLIER_DEFAULT_VALUES = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  leadTimeDays: 7,
  address: '',
  notes: '',
};

export const DASHBOARD_FILTER_PRESETS = [
  { label: 'All inventory', value: 'all' },
  { label: 'Needs attention', value: 'attention' },
  { label: 'Recently updated', value: 'recent' },
];

export const QUICK_ACTION_LINKS = [
  { label: 'New purchase order line', path: '/app/inventory?new=true', icon: Truck },
  { label: 'Manage suppliers', path: '/app/suppliers', icon: Users },
  { label: 'Review alerts', path: '/app/notifications', icon: BellRing },
];
