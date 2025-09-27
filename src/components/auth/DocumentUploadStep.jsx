import React from 'react';
import FileUpload from '../common/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner';

const InstitutionDocuments = ({ register, errors, setValue }) => {
  
    return (
    <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documentos Institucionais</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Envie os documentos necessários para verificação da sua instituição.
        </p>
    
        <div className="mt-4 space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de Usuário *
                </label>
                <input
                    id="username"
                    type="text"
                    {...register('username')}
                    className={`mt-1 block w-full px-3 py-2 border ${
                    errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                )}
                </div>
                <div>
                <label htmlFor="nuit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    NUIT *
                </label>
                <input
                    id="nuit"
                    type="text"
                    placeholder="123456789"
                    {...register('nuit')}
                    className={`mt-1 block w-full px-3 py-2 border ${
                    errors.nuit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.nuit && (
                    <p className="mt-1 text-sm text-red-500">{errors.nuit.message}</p>
                )}
                </div>

                <div>
                <label htmlFor="legalRepresentative" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Responsável Legal *
                </label>
                <input
                    id="legalRepresentative"
                    type="text"
                    {...register('legalRepresentative')}
                    className={`mt-1 block w-full px-3 py-2 border ${
                    errors.legalRepresentative ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.legalRepresentative && (
                    <p className="mt-1 text-sm text-red-500">{errors.legalRepresentative.message}</p>
                )}
                </div>

                {/* Institution Documents Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documentos Institucionais</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Envie os documentos necessários para verificação da sua instituição.
                </p>

                <div className="mt-4 space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alvará de Funcionamento *
                    </label>
                    <FileUpload
                        accept=".pdf,.jpg,.jpeg,.png"
                        onFileUpload={(file) => setValue('alvara', file)}
                        maxSize={5}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Documento de Credenciamento Institucional *
                    </label>
                    <FileUpload
                        accept=".pdf,.jpg,.jpeg,.png"
                        onFileUpload={(file) => setValue('credenciamento', file)}
                        maxSize={5}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estatutos/Contrato Social *
                    </label>
                    <FileUpload
                        accept=".pdf,.jpg,.jpeg,.png"
                        onFileUpload={(file) => setValue('estatutos', file)}
                        maxSize={5}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Comprovante de Endereço Institucional *
                    </label>
                    <FileUpload
                        accept=".pdf,.jpg,.jpeg,.png"
                        onFileUpload={(file) => setValue('endereco', file)}
                        maxSize={5}
                    />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const InstructorDocuments = ({ register, errors, setValue }) => {
  return (
    <>
        <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome de Usuário *
            </label>
            <input
                id="username"
                type="text"
                {...register('username')}
                className={`mt-1 block w-full px-3 py-2 border ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                placeholder="ex: joao_silva"
            />
            {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
        </div>

        <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Completo *
            </label>
            <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className={`mt-1 block w-full px-3 py-2 border ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            />
            {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
        </div>
        <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nível de Formação *
            </label>
            <select
                id="educationLevel"
                {...register('educationLevel')}
                className={`mt-1 block w-full px-3 py-2 border ${
                    errors.educationLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            >
                <option value="">Selecione</option>
                <option value="graduation">Graduação</option>
                <option value="specialization">Especialização</option>
                <option value="masters">Mestrado</option>
                <option value="phd">Doutorado</option>
            </select>
            {errors.educationLevel && (
                <p className="mt-1 text-sm text-red-500">{errors.educationLevel.message}</p>
            )}
        </div>

        <div>
            <label htmlFor="educationField" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Área de Formação *
            </label>
            <input
                id="educationField"
                type="text"
                {...register('educationField')}
                className={`mt-1 block w-full px-3 py-2 border ${
                    errors.educationField ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            />
            {errors.educationField && (
                <p className="mt-1 text-sm text-red-500">{errors.educationField.message}</p>
            )}
        </div>

        {/* Instructor Qualifications Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Qualificações e Documentos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Envie os documentos que comprovam suas qualificações profissionais.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificados Acadêmicos (Diplomas) *
                </label>
                <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileUpload={(file) => setValue('diplomas', file)}
                    maxSize={5}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Pode enviar vários arquivos simultaneamente
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comprovantes de Experiência Profissional *
                </label>
                <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileUpload={(file) => setValue('experiencia', file)}
                    maxSize={5}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificações Específicas da Área
                </label>
                <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileUpload={(file) => setValue('certificacoes', file)}
                    maxSize={5}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Documentos de Identidade Profissional (CREA, OAB, etc.)
                </label>
                <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileUpload={(file) => setValue('registroProfissional', file)}
                    maxSize={5}
                />
                </div>
            </div>
        </div>
    </>
  );
};

const DocumentUploadStep = ({
  selectedRole,
  register,
  errors,
  onSubmit,
  loading,
  onBack,
  setValue
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {selectedRole === 'institution' ? (
        <InstitutionDocuments register={register} errors={errors} setValue={setValue} />
      ) : (
        <InstructorDocuments register={register} errors={errors} setValue={setValue} />
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
          className="inline-flex justify-center rounded-md border border-transparent bg-custom-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner 
                size="small"
                withText
                text="Processando..."
                textColor="text-indigo-700 dark:text-indigo-300"
                inline
            />
          ) : "Continuar"}
        </button>
      </div>
    </form>
  );
};

export default DocumentUploadStep;