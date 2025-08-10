import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthCard from '../../components/auth/AuthCard';
import ResendEmailButton from '../../components/auth/ResendEmailButton';

export default function VerifyEmail() {
  const { currentUser, reloadUser, loading } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const newUser = location.state?.newUser;

  // Redireciona se o e-mail já estiver verificado
  useEffect(() => {
    if (!loading && currentUser?.isVerified) {
      navigate(location.state?.from || '/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate, location]);

  const handleCheckVerification = async () => {
    try {
      setIsVerifying(true);
      await reloadUser();
      
      if (currentUser?.isVerified) {
        navigate(location.state?.from || '/dashboard', { replace: true });
      } else {
        setError('Email ainda não verificado. Por favor, verifique sua caixa de entrada.');
      }
    } catch (err) {
      setError('Falha ao verificar status. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Verifique seu e-mail
          </h1>
          <div className="mt-6 flex justify-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <svg
                className="h-12 w-12 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {newUser ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              Um link de verificação foi enviado para <span className="font-semibold">{currentUser?.email}</span>.
              Por favor, clique no link para ativar sua conta.
            </p>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300">
              Por favor, verifique seu e-mail <span className="font-semibold">{currentUser?.email}</span> e
              clique no link de verificação para continuar.
            </p>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleCheckVerification}
              disabled={isVerifying}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isVerifying ? (
                <LoadingSpinner size="small" />
              ) : (
                'Já verifiquei meu e-mail'
              )}
            </button>

            <ResendEmailButton 
              email={currentUser?.email} 
              onSuccess={() => setSuccess('Novo link enviado com sucesso!')}
              onError={setError}
            />

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Problemas com a verificação?{' '}
              <button
                onClick={() => navigate('/support')}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Contate o suporte
              </button>
            </div>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}