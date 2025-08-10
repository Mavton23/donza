import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Award } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CertificateCard from '../../components/certificates/CertificateCard';
import api from '../../services/api';

export default function CertificatesPage() {
  const { currentUser } = useAuth();
  const notification = useNotification();
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!currentUser) {
        setState({
          data: [],
          loading: false,
          error: 'Usuário não autenticado'
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await api.get('/certificates');
        const data = parseApiResponse(response.data);
        
        setState({
          data,
          loading: false,
          error: null
        });
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        
        setState({
          data: [],
          loading: false,
          error: errorMessage
        });
        
        notification.error(errorMessage);
      }
    };

    fetchCertificates();
  }, [notification, currentUser]);

  const handleDownload = async (certificateId) => {
    if (!certificateId) {
      notification.error('ID de certificado inválido');
      return;
    }

    try {
      const { data } = await api.get(`/certificates/${certificateId}/download`);
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        notification.error('URL de download não disponível');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Falha ao baixar certificado';
      notification.error(errorMsg);
      console.error('Erro no download:', err);
    }
  };

  // Funções auxiliares
  const parseApiResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const getErrorMessage = (err) => {
    if (err.response) {
      if (err.response.status === 404) return 'Nenhum certificado encontrado';
      if (err.response.data?.error) return err.response.data.error;
    }
    return 'Falha ao carregar certificados';
  };

  // Renderização condicional
  if (state.loading) return <LoadingSpinner fullScreen />;
  
  if (state.error) {
    return (
      <EmptyState 
        title="Erro ao carregar certificados" 
        description={state.error}
        icon={Award}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Meus Certificados
        </h1>
      </div>

      <CertificateList 
        certificates={state.data} 
        onDownload={handleDownload} 
      />
    </div>
  );
}

// Componente auxiliar para renderização da lista
function CertificateList({ certificates, onDownload }) {
  if (certificates === null) {
    return (
      <EmptyState
        icon={Award}
        title="Carregando..."
        description="Buscando seus certificados"
      />
    );
  }

  if (!Array.isArray(certificates)) {
    return (
      <EmptyState
        icon={Award}
        title="Erro nos dados"
        description="Os certificados não estão no formato esperado"
      />
    );
  }

  if (certificates.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="Nenhum certificado ainda"
        description="Seus certificados conquistados aparecerão aqui quando você completar cursos ou eventos"
        actionText="Explorar Cursos"
        actionHref="/courses"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((certificate) => (
        <CertificateCard
          key={certificate.id || certificate._id}
          certificate={certificate}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}