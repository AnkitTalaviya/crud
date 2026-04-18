import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LoaderScreen } from '@/components/common/LoaderScreen';
import { useAuth } from '@/context/AuthContext';
import { logoutCurrentUser } from '@/services/auth.service';
import { isAllowedRole } from '@/utils/access';

function AccessMessage({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="page-shell subtle-grid flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel flex w-full max-w-xl flex-col items-center gap-5 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const navigate = useNavigate();
  const { sessionReady, isAuthenticated, isActiveMember, profileError, role, accountRequest } = useAuth();
  const location = useLocation();

  if (!sessionReady) {
    return <LoaderScreen label="Loading your account..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (profileError) {
    return (
      <AccessMessage
        icon={AlertTriangle}
        title="Your workspace profile could not be loaded"
        description={profileError}
        actionLabel="Back to sign in"
        onAction={async () => {
          await logoutCurrentUser();
          navigate('/login', { replace: true });
        }}
      />
    );
  }

  if (accountRequest?.status === 'pending') {
    return (
      <AccessMessage
        icon={AlertTriangle}
        title="Your access request is waiting for approval"
        description={`Your request for ${accountRequest.requestedRole} access in workspace ${accountRequest.workspaceId} has been submitted. A higher-level approver needs to review it before you can enter the app.`}
        actionLabel="Sign out"
        onAction={async () => {
          await logoutCurrentUser();
          navigate('/login', { replace: true });
        }}
      />
    );
  }

  if (accountRequest?.status === 'rejected') {
    return (
      <AccessMessage
        icon={ShieldAlert}
        title="Your access request was not approved"
        description={accountRequest.reviewNote || 'A higher-level approver rejected this account request. Contact your workspace admin if you need another review.'}
        actionLabel="Sign out"
        onAction={async () => {
          await logoutCurrentUser();
          navigate('/login', { replace: true });
        }}
      />
    );
  }

  if (!isActiveMember) {
    return (
      <AccessMessage
        icon={ShieldAlert}
        title="This workspace access is currently paused"
        description="An administrator has suspended this account's workspace access. Sign out or contact your workspace admin to reactivate it."
        actionLabel="Sign out"
        onAction={async () => {
          await logoutCurrentUser();
          navigate('/login', { replace: true });
        }}
      />
    );
  }

  if (!isAllowedRole(role, allowedRoles)) {
    return (
      <AccessMessage
        icon={ShieldAlert}
        title="You do not have access to this section"
        description="This area is reserved for a different workspace role. If you need it, ask an admin to update your access."
        actionLabel="Go to dashboard"
        onAction={() => navigate('/app/dashboard', { replace: true })}
      />
    );
  }

  return children;
}
