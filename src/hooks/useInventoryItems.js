import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  applyInventoryTransaction,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  importInventoryItems,
  seedStarterInventory,
  updateInventoryItem,
} from '@/services/inventory.service';

function invalidateWorkspace(queryClient, userId) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['inventory', userId] }),
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] }),
    queryClient.invalidateQueries({ queryKey: ['suppliers', userId] }),
  ]);
}

export function useInventoryItems() {
  const { user, workspaceId } = useAuth();
  const queryClient = useQueryClient();
  const context = user?.uid && workspaceId ? { userId: user.uid, workspaceId } : null;

  const inventoryQuery = useQuery({
    queryKey: ['inventory', workspaceId],
    queryFn: () => getInventoryItems(context),
    enabled: Boolean(context),
  });

  const createMutation = useMutation({
    mutationFn: (values) => createInventoryItem(context, values),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, values }) => updateInventoryItem(context, itemId, values),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  const seedMutation = useMutation({
    mutationFn: () => seedStarterInventory(context),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId) => deleteInventoryItem(context, itemId),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  const importMutation = useMutation({
    mutationFn: (rows) => importInventoryItems(context, rows),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  const movementMutation = useMutation({
    mutationFn: ({ itemId, values }) => applyInventoryTransaction(context, itemId, values),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });

  return {
    items: inventoryQuery.data ?? [],
    isLoading: inventoryQuery.isLoading,
    isFetching: inventoryQuery.isFetching,
    isError: inventoryQuery.isError,
    error: inventoryQuery.error,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    seedItems: seedMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    importItems: importMutation.mutateAsync,
    applyTransaction: movementMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSeeding: seedMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
    isApplyingTransaction: movementMutation.isPending,
    refetch: inventoryQuery.refetch,
  };
}
