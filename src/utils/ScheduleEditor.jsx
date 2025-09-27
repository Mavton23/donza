import { useState } from 'react';
import { FiPlus, FiTrash2, FiClock, FiCalendar } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ScheduleEditor({ schedule, onChange }) {
  const [newSchedule, setNewSchedule] = useState({
    day: '',
    time: '',
    frequency: 'weekly'
  });

  const addSchedule = () => {
    if (newSchedule.day && newSchedule.time) {
      onChange([...schedule, newSchedule]);
      setNewSchedule({ day: '', time: '', frequency: 'weekly' });
    }
  };

  const removeSchedule = (index) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        {schedule.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex-1">
              <span className="font-medium">{item.day}</span>, {item.time} ({item.frequency})
            </div>
            <Button
              type="button"
              variant="danger-outline"
              size="sm"
              onClick={() => removeSchedule(index)}
            >
              <FiTrash2 size={14} />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input
          type="text"
          placeholder="Day (e.g. Monday)"
          value={newSchedule.day}
          onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}
          icon={<FiCalendar size={14} />}
        />
        
        <Input
          type="time"
          value={newSchedule.time}
          onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
          icon={<FiClock size={14} />}
        />
        
        <select
          className="input"
          value={newSchedule.frequency}
          onChange={(e) => setNewSchedule({...newSchedule, frequency: e.target.value})}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        
        <Button
          type="button"
          onClick={addSchedule}
          className="flex items-center justify-center"
        >
          <FiPlus className="mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}