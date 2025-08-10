import { useState } from "react";

export default function PublishPanel({ course, onPublish, isPublishing }) {
  const [requirements, setRequirements] = useState({
    hasModules: course.modules?.length > 0,
    hasLessons: course.modules?.some(m => m.lessons?.length > 0),
    hasCover: !!course.coverImageUrl,
    hasDescription: !!course.description,
  });

  const mandatoryRequirements = {
    hasDescription: true,
    hasCover: false,
    hasModules: false,
    hasLessons: false
  };

  // Verifica apenas os requisitos marcados como obrigatórios
  const mandatoryRequirementsMet = Object.keys(mandatoryRequirements)
    .filter(key => mandatoryRequirements[key])
    .every(key => requirements[key]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Ready to Publish?</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Course Checklist:</h3>
        <ul className="space-y-2">
          <li className={`flex items-center ${requirements.hasCover ? 'text-green-500' : 'text-yellow-500'}`}>
            {requirements.hasCover ? '✓' : '○'} Course cover image {!requirements.hasCover && '(recommended)'}
          </li>
          <li className={`flex items-center ${requirements.hasDescription ? 'text-green-500' : 'text-red-500'}`}>
            {requirements.hasDescription ? '✓' : '✗'} Detailed description {!requirements.hasDescription && '(required)'}
          </li>
          <li className={`flex items-center ${requirements.hasModules ? 'text-green-500' : 'text-yellow-500'}`}>
            {requirements.hasModules ? '✓' : '○'} At least one module {!requirements.hasModules && '(recommended)'}
          </li>
          <li className={`flex items-center ${requirements.hasLessons ? 'text-green-500' : 'text-yellow-500'}`}>
            {requirements.hasLessons ? '✓' : '○'} At least one lesson {!requirements.hasLessons && '(recommended)'}
          </li>
        </ul>

        {!requirements.hasDescription && (
          <div className="mt-4 text-red-500 text-sm">
            You must provide a detailed description to publish this course.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onPublish}
          disabled={!mandatoryRequirementsMet || isPublishing}
          className={`px-4 py-2 rounded-md text-white ${
            mandatoryRequirementsMet 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isPublishing ? 'Publishing...' : 'Publish Course'}
        </button>
      </div>

      {mandatoryRequirementsMet && (!requirements.hasCover || !requirements.hasModules || !requirements.hasLessons) && (
        <div className="mt-4 text-yellow-600 dark:text-yellow-400 text-sm">
          Note: Your course is publishable but might benefit from adding the recommended items.
        </div>
      )}
    </div>
  );
}