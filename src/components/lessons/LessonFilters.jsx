import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function LessonFilters({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(localFilters);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (localFilters.search) params.set('q', localFilters.search);
    if (localFilters.lessonType) params.set('type', localFilters.lessonType);
    if (localFilters.level) params.set('level', localFilters.level);
    if (localFilters.sort) params.set('sort', localFilters.sort);
    if (localFilters.isFree) params.set('free', 'true');
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Campo de Busca */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Buscar aulas..."
            value={localFilters.search}
            onChange={handleChange}
            className="block w-full rounded-md p-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Filtro de Tipo */}
        <div className="min-w-[180px]">
          <label htmlFor="lessonType" className="sr-only">Tipo</label>
          <select
            id="lessonType"
            name="lessonType"
            value={localFilters.lessonType}
            onChange={handleChange}
            className="block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os Tipos</option>
            <option value="video">Vídeo</option>
            <option value="text">Texto</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Atividade</option>
          </select>
        </div>

        {/* Filtro de Nível */}
        <div className="min-w-[150px]">
          <label htmlFor="level" className="sr-only">Nível</label>
          <select
            id="level"
            name="level"
            value={localFilters.level}
            onChange={handleChange}
            className="block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos Níveis</option>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>

        {/* Filtro de Ordenação */}
        <div className="min-w-[150px]">
          <label htmlFor="sort" className="sr-only">Ordenar por</label>
          <select
            id="sort"
            name="sort"
            value={localFilters.sort}
            onChange={handleChange}
            className="block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Mais Recentes</option>
            <option value="popular">Mais Populares</option>
            <option value="rating">Melhor Avaliados</option>
          </select>
        </div>

        {/* Filtro de Aulas Gratuitas */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFree"
            name="isFree"
            checked={localFilters.isFree}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="isFree" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Apenas Gratuitas
          </label>
        </div>

        {/* Botão de Aplicar */}
        <button
          type="submit"
          className="px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors whitespace-nowrap"
        >
          Aplicar Filtros
        </button>
      </div>
    </form>
  );
}