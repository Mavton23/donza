import { useState, useRef, useEffect } from 'react';
import { FiPaperclip, FiSend, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

export default function CommunityChatInput({ 
  onSendMessage,
  onTyping,
  placeholder,
  disabled
}) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  
  const debouncedTypingStop = useDebounce(() => {
    setIsTyping(false);
    onTyping(false);
  }, 2000);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || file) && !disabled) {
      onSendMessage({
        text: message,
        file: file ? {
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        } : null
      });
      setMessage('');
      setFile(null);
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Verificar tamanho máximo do arquivo (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo permitido: 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    debouncedTypingStop();
  }, [message, isTyping, debouncedTypingStop, onTyping]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-3">
      {file && (
        <div className="flex items-center justify-between mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
          <div className="flex items-center">
            <span className="truncate max-w-xs">{file.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX />
          </button>
        </div>
      )}
      
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={disabled}
        >
          <FiPaperclip />
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, .pdf, .doc, .docx"
            disabled={disabled}
          />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 mx-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        />
        
        <Button
          type="submit"
          variant="primary"
          size="icon"
          disabled={(!message.trim() && !file) || disabled}
        >
          <FiSend />
        </Button>
      </div>
    </form>
  );
}