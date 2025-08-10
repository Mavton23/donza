import { useState } from 'react';
import { FiFile, FiLink, FiDownload, FiEdit, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

const ContentGallery = ({ contents, onPreview, onEdit, onDelete, canEdit, isLoading }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const getFileIcon = (fileType) => {
    const baseClasses = "w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center";
    
    switch(fileType) {
      case 'pdf': 
        return (
          <div className={`${baseClasses} bg-red-100 text-red-600`}>
            <FiFile className="w-4 h-4" />
          </div>
        );
      case 'video': 
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
            <FiFile className="w-4 h-4" />
          </div>
        );
      case 'image': 
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            <FiFile className="w-4 h-4" />
          </div>
        );
      case 'link': 
        return (
          <div className={`${baseClasses} bg-indigo-100 text-indigo-600`}>
            <FiLink className="w-4 h-4" />
          </div>
        );
      default: 
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
            <FiFile className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (isLoading && contents.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full animate-pulse">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFile className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Nenhum conteúdo compartilhado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comece compartilhando arquivos ou links com o grupo
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {contents.map(content => (
          <motion.div
            key={content.contentId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col"
            onMouseEnter={() => setHoveredItem(content.contentId)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="p-4 flex-grow">
              <div className="flex items-start space-x-3">
                {getFileIcon(content.fileType)}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                    {content.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(content.createdAt)}
                  </p>
                </div>
              </div>

              {content.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {content.description}
                </p>
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {content.fileType === 'link' ? 'Link' : content.fileType}
                </span>
                {content.downloadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {content.downloadCount} download{content.downloadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(content.fileUrl || content.externalUrl, '_blank')}
                  className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Download"
                >
                  <FiDownload className="w-4 h-4" />
                </button>

                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FiMoreVertical className="w-4 h-4" />
                  </Menu.Button>

                  <Transition
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => onPreview(content)}
                            className={clsx(
                              active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200',
                              'block w-full text-left px-4 py-2 text-sm items-center space-x-2'
                            )}
                          >
                            <FiEye className="w-4 h-4" />
                            <span>Visualizar</span>
                          </button>
                        )}
                      </Menu.Item>
                      {canEdit && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onEdit(content)}
                                className={clsx(
                                  active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200',
                                  'block w-full text-left px-4 py-2 text-sm items-center space-x-2'
                                )}
                              >
                                <FiEdit className="w-4 h-4" />
                                <span>Editar</span>
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onDelete(content.contentId)}
                                className={clsx(
                                  active ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-red-600 dark:text-red-400',
                                  'block w-full text-left px-4 py-2 text-sm items-center space-x-2'
                                )}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Excluir</span>
                              </button>
                            )}
                          </Menu.Item>
                        </>
                      )}
                    </div>
                  </Transition>
                </Menu>
              </div>
            </div>

            <AnimatePresence>
              {hoveredItem === content.contentId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black bg-opacity-10 dark:bg-opacity-20 rounded-lg pointer-events-none"
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContentGallery;