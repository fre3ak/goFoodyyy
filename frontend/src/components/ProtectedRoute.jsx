import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredUserType }) {
    const { user, userType, loading } = useAuth();

    if (loading) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;