import { useCallback, useState, useRef } from 'react';
import { FiUpload, FiX, FiLink, FiPaperclip, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function ContentUploader({ groupId, onUpload, onLinkSubmit, isLoading }) {
  const [files, setFiles] = useState([]);
  const [link, setLink] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const linkInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type.split('/')[0] || 'file'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov'],
      'text/plain': ['.txt', '.md'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/zip': ['.zip', '.rar']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.warning('Selecione pelo menos um arquivo para enviar');
      return;
    }
    
    onUpload(files.map(f => f.file));
    setFiles([]);
  };

  const handleLinkSubmit = () => {
    if (!link.trim()) {
      toast.warning('Por favor, insira um link válido');
      linkInputRef.current?.focus();
      return;
    }
    
    try {
      new URL(link); // Validação básica de URL
      onLinkSubmit(link);
      setLink('');
    } catch (e) {
      toast.error('Por favor, insira uma URL válida (começando com http:// ou https://)');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return <FiFile className="text-blue-400" />;
      case 'pdf': return <FiFile className="text-red-400" />;
      case 'video': return <FiFile className="text-purple-400" />;
      case 'text': return <FiFile className="text-green-400" />;
      default: return <FiFile className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload /> Upload de Arquivos
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'link' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('link')}
        >
          <FiLink /> Compartilhar Link
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {isDragActive ? (
                <span className="text-indigo-600 dark:text-indigo-400">Solte os arquivos aqui</span>
              ) : (
                <>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">Clique para enviar</span> ou arraste arquivos
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formatos suportados: PDF, vídeos, imagens, documentos (até 50MB)
            </p>
          </div>

          {/* File Preview List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arquivos selecionados ({files.length})
                </h4>
                
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-xs">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))}

                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Enviar {files.length} arquivo{files.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Link Tab */}
      {activeTab === 'link' && (
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL do conteúdo
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLink className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="link"
                  ref={linkInputRef}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/document.pdf"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título (opcional)
              </label>
              <input
                type="text"
                id="title"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Título descritivo para o link"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Adicione uma descrição útil sobre este recurso"
              />
            </div>

            <button
              onClick={handleLinkSubmit}
              disabled={isLoading || !link.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Compartilhando...
                </>
              ) : (
                <>
                  <FiPaperclip /> Compartilhar Link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}