import usePageTitle from "@/hooks/usePageTitle";
import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Mail,
  ArrowLeft,
  BookOpen,
  Calendar,
  Video,
  Package
} from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import { CONTENT_TYPES } from '@/constants/contentTypes';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

usePageTitle();

// Ícones para cada tipo de conteúdo
const contentTypeIcons = {
  [CONTENT_TYPES.COURSE]: BookOpen,
  [CONTENT_TYPES.EVENT]: Calendar,
  [CONTENT_TYPES.LESSON]: Video,
  [CONTENT_TYPES.BUNDLE]: Package
};

// Textos para cada tipo de conteúdo
const contentTypeTexts = {
  [CONTENT_TYPES.COURSE]: {
    singular: 'curso',
    plural: 'cursos',
    access: 'Acessar Curso',
    myContent: 'Meus Cursos',
    allContent: 'Ver todos os meus cursos'
  },
  [CONTENT_TYPES.EVENT]: {
    singular: 'evento',
    plural: 'eventos',
    access: 'Acessar Evento',
    myContent: 'Meus Eventos',
    allContent: 'Ver todos os meus eventos'
  },
  [CONTENT_TYPES.LESSON]: {
    singular: 'aula',
    plural: 'aulas',
    access: 'Assistir Aula',
    myContent: 'Minhas Aulas',
    allContent: 'Ver todas as minhas aulas'
  },
  [CONTENT_TYPES.BUNDLE]: {
    singular: 'pacote',
    plural: 'pacotes',
    access: 'Acessar Pacote',
    myContent: 'Meus Pacotes',
    allContent: 'Ver todos os meus pacotes'
  }
};

export default function PaymentConfirmation() {
  const { getContentAccessUrl, getContentTypeLabel } = useCheckout();
  const [searchParams] = useSearchParams();
  const { contentType, contentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');
  const success = searchParams.get('success');

  // Detectar tipo de conteúdo válido
  const validContentType = Object.values(CONTENT_TYPES).includes(contentType) 
    ? contentType 
    : CONTENT_TYPES.COURSE;

  const contentTexts = contentTypeTexts[validContentType] || contentTypeTexts[CONTENT_TYPES.COURSE];
  const ContentIcon = contentTypeIcons[validContentType] || BookOpen;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        let response;
        if (sessionId) {
          response = await api.get(`/payments/verify-session/${sessionId}`);
        } else if (paymentIntent) {
          response = await api.get(`/payments/verify-intent/${paymentIntent}`);
        } else if (contentId && validContentType) {
          response = await api.get(`/payments/latest-payment/${validContentType}/${contentId}`);
        } else if (success === 'true') {
          response = await api.get('/payments/latest-payment');
        } else {
          throw new Error('Nenhum identificador de pagamento encontrado');
        }

        const paymentData = response.data.data;
        
        // Se não temos contentType na resposta, usar o detectado
        if (!paymentData.contentType && validContentType) {
          paymentData.contentType = validContentType;
        }

        setPayment(paymentData);
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setError(error.response?.data?.message || 'Erro ao verificar pagamento');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentIntent, contentId, validContentType, success]);

  const getAccessButton = () => {
    if (!payment?.content) return null;

    const accessUrl = getContentAccessUrl(payment.contentType, payment.content);
    const buttonText = contentTypeTexts[payment.contentType]?.access || 'Acessar Conteúdo';

    return (
      <Link
        to={accessUrl}
        className="flex items-center px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover"
      >
        <ContentIcon className="h-4 w-4 mr-2" />
        {buttonText}
      </Link>
    );
  };

  const getContentCreator = () => {
    if (!payment?.content) return 'Criador';
    
    const content = payment.content;
    switch (payment.contentType) {
      case CONTENT_TYPES.COURSE:
        return content.instructorName || content.instructor?.name || 'Instrutor';
      case CONTENT_TYPES.EVENT:
        return content.organizerName || content.organizer?.name || 'Organizador';
      case CONTENT_TYPES.LESSON:
        return content.creatorName || content.creator?.name || 'Criador';
      case CONTENT_TYPES.BUNDLE:
        return content.creatorName || content.creator?.name || 'Criador';
      default:
        return 'Criador';
    }
  };

  const getContentDetails = () => {
    if (!payment?.content) return null;

    const content = payment.content;
    const details = [];

    if (content.startDate) {
      details.push(`Data: ${new Date(content.startDate).toLocaleDateString('pt-BR')}`);
    }
    
    if (content.duration) {
      const hours = Math.floor(content.duration / 60);
      const minutes = content.duration % 60;
      details.push(`Duração: ${hours > 0 ? `${hours}h ` : ''}${minutes}min`);
    }
    
    if (content.lessonsCount) {
      details.push(`${content.lessonsCount} aulas`);
    }

    return details.length > 0 ? details.join(' • ') : null;
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${payment.invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${payment.invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar fatura:', error);
      alert('Erro ao baixar fatura. Tente novamente.');
    }
  };

  const handleResendEmail = async () => {
    try {
      await api.post('/payments/resend-confirmation', {
        invoiceId: payment.invoiceId
      });
      alert('Email de confirmação reenviado com sucesso!');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      alert('Erro ao reenviar email. Tente novamente.');
    }
  };

  const getMyContentUrl = () => {
    if (payment?.contentType) {
      return `/${contentTypeTexts[payment.contentType]?.plural || 'courses'}`;
    }
    return '/courses';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? 'Erro no Pagamento' : 'Pagamento Não Encontrado'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Não foi possível encontrar informações sobre este pagamento.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={getMyContentUrl()}
              className="inline-flex items-center justify-center px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para {contentTypeTexts[validContentType]?.myContent || 'Cursos'}
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contentDetails = getContentDetails();
  const contentCreator = getContentCreator();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {payment.amount === 0 ? 'Acesso Confirmado!' : 'Pagamento Confirmado!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {payment.amount === 0 
              ? `Você agora tem acesso ao ${contentTexts.singular}.` 
              : 'Obrigado por sua compra. Aqui estão os detalhes do seu pagamento.'}
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <ContentIcon className="h-6 w-6 text-custom-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {payment.content?.title || getContentTypeLabel(payment.contentType)}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {contentCreator}
                </p>
                {contentDetails && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {contentDetails}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Detalhes do pagamento (apenas se não for gratuito) */}
            {payment.amount > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valor Pago</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {payment.amount} {payment.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Data</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Método</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {payment.paymentMethod?.replace(/_/g, ' ') || 'Não especificado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Confirmado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    ID da Transação
                  </h3>
                  <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded break-all">
                    {payment.transactionId || payment.invoiceId}
                  </code>
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3">
              {payment.amount > 0 && (
                <>
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Fatura
                  </button>

                  <button
                    onClick={handleResendEmail}
                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reenviar Email
                  </button>
                </>
              )}
              
              {getAccessButton()}
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Próximos Passos
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Acesso imediato ao {contentTexts.singular}
            </li>
            {payment.amount > 0 && (
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email de confirmação enviado
              </li>
            )}
            <li className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Suporte disponível 24/7
            </li>
          </ul>
        </div>

        {/* Ações Adicionais */}
        <div className="text-center mt-8">
          <Link
            to={getMyContentUrl()}
            className="text-custom-primary hover:text-custom-primary-hover font-medium"
          >
            {contentTypeTexts[payment.contentType]?.allContent || 'Ver todos os meus cursos'} →
          </Link>
        </div>
      </div>
    </div>
  );
}