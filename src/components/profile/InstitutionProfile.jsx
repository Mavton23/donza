import { useState, useEffect } from 'react';
import { TagsInput } from 'react-tag-input-component';
import { Info, Plus, X, Check } from 'lucide-react';
import { getAcademicPrograms } from '../../utils/userUtils';

const institutionTypes = [
  'Universidade',
  'Faculdade',
  'Escola Técnica', 
  'Centro de Pesquisa',
  'Plataforma Online',
  'ONG Educacional',
  'Outro'
];

export default function InstitutionProfile({ 
  institutionData, 
  onSubmit, 
  errors, 
  loading 
}) {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    academicPrograms: [],
    bio: '',
    website: '',
    contactPhone: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: ''
    }
  });

  useEffect(() => {
    if (institutionData) {
      setFormData({
        institutionName: institutionData.institutionName || '',
        institutionType: institutionData.institutionType || '',
        academicPrograms: institutionData.academicPrograms || [],
        bio: institutionData.bio || '',
        website: institutionData.website || '',
        contactPhone: institutionData.contactPhone || '',
        socialMedia: {
          linkedin: institutionData.socialMedia?.linkedin || '',
          twitter: institutionData.socialMedia?.twitter || '',
          facebook: institutionData.socialMedia?.facebook || '',
          instagram: institutionData.socialMedia?.instagram || '',
          youtube: institutionData.socialMedia?.youtube || ''
        }
      });
    }
  }, [institutionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleProgramsChange = (programs) => {
    setFormData(prev => ({ ...prev, academicPrograms: programs }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const suggestedPrograms = getAcademicPrograms();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome da Instituição */}
        <div className="md:col-span-2">
          <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome da Instituição *
          </label>
          <input
            type="text"
            id="institutionName"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            className={`w-full border ${
              errors.institutionName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Ex: Universidade Federal de Tecnologia"
          />
          {errors.institutionName && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <X size={14} /> {errors.institutionName}
            </p>
          )}
        </div>

        {/* Tipo de Instituição */}
        <div>
          <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Instituição *
          </label>
          <select
            id="institutionType"
            name="institutionType"
            value={formData.institutionType}
            onChange={handleChange}
            className={`w-full border ${
              errors.institutionType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
          >
            <option value="">Selecione um tipo</option>
              {institutionTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
          </select>
          {errors.institutionType && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <X size={14} /> {errors.institutionType}
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website *
          </label>
          <div className="flex rounded-md shadow-sm">
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
                errors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
              placeholder="seusite.edu.br"
            />
          </div>
          {errors.website && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <X size={14} /> {errors.website}
            </p>
          )}
        </div>
      </div>

      {/* Programas Acadêmicos */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Programas Acadêmicos *
            <span className="text-gray-400 hover:text-gray-500 cursor-pointer">
              <Info size={16} />
            </span>
          </label>
          <span className="text-xs text-gray-500">
            {formData.academicPrograms.length}/1 mínimo
          </span>
        </div>

        <div className={`relative border ${
          errors.academicPrograms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } rounded-md shadow-sm`}>
          <TagsInput
            value={formData.academicPrograms}
            onChange={handleProgramsChange}
            name="academicPrograms"
            placeHolder="Adicione programas (ex: Graduação em Engenharia)"
            classNames={{
              input: 'react-tags-input py-2 px-3 w-full',
              tag: 'react-tags-input-tag bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            }}
          />
        </div>

        {errors.academicPrograms && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <X size={14} /> {errors.academicPrograms}
          </p>
        )}

        {formData.academicPrograms.length >= 1 && (
          <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
            <Check size={14} /> Requisito mínimo atendido
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {suggestedPrograms.slice(0, 6).map(program => (
            <button
              key={program}
              type="button"
              className={`text-xs px-2 py-1 rounded-full ${
                formData.academicPrograms.includes(program)
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => {
                if (!formData.academicPrograms.includes(program)) {
                  handleProgramsChange([...formData.academicPrograms, program]);
                }
              }}
            >
              {program}
            </button>
          ))}
        </div>
      </div>

      {/* Biografia */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sobre a Instituição
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          className={`w-full border ${
            errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
          placeholder="Descreva sua instituição, missão, valores e diferenciais..."
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Esta descrição aparecerá no perfil público da sua instituição
        </p>
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefone para Contato
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                linkedin.com/
              </span>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleSocialMediaChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="sua-instituicao"
              />
            </div>
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                twitter.com/
              </span>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.socialMedia.twitter}
                onChange={handleSocialMediaChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="sua-instituicao"
              />
            </div>
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instagram
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                instagram.com/
              </span>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.socialMedia.instagram}
                onChange={handleSocialMediaChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="sua.instituicao"
              />
            </div>
          </div>

          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              YouTube
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                youtube.com/
              </span>
              <input
                type="text"
                id="youtube"
                name="youtube"
                value={formData.socialMedia.youtube}
                onChange={handleSocialMediaChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="c/SuaInstituicao"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Envio */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}