import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ParticipantList from './ParticipantList';

export default function EventParticipants({ eventId, isOrganizer }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${eventId}/participants`);
        setParticipants(response.data);
      } catch (err) {
        setError('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Participantes ({participants.length})
          </h2>
          {isOrganizer && (
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Exportar Lista
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ParticipantList 
          participants={participants}
          isOrganizer={isOrganizer}
        />
      </div>
    </div>
  );
}