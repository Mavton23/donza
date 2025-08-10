import { useCallback, useState } from 'react';
import { FiUpload, FiX, FiLink } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function ContentUploader({ onUpload, onLinkSubmit }) {
  const [files, setFiles] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))]);
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitLink = (e) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      onLinkSubmit(linkUrl);
      setLinkUrl('');
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Files
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'link' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('link')}
        >
          Add Link
        </button>
      </div>

      {activeTab === 'upload' ? (
        <>
          <div 
            className="text-center cursor-pointer py-8"
            onClick={() => document.getElementById('file-upload').click()}
          >
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2 flex justify-center text-sm text-gray-600 dark:text-gray-300">
              <label className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                Click to upload
                <input 
                  id="file-upload"
                  type="file" 
                  className="sr-only" 
                  multiple 
                  onChange={(e) => onDrop(Array.from(e.target.files))}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PDF, images, videos up to 50MB
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center">
                    {file.preview && (
                      <img src={file.preview} alt="" className="w-10 h-10 object-cover rounded mr-2" />
                    )}
                    <span className="truncate max-w-xs">{file.file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
              
              <Button
                variant="primary"
                className="mt-3 w-full"
                onClick={() => {
                  onUpload(files);
                  setFiles([]);
                }}
              >
                Upload {files.length} file(s)
              </Button>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmitLink} className="space-y-3">
          <div className="flex items-center">
            <FiLink className="text-gray-400 mr-2" />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            disabled={!linkUrl.trim()}
          >
            Add Link
          </Button>
        </form>
      )}
    </div>
  );
}