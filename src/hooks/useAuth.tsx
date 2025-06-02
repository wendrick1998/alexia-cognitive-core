
import { usePWAAuth } from './usePWAAuth';

// Re-export the PWA-optimized auth hook for Safari compatibility
export const useAuth = usePWAAuth;

// Create a simple AuthProvider that uses the PWA auth
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
