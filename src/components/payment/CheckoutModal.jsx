import { useState, useEffect } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { CONTENT_TYPES } from '@/constants/contentTypes';
import { 
  XIcon, 
  CreditCardIcon, 
  SmartphoneIcon, 
  BuildingIcon,
  LockIcon,
  GlobeIcon,
  AlertCircleIcon,
  BookOpenIcon
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ contentType, content, onSuccess, onError }) => {
  const { getContentTypeLabel, processPayment } = useCheckout();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');

  const paymentMethods = [
    { id: 'card', name: 'Cartão', icon: CreditCardIcon, available: true },
    { id: 'mobile', name: 'Mobile Money', icon: SmartphoneIcon, available: true },
    { id: 'bank', name: 'Transferência', icon: BuildingIcon, available: true }
  ];

  const getPaymentData = () => {
    switch (paymentMethod) {
      case 'card':
        return { type: 'credit_card' };
      case 'mobile':
        return { 
          type: 'mobile_money', 
          provider: 'mpesa',
          phoneNumber: user.phoneNumber 
        };
      case 'bank':
        return { 
          type: 'bank_transfer', 
          bank: 'bim' 
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let paymentData = getPaymentData();
      let gateway = paymentMethod === 'card' ? 'stripe' : 'paytek';

      // Para cartão, precisamos processar com Stripe primeiro
      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Stripe não inicializado');
        }

        const cardElement = elements.getElement(CardElement);
        
        const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: user.fullName || user.username,
            email: user.email
          }
        });

        if (pmError) {
          throw new Error(pmError.message);
        }

        paymentData.paymentMethodId = pm.id;
      }

      // Processar pagamento
      const result = await processPayment(
        contentType,
        content[`${contentType}Id`] || content.id,
        {
          paymentMethod: paymentData.type,
          paymentData,
          gateway
        }
      );

      onSuccess(result);

    } catch (error) {
      const errorMessage = error.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processando...';
    
    const verb = content.price === 0 ? 'Confirmar' : 'Pagar';
    const amount = content.price === 0 ? 'Grátis' : `${content.price} MZN`;
    
    return `${verb} ${amount}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título dinâmico */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Adquirir {getContentTypeLabel(contentType)}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {content.title}
        </p>
      </div>

      {/* Seção de Métodos de Pagamento */}
      {content.price > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Escolha o método de pagamento
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                disabled={!method.available}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === method.id
                    ? 'border-custom-primary bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <method.icon className="h-6 w-6 mx-auto mb-2 text-custom-primary" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Cartão (aparece apenas quando selecionado e é pago) */}
      {paymentMethod === 'card' && content.price > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalhes do Cartão
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#374151',
                      '::placeholder': {
                        color: '#9CA3AF',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Informações para conteúdo gratuito */}
      {content.price === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200 text-center">
            Este {getContentTypeLabel(contentType).toLowerCase()} é gratuito. 
            Clique em "Confirmar" para obter acesso imediato.
          </p>
        </div>
      )}

      {/* Informações de Mobile Money */}
      {paymentMethod === 'mobile' && content.price > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Você será redirecionado para confirmar o pagamento via Mobile Money.
          </p>
        </div>
      )}

      {/* Informações de Transferência Bancária */}
      {paymentMethod === 'bank' && content.price > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
            Dados para Transferência
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Banco:</strong> BIM<br />
            <strong>Conta:</strong> 1234567890<br />
            <strong>Nome:</strong> Sua Plataforma LTDA<br />
            <strong>Referência:</strong> {(content[`${contentType}Id`] || content.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            O acesso será liberado após confirmação do pagamento (1-2 dias úteis).
          </p>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Botão de Confirmação/Pagamento */}
      <button
        type="submit"
        disabled={loading || (content.price > 0 && paymentMethod === 'card' && !stripe)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processando...
          </>
        ) : (
          <>
            <LockIcon className="h-4 w-4" />
            {getButtonText()}
          </>
        )}
      </button>

      {/* Segurança - apenas para pagamentos */}
      {content.price > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <LockIcon className="h-3 w-3" />
          <span>Pagamento seguro</span>
          <GlobeIcon className="h-3 w-3 ml-2" />
          <span>Suporte multi-moeda</span>
        </div>
      )}
    </form>
  );
};

export default function CheckoutModal({ isOpen, onClose, contentType, content }) {
  const [step, setStep] = useState('checkout');
  const [paymentResult, setPaymentResult] = useState(null);
  const { getContentAccessUrl, getContentTypeLabel } = useCheckout();

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setPaymentResult(null);
    }
  }, [isOpen, contentType, content]);

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setStep('success');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleComplete = () => {
    onClose();
    // Recarregar a página para atualizar o estado de acesso
    window.location.reload();
  };

  const handleGoToContent = () => {
    const accessUrl = getContentAccessUrl(contentType, content);
    window.location.href = accessUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {step === 'checkout' 
              ? `Adquirir ${getContentTypeLabel(contentType)}` 
              : 'Aquisição Concluída!'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Resumo do Conteúdo */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {content.title}
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tipo: {getContentTypeLabel(contentType)}
              </span>
              <span className="text-lg font-bold text-custom-primary">
                {content.price === 0 ? 'Grátis' : `${content.price} MZN`}
              </span>
            </div>
            
            {/* Informações específicas por tipo */}
            {contentType === CONTENT_TYPES.EVENT && content.startDate && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Data: {new Date(content.startDate).toLocaleDateString('pt-BR')}
                {content.startTime && ` às ${content.startTime}`}
              </div>
            )}
            
            {contentType === CONTENT_TYPES.LESSON && content.duration && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Duração: {Math.floor(content.duration / 60)}min
              </div>
            )}
            
            {contentType === CONTENT_TYPES.COURSE && content.instructor && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Instrutor: {content.instructor.name || content.instructor.username}
              </div>
            )}
          </div>

          {step === 'checkout' ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                contentType={contentType}
                content={content}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {content.price === 0 ? 'Acesso Liberado!' : 'Pagamento Concluído!'}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-400">
                Você agora tem acesso ao {getContentTypeLabel(contentType).toLowerCase()}{' '}
                <strong>{content.title}</strong>.
              </p>

              {paymentResult?.invoiceId && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Nº da transação: {paymentResult.invoiceId}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGoToContent}
                  className="w-full px-6 py-3 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Acessar {getContentTypeLabel(contentType)}
                </button>
                
                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}