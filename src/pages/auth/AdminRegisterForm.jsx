import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import PasswordStrengthBar from 'react-password-strength-bar';

// Esquema de validação
const adminRegisterSchema = yup.object().shape({
  username: yup.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(30, 'Nome deve ter no máximo 30 caracteres')
    .required('Nome é obrigatório'),
  email: yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: yup.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/, 'Deve conter pelo menos um número')
    .required('Senha é obrigatória'),
  secretKey: yup.string()
    .required('Chave secreta é obrigatória')
});

export function AdminRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm({
    resolver: yupResolver(adminRegisterSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/admin/register', data);

      toast.success('Administrador registrado com sucesso!');
      
      // Login automático após registro
        await login({
            email: data.email,
            password: data.password
        });
      
      // Redireciona para o dashboard
      navigate('/admin');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || 'Erro ao registrar administrador');
      }
    } finally {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Criar Conta de Administrador
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Preencha os campos abaixo para registrar um novo administrador da plataforma
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-8 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Completo *
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-custom-primary focus:border-custom-primary dark:bg-gray-700 dark:text-white`}
                placeholder="Seu nome completo"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha *
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
              <PasswordStrengthBar 
                password={watch('password') || ''} 
                className="mt-2"
                scoreWords={['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']}
                shortScoreWord="Muito curta"
              />
            </div>

            <div>
              <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chave Secreta de Administração *
              </label>
              <div className="relative mt-1">
                <input
                  id="secretKey"
                  type={showSecretKey ? 'text' : 'password'}
                  {...register('secretKey')}
                  className={`block w-full px-3 py-2 border ${
                    errors.secretKey ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Chave fornecida pelo sistema"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.secretKey && (
                <p className="mt-1 text-sm text-red-500">{errors.secretKey.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Esta chave é fornecida apenas para administradores autorizados
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Registrar Administrador'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Ao registrar, você concorda com nossos{' '}
            <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Política de Privacidade
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}