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
    if (seconds < 5) return 'agora mesmo';
    if (seconds < 60) return `${seconds} segundos atrás`;
    if (seconds < 120) return '1 minuto atrás';
    if (seconds < intervals.hour) return `${Math.floor(seconds / intervals.minute)} minutos atrás`;
    if (seconds < intervals.hour * 2) return '1 hora atrás';
    if (seconds < intervals.day) return `${Math.floor(seconds / intervals.hour)} horas atrás`;
    
    if (seconds < intervals.day * 2) return 'ontem';
    if (seconds < intervals.week) return `${Math.floor(seconds / intervals.day)} dias atrás`;
    
    // Para semanas e meses
    if (seconds < intervals.week * 2) return '1 semana atrás';
    if (seconds < intervals.month) return `${Math.floor(seconds / intervals.week)} semanas atrás`;
    if (seconds < intervals.month * 2) return '1 mês atrás';
    if (seconds < intervals.year) return `${Math.floor(seconds / intervals.month)} meses atrás`;
    if (seconds < intervals.year * 2) return '1 ano atrás';
    
    return `${Math.floor(seconds / intervals.year)} anos atrás`;
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