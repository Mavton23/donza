import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CreditCardIcon, ReceiptIcon } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import api from '@/services/api';

export default function BillingSettings() {
  const { user } = useOutletContext();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, [user.userId]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [methodsResponse, historyResponse] = await Promise.all([
        api.get(`/payments/${user.userId}/methods`),
        api.get(`/payments/${user.userId}/history`)
      ]);

      setPaymentMethods(methodsResponse.data.data.paymentMethods || []);
      setPaymentHistory(historyResponse.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(pmts =>
      pmts.map(pmt => ({
        ...pmt,
        isDefault: pmt.id === id,
      }))
    );
  };

  const handleRemoveMethod = (id) => {
    setPaymentMethods(pmts => pmts.filter(pmt => pmt.id !== id));
  };

  const hasPaymentMethods = paymentMethods.length > 0;
  const hasPaymentHistory = paymentHistory.length > 0;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5" /> Pagamentos
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie seus métodos de pagamento e assinaturas
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-8">
          {/* Seção de Métodos de Pagamento */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Métodos de Pagamento
            </h4>
            
            {hasPaymentMethods ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <div className={`bg-${method.brand === 'visa' ? 'blue' : 'red'}-100 p-2 rounded mr-4`}>
                        {method.brand === 'visa' ? (
                          <span className="text-blue-800 font-bold">VISA</span>
                        ) : (
                          <span className="text-red-800 font-bold">MC</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expira em {method.expiry}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {method.isDefault ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Padrão
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                        >
                          Tornar padrão
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMethod(method.id)}
                        className="text-sm text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CreditCardIcon}
                title="Nenhum método de pagamento"
                description="Você ainda não adicionou nenhum método de pagamento."
                action={
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-custom-primary hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Adicionar método de pagamento
                  </button>
                }
              />
            )}
          </div>

          {/* Seção de Histórico de Pagamentos */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Histórico de Pagamentos
            </h4>
            
            {hasPaymentHistory ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={ReceiptIcon}
                title="Nenhum histórico de pagamentos"
                description="Ainda não foram realizados pagamentos na sua conta."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}