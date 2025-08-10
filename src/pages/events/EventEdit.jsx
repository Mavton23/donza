import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import EventForm from '../../components/events/EventForm';
import FormStepper from '../../components/common/FormStepper';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

const steps = [
  'Informações Básicas',
  'Detalhes do Evento',
  'Configurações Adicionais'
];

export default function EventEdit() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: null,
    location: '',
    isOnline: false,
    meetingUrl: '',
    maxParticipants: null,
    price: 0,
    status: 'scheduled'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carrega os dados do evento
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${eventId}`);
        
        // Verifica se o usuário é o organizador
        if (response.data.organizer.userId !== user.userId) {
          navigate('/unauthorized', { replace: true });
          return;
        }

        // Formata os dados recebidos
        const event = response.data;
        setEventData({
          title: event.title,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          location: event.location,
          isOnline: event.isOnline,
          meetingUrl: event.meetingUrl,
          maxParticipants: event.maxParticipants,
          price: parseFloat(event.price),
          status: event.status
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar evento');
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user, navigate]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const payload = {
        ...eventData,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate ? eventData.endDate.toISOString() : null
      };

      await api.put(`/events/${eventId}`, payload);

      setSuccess('Evento atualizado com sucesso!');
      setTimeout(() => navigate(`/events/${eventId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  if (loading && !eventData.title) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Evento
          </h2>
        </div>

        <FormStepper 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
        />

        <div className="p-6">
          {error && (
            toast.error(error)
          )}

          {success && (
            toast.success(success)
          )}

          {loading ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            <EventForm
              step={currentStep}
              eventData={eventData}
              setEventData={setEventData}
              isEditMode={true}
            />
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Voltar
            </button>
            <div className="space-x-3">
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {currentStep === steps.length - 1 ? 'Salvar Alterações' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}