import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RoleBasedRedirect = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser) {
      const from = location.state?.from?.pathname;
      
      if (from && !hasPermission(currentUser.role, from)) {
        navigate(getDefaultRoute(currentUser.role), { replace: true });
        return;
      }

      if (!currentUser.isVerified) {
        navigate('/verify-email', { state: { from: location } });
      } else if (currentUser.role !== 'institution' && !currentUser.profileCompleted) {
        navigate('/complete-profile', { state: { from: location } });
      } else {
        navigate(from || getDefaultRoute(currentUser.role), { replace: true });
      }
    }
  }, [currentUser, loading, navigate, location]);

  if (loading) return <LoadingSpinner fullScreen />;

  return null;
};

const hasPermission = (role, path) => {
  if (path.startsWith('/admin') && role !== 'admin') return false;
  if (path.startsWith('/instructor') && !['instructor', 'admin'].includes(role)) return false;
  if (path.startsWith('/institution') && role !== 'institution') return false;
  return true;
};

export const getDefaultRoute = (role) => {
  switch(role) {
    case 'student': return '/my-courses';
    case 'instructor': return '/instructor/courses';
    case 'admin': return '/admin/dashboard';
    case 'institution': return '/institution/management';
    default: return '/dashboard';
  }
};

export default RoleBasedRedirect;