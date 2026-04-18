import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, UserCog, UserPlus, Users2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SelectField, TextInput } from '@/components/common/Field';
import { SkeletonBlock } from '@/components/common/SkeletonBlock';
import { useAuth } from '@/context/AuthContext';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { MEMBER_STATUS_OPTIONS, ROLE_OPTIONS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import { workspaceInviteSchema } from '@/utils/schemas';

function LoadingState() {
  return (
    <div className="space-y-5">
      <SkeletonBlock className="h-[220px] w-full rounded-[30px]" />
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonBlock className="h-[320px] w-full rounded-[30px]" />
        <SkeletonBlock className="h-[320px] w-full rounded-[30px]" />
      </div>
    </div>
  );
}

function getRoleTone(role) {
  if (role === 'admin') {
    return 'accent';
  }

  if (role === 'manager') {
    return 'warning';
  }

  return 'neutral';
}

export function TeamPage() {
  const { user } = useAuth();
  const [memberActionId, setMemberActionId] = useState('');
  const [inviteActionId, setInviteActionId] = useState('');
  const {
    workspace,
    members,
    invites,
    isLoading,
    isError,
    refetch,
    createInvite,
    revokeInvite,
    updateMemberRole,
    updateMemberStatus,
    isCreatingInvite,
  } = useWorkspaceMembers();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workspaceInviteSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load workspace access"
        description="Team roles and invitations are unavailable right now. Try again in a moment."
        onRetry={refetch}
      />
    );
  }

  const ownerUserId = workspace?.ownerUserId;
  const activeMembers = members.filter((member) => member.status !== 'inactive');
  const adminCount = activeMembers.filter((member) => member.role === 'admin').length;

  const handleInvite = async (values) => {
    try {
      await createInvite(values);
      toast.success(`Invitation saved for ${values.email.toLowerCase()}`);
      reset({
        email: '',
        role: values.role,
      });
    } catch (error) {
      toast.error(error.message || 'Could not create the invitation');
    }
  };

  const handleRoleChange = async (member, nextRole) => {
    if (member.role === nextRole) {
      return;
    }

    try {
      setMemberActionId(`role-${member.id}`);
      await updateMemberRole({ memberUserId: member.id, role: nextRole });
      toast.success(`Updated ${member.displayName}'s role`);
    } catch (error) {
      toast.error(error.message || 'Could not update the role');
    } finally {
      setMemberActionId('');
    }
  };

  const handleStatusChange = async (member, nextStatus) => {
    if (member.status === nextStatus) {
      return;
    }

    try {
      setMemberActionId(`status-${member.id}`);
      await updateMemberStatus({ memberUserId: member.id, status: nextStatus });
      toast.success(nextStatus === 'active' ? `Reactivated ${member.displayName}` : `Paused ${member.displayName}'s access`);
    } catch (error) {
      toast.error(error.message || 'Could not update access');
    } finally {
      setMemberActionId('');
    }
  };

  const handleRevokeInvite = async (email) => {
    try {
      setInviteActionId(email);
      await revokeInvite(email);
      toast.success(`Removed the invite for ${email}`);
    } catch (error) {
      toast.error(error.message || 'Could not revoke the invite');
    } finally {
      setInviteActionId('');
    }
  };

  return (
    <div className="space-y-5">
      <section className="surface-panel p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Role-based access</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Control who can view, operate, and administer this workspace</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Invite teammates by email, assign their operational role, and suspend access without changing the inventory data underneath.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Workspace members', value: members.length },
              { label: 'Active admins', value: adminCount },
              { label: 'Pending invites', value: invites.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[1.06fr_0.94fr]">
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Member directory</p>
              <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{workspace?.name || 'Workspace team'}</h3>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {members.map((member) => {
              const isOwner = member.userId === ownerUserId;
              const isCurrentUser = member.userId === user?.uid;
              const roleActionLoading = memberActionId === `role-${member.id}`;
              const statusActionLoading = memberActionId === `status-${member.id}`;

              return (
                <div key={member.id} className="rounded-[28px] border border-[color:rgb(var(--border))] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-display text-lg font-semibold tracking-tight">{member.displayName}</h4>
                        <Badge tone={getRoleTone(member.role)}>{ROLE_OPTIONS.find((option) => option.value === member.role)?.label || member.role}</Badge>
                        <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>
                          {MEMBER_STATUS_OPTIONS.find((option) => option.value === member.status)?.label || member.status}
                        </Badge>
                        {isOwner && <Badge tone="accent">Workspace owner</Badge>}
                        {isCurrentUser && <Badge tone="neutral">You</Badge>}
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        Joined {formatDateTime(member.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                      {ROLE_OPTIONS.find((option) => option.value === member.role)?.description}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <SelectField
                      label="Role"
                      value={member.role}
                      disabled={isOwner || roleActionLoading}
                      onChange={(event) => handleRoleChange(member, event.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Access status"
                      value={member.status}
                      disabled={isOwner || statusActionLoading}
                      onChange={(event) => handleStatusChange(member, event.target.value)}
                    >
                      {MEMBER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Invite teammate</p>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Grant access by email</h3>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit(handleInvite)}>
              <TextInput label="Email address" placeholder="ops@company.com" error={errors.email?.message} {...register('email')} />
              <SelectField label="Assigned role" error={errors.role?.message} {...register('role')}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                When the invited teammate signs in with this email for the first time, they will join this workspace automatically.
              </p>
              <Button type="submit" loading={isCreatingInvite}>
                Save invite
              </Button>
            </form>
          </section>

          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending invitations</p>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Access waiting to be accepted</h3>
              </div>
            </div>

            {!invites.length ? (
              <EmptyState
                icon={UserCog}
                title="No pending invites"
                description="New invitations will appear here until each teammate signs in and accepts their access."
              />
            ) : (
              <div className="mt-5 space-y-3">
                {invites.map((invite) => (
                  <div key={invite.id} className="rounded-[28px] border border-[color:rgb(var(--border))] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{invite.email}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Invited as {ROLE_OPTIONS.find((option) => option.value === invite.role)?.label || invite.role}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          Updated {formatDateTime(invite.updatedAt || invite.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-600"
                        loading={inviteActionId === invite.email}
                        onClick={() => handleRevokeInvite(invite.email)}
                      >
                        Remove invite
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
