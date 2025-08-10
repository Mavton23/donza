import { FiX, FiAward } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const tierColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-300',
  gold: 'bg-yellow-400',
  platinum: 'bg-blue-200',
  default: 'bg-purple-100'
};

export default function NotificationToast({ 
  achievement,
  onClose,
  autoClose = 5000
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-lg overflow-hidden ${tierColors[achievement.tier] || tierColors.default}`}>
      <div className="p-4 pr-8 max-w-xs">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiAward className={`h-6 w-6 ${achievement.tier === 'bronze' || achievement.tier === 'default' ? 'text-white' : 'text-gray-800'}`} />
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${achievement.tier === 'bronze' || achievement.tier === 'default' ? 'text-white' : 'text-gray-800'}`}>
              Achievement Unlocked!
            </h3>
            <div className={`mt-1 text-sm ${achievement.tier === 'bronze' || achievement.tier === 'default' ? 'text-white' : 'text-gray-800'}`}>
              <p className="font-bold">{achievement.title}</p>
              <p>{achievement.description}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`absolute top-2 right-2 rounded-full p-1 ${achievement.tier === 'bronze' || achievement.tier === 'default' ? 'text-white hover:bg-black/10' : 'text-gray-800 hover:bg-black/5'}`}
        onClick={() => {
          setVisible(false);
          onClose();
        }}
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}