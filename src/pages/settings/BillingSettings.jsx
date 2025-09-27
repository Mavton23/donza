import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CreditCardIcon, 
  ReceiptIcon, 
  WalletIcon,
  DownloadIcon,
  BuildingIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  StarIcon
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { getErrorMessage } from '@/hooks/getErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AddPaymentMethodModal from '@/components/payment/AddPaymentMethodModal';
import PayoutMethodsModal from '@/components/payment/PayoutMethodsModal';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function BillingSettings() {
  const { user } = useOutletContext();
  const { hasRole } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showPayoutMethodsModal, setShowPayoutMethodsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('payment-methods');

  const isInstructor = hasRole('instructor');
  const isInstitution = hasRole('institution');
  const canReceivePayouts = isInstructor || isInstitution;

  useEffect(() => {
    fetchBillingData();
  }, [user.userId]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const requests = [
        api.get(`/payments/${user.userId}/methods`),
        api.get(`/payments/${user.userId}/history`)
      ];

      if (canReceivePayouts) {
        requests.push(api.get('/payments/payouts'));
      }

      const [methodsResponse, historyResponse, payoutsResponse] = await Promise.all(requests);

      setPaymentMethods(methodsResponse.data.data.paymentMethods || []);
      setPaymentHistory(historyResponse.data.data || []);
      setBillingInfo(methodsResponse.data.data.billingInfo);

      if (payoutsResponse) {
        setPayouts(payoutsResponse.data.data.payouts || []);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (methodData) => {
    try {
      const response = await api.post(`/payments/${user.userId}/methods`, {
        paymentMethodData: methodData
      });
      
      setPaymentMethods(prev => [...prev, response.data.data]);
      setShowAddMethodModal(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Erro ao adicionar método de pagamento:', error);
    }
  };

  const handleRemoveMethod = async (id) => {
    try {
      await api.delete(`/payments/${user.userId}/methods/${id}`);
      setPaymentMethods(prev => prev.filter(pmt => pmt.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Erro ao remover método de pagamento:', error);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Erro ao baixar fatura:', error);
    }
  };

  const hasPaymentMethods = paymentMethods.length > 0;
  const hasPaymentHistory = paymentHistory.length > 0;
  const hasPayouts = payouts.length > 0;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Modal para adicionar método de pagamento */}
      <AddPaymentMethodModal
        isOpen={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        onAddMethod={handleAddPaymentMethod}
      />

      {/* Modal para configurar métodos de repasse */}
      <PayoutMethodsModal
        isOpen={showPayoutMethodsModal}
        onClose={() => setShowPayoutMethodsModal(false)}
        user={user}
      />

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5" /> 
          {canReceivePayouts ? 'Pagamentos e Repasses' : 'Pagamentos'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {canReceivePayouts 
            ? 'Gerencie seus métodos de pagamento e recebimento' 
            : 'Gerencie seus métodos de pagamento e assinaturas'
          }
        </p>
      </div>

      {/* Tabs de Navegação */}
      {canReceivePayouts && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'payment-methods', name: 'Métodos de Pagamento', icon: CreditCardIcon },
              { id: 'payouts', name: 'Meus Repasses', icon: WalletIcon },
              { id: 'history', name: 'Histórico', icon: ReceiptIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-custom-primary text-custom-primary dark:text-custom-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Conteúdo das Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
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
                        <div className={`p-2 rounded mr-4 ${
                          method.brand === 'visa' ? 'bg-blue-100 text-blue-800' :
                          method.brand === 'mastercard' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {method.brand === 'visa' ? 'VISA' :
                           method.brand === 'mastercard' ? 'MC' : method.brand?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• {method.last4}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {method.type === 'mobile_money' ? 'Carteira Mobile' :
                             method.type === 'bank_transfer' ? 'Transferência Bancária' :
                             'Cartão de Crédito'} • Expira em {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Padrão
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMethod(method.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2"
                          title="Remover método"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CreditCardIcon}
                  title="Nenhum método de pagamento"
                  description="Adicione um método de pagamento para realizar compras na plataforma."
                />
              )}

              <button
                type="button"
                onClick={() => setShowAddMethodModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-custom-primary hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicionar método de pagamento
              </button>
            </div>

            {/* Informações de Assinatura */}
            {billingInfo && billingInfo.plan !== 'free' && (
              <div className="border-t pt-6 mt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Plano Atual
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{billingInfo.plan}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Próxima cobrança: {new Date(billingInfo.currentPeriodEnd).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      billingInfo.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {billingInfo.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payouts' && canReceivePayouts && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Meus Repasses
              </h4>
              <button
                onClick={() => setShowPayoutMethodsModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <WalletIcon className="h-4 w-4 mr-2" />
                Configurar Recebimento
              </button>
            </div>

            {hasPayouts ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr key={payout.payoutId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payout.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payout.amount} {payout.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payout.payoutMethod === 'bank_transfer' ? 'Transferência Bancária' :
                           payout.payoutMethod === 'mobile_money' ? 'Carteira Mobile' :
                           payout.payoutMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payout.status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : payout.status === 'processing'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {payout.status === 'paid' ? 'Pago' :
                             payout.status === 'processing' ? 'Processando' :
                             payout.status === 'pending' ? 'Pendente' : 'Falhou'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payout.invoice?.externalId && (
                            <button
                              onClick={() => handleDownloadInvoice(payout.invoice.externalId)}
                              className="text-custom-primary hover:text-custom-primary-hover"
                              title="Baixar recibo"
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={WalletIcon}
                title="Nenhum repasse encontrado"
                description="Você ainda não recebeu nenhum repasse. Os repasses são processados automaticamente após a conclusão das vendas."
              />
            )}

            {/* Estatísticas de Repasses */}
            {hasPayouts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Recebido</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payouts
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                      .toFixed(2)} MZN
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {payouts.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Próximo Repasse</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {payouts.some(p => p.status === 'pending') ? 'Em processamento' : 'Sem pendências'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Histórico de Pagamentos
            </h4>
            
            {hasPaymentHistory ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.amount} {payment.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(payment.externalId)}
                            className="text-custom-primary hover:text-custom-primary-hover"
                            title="Baixar fatura"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </button>
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
        )}
      </div>
    </div>
  );
}