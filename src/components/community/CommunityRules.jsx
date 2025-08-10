import { useState } from 'react';
import { FiEdit2, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import RichTextEditor from '@/components/common/RichTextEditor';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CommunityRules({ rules, communityId, userRole }) {
  const safeRules = Array.isArray(rules) ? rules : [];

  const [editing, setEditing] = useState(false);
  const [localRules, setLocalRules] = useState([...safeRules]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRule = () => {
    setLocalRules([...localRules, { title: '', content: '' }]);
  };

  const handleRemoveRule = (index) => {
    const newRules = [...localRules];
    newRules.splice(index, 1);
    setLocalRules(newRules);
  };

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
          throw new Error('All rules must have a title and content');
        }
      }

      // Chamada API para salvar (implementação fictícia)
      // await api.put(`/communities/${communityId}/rules`, { rules: localRules });
      
      setEditing(false);
      // Em uma implementação real, você atualizaria o estado com a resposta da API
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Community Rules</h2>
        
        {userRole === 'admin' && !editing && (
          <Button
            onClick={() => setEditing(true)}
            size="sm"
            variant="outline"
          >
            <FiEdit2 className="mr-2" />
            Edit Rules
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
                  placeholder="Rule title"
                  maxLength={100}
                />
                <button
                  onClick={() => handleRemoveRule(index)}
                  className="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
              
              <RichTextEditor
                value={rule.content}
                onChange={(html) => handleRuleChange(index, 'content', html)}
                placeholder="Rule description..."
                maxLength={500}
                className="min-h-[150px]"
              />
            </div>
          ))}

          <Button
            onClick={handleAddRule}
            variant="outline"
            size="sm"
          >
            <FiPlus className="mr-2" />
            Add Rule
          </Button>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => {
                setEditing(false);
                setLocalRules([...safeRules]);
              }}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <FiSave className="mr-2" />
                  Save Rules
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
                No rules have been set for this community
              </p>
            </div>
          ) : (
            localRules.map((rule, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{rule.title}</h3>
                <div 
                  className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
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