import { useState } from 'react';
import { 
  Globe,
  Plus,
  X
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaGithub, FaLinkedin } from 'react-icons/fa';

const socialPlatforms = {
  facebook: { name: 'Facebook', icon: FaFacebook, color: 'text-blue-600 dark:text-blue-400' },
  twitter: { name: 'Twitter', icon: FaTwitter, color: 'text-blue-400 dark:text-blue-300' },
  instagram: { name: 'Instagram', icon: FaInstagram, color: 'text-pink-600 dark:text-pink-400' },
  linkedin: { name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700 dark:text-blue-500' },
  youtube: { name: 'YouTube', icon: FaYoutube, color: 'text-red-600 dark:text-red-400' },
  github: { name: 'GitHub', icon: FaGithub, color: 'text-gray-800 dark:text-gray-300' },
  website: { name: 'Website', icon: Globe, color: 'text-indigo-600 dark:text-indigo-400' }
};

export default function SocialMediaLinks({ socialMedia = {}, onSave, editable = true }) {
  const [links, setLinks] = useState(socialMedia);
  const [isEditing, setIsEditing] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '' });

  const handleAddLink = () => {
    if (!newLink.url.trim()) return;
    
    setLinks(prev => ({
      ...prev,
      [newLink.platform]: newLink.url
    }));
    setNewLink({ platform: 'facebook', url: '' });
  };

  const handleRemoveLink = (platform) => {
    const updatedLinks = { ...links };
    delete updatedLinks[platform];
    setLinks(updatedLinks);
  };

  const handleSave = () => {
    onSave(links);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Redes Sociais
        </h3>
        {editable && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(links).map(([platform, url]) => {
          const platformInfo = socialPlatforms[platform] || { 
            name: platform, 
            icon: Globe, 
            color: 'text-gray-600 dark:text-gray-400' 
          };
          
          return (
            <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex items-center">
                <platformInfo.icon className={`h-5 w-5 mr-3 ${platformInfo.color}`} />
                <a 
                  href={url.startsWith('http') ? url : `https://${url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {platformInfo.name}
                </a>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveLink(platform)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}

        {isEditing && (
          <div className="flex items-center space-x-2 mt-4">
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
              className="block w-32 rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(socialPlatforms).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="URL"
              className="flex-1 min-w-0 block rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddLink}
              className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}