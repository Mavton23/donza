import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { CONTENT_TYPES } from '@/constants/contentTypes';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const processPayment = async (contentType, contentId, paymentData) => {
    setLoading(true);
    setError(null);

    try {
      if (!Object.values(CONTENT_TYPES).includes(contentType)) {
        throw new Error('Tipo de conteúdo não suportado');
      }

      const response = await api.post('/payments/process-payment', {
        contentType,
        contentId,
        ...paymentData
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error?.message || 
                         'Erro ao processar pagamento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethods = async () => {
    try {
      const response = await api.get(`/payments/${user.userId}/methods`);
      return response.data.data.paymentMethods || [];
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      return [];
    }
  };

  const getContentAccessUrl = (contentType, content) => {
    const routes = {
      [CONTENT_TYPES.COURSE]: `/learn/${content.slug || content.courseId}`,
      [CONTENT_TYPES.EVENT]: `/events/${content.eventId}`,
      [CONTENT_TYPES.LESSON]: `/lessons/${content.lessonId}`,
      [CONTENT_TYPES.BUNDLE]: `/bundles/${content.bundleId}`
    };
    
    return routes[contentType] || '/';
  };

  const getContentTypeLabel = (contentType) => {
    const labels = {
      [CONTENT_TYPES.COURSE]: 'Curso',
      [CONTENT_TYPES.EVENT]: 'Evento',
      [CONTENT_TYPES.LESSON]: 'Aula',
      [CONTENT_TYPES.BUNDLE]: 'Pacote'
    };
    
    return labels[contentType] || 'Conteúdo';
  };

  return {
    processPayment,
    getPaymentMethods,
    getContentAccessUrl,
    getContentTypeLabel,
    loading,
    error,
    clearError: () => setError(null)
  };
};