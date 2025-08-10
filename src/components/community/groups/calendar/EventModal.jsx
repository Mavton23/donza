import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import EventBadge from './EventBadge';
import RecurringEventOptions from './RecurringEventOptions';

export default function EventModal({ 
  event, 
  isOpen, 
  onClose,
  onSubmit,
  groupMembers 
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    start: '',
    end: '',
    location: '',
    description: '',
    attendees: [],
    recurring: {
      frequency: 'none',
      days: [],
      endDate: ''
    }
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        type: event.type || 'meeting',
        start: event.start ? event.start.split('T')[0] : '',
        end: event.end ? event.end.split('T')[0] : '',
        location: event.location || '',
        description: event.description || '',
        attendees: event.attendees || [],
        recurring: event.recurring || {
          frequency: 'none',
          days: [],
          endDate: ''
        }
      });
    } else {
      const now = new Date();
      const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
      
      setFormData({
        title: '',
        type: 'meeting',
        start: nextHour.toISOString().split('T')[0],
        end: new Date(nextHour.setHours(nextHour.getHours() + 1)).toISOString().split('T')[0],
        location: '',
        description: '',
        attendees: [],
        recurring: {
          frequency: 'none',
          days: [],
          endDate: ''
        }
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start: `${formData.start}T${formData.startTime || '12:00'}`,
      end: `${formData.end}T${formData.endTime || '13:00'}`
    });
  };

  const toggleAttendee = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="mb-4 flex justify-between items-center">
          <DialogTitle className="text-xl font-bold">
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogClose asChild>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title*</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="meeting">Meeting</option>
                <option value="study_session">Study Session</option>
                <option value="group_event">Group Event</option>
              </select>
              <div className="mt-1">
                <EventBadge type={formData.type} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <FiCalendar className="mr-2" />
                Start Date*
              </label>
              <input
                type="date"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={formData.startTime || '12:00'}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md mt-2"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <FiClock className="mr-2" />
                End Date*
              </label>
              <input
                type="date"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
                min={formData.start}
              />
              <input
                type="time"
                value={formData.endTime || '13:00'}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md mt-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              <FiMapPin className="mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Online meeting link or physical address"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              <FiUsers className="mr-2" />
              Invite Members
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {groupMembers.map((member) => (
                <div key={member.userId} className="flex items-center">
                  <input
                    id={`attendee-${member.userId}`}
                    type="checkbox"
                    checked={formData.attendees.includes(member.userId)}
                    onChange={() => toggleAttendee(member.userId)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`attendee-${member.userId}`} className="ml-2 text-sm">
                    {member.username}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <RecurringEventOptions
            value={formData.recurring}
            onChange={(recurring) => setFormData({ ...formData, recurring })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
