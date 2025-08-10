import { useState } from 'react';
import { FiSave, FiLock, FiGlobe } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { TagsInput } from 'react-tag-input-component';

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
        throw new Error('Community name is required');
      }
      onUpdate(formData);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Community Settings</h2>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Community Name *
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
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <TagsInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            maxTags={10}
            maxLength={20}
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
              Public - Anyone can view content
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
              Private - Only members can view content
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Membership Type *
          </label>
          <select
            id="membershipType"
            value={formData.membershipType}
            onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            required
          >
            <option value="open">Open - Anyone can join</option>
            <option value="approval">Approval Required - Members must be approved</option>
            <option value="invite">Invite Only - Only by invitation</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                <FiSave className="mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}