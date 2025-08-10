import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';

export default function AdminSystemHealth({ status }) {
  const [systemStatus, setSystemStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/admin/system-status');
      setSystemStatus(response.data);
    } catch (err) {
      setError('Failed to load system status');
      toast.error('Failed to refresh system health');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { name: 'API Server', key: 'api' },
    { name: 'Database', key: 'database' },
    { name: 'Cache', key: 'cache' },
    { name: 'File Storage', key: 'storage' },
    { name: 'Email Service', key: 'email' },
    { name: 'Background Jobs', key: 'jobs' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          System Health Monitoring
        </h2>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div 
            key={service.key}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {service.name}
              </h3>
              <StatusBadge 
                status={systemStatus?.[service.key]?.status || 'unknown'}
              />
            </div>
            
            {systemStatus?.[service.key] && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Version: {systemStatus[service.key].version || 'N/A'}</p>
                <p>Response: {systemStatus[service.key].responseTime || 'N/A'} ms</p>
                {systemStatus[service.key].message && (
                  <p className="mt-1 italic">"{systemStatus[service.key].message}"</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          System Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="CPU Usage" 
            value={systemStatus?.metrics?.cpu || 'N/A'} 
            unit="%"
          />
          <MetricCard 
            label="Memory Usage" 
            value={systemStatus?.metrics?.memory || 'N/A'} 
            unit="GB"
          />
          <MetricCard 
            label="Disk Space" 
            value={systemStatus?.metrics?.disk || 'N/A'} 
            unit="GB"
          />
          <MetricCard 
            label="Uptime" 
            value={systemStatus?.metrics?.uptime || 'N/A'} 
            unit="days"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
    </div>
  );
}
