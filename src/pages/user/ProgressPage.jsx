import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { BarChart2, Book, Users, Clock, Award, Calendar } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import ProgressChart from '../../components/progress/ProgressChart';
import RecentActivity from '../../components/progress/RecentActivity';
import EmptyState from '../../components/common/EmptyState';

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const notification = useNotification();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users/progress');
        setProgressData(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load progress data');
        notification.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentUser.userId]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <EmptyState title="Error" description={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Progress Overview
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {currentUser.role === 'student' 
            ? 'Track your learning journey'
            : currentUser.role === 'instructor'
            ? 'Monitor your teaching impact'
            : 'Institution performance metrics'}
        </p>
      </div>

      {progressData?.type === 'student' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<Book size={20} />}
              title="Courses Enrolled"
              value={progressData.stats.coursesEnrolled}
              change={null}
            />
            <StatCard 
              icon={<Award size={20} />}
              title="Courses Completed"
              value={progressData.stats.coursesCompleted}
              change={null}
            />
            <StatCard 
              icon={<Clock size={20} />}
              title="Learning Hours"
              value={progressData.stats.totalLearningHours}
              unit="hours"
            />
            <StatCard 
              icon={<Calendar size={20} />}
              title="Events Attended"
              value={progressData.stats.eventsAttended}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Course Progress
              </h2>
              <ProgressChart 
                data={progressData.courses}
                type="course"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <RecentActivity 
                courses={progressData.courses.slice(0, 3)}
                events={progressData.events.slice(0, 3)}
              />
            </div>
          </div>
        </>
      )}

      {progressData?.type === 'instructor' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<Book size={20} />}
              title="Courses Taught"
              value={progressData.teachingStats.totalCourses}
            />
            <StatCard 
              icon={<Users size={20} />}
              title="Total Students"
              value={progressData.teachingStats.totalStudents}
            />
            <StatCard 
              icon={<Calendar size={20} />}
              title="Events Organized"
              value={progressData.teachingStats.totalEvents}
            />
            <StatCard 
              icon={<Users size={20} />}
              title="Total Participants"
              value={progressData.teachingStats.totalParticipants}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Courses
              </h2>
              <ul className="space-y-4">
                {progressData.recentCourses.map(course => (
                  <li key={course.id} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{course.title}</span>
                    <span className="font-medium">{course.students} students</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <ul className="space-y-4">
                {progressData.upcomingEvents.map(event => (
                  <li key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-medium">{event.participants} participants</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {progressData?.type === 'institution' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<Users size={20} />}
              title="Total Users"
              value={progressData.stats.totalUsers}
            />
            <StatCard 
              icon={<Book size={20} />}
              title="Courses Taken"
              value={progressData.stats.totalCourses}
            />
            <StatCard 
              icon={<Award size={20} />}
              title="Courses Completed"
              value={progressData.stats.completedCourses}
            />
            <StatCard 
              icon={<Clock size={20} />}
              title="Total Learning Hours"
              value={progressData.stats.totalLearningHours}
              unit="hours"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Engagement
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">Active Users (30 days)</p>
                  <p className="text-2xl font-bold">{progressData.userEngagement.activeUsers}</p>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">Course Completion Rate</p>
                  <p className="text-2xl font-bold">{progressData.userEngagement.completionRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Events Participation
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Total Events Attended: <span className="font-bold">{progressData.stats.eventsAttended}</span>
              </p>
              <ProgressChart 
                data={[
                  { name: 'Courses', value: progressData.stats.totalCourses },
                  { name: 'Events', value: progressData.stats.eventsAttended }
                ]}
                type="institution"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}