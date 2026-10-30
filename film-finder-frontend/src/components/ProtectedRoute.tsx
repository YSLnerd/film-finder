import { Navigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}
//Если пользователь не залогинился, отправляем на страницу авторизации
export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  //Если клиент не админ, отправляем на страницу главную
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}