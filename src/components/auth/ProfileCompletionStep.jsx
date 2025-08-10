import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const ProfileCompletionStep = ({
  selectedRole,
  register,
  errors,
  onSubmit,
  loading,
  onBack,
  formData,
  watchInit
}) => {
  return (
    <div>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
              {watchInit('email')}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome de Usuário
            </label>
            <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
              {formData.documents?.username || 'Não disponível'}
            </div>
          </div>

          {selectedRole === 'institution' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome da Instituição
              </label>
              <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                {formData.documents?.institutionName ? formData.documents?.username : 'Não disponível'}
              </div>
            </div>
          )}

          {selectedRole === 'instructor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Área de Formação
              </label>
              <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                {formData.documents?.educationField || 'Não disponível'}
              </div>
            </div>
          )}
        </div>

        {selectedRole === 'instructor' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Biografia (Opcional)
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none ${
                errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
              rows={3}
              placeholder="Fale sobre sua experiência e abordagem de ensino..."
            />
          </div>
        )}

        {selectedRole === 'institution' && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição Institucional (Opcional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
              rows={3}
              placeholder="Descreva sua instituição, missão e valores..."
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Finalizar Cadastro'}
          </button>
        </div>
      </form>

      <AdditionalInfoMessage selectedRole={selectedRole} />
    </div>
  );
};

const AdditionalInfoMessage = ({ selectedRole }) => {
  return (
    <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {selectedRole === 'institution' 
              ? 'Você poderá adicionar mais detalhes sobre sua instituição na página de perfil após o cadastro.'
              : 'Você poderá completar seu perfil com mais detalhes profissionais posteriormente.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionStep;