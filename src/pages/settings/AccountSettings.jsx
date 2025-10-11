import usePageTitle from "@/hooks/usePageTitle";
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { useNotification } from '@/contexts/NotificationContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import InterestsSelector from '@/components/profile/InterestsSelector';
import ExpertiseEditor from '@/components/profile/ExpertiseEditor';
import { roleSpecificFields } from '@/utils/userUtils';

// Esquema de validação baseado no role do usuário
const createAccountSchema = (role) => {
  const baseSchema = z.object({
    fullName: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
    username: z.string().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres'),
    email: z.string().email('Email inválido'),
    bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
    website: z.string().url('URL inválida').or(z.literal('')).optional(),
  });

  // Adiciona campos específicos por role
  if (role === 'student') {
    return baseSchema.extend({
      interests: z.array(z.string()).min(1, 'Selecione pelo menos 1 interesse'),
    });
  }

  if (['instructor', 'institution'].includes(role)) {
    return baseSchema.extend({
      expertise: z.array(z.string()).min(1, 'Selecione pelo menos 1 área'),
    });
  }

  return baseSchema;
};

export default function AccountSettings() {
  usePageTitle();
  const { user, role, updateUser } = useOutletContext();
  const { showNotification } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  usePageTitle();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(createAccountSchema(role)),
    defaultValues: {
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      website: user.website || '',
      ...(role === 'student' && { interests: user.interests || [] }),
      ...(['instructor', 'institution'].includes(role) && { expertise: user.expertise || [] }),
    },
  });

  const handleAvatarUpload = async (file) => {
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser(data.user);
      showNotification('success', 'Foto de perfil atualizada com sucesso');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Falha ao atualizar avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const payload = {
        ...data
      };

      const { data: response } = await api.put('/users/me', payload);
      updateUser(response.user);
      showNotification('success', 'Perfil atualizado com sucesso');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Falha ao atualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Informações da Conta
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Atualize suas informações básicas {roleSpecificFields[role]?.hint && (
            <span className="text-indigo-500 dark:text-indigo-400">
              ({roleSpecificFields[role].hint})
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-1/3">
          <AvatarUpload 
            currentUrl={user.avatarUrl} 
            onUpload={handleAvatarUpload}
            isLoading={avatarUploading}
            size="lg"
          />
        </div>
        
        <div className="sm:w-2/3 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register('fullName')}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.fullName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome de usuário *
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  {...register('website')}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.website 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Biografia
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  {...register('bio')}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.bio 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Campos específicos por role */}
              {role === 'student' && (
                <div className="sm:col-span-2">
                  <InterestsSelector
                    selectedInterests={user.interests || []}
                    onChange={(interests) => setValue('interests', interests)}
                    error={errors.interests}
                  />
                </div>
              )}

              {['instructor', 'institution'].includes(role) && (
                <div className="sm:col-span-2">
                  <ExpertiseEditor
                    expertise={user.expertise || []}
                    onChange={(expertise) => setValue('expertise', expertise)}
                    error={errors.expertise}
                  />
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-custom-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
                disabled={isUpdating}
              >
                {isUpdating ? (
                    <LoadingSpinner 
                      size="sm" 
                      withText
                      text="Salvando..."
                      inline
                      className="mr-2" 
                    />
                ) : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}