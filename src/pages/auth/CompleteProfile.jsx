import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AvatarUpload from '@/components/profile/AvatarUpload';
import RoleSpecificFields from '@/components/profile/RoleSpecificFields';
import { PhoneInput } from '@/components/auth/PhoneInput';

export default function CompleteProfile() {
  usePageTitle();
  const { currentUser, completeProfile, loading: authLoading, user } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    bio: currentUser?.bio || '',
    expertise: currentUser?.expertise || [],
    interests: currentUser?.interests || [],
    academicPrograms: currentUser?.academicPrograms || [],
    institutionName: location.state?.initialData?.institutionName || currentUser?.institutionName || '',
    institutionType: currentUser?.institutionType || '',
    website: currentUser?.website || '',
    contactPhone: currentUser?.contactPhone || '',
    avatarUrl: currentUser?.avatarUrl || '',
    initialized: false,
    // Campos específicos para roles diferentes
    ...(currentUser?.role !== 'institution' && {
      fullName: location.state?.initialData?.fullName || currentUser?.fullName || ''
    }),
    ...(currentUser?.role === 'instructor' && {
      educationLevel: location.state?.initialData?.educationLevel || currentUser?.educationLevel || '',
      educationField: location.state?.initialData?.educationField || currentUser?.educationField || ''
    }),
    ...(currentUser?.role === 'institution' && {
      legalRepresentative: currentUser?.legalRepresentative || '',
      accreditation: currentUser?.accreditation || '',
      yearFounded: currentUser?.yearFounded || '',
      teachingExperience: currentUser?.teachingExperience || ''
    })
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [avatarError, setAvatarError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !formData.initialized) {
      const userData = {
        bio: currentUser.bio || '',
        expertise: currentUser.expertise || [],
        interests: currentUser.interests || [],
        academicPrograms: currentUser.academicPrograms || [],
        institutionName: currentUser.institutionName || '',
        institutionType: currentUser.institutionType || '',
        website: currentUser.website || '',
        contactPhone: currentUser.contactPhone || '',
        avatarUrl: currentUser.avatarUrl || '',
        initialized: true,
        // Campos específicos para roles diferentes
        ...(currentUser.role !== 'institution' && {
          fullName: location.state?.initialData?.fullName || currentUser.fullName || ''
        }),
        ...(currentUser.role === 'instructor' && {
          educationLevel: location.state?.initialData?.educationLevel || currentUser.educationLevel || '',
          educationField: location.state?.initialData?.educationField || currentUser.educationField || ''
        }),
        ...(currentUser.role === 'institution' && {
          legalRepresentative: location.state?.initialData?.legalRepresentative || currentUser.legalRepresentative || '',
          accreditation: currentUser.accreditation || '',
          yearFounded: currentUser.yearFounded || '',
          teachingExperience: currentUser.teachingExperience || ''
        })
      };
      
      setFormData(userData);
      setIsDraft(!currentUser.profileCompleted);

      if (currentUser.profileCompleted) {
        navigate(location.state?.from || '/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate, location, formData.initialized]);

  const validateForm = useCallback(() => {
    const errors = {};
    const { website, institutionName, fullName, institutionType, contactPhone } = formData;
    
    // Validações gerais
    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      errors.website = 'URL inválida';
    }

    // Validação de telefone para instrutores/instituições
    if (['instructor', 'institution'].includes(currentUser?.role)) {
      if (contactPhone && !/^(\+\d{1,3}[- ]?)?\d{10,15}$/.test(contactPhone.replace(/[^\d+]/g, ''))) {
        errors.contactPhone = 'Telefone inválido';
      }
    }
    
    // Validações específicas por role
    if (currentUser?.role === 'instructor') {
      if (formData.expertise.length < 3) {
        errors.expertise = 'Selecione pelo menos 3 áreas';
      }
    } else if (currentUser?.role === 'student') {
      if (formData.interests.length < 1) {
        errors.interests = 'Selecione pelo menos 1 interesse';
      }
    } else if (currentUser?.role === 'institution') {
      if (!institutionName?.trim()) {
        errors.institutionName = 'Nome da instituição é obrigatório';
      }
      if (!institutionType) {
        errors.institutionType = 'Tipo de instituição é obrigatório';
      }
      if (formData.academicPrograms.length < 1) {
        errors.academicPrograms = 'Selecione pelo menos 1 programa acadêmico';
      }
    }

  Object.keys(errors).forEach(key => {
    if (errors[key] === undefined) {
      delete errors[key];
    }
  });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, currentUser?.role]);

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!saveAsDraft && !isValid) return;

    try {
      setLoading(true);
      
      const submissionData = { 
        ...formData,
        userId: user.userId,
        profileCompleted: !saveAsDraft,
        isRegistrationFlow: location.state?.fromRegistration
      };
      delete submissionData.initialized;
      
      await completeProfile(submissionData);

      toast.success(saveAsDraft ? 'Alterações salvas com sucesso' : 'Perfil atualizado com sucesso!');
      
      if (!saveAsDraft) {
        navigate(location.state?.from || '/dashboard', { replace: true });
      } else {
        setIsDraft(true);
      }
    } catch (error) {
      toast.error('Erro ao salvar perfil');
      console.error('Profile completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
    });
    }
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData(prev => ({
      ...prev,
      contactPhone: phoneValue
    }));
    };

  const handleAvatarUpload = (url) => {
    setAvatarError(null);
    setFormData(prev => ({ ...prev, avatarUrl: url }));
  };

  if (authLoading) return <LoadingSpinner withText text='Carregando...' fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isDraft ? 'Editar Perfil' : 'Complete seu perfil'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isDraft ? 'Atualize suas informações' : 'Adicione informações para personalizar seu perfil'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
            {Object.keys(formErrors).filter(key => formErrors[key]).length > 0 && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <div className="font-bold">Corrija os seguintes erros:</div>
                <ul className="list-disc pl-5 mt-2">
                  {Object.entries(formErrors)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key, value]) => (
                      <li key={key}>
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>: {value}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-4">
                  <AvatarUpload 
                    currentUrl={formData.avatarUrl}
                    onUpload={handleAvatarUpload}
                    onError={(error) => setAvatarError(error)}
                  />
                  {avatarError && (
                    <p className="mt-1 text-sm text-red-500">{avatarError}</p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Adicione uma foto para personalizar seu perfil (opcional)
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                {/* Nome completo ou nome da instituição */}
                {currentUser?.role !== 'institution' ? (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome completo
                      {location.state?.initialData?.fullName && (
                        <span className="ml-2 text-xs text-green-600">(Pré-preenchido)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${
                        formErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Como você gostaria de ser chamado"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome da Instituição *
                      {location.state?.initialData?.institutionName && (
                        <span className="ml-2 text-xs text-green-600">(Pré-preenchido)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="institutionName"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${
                        formErrors.institutionName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Nome oficial da instituição"
                    />
                    {formErrors.institutionName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.institutionName}</p>
                    )}
                  </div>
                )}

                {/* Campos específicos para instituições */}
                {currentUser?.role === 'institution' && (
                  <>
                    <div>
                      <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo de Instituição *
                      </label>
                      <select
                        id="institutionType"
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${
                          formErrors.institutionType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                      >
                        <option value="">Selecione um tipo</option>
                        <option value="Universidade">Universidade</option>
                        <option value="Faculdade">Faculdade</option>
                        <option value="Escola Técnica">Escola Técnica</option>
                        <option value="Centro de Pesquisa">Centro de Pesquisa</option>
                        <option value="Plataforma Online">Plataforma Online</option>
                        <option value="ONG Educacional">ONG Educacional</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {formErrors.institutionType && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.institutionType}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="legalRepresentative" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Representante Legal
                        {location.state?.initialData?.legalRepresentative && (
                          <span className="ml-2 text-xs text-green-600">(Pré-preenchido)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="legalRepresentative"
                        name="legalRepresentative"
                        value={formData.legalRepresentative}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Nome do representante legal"
                      />
                    </div>

                    <div>
                      <label htmlFor="accreditation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Credenciamento/Certificação
                      </label>
                      <input
                        type="text"
                        id="accreditation"
                        name="accreditation"
                        value={formData.accreditation}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Número ou código de credenciamento"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="yearFounded" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ano de Fundação
                        </label>
                        <input
                          type="number"
                          id="yearFounded"
                          name="yearFounded"
                          value={formData.yearFounded}
                          onChange={handleChange}
                          min="1000"
                          max={new Date().getFullYear()}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ano de fundação"
                        />
                      </div>
                      <div>
                        <label htmlFor="teachingExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Anos de Experiência em Ensino
                        </label>
                        <input
                          type="number"
                          id="teachingExperience"
                          name="teachingExperience"
                          value={formData.teachingExperience}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Número de anos"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Campos específicos para instrutores */}
                {currentUser?.role === 'instructor' && (
                  <>
                    <div>
                      <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nível de Formação
                        {location.state?.initialData?.educationLevel && (
                          <span className="ml-2 text-xs text-green-600">(Pré-preenchido)</span>
                        )}
                      </label>
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Selecione</option>
                        <option value="graduation">Graduação</option>
                        <option value="specialization">Especialização</option>
                        <option value="masters">Mestrado</option>
                        <option value="phd">Doutorado</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="educationField" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Área de Formação
                        {location.state?.initialData?.educationField && (
                          <span className="ml-2 text-xs text-green-600">(Pré-preenchido)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="educationField"
                        name="educationField"
                        value={formData.educationField}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Sua área de formação principal"
                      />
                    </div>
                  </>
                )}

                <RoleSpecificFields 
                  role={currentUser?.role}
                  formData={formData}
                  setFormData={setFormData}
                  errors={formErrors}
                  setErrors={setFormErrors}
                />

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Biografia
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      formErrors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                    placeholder={
                      currentUser?.role === 'instructor' ? 'Conte sobre sua experiência (opcional)' :
                      currentUser?.role === 'student' ? 'Fale sobre seus interesses (opcional)' :
                      currentUser?.role === 'institution' ? 'Descreva sua instituição (opcional)' :
                      'Conte um pouco sobre você (opcional)'
                    }
                  />
                </div>

                {/* Website */}
                {['instructor', 'institution'].includes(currentUser?.role) && (
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Website (opcional)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                        https://
                      </span>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website?.replace('https://', '') || ''}
                        onChange={(e) => handleChange({
                          target: {
                            name: 'website',
                            value: `https://${e.target.value}`
                          }
                        })}
                        className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                          formErrors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                        placeholder="seu-site.com"
                      />
                    </div>
                    {formErrors.website && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.website}</p>
                    )}
                  </div>
                )}

                {/* Telefone */}
                {['instructor', 'institution'].includes(currentUser?.role) && (
                  <div>
                    <PhoneInput 
                      id="contactPhone"
                      label="Telefone para Contato"
                      value={formData.contactPhone}
                      onChange={handlePhoneChange}
                      description={
                        currentUser?.role === 'instructor' 
                        ? 'Número para contato profissional (opcional)' 
                        : 'Telefone institucional (opcional)'
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {loading ? 
                  <LoadingSpinner 
                    size="small" 
                    withText
                    text='Salvando...'
                    inline
                  /> 
                  : 'Salvar como rascunho'}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {isDraft ? 'Voltar' : 'Pular por agora'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner size="small" light />
                  ) : (
                    isDraft ? 'Atualizar perfil' : 'Salvar perfil'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
              Salvando suas informações...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}