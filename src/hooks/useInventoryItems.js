import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  seedStarterInventory,
  updateInventoryItem,
} from '@/services/inventory.service';

export function useInventoryItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ['inventory', user?.uid],
    queryFn: () => getInventoryItems(user.uid),
    enabled: Boolean(user?.uid),
  });

  const createMutation = useMutation({
    mutationFn: (values) => createInventoryItem(user.uid, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', user?.uid] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, values }) => updateInventoryItem(user.uid, itemId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', user?.uid] }),
  });

  const seedMutation = useMutation({
    mutationFn: () => seedStarterInventory(user.uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', user?.uid] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', user?.uid] }),
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
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSeeding: seedMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: inventoryQuery.refetch,
  };
}
