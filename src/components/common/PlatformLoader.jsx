export default function PlatformLoader({ fullScreen = false }) {
    return (
      <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50' : ''}`}>
        <div className="relative">
          {/* Logo animada */}
          <div className="w-16 h-16 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center animate-pulse">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          
          {/* Efeito de onda */}
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-600 dark:border-indigo-400 opacity-0 animate-ping-slow" />
        </div>
  
        {/* Texto com loading */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Donza</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Carregando sua experiência de aprendizado</p>
          
          <div className="mt-4 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }