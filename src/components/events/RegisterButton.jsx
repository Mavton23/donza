import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterButton({ 
  eventId, 
  isRegistered, 
  isOnline,
  meetingUrl,
  maxParticipants,
  participantsCount,
  onRegistrationChange,
  organizerId
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegistration = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      if (isRegistered) {
        await api.delete(`/events/${eventId}/register`);
        onRegistrationChange(false);
      } else {
        await api.post(`/events/${eventId}/register`);
        onRegistrationChange(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar inscrição');
    } finally {
      setLoading(false);
    }
  };

  const isEventFull = maxParticipants && participantsCount >= maxParticipants;
  const isOrganizer = user?.userId === organizerId;

  if (!user) {
    return (
      <Link
        to="/login"
        state={{ from: `/events/${eventId}` }}
        className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Faça login para se inscrever
      </Link>
    );
  }

  if (isOrganizer) {
    return (
      <Link
        to={`/events/${eventId}/edit`}
        className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        Gerenciar Evento
      </Link>
    );
  }

  if (isEventFull && !isRegistered) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-md cursor-not-allowed"
      >
        Evento lotado
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        onClick={handleRegistration}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-md font-medium ${
          isRegistered
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {loading ? (
          'Processando...'
        ) : isRegistered ? (
          'Inscrito - Ver detalhes'
        ) : (
          'Inscrever-se'
        )}
      </button>
      {isOnline && isRegistered && (
        <Link
          to={meetingUrl}
          className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Acessar link da reunião
        </Link>
      )}
    </div>
  );
}