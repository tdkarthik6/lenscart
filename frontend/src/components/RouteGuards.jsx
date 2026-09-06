import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function OwnerRoute({ children }) {
  const { isLoggedIn, isOwner, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/owner/login" state={{ from: location }} replace />;
  if (!isOwner)   return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { isLoggedIn, isOwner, loading } = useAuth();

  if (loading) return null;
  if (isLoggedIn) {
    return <Navigate to={isOwner ? '/owner/dashboard' : '/my-bookings'} replace />;
  }
  return children;
}
