import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRequireGroupMembership({
  isMember,
  loading,
  redirectTo,
  enabled = true,
  delay = 3000 // 3 segundos
}) {
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!enabled || loading) return;

    if (!isMember) {
      setShouldRedirect(true);
      const timer = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isMember, loading, redirectTo, navigate, enabled, delay]);

  return { shouldRedirect };
}
