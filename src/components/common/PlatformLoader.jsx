export default function PlatformLoader({ fullScreen = false }) {
    return (
      <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50' : ''}`}>
        <div className="relative">
          {/* Logo animada */}
          <div className="w-40 h-40 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center animate-pulse">
            <img 
              src="/logos/Artboard4.png"
              alt="Donza Logo"
              className="h-40 w-40 object-contain"
            />
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