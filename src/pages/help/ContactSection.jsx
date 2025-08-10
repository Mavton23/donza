import { Mail, MessageSquare, Phone, ChevronRight , X, ChevronLeft, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

const ContactSection = () => {
  const navigate = useNavigate();
  const [activeOption, setActiveOption] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactReason: '',
    message: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const contactOptions = [
    {
      id: 'email',
      title: "Enviar e-mail",
      description: "Suporte detalhado",
      icon: <Mail size={20} />,
      details: "Resposta em até 24h",
      color: 'indigo',
      formFields: [
        { name: 'contactReason', label: 'Motivo do contato', type: 'select', options: [
          'Problema técnico', 'Dúvida sobre a plataforma', 'Sugestão', 'Outro'
        ], required: true },
        { name: 'message', label: 'Mensagem detalhada', type: 'textarea', required: true }
      ]
    },
    // {
    //   id: 'chat',
    //   title: "Chat ao vivo",
    //   description: "Atendimento imediato",
    //   icon: <MessageSquare size={20} />,
    //   details: "Disponível das 8h às 18h",
    //   color: 'green',
    //   immediateAction: true,
    //   action: () => navigate('/live-chat')
    // },
    {
      id: 'callback',
      title: "Agendar chamada",
      description: "Atendimento personalizado",
      icon: <Phone size={20} />,
      details: "Ligamos para você",
      color: 'blue',
      formFields: [
        { name: 'contactReason', label: 'Assunto', type: 'text', required: true },
        { name: 'preferredTime', label: 'Melhor horário', type: 'datetime-local', required: true },
        { name: 'phone', label: 'Telefone para contato', type: 'tel', required: true }
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.post('/contact-requests', {
        ...formData,
        contactMethod: activeOption
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setActiveOption(null);
        setSubmitSuccess(false);
        setFormData({
          name: '',
          email: '',
          contactReason: '',
          message: '',
          preferredTime: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            required={field.required}
          >
            <option value="">Selecione...</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            rows={4}
            value={formData[field.name]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            required={field.required}
          />
        );
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            required={field.required}
            min={new Date().toISOString().slice(0, 16)}
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            required={field.required}
          />
        );
    }
  };

  if (submitSuccess) {
    return (
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Solicitação enviada!</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Nossa equipe entrará em contato em breve. Obrigado!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 sm:p-8">
        {activeOption ? (
          <div className="space-y-6">
            <button
              onClick={() => setActiveOption(null)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="mr-1" size={18} />
              Voltar para opções
            </button>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {contactOptions.find(opt => opt.id === activeOption)?.title}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              {contactOptions.find(opt => opt.id === activeOption)?.formFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mr-2" size={18} />
                      Enviando...
                    </>
                  ) : (
                    'Enviar solicitação'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Precisa de mais ajuda?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecione a melhor forma de entrar em contato conosco
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => option.immediateAction ? option.action() : setActiveOption(option.id)}
                  className={`flex flex-col items-start p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${option.color === 'indigo' ? 'border-indigo-200 hover:border-indigo-300 dark:border-indigo-900/50 dark:hover:border-indigo-800' : option.color === 'green' ? 'border-green-200 hover:border-green-300 dark:border-green-900/50 dark:hover:border-green-800' : 'border-blue-200 hover:border-blue-300 dark:border-blue-900/50 dark:hover:border-blue-800'}`}
                >
                  <div className={`flex items-center mb-3 p-2 rounded-full ${option.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : option.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {option.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">{option.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                    <span>{option.details}</span>
                    <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactSection;