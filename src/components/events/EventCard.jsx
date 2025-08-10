import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { motion } from 'framer-motion';

export default function EventCard({ event }) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const isPastEvent = endDate ? new Date() > endDate : new Date() > startDate;

  // Funções para formatar data e hora
  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "Data inválida";
    }
  };

  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      console.error("Erro ao formatar hora:", e);
      return "";
    }
  };

  const formatDateTimeRange = () => {
    const startDay = formatDate(startDate);
    const startTime = formatTime(startDate);
    
    if (!endDate || isNaN(endDate)) {
      return `${startDay} • ${startTime}`;
    }

    const endDay = formatDate(endDate);
    const endTime = formatTime(endDate);

    if (startDay === endDay) {
      return `${startDay} • ${startTime} - ${endTime}`;
    } else {
      return `${startDay} • ${startTime} → ${endDay} • ${endTime}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
        isPastEvent ? 'opacity-80' : ''
      }`}
    >
      <Link to={`/events/${event.eventId}`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <img
            src={event.imageUrl || '/images/thumbnail-placeholder.svg'}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.src = '/images/thumbnail-placeholder.svg';
            }}
          />
          
          {/* Overlay de data */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="text-white font-semibold text-sm flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDateTimeRange()}
            </div>
          </div>
          
          {isPastEvent && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                Evento Encerrado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3 gap-2">
          <Link 
            to={`/events/${event.eventId}`}
            className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
          >
            {event.title}
          </Link>
          
          {Number(event.price) > 0 ? (
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap ml-2">
              {formatPrice(event.price)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded whitespace-nowrap">
              GRATUITO
            </span>
          )}
        </div>

        <div className="flex items-start text-gray-600 dark:text-gray-400 text-sm mb-4 gap-2">
          {event.isOnline ? (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 mr-2 relative">
                <div className="absolute inset-1 rounded-full bg-green-300 animate-ping"></div>
              </div>
              <span>Evento Online</span>
              {event.meetingUrl && (
                <span className="ml-2 text-xs opacity-70 truncate max-w-[120px]">
                  {event.meetingUrl.replace(/^https?:\/\//, '')}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
              <span>{event.location || 'Local a definir'}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div 
            className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: event.description }} 
          />
        )}

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>
              {event.registeredCount || 0} participante{event.registeredCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Link 
            to={`/events/${event.eventId}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            {isPastEvent ? 'Ver Detalhes' : 'Participar'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}