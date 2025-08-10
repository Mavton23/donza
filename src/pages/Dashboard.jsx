import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsOverview from '../components/dashboard/StatsOverview';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CourseProgress from '../components/dashboard/CourseProgress';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import QuickActions from '../components/dashboard/QuickActions';
import RecentResources from '../components/dashboard/RecentResources';
import PersonalizedRecommendations from '../components/dashboard/PersonalizedRecommendations';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    user: {},
    stats: {},
    courseProgress: [],
    recentActivities: [],
    upcomingEvents: [],
    recentResources: [],
    recommendations: [],
    teachingStats: {}
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${user.userId}/dashboard`);
        
        const normalizedData = {
          user: response.data.userInfo || {},
          stats: response.data.stats || {},
          courseProgress: response.data.courseProgress || [],
          recentActivities: response.data.recentActivities || [],
          upcomingEvents: response.data.upcomingEvents || [],
          recentResources: response.data.recentResources || [],
          recommendations: response.data.recommendations || [],
          teachingStats: response.data.teachingStats || {}
        };
        
        setDashboardData(normalizedData);
      } catch (err) {
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.userId]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 pb-32">
        <DashboardHeader user={dashboardData.user} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        {/* Stats Overview */}
        <StatsOverview stats={dashboardData.stats} role={user.role} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Progress for Students / Teaching Stats for Instructors */}
            {user.role === 'student' ? (
              <CourseProgress 
                courses={dashboardData.courseProgress} 
                recommendations={dashboardData.recommendations}
              />
            ) : user.role === 'instructor' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Teaching Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                        Active Courses
                      </p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {dashboardData.teachingStats.activeCourses || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Total Students
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {dashboardData.teachingStats.totalStudents || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Avg. Rating
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        {(dashboardData.teachingStats.averageRating || 0).toFixed(1)}/5
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Activity Feed */}
            <ActivityFeed activities={dashboardData.recentActivities} />

            {/* Recent Resources */}
            <RecentResources resources={dashboardData.recentResources} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions role={user.role} />

            {/* Upcoming Events */}
            <UpcomingEvents events={dashboardData.upcomingEvents} />

            {/* Personalized Recommendations */}
            <PersonalizedRecommendations 
              recommendations={dashboardData.recommendations} 
              role={user.role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}