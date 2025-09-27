import { useState, useEffect } from 'react';
import { FiEdit2, FiSave } from 'react-icons/fi';
import RichTextEditor from '@/components/common/RichTextEditor';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';
import api from '@/services/api';

export default function CommunityRules({ rules, communityId, userRole }) {
  const transformRulesToArray = (rulesObj) => {
    if (!rulesObj) return [];
    
    if (Array.isArray(rulesObj)) return rulesObj;
    
    return [
      { 
        title: 'Diretrizes da Comunidade', 
        content: rulesObj.guidelines || '' 
      },
      { 
        title: 'Conteúdo Permitido', 
        content: rulesObj.allowedContent || '' 
      },
      { 
        title: 'Política de Moderação', 
        content: rulesObj.moderationPolicy || '' 
      }
    ];
  };

  const [editing, setEditing] = useState(false);
  const [localRules, setLocalRules] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Inicializar as regras quando o componente montar
  useEffect(() => {
    setLocalRules(transformRulesToArray(rules));
  }, [rules]);

  const handleRuleChange = (index, field, value) => {
    const newRules = [...localRules];
    newRules[index][field] = value;
    setLocalRules(newRules);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validação básica
      for (const rule of localRules) {
        if (!rule.title.trim() || !rule.content.trim()) {
          throw new Error('Todas as regras devem ter um título e um conteúdo');
        }
      }

      // Transformar de volta para o formato original
      const rulesToSave = {
        guidelines: localRules[0]?.content || '',
        allowedContent: localRules[1]?.content || '',
        moderationPolicy: localRules[2]?.content || ''
      };

      const response = await api.put(`/community/${communityId}/rules`, { rules: rulesToSave });
      
      // Atualiza as regras com a resposta da API
      if (response.data.data.community.rules) {
        setLocalRules(transformRulesToArray(response.data.data.community.rules));
      }

      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Falha ao salvar regras');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalRules(transformRulesToArray(rules));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regras da Comunidade</h2>
        
        {userRole === 'admin' && !editing && (
          <Button
            onClick={() => setEditing(true)}
            size="sm"
            variant="outline"
          >
            <FiEdit2 className="mr-2" />
            Editar Regras
          </Button>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {editing ? (
        <div className="space-y-6">
          {localRules.map((rule, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={rule.title}
                  onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 font-medium"
                  placeholder="Título da regra"
                  maxLength={100}
                />
              </div>
              
              <RichTextEditor
                value={rule.content}
                onChange={(html) => handleRuleChange(index, 'content', html)}
                placeholder="Descrição da regra..."
                maxLength={500}
                className="min-h-[150px]"
              />
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (
                <>
                  <FiSave className="mr-2" />
                  Salvar Regras
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {localRules.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Nenhuma regra foi definida para esta comunidade
              </p>
            </div>
          ) : (
            localRules.map((rule, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{rule.title}</h3>
                <div 
                  className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 overflow-x-auto p-3"
                  dangerouslySetInnerHTML={{ __html: rule.content }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}