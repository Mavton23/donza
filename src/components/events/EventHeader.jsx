import { CalendarDays, MapPin } from 'lucide-react';

export default function EventHeader({ event }) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const isPastEvent = new Date() > endDate;
  
  // Função para traduzir o status do evento
  const translateStatus = (status) => {
    const statusMap = {
      'scheduled': 'Agendado',
      'ongoing': 'Em andamento',
      'completed': 'Concluído',
      'canceled': 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mb-2">
              {translateStatus(event.status)}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-1" />
                <span>
                  {startDate.toLocaleDateString('pt-BR')} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{event.isOnline ? 'Evento Online' : event.location}</span>
              </div>
              {isPastEvent && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Evento Encerrado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}