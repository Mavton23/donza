import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { HelpCircle, Wifi, WifiOff } from 'lucide-react';

export default function MessageComposer({ 
  onSend, 
  context, 
  disabled,
  isOnline,
  conversationId, 
  onMarkAsRead 
}) {
  const [message, setMessage] = useState('');
  const [isTicket, setIsTicket] = useState(false);

  useEffect(() => {
    const input = document.querySelector('input[type="text"]');
    if (input) input.focus();
    
    if (conversationId) {
      onMarkAsRead(conversationId);
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
            This is a question about the course
          </label>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            context === 'course' ? "Ask about the course..." : 
            isTicket ? "Describe your issue..." : 
            "Type your message..."
          }
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
              {disabled ? "Connecting..." : "Send"}
            </Button>
          <div className="ml-2" title={isOnline ? 'Online' : 'Connecting...'}>
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