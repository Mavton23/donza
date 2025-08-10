import { useState } from 'react';
import RichTextEditor from '../common/RichTextEditor';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EventForm({ step, eventData, setEventData, isEditMode = false }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDescriptionChange = (value) => {
    setEventData(prev => ({ ...prev, description: value }));
  };

  switch (step) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título do Evento *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição do Evento
            </label>
            <RichTextEditor
              value={eventData.description}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>
      );

    case 1:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data e Hora de Início *
              </label>
              <DatePicker
                selected={eventData.startDate}
                onChange={(date) => setEventData(prev => ({ ...prev, startDate: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data e Hora de Término
              </label>
              <DatePicker
                selected={eventData.endDate}
                onChange={(date) => setEventData(prev => ({ ...prev, endDate: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={eventData.startDate}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Evento *
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="eventTypeInPerson"
                  name="isOnline"
                  checked={!eventData.isOnline}
                  onChange={() => setEventData(prev => ({ ...prev, isOnline: false }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="eventTypeInPerson" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Presencial
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="eventTypeOnline"
                  name="isOnline"
                  checked={eventData.isOnline}
                  onChange={() => setEventData(prev => ({ ...prev, isOnline: true }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="eventTypeOnline" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Online
                </label>
              </div>
            </div>
          </div>

          {!eventData.isOnline ? (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Localização *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required={!eventData.isOnline}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL da Reunião *
              </label>
              <input
                type="url"
                id="meetingUrl"
                name="meetingUrl"
                value={eventData.meetingUrl}
                onChange={handleChange}
                placeholder="https://"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required={eventData.isOnline}
              />
            </div>
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número Máximo de Participantes
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                value={eventData.maxParticipants || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                disabled={isEditMode}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ? 'Não pode ser alterado após criação' : 'Deixe em branco para ilimitado'}
              </p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preço (R$) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">R$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={eventData.price}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status do Evento *
            </label>
            <select
              id="status"
              name="status"
              value={eventData.status}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="scheduled">Agendado</option>
              <option value="live">Ao Vivo</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
        </div>
      );

    default:
      return null;
  }
}