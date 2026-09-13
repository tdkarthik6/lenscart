import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Not used for customers anymore - kept only for owner routes
export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  // Redirect to owner login if not logged in (only owner routes use this)
  if (!isLoggedIn) return <Navigate to="/owner/login" state={{ from: location }} replace />;
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
  // If already logged in as owner → go to dashboard
  if (isLoggedIn && isOwner) return <Navigate to="/owner/dashboard" replace />;
  // If logged in as anything else → just go home (no /my-bookings anymore)
  if (isLoggedIn) return <Navigate to="/" replace />;
  return children;
}
