import { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

export default function ResendEmailButton({ email, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    try {
      setLoading(true);
      await api.post('/auth/resend-verification', { email });
      onSuccess('Novo link de verificação enviado!');
      startCooldown(60);
    } catch (err) {
      onError(err.response?.data?.message || 'Falha ao reenviar e-mail');
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <button
      onClick={handleResend}
      disabled={loading || cooldown > 0}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {loading ? (
        <LoadingSpinner size="small" />
      ) : cooldown > 0 ? (
        `Reenviar em ${cooldown}s`
      ) : (
        'Reenviar e-mail de verificação'
      )}
    </button>
  );
}