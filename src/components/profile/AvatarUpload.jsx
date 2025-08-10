import { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

export default function AvatarUpload({ currentUrl, onUpload, size = 'md' }) {
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validações
    if (!file.type.match('image.*')) {
      showNotification('error', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showNotification('error', 'Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg`}>
      {currentUrl ? (
        <img 
          src={currentUrl} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-indigo-100 dark:bg-gray-600 flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-800 dark:text-gray-300">
            {size === 'xl' ? '👤' : size === 'lg' ? '👤' : '👤'}
          </span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full">
          {isUploading ? (
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}