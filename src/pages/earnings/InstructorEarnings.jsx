import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

export default function InstructorEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const [earningsRes, transactionsRes] = await Promise.all([
          api.get('/instructor/earnings'),
          api.get('/instructor/transactions'),
        ]);
        
        setEarnings(earningsRes.data);
        setTransactions(transactionsRes.data.transactions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar dados de ganhos');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meus Ganhos</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ganhos Totais</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                R${earnings?.totalEarnings?.toFixed(2) || '0,00'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Saldo Disponível</h3>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                R${earnings?.availableBalance?.toFixed(2) || '0,00'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Em Processamento</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                R${earnings?.pendingClearance?.toFixed(2) || '0,00'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transações Recentes</h3>
            </div>
            {transactions.length === 0 ? (
              <EmptyState
                title="Nenhuma transação ainda"
                description="Seu histórico de transações aparecerá aqui."
                className="py-12"
              />
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${
                        transaction.amount >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Solicitar Saque
            </button>
          </div>
        </>
      )}
    </div>
  );
}