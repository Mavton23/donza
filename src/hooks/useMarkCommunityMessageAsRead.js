import { useCallback } from 'react';
import api from '@/services/api';

export default function useMarkCommunityMessageAsRead(communityId) {
    return useCallback(async (messageId = null) => {
        try {
            const payload = messageId ? { messageId } : {};
            await api.post(`/communitychat/${communityId}/read`, payload);
            
            console.log(`Mensagem ${messageId || 'todas'} marcada como lida`);
            return true;
        } catch (error) {
            console.error('Erro ao marcar mensagem como lida via API:', error);
            return false;
        }
    }, [communityId]);
}
