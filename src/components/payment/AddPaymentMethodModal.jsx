import { useState } from 'react';
import { XIcon, CreditCardIcon, SmartphoneIcon, BuildingIcon } from 'lucide-react';
import api from '@/services/api';

export default function AddPaymentMethodModal({ isOpen, onClose, onAddMethod }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('card');
  const [formData, setFormData] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    mobileNumber: '',
    mobileProvider: 'mpesa',
    bankAccount: '',
    bankCode: 'bim'
  });

  const paymentMethods = [
    { id: 'card', name: 'Cartão', icon: CreditCardIcon },
    { id: 'mobile', name: 'Carteira Mobile', icon: SmartphoneIcon },
    { id: 'bank', name: 'Conta Bancária', icon: BuildingIcon }
  ];

  const mobileProviders = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'emola', label: 'e-Mola' }
  ];

  const banks = [
    { value: 'bim', label: 'BIM' },
    { value: 'bci', label: 'BCI' },
    { value: 'standard', label: 'Standard Bank' },
    { value: 'absa', label: 'Absa' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardNumberChange = (value) => {
    // Formatação automática do número do cartão
    const formatted = value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
    
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryChange = (value) => {
    // Formatação automática da data de expiração
    const formatted = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 5);
    
    handleInputChange('expiry', formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let methodData;

      switch (activeTab) {
        case 'card':
          const [expMonth, expYear] = formData.expiry.split('/');
          methodData = {
            type: 'credit_card',
            id: `card_${Date.now()}`,
            last4: formData.cardNumber.slice(-4),
            brand: formData.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
            expMonth: parseInt(expMonth),
            expYear: parseInt(20 + expYear)
          };
          break;

        case 'mobile':
          methodData = {
            type: 'mobile_money',
            id: `mobile_${Date.now()}`,
            last4: formData.mobileNumber.slice(-4),
            provider: formData.mobileProvider
          };
          break;

        case 'bank':
          methodData = {
            type: 'bank_transfer',
            id: `bank_${Date.now()}`,
            last4: formData.bankAccount.slice(-4),
            bank: formData.bankCode
          };
          break;
      }

      // Simular integração com gateway de pagamento
      // Na implementação real, aqui você integraria com Stripe/Paytek
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAddMethod(methodData);
      
    } catch (error) {
      console.error('Erro ao adicionar método:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Adicionar Método de Pagamento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs de Métodos */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveTab(method.id)}
                  className={`${
                    activeTab === method.id
                      ? 'border-custom-primary text-custom-primary dark:text-custom-primary-dark'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <method.icon className="h-4 w-4" />
                  {method.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Formulário de Cartão */}
          {activeTab === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={formData.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </form>
          )}

          {/* Formulário Mobile Money */}
          {activeTab === 'mobile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operadora
                </label>
                <select
                  value={formData.mobileProvider}
                  onChange={(e) => handleInputChange('mobileProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                >
                  {mobileProviders.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número da Carteira
                </label>
                <input
                  type="tel"
                  placeholder="84 300 0000"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </form>
          )}

          {/* Formulário Conta Bancária */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banco
                </label>
                <select
                  value={formData.bankCode}
                  onChange={(e) => handleInputChange('bankCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                >
                  {banks.map(bank => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número da Conta
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={formData.bankAccount}
                  onChange={(e) => handleInputChange('bankAccount', e.target.value.replace(/\D/g, '').slice(0, 15))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </form>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-custom-primary rounded-md hover:bg-custom-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar Método'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}