import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

const TestimonialFormModal = ({ isOpen, onClose, onSubmit, user }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentRating = watch('rating');

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const testimonialData = {
        content: data.content,
        rating: data.rating,
        ...(user ? { 
          userId: user.userId,
          source: 'platform'
        } : {
          source: 'external',
          externalAuthor: data.name,
          externalRole: data.role
        })
      };
      
      await onSubmit(testimonialData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar depoimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Deixe seu depoimento
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Compartilhe sua experiência com nossa plataforma
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {!user && (
              <>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seu nome *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Nome é obrigatório' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sua função/área *
                  </label>
                  <input
                    id="role"
                    type="text"
                    {...register('role', { required: 'Função é obrigatória' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
                  )}
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avaliação *
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setValue('rating', star);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                {...register('rating', { 
                  required: 'Avaliação é obrigatória',
                  min: { value: 1, message: 'Selecione pelo menos 1 estrela' }
                })}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seu depoimento *
              </label>
              <textarea
                id="content"
                rows={4}
                {...register('content', { 
                  required: 'Depoimento é obrigatório',
                  minLength: { value: 20, message: 'Depoimento deve ter pelo menos 20 caracteres' }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Conte como foi sua experiência..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Depoimento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestimonialFormModal;