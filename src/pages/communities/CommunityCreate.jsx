import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import FileUpload from '../../components/common/FileUpload';
import RichTextEditor from '../../components/common/RichTextEditor';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormStepper from '../../components/common/FormStepper';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';
import { FiLock, FiGlobe, FiUsers, FiShield, FiTag } from 'react-icons/fi';

const steps = [
  'Informações Básicas',
  'Visibilidade & Acesso',
  'Regras & Diretrizes',
  'Revisão & Criação'
];

export default function CommunityCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    coverImage: null,
    thumbnailImage: null,
    tags: [],
    
    isPublic: true,
    membershipType: 'open',
    socialLinks: {
      website: '',
      twitter: '',
      discord: ''
    },
    
    rules: {
      guidelines: '',
      allowedContent: '',
      moderationPolicy: ''
    }
  });

  if (!isAllowed) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6 text-center">
            <LoadingSpinner fullScreen={false} />
          </div>
        </div>
      );
    }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const formPayload = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'socialLinks' || key === 'rules') {
          formPayload.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          formPayload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formPayload.append(key, value);
        }
      });

      const response = await api.post('/community/communities', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/communities/${response.data.data.communityId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar comunidade');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && (!formData.name || !formData.description)) {
      setError('Nome e descrição são obrigatórios');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleFileUpload = (file, field) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da Comunidade *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL da Comunidade *
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                  yourplatform.com/c/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
                  })}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                  required
                  pattern="[a-z0-9-]+"
                  title="Apenas letras minúsculas, números e hífens"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagem de Capa
              </label>
              <FileUpload
                accept="image/*"
                onFileUpload={(file) => handleFileUpload(file, 'coverImage')}
                maxSize={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagem Miniatura (Opcional)
              </label>
              <FileUpload
                accept="image/*"
                onFileUpload={(file) => handleFileUpload(file, 'thumbnailImage')}
                maxSize={2}
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição Curta (Máx. 100 caracteres) *
              </label>
              <textarea
                id="shortDescription"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição Completa *
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Conte-nos sobre sua comunidade..."
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (Máx. 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 inline-flex text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length < 5 && (
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                    placeholder="Digite a tag e pressione Enter"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                <FiGlobe className="mr-2" /> Configurações de Visibilidade
              </h4>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={() => setFormData({ ...formData, isPublic: true })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Comunidade Pública (Visível para todos)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="private"
                  name="isPublic"
                  checked={!formData.isPublic}
                  onChange={() => setFormData({ ...formData, isPublic: false })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="private" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Comunidade Privada (Visível apenas para membros)
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                <FiUsers className="mr-2" /> Configurações de Membros
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="open"
                    name="membershipType"
                    checked={formData.membershipType === 'open'}
                    onChange={() => setFormData({ ...formData, membershipType: 'open' })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="open" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Aberta - Qualquer um pode entrar
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="approval"
                    name="membershipType"
                    checked={formData.membershipType === 'approval'}
                    onChange={() => setFormData({ ...formData, membershipType: 'approval' })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="approval" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Aprovação Necessária - Membros devem ser aprovados
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="inviteOnly"
                    name="membershipType"
                    checked={formData.membershipType === 'invite_only'}
                    onChange={() => setFormData({ ...formData, membershipType: 'invite_only' })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="inviteOnly" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Somente Convite - Apenas usuários convidados podem entrar
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                <FiGlobe className="mr-2" /> Links Sociais (Opcional)
              </h4>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      website: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                  placeholder="https://"
                />
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                    twitter.com/
                  </span>
                  <input
                    type="text"
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        twitter: e.target.value
                      }
                    })}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                    placeholder="nome de usuário"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="discord" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discord
                </label>
                <input
                  type="url"
                  id="discord"
                  value={formData.socialLinks.discord}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      discord: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                  placeholder="https://discord.gg/"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                <FiShield className="mr-2" /> Regras da Comunidade
              </h4>
              
              <div>
                <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diretrizes da Comunidade *
                </label>
                <RichTextEditor
                  value={formData.rules.guidelines}
                  onChange={(html) => setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      guidelines: html
                    }
                  })}
                  placeholder="Que comportamento é esperado dos membros?"
                />
              </div>
              
              <div>
                <label htmlFor="allowedContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conteúdo Permitido *
                </label>
                <RichTextEditor
                  value={formData.rules.allowedContent}
                  onChange={(html) => setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      allowedContent: html
                    }
                  })}
                  placeholder="Que tipo de conteúdo os membros podem postar?"
                />
              </div>
              
              <div>
                <label htmlFor="moderationPolicy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Política de Moderação
                </label>
                <RichTextEditor
                  value={formData.rules.moderationPolicy}
                  onChange={(html) => setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      moderationPolicy: html
                    }
                  })}
                  placeholder="Como o conteúdo e comportamento serão moderados?"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Resumo da Comunidade
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Revise os detalhes da sua comunidade antes da criação
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-8">
                  {/* Informações Básicas */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <FiTag className="mr-2" /> Informações Básicas
                    </h4>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Nome da Comunidade
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                          {formData.name}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          URL
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                          yourplatform.com/c/{formData.slug}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Descrição Curta
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                          {formData.shortDescription}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tags
                        </dt>
                        <dd className="mt-1 flex flex-wrap gap-2">
                          {formData.tags.length > 0 ? (
                            formData.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tag adicionada</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Visibilidade & Acesso */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <FiLock className="mr-2" /> Visibilidade & Acesso
                    </h4>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Visibilidade
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                          {formData.isPublic ? 'Pública' : 'Privada'}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tipo de Associação
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                          {formData.membershipType === 'open' && 'Aberta para todos'}
                          {formData.membershipType === 'approval' && 'Aprovação necessária'}
                          {formData.membershipType === 'invite_only' && 'Somente convite'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Links Sociais */}
                  {Object.values(formData.socialLinks).some(val => val) && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <FiGlobe className="mr-2" /> Links Sociais
                      </h4>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        {formData.socialLinks.website && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Website
                            </dt>
                            <dd className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                              <a href={formData.socialLinks.website} target="_blank" rel="noopener noreferrer">
                                {formData.socialLinks.website}
                              </a>
                            </dd>
                          </div>
                        )}
                        {formData.socialLinks.twitter && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Twitter
                            </dt>
                            <dd className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                              <a 
                                href={`https://twitter.com/${formData.socialLinks.twitter}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                twitter.com/{formData.socialLinks.twitter}
                              </a>
                            </dd>
                          </div>
                        )}
                        {formData.socialLinks.discord && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Discord
                            </dt>
                            <dd className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                              <a href={formData.socialLinks.discord} target="_blank" rel="noopener noreferrer">
                                {formData.socialLinks.discord}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Nota Importante
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Após a criação, algumas configurações como URL e tipo de associação não podem ser alteradas. 
                      Por favor, verifique esses detalhes cuidadosamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Criar Nova Comunidade
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Crie um espaço para seus alunos, colegas ou grupo de interesse
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <FormStepper 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
        />

        <div className="p-6">
          {loading ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            <div className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentStep === steps.length - 1 ? 'Criar Comunidade' : 'Próximo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}