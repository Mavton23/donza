import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiDownload, FiFile, FiLink } from 'react-icons/fi';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import Modal from '@/components/common/Modal';

/**
 * Component for managing study group resources (files and links)
 */
export default function StudyGroupResources({ groupId, communityId, isMember, userRole }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState({
    type: 'link',
    title: '',
    url: '',
    file: null,
    description: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/communities/${communityId}/study-groups/${groupId}/resources`);
        setResources(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    if (isMember) {
      fetchResources();
    }
  }, [communityId, groupId, isMember]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (!newResource.title.trim()) {
        throw new Error('Title is required');
      }

      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('description', newResource.description);
      formData.append('type', newResource.type);
      
      if (newResource.type === 'link') {
        if (!newResource.url.trim()) {
          throw new Error('URL is required for links');
        }
        formData.append('url', newResource.url);
      } else if (newResource.type === 'file' && newResource.file) {
        formData.append('file', newResource.file);
      } else {
        throw new Error('File is required for file uploads');
      }

      const response = await api.post(
        `/communities/${communityId}/study-groups/${groupId}/resources`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResources([...resources, response.data]);
      setShowAddModal(false);
      setNewResource({
        type: 'link',
        title: '',
        url: '',
        file: null,
        description: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await api.delete(`/communities/${communityId}/study-groups/${groupId}/resources/${resourceId}`);
      setResources(resources.filter(resource => resource.resourceId !== resourceId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleFileChange = (e) => {
    setNewResource({
      ...newResource,
      file: e.target.files[0]
    });
  };

  if (!isMember) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Join the study group to access and contribute resources
        </p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onClose={setError('')} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Study Group Resources
        </h3>
        {(userRole === 'admin' || userRole === 'moderator') && (
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            variant="primary"
          >
            <FiPlus className="mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No resources have been added yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map(resource => (
            <div 
              key={resource.resourceId} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {resource.type === 'file' ? (
                      <FiFile className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <FiLink className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white truncate">
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {resource.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Added by {resource.creator.name} on {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {resource.type === 'file' ? (
                    <a 
                      href={resource.fileUrl} 
                      download
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      <FiDownload className="h-5 w-5" />
                    </a>
                  ) : (
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      <FiLink className="h-5 w-5" />
                    </a>
                  )}
                  {(userRole === 'admin' || userRole === 'moderator') && (
                    <button
                      onClick={() => handleDeleteResource(resource.resourceId)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError('');
        }}
        title="Add New Resource"
      >
        <form onSubmit={handleAddResource} className="space-y-4">
          {error && <ErrorMessage message={error} onClose={setError('')} />}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resource Type *
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  checked={newResource.type === 'link'}
                  onChange={() => setNewResource({ ...newResource, type: 'link' })}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Link</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  checked={newResource.type === 'file'}
                  onChange={() => setNewResource({ ...newResource, type: 'file' })}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">File</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              required
              maxLength={100}
              placeholder="Resource title"
            />
          </div>

          {newResource.type === 'link' && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                id="url"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                required
                placeholder="https://example.com"
              />
            </div>
          )}

          {newResource.type === 'file' && (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File *
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300"
                required={newResource.type === 'file'}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max file size: 10MB. Supported formats: PDF, DOC, PPT, XLS, ZIP, JPG, PNG
              </p>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              placeholder="Brief description of the resource"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Add Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}