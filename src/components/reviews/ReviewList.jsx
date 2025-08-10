import { useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Avatar from '../common/Avatar';

export default function ReviewList({
  reviews,
  currentUserId,
  editable,
  showReplyForm,
  onReplyStart,
  onReplySubmit,
  isSubmittingReply,
  isInstructor
}) {
  const [replyTexts, setReplyTexts] = useState({});

  const handleReplyChange = (reviewId, text) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleLocalReplySubmit = (reviewId) => {
    onReplySubmit(reviewId, replyTexts[reviewId] || '');
    setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      {reviews?.map(review => (
        <div key={review.reviewId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start">
            <Link 
              to={`/profile/${review.user.userId}`}
              className="flex-shrink-0"
            >
              <Avatar 
                src={review.user.avatarUrl}
                name={review.user.username}
                size="md"
              />
            </Link>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Link 
                    to={`/profile/${review.user.userId}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {review.user.username}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Rating value={review.rating} size="sm" />
              </div>
              
              <div className="mt-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {review.title}
                </h3>
                <div className="mt-2 prose dark:prose-invert text-gray-600 dark:text-gray-300">
                  {review.comment}
                </div>
              </div>

              {/* Instructor Reply Section */}
              {review.instructorReply && (
                <div className="mt-4 pl-4 border-l-4 border-indigo-200 dark:border-indigo-800 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Organizer Response
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {review.instructorReply}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.replyDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Reply Form (for instructors) */}
              {isInstructor && showReplyForm === review.reviewId && !review.instructorReply && (
                <div className="mt-4">
                  <textarea
                    value={replyTexts[review.reviewId] || ''}
                    onChange={(e) => handleReplyChange(review.reviewId, e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
                    rows={3}
                    placeholder="Write your response..."
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => onReplyStart(null)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleLocalReplySubmit(review.reviewId)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex justify-between items-center">
                {editable && review.user.userId === currentUserId && (
                  <div className="flex space-x-4 text-sm">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                      Edit
                    </button>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300">
                      Delete
                    </button>
                  </div>
                )}

                {isInstructor && !review.instructorReply && !showReplyForm && (
                    <button
                      onClick={() => onReplyStart(review.reviewId)}
                      disabled={isSubmittingReply}
                      className={`text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 ${
                        isSubmittingReply ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmittingReply && showReplyForm === review.reviewId ? 'Sending...' : 'Respond'}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}