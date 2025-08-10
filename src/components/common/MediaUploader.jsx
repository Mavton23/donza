import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, Trash2, File, FileText, Film, Music } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function MediaUploader({ 
  type = 'video',
  onFileUpload,
  preview = null,
  maxSize = 50,
  disabled = false,
  durationInput = false
}) {
  const fileInputRef = useRef(null);
  const [previewData, setPreviewData] = useState({
    url: preview,
    type: 'url'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  // Configurações específicas por tipo
  const TYPE_CONFIG = {
    video: {
      accept: 'video/*',
      icon: <Film className="h-10 w-10" />,
      label: 'MP4, MOV, AVI',
      previewType: 'video'
    },
    pdf: {
      accept: 'application/pdf',
      icon: <FileText className="h-10 w-10" />,
      label: 'PDF',
      previewType: 'embed'
    },
    audio: {
      accept: 'audio/*',
      icon: <Music className="h-10 w-10" />,
      label: 'MP3, WAV',
      previewType: 'audio'
    },
    image: {
      accept: 'image/*',
      icon: <File className="h-10 w-10" />,
      label: 'PNG, JPG',
      previewType: 'image'
    }
  };

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.video;

  // Atualiza a pré-visualização quando a prop preview muda
  useEffect(() => {
    if (preview) {
      setPreviewData({
        url: preview,
        type: 'url'
      });
    }
  }, [preview]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validações
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    if (!file.type.match(config.accept.replace('*', '.*'))) {
      setError(`Invalid file type. Accepted: ${config.label}`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Criar pré-visualização local
      const previewUrl = URL.createObjectURL(file);
      setPreviewData({
        url: previewUrl,
        type: 'blob',
        file
      });

      // Calcular duração para vídeo/áudio
      if (type === 'video' || type === 'audio') {
        await getMediaDuration(file).then(dur => {
          setDuration(Math.round(dur / 60));
        });
      }

      // Chamar callback do parent com o arquivo
      if (onFileUpload) {
        await onFileUpload(file, duration);
      }
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Função para calcular duração de mídia
  const getMediaDuration = (file) => {
    return new Promise((resolve) => {
      const media = type === 'video' 
        ? document.createElement('video') 
        : document.createElement('audio');
      
      media.src = URL.createObjectURL(file);
      media.onloadedmetadata = () => {
        resolve(media.duration);
        URL.revokeObjectURL(media.src);
      };
      media.onerror = () => {
        resolve(0);
      };
    });
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewData.type === 'blob') {
      URL.revokeObjectURL(previewData.url);
    }
    setPreviewData({ url: null, type: null });
    setDuration(0);
    if (onFileUpload) {
      onFileUpload(null, 0);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Renderizar pré-visualização específica por tipo
  const renderPreview = () => {
    if (!previewData.url) return null;

    switch (config.previewType) {
      case 'video':
        return (
          <video 
            src={previewData.url} 
            controls 
            className="w-full h-full object-contain max-h-64"
          />
        );
      case 'audio':
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <audio 
              src={previewData.url} 
              controls 
              className="w-full"
            />
          </div>
        );
      case 'embed':
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            <FileText className="h-16 w-16 text-gray-400" />
            <div className="ml-4">
              <p className="font-medium">{previewData.file?.name || 'PDF Document'}</p>
              <p className="text-sm text-gray-500">
                {(previewData.file?.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        );
      case 'image':
        return (
          <img
            src={previewData.url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={config.accept}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={triggerFileInput}
        className={`relative group rounded-lg border-2 border-dashed ${
          error
            ? 'border-red-300 dark:border-red-700'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } transition-colors duration-200 overflow-hidden`}
      >
        {previewData.url ? (
          <div className="relative">
            {renderPreview()}
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  title="Remove file"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {config.label} (max {maxSize}MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {durationInput && (type === 'video' || type === 'audio') && previewData.url && (
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Duration (minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

MediaUploader.propTypes = {
  type: PropTypes.oneOf(['video', 'pdf', 'audio', 'image']),
  onFileUpload: PropTypes.func.isRequired,
  preview: PropTypes.string,
  maxSize: PropTypes.number,
  disabled: PropTypes.bool,
  durationInput: PropTypes.bool
};