export default function LoadingSpinner({ 
  size = "medium", 
  fullScreen = false,
  withText = false,
  text = "Processando...",
  textColor = "text-indigo-700 dark:text-indigo-300",
  spinnerColor = "border-indigo-600 dark:border-indigo-400",
  inline = false
}) {
  const sizeClasses = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  const spinner = (
    <div className={`flex ${inline ? 'flex-row items-center gap-2' : 'flex-col items-center justify-center'}`}>
      <div className={`animate-spin rounded-full border-b-2 ${spinnerColor} ${sizeClasses[size]}`}>
        <span className="sr-only">{text}</span>
      </div>
      {withText && (
        <p className={`${inline ? 'text-sm font-medium' : 'mt-2 text-sm font-medium'} ${textColor}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}