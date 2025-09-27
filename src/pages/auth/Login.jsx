import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, currentUser, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionamento baseado no perfil do usuário
  const getDefaultRoute = (role) => {
    const from = location.state?.from?.pathname;
    if (from) return from;
    
    switch(role) {
      case 'student':
        return '/learning/courses';
      case 'instructor':
        return '/instructor/courses';
      case 'admin':
        return '/admin';
      case 'institution':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validação básica dos campos
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      setLoading(true);
      
      // Executa o login
      const user = await login({ email, password });
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Verifica se o perfil está completo
      if (user.role !== 'institution' && !user.profileCompleted) {
        navigate('/complete-profile', { 
          state: { from: location },
          replace: true
        });
        return;
      }

      // Verifica se o email está verificado
      if (!user.isVerified) {
        navigate('/verify-email', { 
          state: { email, from: location },
          replace: true
        });
        return;
      }

      // Redireciona para a rota apropriada
      navigate(getDefaultRoute(user.role), { replace: true });
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message 
                        || error.message 
                        || "Falha no login. Tente novamente.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser) {
      navigate(getDefaultRoute(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  // Carrega email lembrado se existir
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 font-custom">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {location.state?.asInstructor ? 'Login de Instrutor' : 'Bem-vindo de volta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {location.state?.asInstructor 
              ? 'Gerencie seus cursos e alunos'
              : 'Faça login para continuar sua jornada de aprendizado'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-8 border border-gray-200 dark:border-gray-700">
          <AuthForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            buttonText={
              loading ? (
                <LoadingSpinner 
                  size="small" 
                  withText 
                  text="Processando..." 
                  inline
                />
              ) : "Entrar"
            }
            showPasswordStrength={false}
            disabled={loading}
          />

          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-gray-300 rounded"
                disabled={loading}
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-gray-700 dark:text-gray-300"
              >
                Lembrar de mim
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="font-medium text-custom-primary hover:text-custom-primary-hover"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou continue com
                </span>
              </div>
            </div>

            <SocialAuthButtons disabled={loading} />
          </div> */}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {location.state?.asInstructor ? (
              <>
                Não tem uma conta de instrutor?{' '}
                <Link
                  to="/registrar?as=instructor"
                  className="font-medium text-custom-primary hover:text-custom-primary-hover"
                >
                  Candidate-se agora
                </Link>
              </>
            ) : (
              <>
                Novo em nossa plataforma?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-custom-primary hover:text-custom-primary-hover"
                >
                  Criar conta
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}