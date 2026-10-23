import { Navigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}