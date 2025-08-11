import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

export default function LessonItem({ lesson, courseId, moduleId, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);
  const [duration, setDuration] = useState(lesson.duration);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('lessonType', lesson.lessonType);
      formData.append('duration', duration);
      formData.append('isFree', lesson.isFree);
      formData.append('isPublished', lesson.isPublished);
      
      if (videoFile) {
        formData.append('video', videoFile);
      }
      
      if (attachmentFiles) {
        Array.from(attachmentFiles).forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }
  
      const response = await api.put(
        `/lessons/${courseId}/modules/${moduleId}/lessons/${lesson.lessonId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      onUpdate({
        ...response.data.data,
        attachments: response.data.data.attachments || lesson.attachments
      });
      
      setIsEditing(false);
      setError('');
      setVideoFile(null);
      setAttachmentFiles(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/lessons/${courseId}/modules/${moduleId}/lessons/${lesson.lessonId}`);
      onDelete(lesson.lessonId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const moveLesson = async (direction) => {
    try {
      setIsLoading(true);
      const response = await api.put(`/lessons/${courseId}/modules/${moduleId}/lessons/${lesson.lessonId}/reorder`, {
        direction
      });
      onUpdate(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-3 border border-gray-200 dark:border-gray-600">
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            placeholder="Lesson title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            placeholder="Lesson description"
            rows="3"
          />
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            placeholder="Video URL"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            placeholder="Duration (minutes)"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-indigo-600 text-white rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Link
              to={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.lessonId}`}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {lesson.title}
            </Link>
            {lesson.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {lesson.description.substring(0, 60)}...
              </p>
            )}
            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-3">
              {lesson.videoUrl && (
                <span>Video: {lesson.videoUrl.includes('youtube') ? 'YouTube' : 'External'}</span>
              )}
              {lesson.duration && (
                <span>{lesson.duration} min</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveLesson('up')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Move up"
              disabled={isLoading}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => moveLesson('down')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Move down"
              disabled={isLoading}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Edit"
              disabled={isLoading}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600"
              title="Delete"
              disabled={isLoading}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}