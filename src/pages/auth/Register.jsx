import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import RoleSelectionStep from '@/components/auth/RoleSelectionStep';
import EmailPasswordStep from '@/components/auth/EmailPasswordStep';
import SpamWarningAlert from '@/components/auth/SpamWarningAlert';
import DocumentUploadStep from '@/components/auth/DocumentUploadStep';
import ProgressSteps from '@/components/common/ProgressSteps';

import { 
  emailPasswordSchema,
  instructorSchema,
  institutionSchema
 } from '@/schemas/registrationSchemas';

export default function Register() {
  usePageTitle();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('student');
  const [verificationToken, setVerificationToken] = useState(searchParams.get('token') || '');
  const [showSpamWarning, setShowSpamWarning] = useState(false);
  const [isCompletingStudentRegistration, setIsCompletingStudentRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    init: null, 
    documents: null
  });

  const { 
    register: registerInit, 
    handleSubmit: handleInitSubmit, 
    formState: { errors: initErrors },
    watch: watchInit,
    setValue: setInitValue
  } = useForm({
    resolver: yupResolver(emailPasswordSchema),
    defaultValues: {
      role: selectedRole
    }
  });

  const getCompleteSchema = () => {
    if (selectedRole === 'institution') return institutionSchema;
    if (selectedRole === 'instructor') return instructorSchema;
    return yup.object();
  };

  const { 
    register: registerComplete, 
    handleSubmit: handleCompleteSubmit, 
    formState: { errors: completeErrors },
    setValue: setCompleteValue
  } = useForm({
    resolver: yupResolver(getCompleteSchema()),
  });

  useEffect(() => {
    const roleParam = searchParams.get('as');
    const token = searchParams.get('token');

    if (roleParam && ['student', 'instructor', 'institution'].includes(roleParam)) {
      setSelectedRole(roleParam);
      setInitValue('role', roleParam);
    }

    if (token) {
      setVerificationToken(token);
      setCurrentStep(selectedRole === 'student' ? 3 : 3);
      
      // Recupera dados temporários se existirem
      const tempData = localStorage.getItem('tempRegistration');
      if (tempData) {
        try {
          const { email, password, role } = JSON.parse(tempData);
          setInitValue('email', email);
          setInitValue('password', password);
          if (role) {
            setSelectedRole(role);
            setInitValue('role', role);
          }
        } catch (e) {
          console.error("Failed to parse temp registration data", e);
        }
      }
    }
  }, [searchParams, setInitValue]);

  useEffect(() => {
    if (isCompletingStudentRegistration && verificationToken) {
      completeStudentRegistration();
    }
  }, [isCompletingStudentRegistration, verificationToken]);

  // Submissão da fase inicial
  const onSubmitInit = async (data) => {
    try {
      setLoading(true);
      setShowSpamWarning(false);

      const initData = {
        email: data.email,
        password: data.password,
        role: selectedRole
      };

      setFormData(prev => ({...prev, init: initData}));  
      localStorage.setItem('tempRegistration', JSON.stringify(initData));

      const response = await api.registerInit(initData);
      
      if (response.data?.token) {
        setVerificationToken(response.data.token);
      }

      if (response.data.success) {
        setShowSpamWarning(true);
      }
      
      toast.success(response.data?.message || 'Email de verificação enviado! Por favor verifique seu email.');
      
      setCurrentStep(2)

    } catch (err) {
      handleRegistrationError(err);
    } finally {
      setLoading(false);
    }
  };

  const completeStudentRegistration = async () => {
    try {
      setLoading(true);
      
      const completeData = {
        token: verificationToken,
        username: watchInit('email').split('@')[0],
        role: selectedRole
      }

      const completeResponse = await api.post('/auth/register/complete', completeData);
      
      // Armazena tokens
      if (completeResponse.data && completeResponse.data.data) {
        localStorage.setItem('token', completeResponse.data.data.accessToken);
        localStorage.setItem('refreshToken', completeResponse.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
          userId: completeResponse.data.data.userId,
          username: completeResponse.data.data.username,
          email: completeResponse.data.data.email,
          role: completeResponse.data.data.role,
          status: completeResponse.data.data.status
        }));
      }

      await login({
        email: watchInit('email'),
        password: watchInit('password')
      });

      // Limpa dados temporários
      localStorage.removeItem('tempRegistration');
      setFormData({ init: null, documents: null });
      setVerificationToken('');
      
      // Redireciona para completar perfil
      navigate('/complete-profile', { 
        state: { 
          from: '/dashboard',
          fromRegistration: true,
          initialData: {
            role: selectedRole,
            email: watchInit('email')
          }
        }
      });

    } catch (err) {
      handleRegistrationError(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDocuments = async (data) => {
    try {
      setLoading(true);

      if (selectedRole === 'student') {
        await completeStudentRegistration();
        return;
      }
      
      const formData = new FormData();
      formData.append('token', verificationToken);
      formData.append('role', selectedRole);

      // Adiciona campos não-arquivo
      Object.keys(data).forEach(key => {
        if (typeof data[key] !== 'object' || data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      });

      // Adiciona arquivos
      const documentFields = {
        instructor: ['diplomas', 'experiencia', 'certificacoes', 'registroProfissional'],
        institution: ['alvara', 'credenciamento', 'estatutos', 'endereco']
      };

      documentFields[selectedRole].forEach(field => {
        if (data[field]) {
          if (Array.isArray(data[field])) {
            data[field].forEach((file, index) => {
              formData.append(`${field}[${index}]`, file);
            });
          } else {
            formData.append(field, data[field]);
          }
        }
      });
      
      const uploadResponse = await api.post('/auth/register/upload-documents', formData);

      if (uploadResponse.data.success) {
        const completeData = {
          token: verificationToken,
          username: data.username,
          ...(data.role === 'institution' && { institutionName: data.institutionName })
        }

        const completeResponse = await api.post('/auth/register/complete', completeData);
        
        // Armazena tokens
        if (completeResponse.data && completeResponse.data.data) {
          localStorage.setItem('token', completeResponse.data.data.accessToken);
          localStorage.setItem('refreshToken', completeResponse.data.data.refreshToken);
          localStorage.setItem('user', JSON.stringify({
            userId: completeResponse.data.data.userId,
            username: completeResponse.data.data.username,
            email: completeResponse.data.data.email,
            role: completeResponse.data.data.role,
            status: completeResponse.data.data.status
          }))
        }
      
      }

      await login({
        email: watchInit('email'),
        password: watchInit('password')
      });

      // Limpa dados temporários
      localStorage.removeItem('tempRegistration');
      setFormData({ init: null, documents: null });
      setVerificationToken('');
      
      // Redireciona para completar perfil
      navigate('/complete-profile', { 
        state: { 
          from: '/dashboard',
          initialData: {
            role: selectedRole,
            email: watchInit('email'),
            ...(selectedRole === 'institution' && { 
              institutionName: data.institutionName,
              legalRepresentative: data.legalRepresentative
            }),
            ...(selectedRole === 'instructor' && {
              fullName: data.fullName,
              educationLevel: data.educationLevel,
              educationField: data.educationField
            })
          }
        }
      });

    } catch (err) {
      handleRegistrationError(err);
    } finally {
      setLoading(false);
    }
  };


  const handleRegistrationError = (err) => {
    console.log(err);
    let errorMsg = 'Falha no registro. Por favor tente novamente.';

    if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Erro de conexão. Verifique sua internet.';
    } 

    else if (err.response?.status === 429) {
        errorMsg = 'Muitas tentativas. Tente novamente mais tarde.';
    } 

    else if (err.response) {
        const resData = err.response.data;

        if (resData?.error?.message) {
            errorMsg = resData.error.message;
        } 
      
        else if (Array.isArray(resData?.errors)) {
            errorMsg = resData.errors[0]?.message || errorMsg;
        } 

        else if (resData?.message) {
            errorMsg = resData.message;
        }
    } 

    else if (err.message) {
        errorMsg = err.message;
    }

    // Exibe a mensagem
    toast.error(errorMsg);

    // Reseta o fluxo para erros específicos
    const shouldResetFlow = [
        'inválido',
        'expirado',
        'ausente',
        'token'
    ].some(keyword => errorMsg.toLowerCase().includes(keyword));

    if (shouldResetFlow) {
        setCurrentStep(1);
        setVerificationToken('');
        localStorage.removeItem('tempRegistration');
    }
  };

   const getSteps = () => {
    if (selectedRole === 'student') {
      return ['Selecionar Perfil', 'Verificar Email', 'Completar Perfil'];
    }
    return ['Selecionar Perfil', 'Verificar Email', 'Documentos'];
  };

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      return (
        <RoleSelectionStep 
          onSelect={(role) => {
            setSelectedRole(role);
            setInitValue('role', role);
            setCurrentStep(2);
          }} 
          initialRole={selectedRole} 
        />
      );
    }

    if (currentStep === 2) {
      return (
        <motion.div
          key="initialForm"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <EmailPasswordStep 
            register={registerInit}
            errors={initErrors}
            watchInit={watchInit}
            onSubmit={handleInitSubmit(onSubmitInit)}
            loading={loading}
            selectedRole={selectedRole}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />                    
        </motion.div>
      );
    }

    if (currentStep === 3) {
      if (selectedRole === 'student') {
        if (!isCompletingStudentRegistration) {
          setIsCompletingStudentRegistration(true);
        }
      
        return (
          <div className="text-center py-8">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Completando seu registro...
            </p>
          </div>
        );
      }

      return (
        <motion.div
          key="documentForm"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <DocumentUploadStep 
            selectedRole={selectedRole}
            register={registerComplete}
            errors={completeErrors}
            onSubmit={handleCompleteSubmit(onSubmitDocuments)}
            loading={loading}
            onBack={() => setCurrentStep(2)}
            setValue={setCompleteValue}
          />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {showSpamWarning && (
          <SpamWarningAlert 
            email={watchInit('email')} 
            onClose={() => setShowSpamWarning(false)}
          />
        )}

        {currentStep !== 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                {currentStep === 2 ? 'Criar Conta' : 
                 currentStep === 3 && selectedRole === 'student' ? 'Completar Registro' : 
                 'Verificação de Documentos'}
              </h2>
              
              <ProgressSteps 
                steps={getSteps()} 
                currentStep={currentStep} 
                className="mt-4"
              />
              
              <button
                onClick={() => setCurrentStep(1)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                ← Alterar tipo de conta
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-8 border border-gray-200 dark:border-gray-700">
              <AnimatePresence mode="wait">
                {renderCurrentStep()}
              </AnimatePresence>

              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Ao registrar, você concorda com nossos{' '}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Termos de Serviço
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Política de Privacidade
                </Link>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Entrar
              </Link>
            </div>
          </div>
        )}

        {currentStep === 1 && renderCurrentStep()}
      </div>
    </div>
  );
}