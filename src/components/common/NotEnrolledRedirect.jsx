import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotEnrolledRedirect({ slug }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/courses/${slug}`, { 
      replace: true,
      state: { fromEnrollmentCheck: true }
    });
  }, [navigate, slug]);

  return null;
}