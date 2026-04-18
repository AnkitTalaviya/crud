import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '@/services/supplier.service';

export function useSuppliers() {
  const { user, workspaceId } = useAuth();
  const queryClient = useQueryClient();
  const context = user?.uid && workspaceId ? { userId: user.uid, workspaceId } : null;

  const suppliersQuery = useQuery({
    queryKey: ['suppliers', workspaceId],
    queryFn: () => getSuppliers(context),
    enabled: Boolean(context),
  });

  const createMutation = useMutation({
    mutationFn: (values) => createSupplier(context, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers', workspaceId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ supplierId, values }) => updateSupplier(context, supplierId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers', workspaceId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers', workspaceId] }),
  });

  return {
    suppliers: suppliersQuery.data ?? [],
    isLoading: suppliersQuery.isLoading,
    isError: suppliersQuery.isError,
    refetch: suppliersQuery.refetch,
    createSupplier: createMutation.mutateAsync,
    updateSupplier: updateMutation.mutateAsync,
    deleteSupplier: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
