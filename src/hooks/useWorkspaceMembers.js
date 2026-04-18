import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  createWorkspaceInvite,
  deleteWorkspaceInvite,
  getWorkspace,
  getWorkspaceInvites,
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  updateWorkspaceMemberStatus,
} from '@/services/profile.service';

function invalidateWorkspaceAccess(queryClient, workspaceId) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['workspace-invites', workspaceId] }),
  ]);
}

export function useWorkspaceMembers() {
  const { workspaceId } = useAuth();
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const membersQuery = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const invitesQuery = useQuery({
    queryKey: ['workspace-invites', workspaceId],
    queryFn: () => getWorkspaceInvites(workspaceId),
    enabled: Boolean(workspaceId),
  });

  const inviteMutation = useMutation({
    mutationFn: (values) => createWorkspaceInvite(workspaceId, values),
    onSuccess: () => invalidateWorkspaceAccess(queryClient, workspaceId),
  });

  const revokeInviteMutation = useMutation({
    mutationFn: deleteWorkspaceInvite,
    onSuccess: () => invalidateWorkspaceAccess(queryClient, workspaceId),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberUserId, role }) => updateWorkspaceMemberRole(memberUserId, role),
    onSuccess: () => invalidateWorkspaceAccess(queryClient, workspaceId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ memberUserId, status }) => updateWorkspaceMemberStatus(memberUserId, status),
    onSuccess: () => invalidateWorkspaceAccess(queryClient, workspaceId),
  });

  return {
    workspace: workspaceQuery.data,
    members: membersQuery.data ?? [],
    invites: invitesQuery.data ?? [],
    isLoading: workspaceQuery.isLoading || membersQuery.isLoading || invitesQuery.isLoading,
    isError: workspaceQuery.isError || membersQuery.isError || invitesQuery.isError,
    refetch: async () => {
      await Promise.all([workspaceQuery.refetch(), membersQuery.refetch(), invitesQuery.refetch()]);
    },
    createInvite: inviteMutation.mutateAsync,
    revokeInvite: revokeInviteMutation.mutateAsync,
    updateMemberRole: updateRoleMutation.mutateAsync,
    updateMemberStatus: updateStatusMutation.mutateAsync,
    isCreatingInvite: inviteMutation.isPending,
    isRevokingInvite: revokeInviteMutation.isPending,
    isUpdatingMemberRole: updateRoleMutation.isPending,
    isUpdatingMemberStatus: updateStatusMutation.isPending,
  };
}
