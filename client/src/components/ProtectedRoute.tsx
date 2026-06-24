import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // brief, avoids a login-page flash before session check resolves
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
