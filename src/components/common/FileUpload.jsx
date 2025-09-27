import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';
import { 
  FileText, 
  Video, 
  Image, 
  Headphones, 
  File,
  UploadCloud,
  Trash2
} from 'lucide-react';

export default function FileUpload({ 
  accept = 'image/*',
  onFileUpload,
  preview = null,
  maxSize = 5,
  disabled = false,
  fileType = 'auto' // 'image', 'video', 'audio', 'pdf', 'document', 'auto'
}) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(preview);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  // Mapeamento de ícones por tipo de arquivo
  const fileTypeIcons = {
    image: Image,
    video: Video,
    audio: Headphones,
    pdf: FileText,
    document: File,
    default: File
  };

  // Configurações por tipo de arquivo
  const fileTypeConfig = {
    image: {
      accept: 'image/*',
      maxSize: 5,
      preview: true
    },
    video: {
      accept: 'video/*,.mp4,.mov,.avi,.wmv,.flv,.webm,.mkv',
      maxSize: 500,
      preview: true
    },
    audio: {
      accept: 'audio/*,.mp3,.wav,.ogg,.m4a,.aac',
      maxSize: 100,
      preview: false
    },
    pdf: {
      accept: '.pdf',
      maxSize: 50,
      preview: false
    },
    document: {
      accept: '.pdf,.doc,.docx,.txt',
      maxSize: 10,
      preview: false
    }
  };

  useEffect(() => {
    if (preview) {
      setPreviewUrl(preview);
    }
  }, [preview]);

  // Determinar configurações baseadas no fileType
  const getFileConfig = () => {
    if (fileType !== 'auto' && fileTypeConfig[fileType]) {
      return fileTypeConfig[fileType];
    }
    
    // Configuração automática baseada no accept
    if (accept.includes('image/*')) return fileTypeConfig.image;
    if (accept.includes('video/*')) return fileTypeConfig.video;
    if (accept.includes('audio/*')) return fileTypeConfig.audio;
    if (accept.includes('.pdf')) return fileTypeConfig.pdf;
    
    return {
      accept: accept,
      maxSize: maxSize,
      preview: false
    };
  };

  const config = getFileConfig();
  const effectiveAccept = config.accept;
  const effectiveMaxSize = config.maxSize;
  const supportsPreview = config.preview;

  const validateFileType = (file, acceptPatterns) => {
    const acceptedTypes = acceptPatterns.split(',').map(type => type.trim());
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    return acceptedTypes.some(pattern => {
      if (pattern.includes('*')) {
        const category = pattern.split('/*')[0];
        return file.type.startsWith(category);
      }
      
      const cleanPattern = pattern.startsWith('.') ? pattern.slice(1) : pattern;
      return fileExtension === cleanPattern.toLowerCase();
    });
  };

  const getFileIcon = (file) => {
    if (!file) return fileTypeIcons.default;
    
    if (file.type.startsWith('image/')) return fileTypeIcons.image;
    if (file.type.startsWith('video/')) return fileTypeIcons.video;
    if (file.type.startsWith('audio/')) return fileTypeIcons.audio;
    if (file.type === 'application/pdf') return fileTypeIcons.pdf;
    
    return fileTypeIcons.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validações
    if (file.size > effectiveMaxSize * 1024 * 1024) {
      setError(`Tamanho do arquivo excede o limite de ${effectiveMaxSize}MB`);
      return;
    }

    if (!validateFileType(file, effectiveAccept)) {
      setError(`Tipo de arquivo inválido. Aceito: ${effectiveAccept}`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });

      // Criar pré-visualização apenas para tipos suportados
      if (supportsPreview) {
        if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          
          video.onloadedmetadata = function() {
            video.currentTime = Math.min(1, video.duration / 4);
          };
          
          video.onseeked = function() {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPreviewUrl(canvas.toDataURL());
            window.URL.revokeObjectURL(video.src);
          };
          
          video.src = URL.createObjectURL(file);
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
      } else {
        // Para arquivos sem preview, usar ícone representativo
        setPreviewUrl(null);
      }

      // Chamar callback
      if (onFileUpload) {
        await onFileUpload(file);
      }
    } catch (err) {
      setError('Falha ao processar o arquivo. Tente novamente.');
      console.error('Erro no upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileInfo(null);
    if (onFileUpload) {
      onFileUpload(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptText = () => {
    if (effectiveAccept.includes('video/*')) {
      return `Vídeos (MP4, MOV, AVI) - até ${effectiveMaxSize}MB`;
    }
    if (effectiveAccept.includes('image/*')) {
      return `Imagens (PNG, JPG, GIF) - até ${effectiveMaxSize}MB`;
    }
    if (effectiveAccept.includes('audio/*')) {
      return `Áudios (MP3, WAV) - até ${effectiveMaxSize}MB`;
    }
    if (effectiveAccept.includes('.pdf')) {
      return `PDF - até ${effectiveMaxSize}MB`;
    }
    return `Arquivos suportados - até ${effectiveMaxSize}MB`;
  };

  const FileIcon = fileInfo ? getFileIcon({ type: fileInfo.type }) : UploadCloud;

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={effectiveAccept}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={triggerFileInput}
        className={`relative group cursor-pointer rounded-lg border-2 border-dashed ${
          error
            ? 'border-red-300 dark:border-red-700'
            : fileInfo
            ? 'border-green-300 dark:border-green-700'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } transition-colors duration-200 overflow-hidden`}
      >
        {previewUrl && supportsPreview ? (
          // Preview visual para imagens e vídeos
          <div className="relative aspect-video">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title="Remover arquivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : fileInfo ? (
          // Informações do arquivo para tipos sem preview
          <div className="p-6">
            <div className="flex items-center justify-center mb-3">
              <FileIcon className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fileInfo.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fileInfo.size} • {fileInfo.type}
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Remover arquivo
                </button>
              )}
            </div>
          </div>
        ) : (
          // Estado vazio - pronto para upload
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {isUploading ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    Clique para enviar
                  </span>{' '}
                  ou arraste e solte
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getAcceptText()}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  accept: PropTypes.string,
  onFileUpload: PropTypes.func.isRequired,
  preview: PropTypes.string,
  maxSize: PropTypes.number,
  disabled: PropTypes.bool,
  fileType: PropTypes.oneOf(['auto', 'image', 'video', 'audio', 'pdf', 'document'])
};

FileUpload.defaultProps = {
  accept: 'image/*',
  maxSize: 5,
  disabled: false,
  fileType: 'auto'
};