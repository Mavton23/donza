import { useState, useEffect } from 'react';
import { XIcon, WalletIcon, BuildingIcon, SmartphoneIcon, SaveIcon, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/hooks/getErrorMessage';

export default function PayoutMethodsModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payoutData, setPayoutData] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    preferredMethod: 'bank_transfer',
    bankAccount: '',
    bankName: 'bim',
    mobileNumber: '',
    mobileProvider: 'mpesa',
    taxIdentification: '',
    fullName: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPayoutMethods();
    }
  }, [isOpen, user.userId]);

  const loadPayoutMethods = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar métodos existentes do usuário
      const response = await api.get(`/payments/${user.userId}/payout-methods`);
      if (response.data.success) {
        const data = response.data.data;

        setPayoutData(data);
        setFormData(prev => ({
          ...prev,
          preferredMethod: data.preferredMethod || 'bank_transfer',
          fullName: data.fullName || '',
          taxIdentification: data.taxIdentification || '',
          bankAccount: data.bankAccount || '',
          bankName: data.bankName || 'bim',
          mobileNumber: data.mobileNumber || '',
          mobileProvider: data.mobileProvider || 'mpesa'
        }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
      setError('Erro ao carregar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Validar dados obrigatórios
      if (!formData.fullName || !formData.taxIdentification) {
        throw new Error('Nome completo e NUIT são obrigatórios');
      }

      if (formData.preferredMethod === 'bank_transfer' && (!formData.bankAccount || !formData.bankName)) {
        throw new Error('Dados bancários são obrigatórios para transferência bancária');
      }

      if (formData.preferredMethod === 'mobile_money' && (!formData.mobileNumber || !formData.mobileProvider)) {
        throw new Error('Dados de mobile money são obrigatórios');
      }

      // Atualizar informações de repasse do usuário
      await api.put(`/payments/${user.userId}/payout-methods`, formData);
      
      // Iniciar verificação KYC
      await api.post(`/payments/${user.userId}/kyc-verification`);
      
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Erro ao salvar métodos de repasse:', error);
    } finally {
      setSaving(false);
    }
  };

  const payoutOptions = [
    {
      id: 'bank_transfer',
      name: 'Transferência Bancária',
      icon: BuildingIcon,
      description: 'Receba diretamente na sua conta bancária',
      fields: [
        {
          name: 'bankName',
          label: 'Banco',
          type: 'select',
          options: [
            { value: 'bim', label: 'BIM' },
            { value: 'bci', label: 'BCI' },
            { value: 'standard', label: 'Standard Bank' },
            { value: 'absa', label: 'Absa' }
          ]
        },
        {
          name: 'bankAccount',
          label: 'Número da Conta',
          type: 'text',
          placeholder: '1234567890'
        }
      ]
    },
    {
      id: 'mobile_money',
      name: 'Carteira Mobile',
      icon: SmartphoneIcon,
      description: 'Receba na sua carteira móvel',
      fields: [
        {
          name: 'mobileProvider',
          label: 'Operadora',
          type: 'select',
          options: [
            { value: 'mpesa', label: 'M-Pesa' },
            { value: 'emola', label: 'e-Mola' }
          ]
        },
        {
          name: 'mobileNumber',
          label: 'Número',
          type: 'tel',
          placeholder: '84 300 0000'
        }
      ]
    }
  ];

  const selectedMethod = payoutOptions.find(opt => opt.id === formData.preferredMethod);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Configurar Métodos de Recebimento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando configurações...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NUIT *
                    </label>
                    <input
                      type="text"
                      value={formData.taxIdentification}
                      onChange={(e) => handleInputChange('taxIdentification', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-700 dark:text-white"
                      placeholder="123456789"
                      required
                      maxLength={9}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">9 dígitos</p>
                  </div>
                </div>
              </div>

              {/* Método de Recebimento Preferido */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Método de Recebimento Preferido *
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {payoutOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleInputChange('preferredMethod', option.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.preferredMethod === option.id
                          ? 'border-custom-primary bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <option.icon className="h-5 w-5 text-custom-primary" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {option.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Campos específicos do método selecionado */}
                {selectedMethod && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-4">
                      Dados para {selectedMethod.name} *
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMethod.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={formData[field.name]}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-600 dark:text-white"
                              required={formData.preferredMethod === selectedMethod.id}
                            >
                              <option value="">Selecione...</option>
                              {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.name]}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-primary dark:bg-gray-600 dark:text-white"
                              required={formData.preferredMethod === selectedMethod.id}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status KYC */}
              {payoutData?.kycStatus && payoutData.kycStatus !== 'not_started' && (
                <div className={`rounded-lg p-4 ${
                  payoutData.kycStatus === 'verified' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : payoutData.kycStatus === 'pending'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                }`}>
                  <h5 className={`font-medium mb-2 ${
                    payoutData.kycStatus === 'verified' ? 'text-green-800 dark:text-green-400' :
                    payoutData.kycStatus === 'pending' ? 'text-yellow-800 dark:text-yellow-400' :
                    'text-red-800 dark:text-red-400'
                  }`}>
                    Status da Verificação KYC: {
                      payoutData.kycStatus === 'verified' ? 'Verificado' :
                      payoutData.kycStatus === 'pending' ? 'Pendente' :
                      'Rejeitado'
                    }
                  </h5>
                  <p className={`text-sm ${
                    payoutData.kycStatus === 'verified' ? 'text-green-700 dark:text-green-300' :
                    payoutData.kycStatus === 'pending' ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-red-700 dark:text-red-300'
                  }`}>
                    {payoutData.kycStatus === 'verified' 
                      ? 'Sua verificação foi aprovada. Você pode receber repasses.'
                      : payoutData.kycStatus === 'pending'
                      ? 'Sua verificação está em análise. Nossa equipe entrará em contato em breve.'
                      : 'Sua verificação foi rejeitada. Entre em contato com o suporte para mais informações.'
                    }
                  </p>
                </div>
              )}

              {/* Informações de KYC */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Verificação Necessária
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Para receber repasses, é necessário completar a verificação KYC. 
                  Os dados fornecidos serão validados pela nossa equipe.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-custom-primary rounded-md hover:bg-custom-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar e Verificar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}