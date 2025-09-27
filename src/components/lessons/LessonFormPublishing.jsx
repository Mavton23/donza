import { useState, useEffect } from 'react';
import { Currency } from 'lucide-react';

export default function LessonFormPublishing({ lessonData, setLessonData }) {
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    // Validar preço quando isFree for alterado
    if (lessonData.isFree) {
      setLessonData(prev => ({ ...prev, price: 0 }));
      setPriceError('');
    }
  }, [lessonData.isFree, setLessonData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      // Validar preço
      const priceValue = parseFloat(value);
      if (isNaN(priceValue) || priceValue < 0) {
        setPriceError('Preço deve ser um número válido maior ou igual a 0');
      } else {
        setPriceError('');
      }
    }

    setLessonData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    
    // Permitir campo vazio temporariamente
    if (value === '') {
      setLessonData(prev => ({ ...prev, price: '' }));
      setPriceError('');
      return;
    }

    // Validar se é um número
    const priceValue = parseFloat(value);
    if (isNaN(priceValue)) {
      setPriceError('Digite um valor numérico válido');
      return;
    }

    if (priceValue < 0) {
      setPriceError('Preço não pode ser negativo');
      return;
    }

    if (priceValue > 10000) {
      setPriceError('Preço máximo é 10.000 MZN');
      return;
    }

    setPriceError('');
    setLessonData(prev => ({ ...prev, price: priceValue }));
  };

  return (
    <div className="space-y-6">
      {/* Campo de Preço - Visível apenas quando a aula não é gratuita */}
      {!lessonData.isFree && (
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preço da Aula (MZN) *
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Currency className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={lessonData.price || ''}
              onChange={handlePriceChange}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                priceError 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder="0.00"
              required={!lessonData.isFree}
            />
          </div>
          {priceError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{priceError}</p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Defina o preço da aula em Meticais (MZN). Use valores como 99.99, 199.50, etc.
          </p>
        </div>
      )}

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="isFree"
            name="isFree"
            type="checkbox"
            checked={lessonData.isFree}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isFree" className="font-medium text-gray-700 dark:text-gray-300">
            Aula Gratuita
          </label>
          <p className="text-gray-500 dark:text-gray-400">
            Marque esta opção se deseja disponibilizar esta aula gratuitamente.
            {lessonData.isFree && ' O preço será automaticamente definido como 0.'}
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={lessonData.isPublished}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isPublished" className="font-medium text-gray-700 dark:text-gray-300">
            Publicar Imediatamente
          </label>
          <p className="text-gray-500 dark:text-gray-400">
            Marque esta opção se deseja disponibilizar esta aula para os estudantes imediatamente.
          </p>
        </div>
      </div>

      {/* Informações sobre preços */}
      {!lessonData.isFree && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Informações sobre Preços
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Preços típicos: 99-499 MZN para aulas individuais</li>
            <li>• Considere o valor proporcionado pela aula</li>
            <li>• Aulas mais longas ou complexas podem ter preços mais altos</li>
            <li>• Você pode ajustar o preço posteriormente</li>
          </ul>
        </div>
      )}
    </div>
  );
}