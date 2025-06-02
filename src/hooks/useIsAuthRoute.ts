
import { useLocation } from 'react-router-dom';

export const useIsAuthRoute = () => {
  const location = useLocation();
  
  const authRoutes = ['/auth', '/login', '/register', '/forgot-password'];
  
  return authRoutes.includes(location.pathname);
};
