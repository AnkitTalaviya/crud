import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaceAccessRequests, reviewAccessRequest } from '@/services/profile.service';

function invalidateApprovalWorkspace(queryClient, workspaceId) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['access-requests', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] }),
  ]);
}

export function useAccessRequests() {
  const { workspaceId, role, canManageWorkspace } = useAuth();
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['access-requests', workspaceId, role],
    queryFn: () => getWorkspaceAccessRequests(workspaceId, role),
    enabled: Boolean(workspaceId && canManageWorkspace),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, decision, note }) => reviewAccessRequest(userId, decision, note),
    onSuccess: () => invalidateApprovalWorkspace(queryClient, workspaceId),
  });

  return {
    accessRequests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    refetch: requestsQuery.refetch,
    reviewRequest: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
  };
}
