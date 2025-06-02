
import { Navigate } from 'react-router-dom';

export default function SecurityPage() {
  // For now, redirect to main page
  return <Navigate to="/" replace />;
}
