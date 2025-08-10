import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function TimeAgo({ date, className = '', refreshInterval = 60000 }) {
  const [timeAgo, setTimeAgo] = useState('');

  const calculateTimeAgo = () => {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);
    const seconds = Math.floor((now - messageDate) / 1000);

    // Intervalos de tempo em segundos
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    // Cálculo do tempo relativo
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 120) return '1 minute ago';
    if (seconds < intervals.hour) return `${Math.floor(seconds / intervals.minute)} minutes ago`;
    if (seconds < intervals.hour * 2) return '1 hour ago';
    if (seconds < intervals.day) return `${Math.floor(seconds / intervals.hour)} hours ago`;
    
    if (seconds < intervals.day * 2) return 'yesterday';
    if (seconds < intervals.week) return `${Math.floor(seconds / intervals.day)} days ago`;
    
    // Para semanas e meses
    if (seconds < intervals.week * 2) return '1 week ago';
    if (seconds < intervals.month) return `${Math.floor(seconds / intervals.week)} weeks ago`;
    if (seconds < intervals.month * 2) return '1 month ago';
    if (seconds < intervals.year) return `${Math.floor(seconds / intervals.month)} months ago`;
    if (seconds < intervals.year * 2) return '1 year ago';
    
    return `${Math.floor(seconds / intervals.year)} years ago`;
  };

  useEffect(() => {
    setTimeAgo(calculateTimeAgo());

    // Configura intervalo para atualização automática
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [date, refreshInterval]);

  return (
    <span className={`whitespace-nowrap ${className}`}>
      {timeAgo}
    </span>
  );
}

TimeAgo.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]).isRequired,
  className: PropTypes.string,
  refreshInterval: PropTypes.number
};