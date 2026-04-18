import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getInventoryTransactions } from '@/services/inventory.service';

export function useInventoryTransactions() {
  const { user, workspaceId } = useAuth();
  const context = user?.uid && workspaceId ? { userId: user.uid, workspaceId } : null;

  const transactionsQuery = useQuery({
    queryKey: ['transactions', workspaceId],
    queryFn: () => getInventoryTransactions(context),
    enabled: Boolean(context),
  });

  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    refetch: transactionsQuery.refetch,
  };
}
