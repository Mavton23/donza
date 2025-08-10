import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiX, FiInfo } from 'react-icons/fi';
import { Button } from '../ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const ScheduleMeetingModal = ({ onClose, onSubmit, defaultSchedule }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    startTime: '18:00',
    endTime: '19:00',
    location: '',
    isRecurring: false,
    recurrencePattern: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche com o horário padrão do grupo se existir
  useEffect(() => {
    if (defaultSchedule?.time) {
      const [defaultStart, defaultEnd] = defaultSchedule.time.split('-');
      setFormData(prev => ({
        ...prev,
        startTime: defaultStart?.trim(),
        endTime: defaultEnd?.trim(),
        isRecurring: defaultSchedule.frequency !== undefined,
        recurrencePattern: defaultSchedule.frequency || ''
      }));
    }
  }, [defaultSchedule]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTimeChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    if (formData.isRecurring && !formData.recurrencePattern) {
      newErrors.recurrencePattern = 'Recurrence pattern is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);
      
      const endDateTime = new Date(formData.startDate);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);
      
      const meetingData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: formData.location,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern
      };
      
      await onSubmit(meetingData);
      onClose();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setErrors({ submit: error.message || 'Failed to schedule meeting' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Schedule New Meeting
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                placeholder="Weekly Study Session"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="What will this meeting be about?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.startDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <FiCalendar className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                      <TimePicker
                        onChange={(value) => handleTimeChange('startTime', value)}
                        value={formData.startTime}
                        disableClock={true}
                        clearIcon={null}
                        className="w-full p-2 dark:bg-gray-700 dark:text-white"
                      />
                      <FiClock className="mr-2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                  </div>
                  <div>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                      <TimePicker
                        onChange={(value) => handleTimeChange('endTime', value)}
                        value={formData.endTime}
                        disableClock={true}
                        clearIcon={null}
                        className="w-full p-2 dark:bg-gray-700 dark:text-white"
                      />
                      <FiClock className="mr-2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location / Meeting Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="https://meet.example.com/room"
                />
                <FiMapPin className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recurring meeting
                </span>
              </label>

              {formData.isRecurring && (
                <div className="mt-3 ml-6">
                  <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recurrence Pattern *
                  </label>
                  <select
                    id="recurrencePattern"
                    name="recurrencePattern"
                    value={formData.recurrencePattern}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select pattern</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {errors.recurrencePattern && (
                    <p className="mt-1 text-sm text-red-600">{errors.recurrencePattern}</p>
                  )}
                  <div className="mt-2 flex items-start text-sm text-gray-500 dark:text-gray-400">
                    <FiInfo className="flex-shrink-0 mr-1.5 mt-0.5" />
                    <span>Recurring meetings will be created automatically</span>
                  </div>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;