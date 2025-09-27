import { useState } from 'react';
import { Bookmark, Share2, Download, Heart } from 'lucide-react';

export default function LessonActions({ lesson, isEnrolled, onEnroll, canAccess }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      {!canAccess && (
        <button
          onClick={onEnroll}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          {lesson.isFree ? 'Acessar Grátis' : `Comprar (${lesson.price})`}
        </button>
      )}
      
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
        <Bookmark className="w-5 h-5" />
      </button>
      
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
        <Share2 className="w-5 h-5" />
      </button>
      
      {canAccess && lesson.mediaUrl && (
        <a
          href={lesson.mediaUrl}
          download
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Download className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}