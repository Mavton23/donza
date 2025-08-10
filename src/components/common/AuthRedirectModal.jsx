import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthRedirectModal({ redirectPath, delay = 5 }) {
  const [countdown, setCountdown] = useState(delay);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) {
      navigate(redirectPath);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, redirectPath]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
    >
      <div className="flex flex-col items-center justify-center max-w-md w-full mx-4">
        {/* Logo animada - Mesmo estilo do PlatformLoader */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="relative mb-6"
        >
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
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-600 dark:border-indigo-400 opacity-0 animate-ping-slow" />
        </motion.div>

        {/* Conteúdo do modal */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center w-full"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Acesso Exclusivo
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Para continuar, faça login na plataforma Donza. Redirecionando em{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {countdown} segundos
            </span>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate(redirectPath)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Fazer Login Agora
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              Voltar
            </button>
          </div>

          {/* Loading dots - Mesmo estilo do PlatformLoader */}
          <div className="mt-8 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="h-3 w-3 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.15
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}