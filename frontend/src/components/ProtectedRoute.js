// frontend/src/components/ProtectedRoute.js

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ← Capital A, capital C

const ProtectedRoute = ({ children, role, roles = [], redirectTo = '/login' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;