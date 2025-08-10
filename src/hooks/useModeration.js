import { useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

export function useModeration() {
  const [isLoading, setIsLoading] = useState(false);

  const resolveReports = async (reportIds, action) => {
    setIsLoading(true);
    try {
      await api.post('/moderation/reports/resolve', {
        reportIds,
        action
      });
      toast.success(`Reports ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} reports: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reviewAppeal = async (actionId, decision, notes) => {
    setIsLoading(true);
    try {
      await api.post(`/moderation/actions/${actionId}/appeal`, {
        decision,
        notes
      });
      toast.success(`Appeal ${decision} successfully`);
    } catch (error) {
      toast.error(`Failed to process appeal: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resolveReports,
    reviewAppeal
  };
}