import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EventHeader from '@/components/events/EventHeader';
import EventDetails from '@/components/events/EventDetails';
import EventParticipants from '@/components/events/EventParticipants';
import RegisterButton from '@/components/events/RegisterButton';
import EventTabs from '@/components/events/EventTabs';
import { User, Mail, Phone, BookUser, School, Info, Globe, MapPin, Copy, Check } from 'lucide-react';

export default function EventDetail() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(event.meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
        
        if (user) {
          const registrationRes = await api.get(`/events/${eventId}/event-registration/${user.userId}`);
          setIsRegistered(registrationRes.data.isRegistered);
        }
      } catch (err) {
        setError('Falha ao carregar detalhes do evento');
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user, navigate]);

  const handleRegistrationChange = (registered) => {
    setIsRegistered(registered);
  };

  if (loading || !event) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <EventHeader event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:flex-1">
            <EventTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOrganizer={user?.userId === event.organizer?.userId}
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {activeTab === 'details' && (
              <EventDetails event={event} />
            )}

            {activeTab === 'participants' && user.userId === event.organizer.userId && (
              <EventParticipants 
                eventId={eventId}
                isOrganizer={user?.userId === event.organizer.userId}
              />
            )}

            {activeTab === 'organizer' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="p-2 mr-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Informações do Organizador
                  </h3>
                </div>
                
                <div className="flex items-center space-x-4 mb-8 group">
                  <div className="flex-shrink-0 relative">
                    {event.organizer.avatarUrl ? (
                      <img 
                        className="h-16 w-16 rounded-full border-2 border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-400 transition-all duration-300" 
                        src={event.organizer.avatarUrl} 
                        alt="Avatar do organizador"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-300 dark:from-indigo-900 dark:to-indigo-700 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-200 border-2 border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-400 transition-all duration-300">
                        {event.organizer.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <User className="w-4 h-4 mr-2 text-indigo-500" />
                      {event.organizer.username}
                    </h4>
                    {event.organizer.institutionName && (
                      <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                        <School className="w-4 h-4 mr-2 text-indigo-500" />
                        {event.organizer.institutionName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <BookUser className="w-5 h-5 mr-2 text-indigo-500" />
                      Sobre o organizador
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 pl-7">
                      {event.organizer.bio || (
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                          <Info className="w-4 h-4 mr-2" />
                          Este organizador ainda não adicionou uma biografia.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                      Contato
                    </h4>
                    <div className="space-y-2 pl-7">
                      <p className="text-gray-600 dark:text-gray-300 flex items-center">
                        {event.organizer?.email || (
                          <span className="text-gray-500 dark:text-gray-400 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Nenhum email disponível
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center">
                        {event.organizer?.contactPhone || (
                          <span className="text-gray-500 dark:text-gray-400 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Nenhum telefone disponível
                          </span>
                        )}
                      </p>
                      {event.organizer?.contactPhone && (
                        <a 
                          href={`tel:${event.organizer.contactPhone}`}
                          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Ligar para o organizador
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra Lateral */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resumo do Evento
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Data</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(event.startDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Horário</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Local</span>
                  <span className="text-gray-900 dark:text-white">
                    {event.isOnline ? event.meetingUrl : event.location}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    {event.isOnline ? (
                      <Globe className="h-5 w-5 text-indigo-500 mr-2" />
                    ) : (
                      <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">Local</span>
                  </div>
                  
                  {event.isOnline ? (
                    <div className="flex items-center group">
                      <a 
                        href={event.meetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center"
                      >
                        {event.meetingUrl.replace(/^https?:\/\//, '')}
                      </a>
                      <button 
                        onClick={copyToClipboard}
                        className="ml-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Copiar link"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">
                      {event.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <RegisterButton
                  eventId={event.eventId}
                  isRegistered={isRegistered}
                  meetingUrl={event.meetingUrl}
                  isOnline={event.isOnline}
                  maxParticipants={event.maxParticipants}
                  participantsCount={event.participants.length}
                  onRegistrationChange={handleRegistrationChange}
                  organizerId={event.organizer?.userId}
                />
              </div>
            </div>

            {user?.userId === event.organizer?.userId && (
              <Link
                to={`/events/${eventId}/edit`}
                className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Gerenciar Evento
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}