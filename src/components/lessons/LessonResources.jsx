import { Download, ExternalLink, FileText, Video, FileAudio, Image, File } from 'lucide-react';

export default function LessonResources({ lesson, canAccess }) {
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'audio': return <FileAudio className="w-5 h-5 text-green-500" />;
      case 'image': return <Image className="w-5 h-5 text-purple-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['mp4', 'mov', 'avi', 'wmv', 'webm'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    return 'other';
  };

  if (!lesson.externalResources || lesson.externalResources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-indigo-600" />
        Recursos da Aula
      </h3>

      <div className="space-y-3">
        {lesson.externalResources.map((resource, index) => {
          const fileType = getFileType(resource);
          const fileName = resource.split('/').pop();
          
          return (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(fileType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {fileType} • {fileType === 'pdf' ? 'Documento' : 'Recurso'}
                </p>
              </div>
              
              <div className="flex-shrink-0 ml-3">
                {canAccess ? (
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Abrir recurso"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="p-1 text-gray-400 cursor-not-allowed" title="Acesso restrito">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!canAccess && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Faça login e adquira a aula para acessar todos os recursos
          </p>
        </div>
      )}
    </div>
  );
}