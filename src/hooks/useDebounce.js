import { useEffect, useRef } from 'react';

/**
 * Custom hook para debounce de valores
 * @param {function} callback - Função a ser chamada após o delay
 * @param {number} delay - Tempo de debounce em milissegundos
 * @returns {function} - Função para cancelar o debounce manualmente
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Atualiza a referência do callback sempre que ele muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Função de debounce
  const debouncedFunction = (...args) => {
    // Limpa o timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configura um novo timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };

  // Função para cancelar manualmente
  const cancelDebounce = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Limpeza do timeout quando o componente desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return cancelDebounce;
};

/**
 * Versão simplificada para valores (não funções)
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Tempo de debounce em milissegundos
 * @returns {any} - Valor após o debounce
 */
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};