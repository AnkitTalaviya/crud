import { Navigate, useLocation } from 'react-router-dom';
import { LoaderScreen } from '@/components/common/LoaderScreen';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children }) {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <LoaderScreen label="Loading your account..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
