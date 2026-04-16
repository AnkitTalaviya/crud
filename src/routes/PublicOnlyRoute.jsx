import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoaderScreen } from '@/components/common/LoaderScreen';

export function PublicOnlyRoute({ children }) {
  const { authReady, isAuthenticated } = useAuth();

  if (!authReady) {
    return <LoaderScreen label="Preparing the app..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}

