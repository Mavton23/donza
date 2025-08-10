import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ContextSelector from '../../components/messaging/ContextSelector';
import { MessagesSquare } from 'lucide-react';

export default function NewConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContextSelector, setShowContextSelector] = useState(true);

  const handleCreateConversation = async (context) => {
    try {
      setLoading(true);
      
      let endpoint = '/conversation/conversations';
      let payload = {
        participants: [context.recipientId],
        contextType: context.type,
        initialMessage: context.message
      };

      if (context.type === 'course') {
        payload.contextId = context.id;
      }

      const response = await api.post(endpoint, payload);
      
      navigate(`/messages/${response.data.data.conversationId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create conversation');
      setShowContextSelector(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Start New Conversation
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      {showContextSelector ? (
        <ContextSelector
          onSubmit={handleCreateConversation}
          onClose={() => navigate('/messages')}
          user={user}
        />
      ) : (
        <EmptyState
          title="Select conversation type"
          description="Choose how you want to start this conversation"
          icon={MessagesSquare}
          action={{
            text: 'Back to selection',
            onClick: () => setShowContextSelector(true)
          }}
        />
      )}
    </div>
  );
}