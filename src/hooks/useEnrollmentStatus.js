import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function useEnrollmentStatus(courseId) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const checkEnrollment = async () => {
    if (!courseId || !user) return false;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${courseId}/enroll/${user.userId}`);
      setIsEnrolled(response.data.isEnrolled);
      return response.data.isEnrolled;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check enrollment');
      setIsEnrolled(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnrollment();
  }, [courseId, user]);

  return { isEnrolled, checkEnrollment, loading, error, setIsEnrolled };
}