
import { useSecureAuth } from './useSecureAuth';

// Re-export the secure auth hook as useAuth for compatibility
export const useAuth = useSecureAuth;

// Create a simple AuthProvider that uses the secure auth
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
