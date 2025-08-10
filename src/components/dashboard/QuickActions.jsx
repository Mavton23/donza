import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Users, 
  BookOpen, 
  Upload, 
  BarChart2,
  Settings,
  Calendar,
  FileText,
  Shield,
  CreditCard,
  Mail
} from 'lucide-react';

const roleBasedActions = {
  student: [
    {
      icon: BookOpen,
      title: 'Enroll in New Course',
      description: 'Browse our catalog of courses',
      link: '/courses',
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      icon: Calendar,
      title: 'Join Live Session',
      description: 'Attend scheduled live classes',
      link: '/live-sessions',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ],
  instructor: [
    {
      icon: PlusCircle,
      title: 'Create New Course',
      description: 'Start building your course',
      link: '/instructor/courses/new',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Upload,
      title: 'Upload Content',
      description: 'Add lessons to your courses',
      link: '/instructor/content',
      color: 'text-blue-600 dark:text-blue-400'
    }
  ],
  institution: [
    {
      icon: Users,
      title: 'Manage Instructors',
      description: 'Add or remove teaching staff',
      link: '/institution/instructors',
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      icon: BookOpen,
      title: 'Create Institutional Course',
      description: 'Launch a course under your brand',
      link: '/institution/courses/new',
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: BarChart2,
      title: 'View Analytics',
      description: 'Institution-wide performance metrics',
      link: '/institution/analytics',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Mail,
      title: 'Send Announcement',
      description: 'Communicate with all students',
      link: '/institution/announcements',
      color: 'text-rose-600 dark:text-rose-400'
    }
  ],
  admin: [
    {
      icon: Shield,
      title: 'Manage Institutions',
      description: 'Oversee all partner institutions',
      link: '/admin/institutions',
      color: 'text-violet-600 dark:text-violet-400'
    },
    {
      icon: FileText,
      title: 'System Reports',
      description: 'Generate platform-wide reports',
      link: '/admin/reports',
      color: 'text-sky-600 dark:text-sky-400'
    },
    {
      icon: Settings,
      title: 'Platform Settings',
      description: 'Configure system parameters',
      link: '/admin/settings',
      color: 'text-gray-600 dark:text-gray-400'
    }
  ]
};

export default function QuickActions({ role }) {
  const actions = roleBasedActions[role] || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {role === 'institution' ? 'Institution Management' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Link
                key={index}
                to={action.link}
                className="group flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`flex-shrink-0 mt-1 ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional resources for institutions */}
        {role === 'institution' && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Resources
            </h3>
            <div className="space-y-2">
              <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <FileText className="h-3 w-3 mr-1" /> Institutional Handbook
              </a>
              <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <CreditCard className="h-3 w-3 mr-1" /> Billing Information
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}