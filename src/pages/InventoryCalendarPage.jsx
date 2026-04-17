import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { Boxes, CalendarDays, CheckCircle2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { InventoryDetailModal } from '@/components/inventory/InventoryDetailModal';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { formatDateOnly } from '@/utils/formatters';
import { buildInventoryCalendarEvents } from '@/utils/inventory';

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32 w-full rounded-[30px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SkeletonBlock className="h-[640px] w-full rounded-[30px]" />
        <div className="grid gap-6">
          <SkeletonBlock className="h-[300px] w-full rounded-[30px]" />
          <SkeletonBlock className="h-[300px] w-full rounded-[30px]" />
        </div>
      </div>
    </div>
  );
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildUpcomingReceipts(items, todayKey) {
  return [...items]
    .filter((item) => item.expectedOn && !item.receivedOn && item.expectedOn >= todayKey)
    .sort((left, right) => left.expectedOn.localeCompare(right.expectedOn))
    .slice(0, 5);
}

function buildRecentReceipts(items) {
  return [...items]
    .filter((item) => item.receivedOn)
    .sort((left, right) => right.receivedOn.localeCompare(left.receivedOn))
    .slice(0, 5);
}

function renderEventContent(eventInfo) {
  return (
    <div className="px-1 py-0.5">
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{eventInfo.event.extendedProps.milestoneLabel}</p>
      <p className="truncate text-xs font-semibold">{eventInfo.event.title}</p>
    </div>
  );
}

export function InventoryCalendarPage() {
  const navigate = useNavigate();
  const { items, isLoading, isError, refetch } = useInventoryItems();
  const [selectedItem, setSelectedItem] = useState(null);

  const scheduledItems = useMemo(() => items.filter((item) => item.orderedOn || item.expectedOn || item.receivedOn), [items]);
  const calendarEvents = useMemo(() => buildInventoryCalendarEvents(items), [items]);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const nextWeekKey = useMemo(() => getDateKey(addDays(today, 7)), [today]);

  const upcomingReceipts = useMemo(() => buildUpcomingReceipts(scheduledItems, todayKey), [scheduledItems, todayKey]);
  const recentReceipts = useMemo(() => buildRecentReceipts(scheduledItems), [scheduledItems]);

  const scheduleMetrics = useMemo(
    () => ({
      scheduledItems: scheduledItems.length,
      dueThisWeek: scheduledItems.filter((item) => item.expectedOn && !item.receivedOn && item.expectedOn >= todayKey && item.expectedOn <= nextWeekKey).length,
      receivedThisMonth: scheduledItems.filter((item) => item.receivedOn?.startsWith(todayKey.slice(0, 7))).length,
    }),
    [nextWeekKey, scheduledItems, todayKey],
  );

  const handleEventClick = ({ event }) => {
    const selectedRecord = items.find((item) => item.id === event.extendedProps.itemId);

    if (selectedRecord) {
      setSelectedItem(selectedRecord);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState title="Could not load the inventory calendar" description="The schedule view could not be loaded. Please try again." onRetry={refetch} />;
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No inventory records yet"
        description="Create inventory items first, then add order and receipt dates to populate the calendar."
        actionLabel="Add inventory"
        onAction={() => navigate('/app/inventory?new=true')}
      />
    );
  }

  if (!calendarEvents.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No schedule dates yet"
        description="Add ordered, expected, or received dates to your inventory records to display them on the calendar."
        actionLabel="Update inventory"
        onAction={() => navigate('/app/inventory')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
            <CalendarDays className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Scheduled items</p>
          <p className="mt-1 text-3xl font-semibold">{scheduleMetrics.scheduledItems}</p>
        </div>
        <div className="surface-panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600 dark:text-amber-300">
            <Truck className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Due in 7 days</p>
          <p className="mt-1 text-3xl font-semibold">{scheduleMetrics.dueThisWeek}</p>
        </div>
        <div className="surface-panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Received this month</p>
          <p className="mt-1 text-3xl font-semibold">{scheduleMetrics.receivedThisMonth}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="surface-panel p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:rgb(var(--border))] pb-5">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inbound schedule</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Orders, expected receipts, and completed deliveries</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Use the calendar to track when items were ordered, when they are expected, and when they were received.
              </p>
            </div>
            <Button onClick={() => navigate('/app/inventory?new=true')}>Add inventory</Button>
          </div>

          <div className="inventory-calendar mt-5">
            <FullCalendar
              plugins={[dayGridPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listMonth',
              }}
              buttonText={{
                today: 'Today',
                dayGridMonth: 'Month',
                listMonth: 'Agenda',
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              dayMaxEventRows={3}
              fixedWeekCount={false}
              eventDisplay="block"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming receipts</p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Next arrivals</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600 dark:text-amber-300">
                <Truck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {upcomingReceipts.length ? (
                upcomingReceipts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="ring-focus flex w-full items-center justify-between gap-4 rounded-3xl border border-[color:rgb(var(--border))] px-4 py-4 text-left transition hover:border-amber-500/25 hover:bg-amber-500/5"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.sku} / {item.supplier}
                      </p>
                    </div>
                    <Badge tone="warning">{formatDateOnly(item.expectedOn)}</Badge>
                  </button>
                ))
              ) : (
                <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  No upcoming receipts are scheduled right now.
                </p>
              )}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent receipts</p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Completed deliveries</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                <Boxes className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentReceipts.length ? (
                recentReceipts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="ring-focus flex w-full items-center justify-between gap-4 rounded-3xl border border-[color:rgb(var(--border))] px-4 py-4 text-left transition hover:border-emerald-500/25 hover:bg-emerald-500/5"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.location} / {item.quantity} units
                      </p>
                    </div>
                    <Badge tone="success">{formatDateOnly(item.receivedOn)}</Badge>
                  </button>
                ))
              ) : (
                <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  Received items will appear here once you start recording delivery dates.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <InventoryDetailModal
        open={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => navigate(`/app/inventory?edit=${item.id}`)}
      />
    </div>
  );
}
