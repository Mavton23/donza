import { useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import TimeAgo from '../common/TimeAgo';
import { BookOpen, User, Headphones } from 'lucide-react';

export default function MessageThread({ messages, currentUser, context }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextIcon = () => {
    switch(context) {
      case 'course': return <BookOpen size={16} className="text-indigo-600" />;
      case 'support': return <Headphones size={16} className="text-green-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto messages-container">
      {context && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center text-sm text-gray-600 dark:text-gray-400">
          {getContextIcon()}
          <span className="ml-2">
            {context === 'course' ? 'Course-related conversation' : 
             context === 'support' ? 'Support ticket' : 'Direct message'}
          </span>
        </div>
      )}
      
      <div className="p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.messageId}
            className={`flex ${message.senderId === currentUser.userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === currentUser.userId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              } ${
                message.isTicket ? 'border-l-4 border-yellow-500' : ''
              }`}
            >
              {message.isTicket && (
                <div className="text-xs font-semibold mb-1 text-yellow-600 dark:text-yellow-400">
                  COURSE QUESTION
                </div>
              )}
              <div className="flex items-center mb-1">
                <Avatar user={message.sender} size="xs" className="mr-2" />
                <span className="text-xs font-medium">
                  {message.senderId === currentUser.userId ? 'You' : message.sender.username}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
              <TimeAgo 
                date={message.createdAt} 
                className={`text-xs mt-1 ${
                  message.senderId === currentUser.userId 
                    ? 'text-indigo-200' 
                    : 'text-gray-500'
                }`}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}