import { BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { useAuth } from '@/context/AuthContext';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';
import { useInventoryItems } from '@/hooks/useInventoryItems';
import { ROLE_OPTIONS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import { canApproveRequestedRole } from '@/utils/access';

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-[150px] w-full rounded-[30px]" />
      ))}
    </div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { items, isLoading, isError, refetch } = useInventoryItems();
  const alerts = useInventoryAlerts(items);
  const {
    accessRequests,
    isLoading: isLoadingRequests,
    isError: isAccessRequestError,
    refetch: refetchRequests,
    reviewRequest,
    isReviewing,
  } = useAccessRequests();
  const visibleAccessRequests = accessRequests.filter((request) => canApproveRequestedRole(role, request.requestedRole));

  const handleReview = async (request, decision) => {
    try {
      await reviewRequest({ userId: request.userId, decision, note: '' });
      toast.success(decision === 'approved' ? `Approved ${request.fullName}'s request` : `Rejected ${request.fullName}'s request`);
    } catch (error) {
      toast.error(error.message || 'Could not review the access request');
    }
  };

  if (isLoading || isLoadingRequests) {
    return <LoadingState />;
  }

  if (isError || isAccessRequestError) {
    return (
      <ErrorState
        title="Could not load notifications"
        description="Inventory alerts or approval requests could not be calculated right now. Please try again."
        onRetry={async () => {
          await Promise.all([refetch(), refetchRequests()]);
        }}
      />
    );
  }

  if (!alerts.length && !visibleAccessRequests.length) {
    return (
      <EmptyState
        icon={BellRing}
        title="No active alerts"
        description="Low-stock warnings, overdue deliveries, incoming receipts, and signup approval requests will appear here automatically."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In-app reminders</p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Approvals, stock alerts, and incoming receipts</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Alerts update from live inventory data, while access requests appear for the next role up to approve or reject.
        </p>
      </section>

      {visibleAccessRequests.length > 0 && (
        <section className="space-y-3">
          {visibleAccessRequests.map((request) => (
            <div key={request.id} className="surface-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="accent">approval request</Badge>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{request.fullName} requested access</h3>
                </div>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {request.email} requested{' '}
                  {ROLE_OPTIONS.find((option) => option.value === request.requestedRole)?.label || request.requestedRole} access on{' '}
                  {formatDateTime(request.submittedAt)} for workspace {request.workspaceId}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" loading={isReviewing} onClick={() => handleReview(request, 'approved')}>
                  Approve
                </Button>
                <Button variant="ghost" className="text-rose-500 hover:text-rose-600" loading={isReviewing} onClick={() => handleReview(request, 'rejected')}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {alerts.length > 0 && (
        <section className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="surface-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={alert.tone}>{alert.type.replace('_', ' ')}</Badge>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{alert.title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{alert.description}</p>
              </div>
              <Button variant="secondary" onClick={() => navigate(`/app/inventory?focus=${alert.itemId}`)}>
                Open item
              </Button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
