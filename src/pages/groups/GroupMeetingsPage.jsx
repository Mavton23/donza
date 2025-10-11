import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import ScheduleMeetingModal from '@/components/community/ScheduleMeetingModal';

export default function GroupMeetingsPage() {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  
  const [meetings, setMeetings] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  usePageTitle();

  // Buscar dados do grupo e reuniões
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [groupRes, meetingsRes, membershipRes] = await Promise.all([
          api.get(`/groups/${communityId}/groups/${groupId}`),
          api.get(`/groups/${groupId}/meetings`),
          api.get(`/groups/groups/${groupId}/membership`)
        ]);

        setGroup(groupRes.data.data);
        setMeetings(meetingsRes.data);
        setUserRole(membershipRes.data.role);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar reuniões');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, groupId]);

  const toggleExpand = (meetingId) => {
    setExpandedMeeting(expandedMeeting === meetingId ? null : meetingId);
  };

  const formatMeetingDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Hoje';
    }
    if (isTomorrow(date)) {
      return 'Amanhã';
    }
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const formatMeetingTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm');
  };

  const handleScheduleMeeting = async (meetingData) => {
    try {
      const response = await api.post(
        `/groups/study-groups/${groupId}/meetings`, 
        meetingData
      );
      
      setMeetings(prev => [response.data, ...prev]);
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Erro ao agendar reunião:', err);
      setError(err.response?.data?.message || 'Falha ao agendar reunião');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const canSchedule = ['leader', 'co-leader'].includes(userRole);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reuniões do Grupo
        </h1>
        {canSchedule && (
          <Button 
            variant="primary"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2"
          >
            <FiPlus size={16} />
            Nova Reunião
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {meetings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Nenhuma reunião agendada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {canSchedule 
                ? 'Comece agendando a primeira reunião do grupo' 
                : 'Aguardando o líder agendar reuniões'}
            </p>
            {canSchedule && (
              <Button 
                variant="primary"
                onClick={() => setShowScheduleModal(true)}
              >
                <FiPlus className="mr-2" size={16} />
                Agendar Reunião
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {meetings.map((meeting) => (
              <li key={meeting.meetingId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <button
                  onClick={() => toggleExpand(meeting.meetingId)}
                  className="w-full px-4 py-4 text-left flex items-center justify-between focus:outline-none"
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 mr-3 mt-0.5">
                      <FiCalendar size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-left">
                        {meeting.title || 'Reunião do Grupo'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <FiClock className="mr-1.5" size={14} />
                        {formatMeetingDate(meeting.startTime)}, {formatMeetingTime(meeting.startTime)} - {formatMeetingTime(meeting.endTime)}
                      </p>
                    </div>
                  </div>
                  <FiChevronRight 
                    className={`text-gray-400 transition-transform ${
                      expandedMeeting === meeting.meetingId ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedMeeting === meeting.meetingId && (
                  <div className="px-4 pb-4 ml-14">
                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {meeting.description}
                      </p>
                    )}
                    
                    {meeting.location && (
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={meeting.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                        >
                          <FiMapPin className="mr-1.5" size={14} />
                          {meeting.location.includes('http') ? 'Participar da Reunião' : meeting.location}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showScheduleModal && group && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleMeeting}
          defaultSchedule={group.meetingSchedule}
        />
      )}
    </div>
  );
};