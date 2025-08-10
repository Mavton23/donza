import { CheckIcon } from "lucide-react";

export default function CourseIntroduction({ course }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        {course.description && (
          <div 
            className="mb-6"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        )}
        
        <h2 className="text-xl font-semibold mb-3">About this course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium">Duration</h3>
            <p>{course.duration} hours</p>
          </div>
          <div>
            <h3 className="font-medium">Level</h3>
            <p>{course.level}</p>
          </div>
        </div>
        
        {course.learningOutcomes?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-3">What you'll learn</h2>
            <ul className="space-y-2 mb-6">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}