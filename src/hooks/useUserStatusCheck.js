import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function useUserStatusCheck(allowedStatus = ['approved']) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !allowedStatus.includes(user.status)) {
      toast.warning(`Seu perfil está ${user.status}. Você precisa ser aprovado para acessar esta funcionalidade.`);
      navigate('/dashboard');
    }
  }, [user, allowedStatus, navigate]);

  return {
    isAllowed: user && allowedStatus.includes(user.status),
    userStatus: user?.status
  };
}