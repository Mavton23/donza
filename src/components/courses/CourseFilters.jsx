import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function CourseFilters({ filters, onChange, showEnrolledToggle }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(localFilters);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (localFilters.search) params.set('q', localFilters.search);
    if (localFilters.category) params.set('category', localFilters.category);
    if (localFilters.level) params.set('level', localFilters.level);
    if (localFilters.sort) params.set('sort', localFilters.sort);
    if (localFilters.enrolled) params.set('enrolled', 'true');
    
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
            placeholder="Buscar cursos..."
            value={localFilters.search}
            onChange={handleChange}
            className="block w-full rounded-md p-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Filtro de Categoria */}
        <div className="min-w-[180px]">
          <label htmlFor="category" className="sr-only">Categoria</label>
          <select
            id="category"
            name="category"
            value={localFilters.category}
            onChange={handleChange}
            className="block w-full p-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas Categorias</option>
            <option value="web">Desenvolvimento Web</option>
            <option value="mobile">Desenvolvimento Mobile</option>
            <option value="data">Ciência de Dados</option>
            <option value="design">Design</option>
            <option value="business">Negócios</option>
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

        {/* Filtro de Cursos Matriculados */}
        {showEnrolledToggle && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enrolled"
              name="enrolled"
              checked={localFilters.enrolled}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, enrolled: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="enrolled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Meus Cursos
            </label>
          </div>
        )}

        {/* Botão de Aplicar */}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Aplicar Filtros
        </button>
      </div>
    </form>
  );
}