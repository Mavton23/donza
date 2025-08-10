import { useState, useEffect } from 'react';
import { format, isPast, isToday } from 'date-fns';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { Button } from '../../components/ui/button';
import Icon from '../common/Icon';
import Modal from '../common/Modal';
import MeetingForm from './MeetingForm';

export default function StudyGroupMeetings({ groupId, isMember, isLeader }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const fetchMeetings = async () => {
    try {
      const response = await api.get(`/study-groups/${groupId}/meetings`);
      setMeetings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [groupId]);

  const handleDelete = async (meetingId) => {
    try {
      await api.delete(`/study-groups/${groupId}/meetings/${meetingId}`);
      setMeetings(meetings.filter(m => m.meetingId !== meetingId));
    } catch (err) {
      setError('Failed to delete meeting');
    }
  };

  const handleJoinMeeting = (meetingUrl) => {
    window.open(meetingUrl, '_blank');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" message={error} icon="alert-triangle" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Upcoming Meetings
        </h3>
        {isLeader && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingMeeting(null);
              setShowForm(true);
            }}
            icon="plus"
          >
            Schedule Meeting
          </Button>
        )}
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          title="No meetings scheduled"
          message={isLeader ? "Schedule your first meeting!" : "Check back later."}
          icon="calendar"
        />
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {meetings.map((meeting) => {
            const isCompleted = isPast(new Date(meeting.endTime || meeting.startTime));
            const isCurrent = isToday(new Date(meeting.startTime)) && !isCompleted;

            return (
              <li key={meeting.meetingId} className="py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h4 className={`font-medium ${isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <Icon name="clock" size="sm" className="inline mr-1" />
                      {format(new Date(meeting.startTime), 'PPPp')}
                      {meeting.endTime && ` - ${format(new Date(meeting.endTime), 'p')}`}
                    </p>
                    {meeting.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {meeting.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 gap-2">
                    {meeting.meetingUrl && (isCurrent || isLeader) && (
                      <Button
                        variant={isCurrent ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleJoinMeeting(meeting.meetingUrl)}
                        icon="video"
                      >
                        {isCurrent ? 'Join Now' : 'View Link'}
                      </Button>
                    )}
                    {isLeader && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMeeting(meeting);
                            setShowForm(true);
                          }}
                          icon="edit"
                        />
                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => handleDelete(meeting.meetingId)}
                          icon="trash-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
      >
        <MeetingForm
          groupId={groupId}
          meeting={editingMeeting}
          onSuccess={() => {
            fetchMeetings();
            setShowForm(false);
          }}
        />
      </Modal>
    </div>
  );
}