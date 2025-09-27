import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/hooks/useCheckout';
import { CONTENT_TYPES } from '@/constants/contentTypes';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, LockOpenIcon, CalendarIcon, VideoIcon } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import api from '@/services/api';

// Ícones para cada tipo de conteúdo
const contentTypeIcons = {
  [CONTENT_TYPES.COURSE]: LockOpenIcon,
  [CONTENT_TYPES.EVENT]: CalendarIcon,
  [CONTENT_TYPES.LESSON]: VideoIcon,
  [CONTENT_TYPES.BUNDLE]: ShoppingCartIcon
};

// Textos para cada tipo de conteúdo
const contentTypeVerbs = {
  [CONTENT_TYPES.COURSE]: { free: 'Acessar', paid: 'Comprar' },
  [CONTENT_TYPES.EVENT]: { free: 'Participar', paid: 'Inscrever' },
  [CONTENT_TYPES.LESSON]: { free: 'Acessar', paid: 'Comprar' },
  [CONTENT_TYPES.BUNDLE]: { free: 'Acessar', paid: 'Comprar' }
};

export default function BuyButton({ 
  contentType, 
  content, 
  className = '', 
  variant = 'default', 
  withIcon = false, 
  disabled = false }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { getContentAccessUrl, getContentTypeLabel } = useCheckout();
  const navigate = useNavigate();

  const IconComponent = contentTypeIcons[contentType] || ShoppingCartIcon;
  const verbs = contentTypeVerbs[contentType] || { free: 'Acessar', paid: 'Comprar' };
  const isFree = content?.price == 0 || content?.price === null;
  const verb = isFree ? verbs.free : verbs.paid;

  const handleBuyClick = async () => {
    if (!isAuthenticated) {
      navigate('/signin', { 
        state: { 
          returnTo: `/${getContentTypeLabel(contentType).toLowerCase()}/${content[`${contentType}Id`] || content.id}` 
        } 
      });
      return;
    }

    // Verificar se usuário já tem acesso ao conteúdo
    try {
      setLoading(true);
      
      let accessCheckEndpoint;
      switch (contentType) {
        case CONTENT_TYPES.COURSE:
          accessCheckEndpoint = `/courses/${content.courseId || content.id}/enrollment-status`;
          break;
        case CONTENT_TYPES.EVENT:
          accessCheckEndpoint = `/events/${content.eventId || content.id}/registration-status`;
          break;
        case CONTENT_TYPES.LESSON:
          accessCheckEndpoint = `/lessons/${content.lessonId || content.id}/access-status`;
          break;
        default:
          accessCheckEndpoint = `/content/${contentType}/${content.id}/access-status`;
      }

      const response = await api.get(accessCheckEndpoint);
      
      if (response.data.hasAccess) {
        navigate(getContentAccessUrl(contentType, content));
        return;
      }

      // Se for gratuito, dar acesso diretamente
      if (isFree) {
        const accessResponse = await api.post(`/${contentType}s/${content[`${contentType}Id`] || content.id}/access`);
        if (accessResponse.data.success) {
          navigate(getContentAccessUrl(contentType, content));
          return;
        }
      }

      setShowCheckout(true);
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      
      // Se não houver endpoint específico, mostrar checkout diretamente
      if (error.response?.status === 404) {
        setShowCheckout(true);
      } else if (!isFree) {
        setShowCheckout(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Carregando...';
    
    if (isFree) {
      return `${verb} Grátis`;
    }
    
    return `${verb} por ${content?.price} MZN`;
  };

  const getButtonClass = () => {
    const baseClass = `flex items-center gap-2 px-6 py-3 rounded-md disabled:opacity-50 text-white ${className}`;
    
    if (variant === 'small') {
      return `${baseClass} text-sm px-3 py-1`;
    }
    
    if (isFree) {
      return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
    }
    
    return `${baseClass} bg-custom-primary text-white hover:bg-custom-primary-hover`;
  };

  return (
    <>
      <button
        onClick={handleBuyClick}
        disabled={loading || disabled}
        className={getButtonClass()}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          withIcon && <IconComponent className="h-4 w-4" />
        )}
        {getButtonText()}
      </button>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          contentType={contentType}
          content={content}
        />
      )}
    </>
  );
}