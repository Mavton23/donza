import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function EventFilters({ filters, onChange }) {
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
    if (localFilters.type !== 'all') params.set('type', localFilters.type);
    if (localFilters.status) params.set('status', localFilters.status);
    if (localFilters.search) params.set('search', localFilters.search);
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Pesquisar</label>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Pesquisar eventos..."
            value={localFilters.search}
            onChange={handleChange}
            className="block p-2 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="type" className="sr-only">Tipo</label>
          <select
            id="type"
            name="type"
            value={localFilters.type}
            onChange={handleChange}
            className="block p-2 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Todos os Tipos</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="meetup">Meetup</option>
            <option value="conference">Conferência</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="sr-only">Status</label>
          <select
            id="status"
            name="status"
            value={localFilters.status}
            onChange={handleChange}
            className="block p-2 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="upcoming">Próximos</option>
            <option value="past">Eventos Passados</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors"
        >
          Aplicar
        </button>
      </div>
    </form>
  );
}