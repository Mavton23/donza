import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockIcon } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const securitySchema = z.object({
  currentPassword: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function SecuritySettings() {
  const { user } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(securitySchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Senha alterada com sucesso!');
      reset();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
          <LockIcon className="h-5 w-5" /> Configurações de Segurança
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie sua senha e configurações de segurança
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha atual
              </label>
              <input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
              <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Salvando...
                </>
              ) : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Sessões ativas
        </h4>
        {/* Lista de dispositivos/sessões */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Chrome - Windows</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">São Paulo, BR • Último acesso: hoje</p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400">
              Encerrar sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}