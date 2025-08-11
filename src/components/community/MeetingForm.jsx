import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCalendar, FiLink } from 'react-icons/fi';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';
import DateTimePicker from '@/components/common/DateTimePicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * @typedef {Object} MeetingFormProps
 * @property {string} groupId - ID do grupo de estudo
 * @property {Object} [meeting] - Dados da reunião existente
 * @property {string} [meeting.meetingId] - ID da reunião
 * @property {string} [meeting.title] - Título
 * @property {string} [meeting.description] - Descrição
 * @property {Date} [meeting.startTime] - Data/hora de início
 * @property {Date} [meeting.endTime] - Data/hora de término
 * @property {string} [meeting.meetingUrl] - URL da reunião
 * @property {function} onSuccess - Callback após sucesso
 */

export default function MeetingForm({ groupId, meeting, onSuccess }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    control 
  } = useForm({
    defaultValues: meeting || {
      title: '',
      description: '',
      startTime: new Date(),
      endTime: null,
      meetingUrl: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        ...data,
        groupId
      };

      const endpoint = meeting 
        ? `/study-groups/${groupId}/meetings/${meeting.meetingId}`
        : `/study-groups/${groupId}/meetings`;

      const method = meeting ? 'put' : 'post';

      await api[method](endpoint, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Input
        label="Title *"
        icon={<FiCalendar />}
        {...register('title', { required: 'Title is required' })}
        error={errors.title?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimePicker
          control={control}
          name="startTime"
          label="Start Time *"
          minDate={new Date()}
          error={errors.startTime?.message}
        />
        <DateTimePicker
          control={control}
          name="endTime"
          label="End Time (Optional)"
          minDate={new Date()}
          isClearable
        />
      </div>

      <Input
        label="Meeting URL (Optional)"
        icon={<FiLink />}
        placeholder="https://meet.google.com/xxx-yyyy-zzz"
        {...register('meetingUrl')}
      />

      <Textarea
        label="Description (Optional)"
        rows={3}
        {...register('description')}
      />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {meeting ? 'Update Meeting' : 'Schedule Meeting'}
        </Button>
      </div>
    </form>
  );
}