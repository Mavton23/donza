import { useState } from 'react';
import { FiSave, FiLock, FiGlobe } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';
import TagInput from '@/components/common/TagInput';
import api from '@/services/api';
import { toast } from 'sonner';
import RichTextEditor from '@/components/common/RichTextEditor';

export default function CommunitySettings({ community, onUpdate }) {
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    isPublic: community.isPublic,
    membershipType: community.membershipType,
    tags: Array.isArray(community?.tags) ? [...community.tags] : []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (!formData.name.trim()) {
        throw new Error('O nome da comunidade é obrigatório');
      }

      const response = await api.put(`/community/${community.communityId}/settings`, formData);
      
      if (response.data.success) {
        onUpdate(response.data.data.community);

        toast.success('Configurações atualizadas com sucesso!');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Falha ao atualizar a comunidade');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h2>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome da Comunidade *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            required
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => setFormData({ ...formData, description: html })}
            placeholder="Descreva a comunidade..."
            maxLength={500}
            className="min-h-[120px]"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Máximo de 500 caracteres</span>
            <span>{formData.description.replace(/<[^>]*>/g, '').length}/500</span>
          </div>
        </div>

        <div>
          <TagInput
            tags={formData.tags}
            onTagsChange={handleTagsChange}
            maxTags={10}
            maxLength={20}
            label="Tags da Comunidade"
            placeholder="Digite uma tag e pressione Enter"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="public"
              name="privacy"
              checked={formData.isPublic}
              onChange={() => setFormData({ ...formData, isPublic: true })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="public" className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
              <FiGlobe className="mr-1" />
              Público - Qualquer pessoa pode ver o conteúdo
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="private"
              name="privacy"
              checked={!formData.isPublic}
              onChange={() => setFormData({ ...formData, isPublic: false })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="private" className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
              <FiLock className="mr-1" />
              Privado - Apenas membros podem ver o conteúdo
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Associação *
          </label>
          <select
            id="membershipType"
            value={formData.membershipType}
            onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            required
          >
            <option value="open">Aberta - Qualquer pessoa pode entrar</option>
            <option value="approval">Aprovação Necessária - Membros devem ser aprovados</option>
            <option value="invite">Somente Convite - Apenas por convite</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (
              <>
                <FiSave className="mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}