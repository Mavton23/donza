import React, { useState } from 'react';
import { 
  FiHeart, FiThumbsUp, FiAward, FiEdit3, 
  FiHelpCircle, FiEye, FiSmile 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = [
  { type: 'like', icon: <FiHeart />, label: 'Like', color: 'text-red-500' },
  { type: 'helpful', icon: <FiThumbsUp />, label: 'Helpful', color: 'text-blue-500' },
  { type: 'celebrate', icon: <FiAward />, label: 'Celebrate', color: 'text-yellow-500' },
  { type: 'creative', icon: <FiEdit3 />, label: 'Creative', color: 'text-purple-500' },
  { type: 'confused', icon: <FiHelpCircle />, label: 'Confused', color: 'text-gray-500' },
  { type: 'insightful', icon: <FiEye />, label: 'Insightful', color: 'text-green-500' },
];

export default function ReactionButton({ currentReaction, count, onClick }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const currentReactionData = REACTIONS.find(r => r.type === currentReaction);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`flex items-center gap-1 px-2 py-1 rounded-md ${
          currentReaction
            ? `${currentReactionData.color} bg-opacity-10 ${currentReactionData.color.replace('text', 'bg')}`
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}
      >
        {currentReactionData ? (
          <span className={currentReactionData.color}>{currentReactionData.icon}</span>
        ) : (
          <FiSmile />
        )}
        <span>{count || 0}</span>
      </button>

      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-1 flex items-center"
          >
            {REACTIONS.map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.3, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                onClick={() => {
                  onClick(reaction.type);
                  setIsHovering(false);
                }}
                className={`p-2 rounded-full text-xl ${reaction.color} ${
                  currentReaction === reaction.type 
                    ? 'bg-opacity-20 ' + reaction.color.replace('text', 'bg')
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={reaction.label}
              >
                {reaction.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hoveredReaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-10 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap"
        >
          {REACTIONS.find(r => r.type === hoveredReaction)?.label}
        </motion.div>
      )}
    </div>
  );
}