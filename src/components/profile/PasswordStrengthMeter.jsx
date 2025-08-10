import { useEffect, useState } from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback('');
      return;
    }

    let score = 0;
    const feedbackMessages = [];
    
    if (password.length >= 8) score += 1;
    else feedbackMessages.push('At least 8 characters');
    
    if (/\d/.test(password)) score += 1;
    else feedbackMessages.push('Add numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedbackMessages.push('Add special characters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedbackMessages.push('Add uppercase letters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedbackMessages.push('Add lowercase letters');

    setStrength(score);
    setFeedback(feedbackMessages.join(', '));
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = () => {
    return `${(strength / 5) * 100}%`;
  };

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
        <div 
          className={`h-full ${getStrengthColor()}`} 
          style={{ width: getStrengthWidth() }}
        />
      </div>
      {feedback && (
        <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {password.length < 8 ? 'Password too short' : `To improve: ${feedback}`}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;