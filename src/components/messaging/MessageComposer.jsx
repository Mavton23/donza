import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { HelpCircle, Wifi, WifiOff } from 'lucide-react';

export default function MessageComposer({ 
  onSend, 
  onTypingChange,
  context, 
  disabled,
  isOnline,
  conversationId, 
  onMarkAsRead 
}) {
  const [message, setMessage] = useState('');
  const [isTicket, setIsTicket] = useState(false);
  const typingTimeoutRef = useRef(null);


  useEffect(() => {
    const input = document.querySelector('input[type="text"]');
    if (input) input.focus();
    
    if (conversationId) {
      onMarkAsRead?.(conversationId);
    }
  }, [conversationId, onMarkAsRead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message, isTicket);
      setMessage('');
      setIsTicket(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Traduções para português
  const getPlaceholder = () => {
    if (context === 'course') {
      return isTicket ? "Descreva sua pergunta sobre o curso..." : "Pergunte sobre o curso...";
    }
    if (isTicket) {
      return "Descreva seu problema...";
    }
    return "Digite sua mensagem...";
  };

  const getCheckboxLabel = () => {
    if (context === 'course') {
      return "Esta é uma pergunta sobre o curso";
    }
    return "Marcar como ticket de suporte";
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      {context === 'course' && (
        <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
          <HelpCircle className="mr-2" size={16} />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTicket}
              onChange={(e) => setIsTicket(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={disabled}
            />
            {getCheckboxLabel()}
          </label>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 ${
            disabled 
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          maxLength={2000}
          disabled={disabled}
        />
        <div className="flex items-center">
          <Button
            type="submit"
            variant={disabled ? "disabled" : "primary"}
            disabled={!message.trim() || disabled}
            className="self-end"
          >
            {disabled ? "Conectando..." : "Enviar"}
          </Button>
          <div className="ml-2" title={isOnline ? 'Online' : 'Conectando...'}>
            {isOnline ? (
              <Wifi size={18} className="text-green-500" />
            ) : (
              <WifiOff size={18} className="text-red-500" />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}