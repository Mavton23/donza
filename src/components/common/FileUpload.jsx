import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';

export default function FileUpload({ 
  accept = 'image/*',
  onFileUpload,
  preview = null,
  maxSize = 5,
  disabled = false,
  required = false
}) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(preview);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (preview) {
      setPreviewUrl(preview);
    }
  }, [preview]);

  const validateFileType = (file, acceptPatterns) => {
    const acceptedTypes = acceptPatterns.split(',').map(type => type.trim());
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    return acceptedTypes.some(pattern => {
      const cleanPattern = pattern.startsWith('.') ? pattern.slice(1) : pattern;
      return fileExtension === cleanPattern.toLowerCase();
    });
};

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validações
    if (file.size > maxSize * 1024 * 1024) {
      setError(`O tamanho do arquivo excede o limite de ${maxSize}MB`);
      return;
    }

    if (!validateFileType(file, accept)) {
      setError(`Tipo de arquivo inválido. Aceito: ${accept}`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Criar pré-visualização local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      if (onFileUpload) {
        await onFileUpload(file);
      }
    } catch (err) {
      setError('Falha ao processar o arquivo. Tente novamente.');
      console.error('Erro no upload do arquivo:', err);
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
    if (onFileUpload) {
      onFileUpload(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={triggerFileInput}
        className={`relative group cursor-pointer rounded-lg border-2 border-dashed ${
          error
            ? 'border-red-300 dark:border-red-700'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } transition-colors duration-200 overflow-hidden`}
      >
        {previewUrl ? (
          <div className="relative aspect-video">
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="w-full h-full object-cover"
              required={required}
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  title="Remover imagem"
                >
                  <Icon name="trash-2" size="sm" />
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
                <Icon
                  name="upload-cloud"
                  className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    Clique para enviar
                  </span>{' '}
                  ou arraste e solte
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {accept === 'image/*'
                    ? `PNG, JPG, GIF (máx ${maxSize}MB)`
                    : `Arquivo (máx ${maxSize}MB)`
                  }
                  {required && (
                    <span className='text-red-600 ml-1'>*</span>
                  )}
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
  disabled: PropTypes.bool
};