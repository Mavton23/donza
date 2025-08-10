export default function FormStepper({ steps, currentStep, setCurrentStep }) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {steps.map((step, index) => (
            <div 
              key={step} 
              className={`flex-1 ${index < steps.length - 1 ? 'pr-8' : ''}`}
            >
              <button
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`group relative flex items-center py-4 w-full focus:outline-none ${
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                disabled={index > currentStep}
              >
                <span
                  className={`flex items-center ${
                    index <= currentStep
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
                      index < currentStep
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : index === currentStep
                          ? 'border-2 border-indigo-600 dark:border-indigo-400'
                          : 'border-2 border-gray-300 dark:border-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`${
                          index === currentStep
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span className="ml-4 text-sm font-medium">{step}</span>
                </span>
  
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-0 right-0 h-full w-8 flex items-center ${
                      index < currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-500'
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          ))}
        </nav>
      </div>
    );
  }