import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function SpamWarningAlert({ email, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg p-4 mb-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Email enviado para {email}
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Verifique sua <strong>caixa de entrada</strong></li>
                <li>Procure na pasta de <strong>spam</strong> ou <strong>lixo eletrônico</strong></li>
                <li>O email pode levar alguns minutos para chegar</li>
              </ul>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}