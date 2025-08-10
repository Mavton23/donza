import { useState, useEffect } from 'react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { Pencil, Check, PhoneOff, Info, Phone, Link as LinkIcon, Shield } from 'lucide-react';

export default function ProfileForm({
  userData,
  onSubmit,
  role,
  errors = {},
  loading = false,
  isEditable = false
}) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    website: '',
    contactPhone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isStudent = role === 'student';

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        website: userData.website || '',
        contactPhone: userData.contactPhone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWebsiteChange = (e) => {
    if (!isEditable) return;
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      website: value.startsWith('http') ? value : `https://${value}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) return;

    setIsSubmitting(true);

    if (showPasswordFields && formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      bio: formData.bio,
      website: formData.website,
      contactPhone: formData.contactPhone
    };

    if (showPasswordFields && formData.newPassword) {
      submissionData.currentPassword = formData.currentPassword;
      submissionData.newPassword = formData.newPassword;
    }

    try {
      await onSubmit(submissionData);
      if (showPasswordFields) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setShowPasswordFields(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${
    !isEditable 
      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 cursor-not-allowed'
      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
  } ${errors ? 'border-red-500 dark:border-red-400' : 'border'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome de usuário
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            readOnly={!isEditable}
            disabled={!isEditable || isSubmitting}
            className={`${baseInputClass} ${errors.username ? 'border-red-500' : ''}`}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
            {userData?.isVerified && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Verificado
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={!isEditable || userData?.isVerified}
              disabled={!isEditable || isSubmitting || userData?.isVerified}
              className={`${baseInputClass} ${errors.email ? 'border-red-500' : ''}`}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {userData?.isVerified && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome completo
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            readOnly={!isEditable}
            disabled={!isEditable || isSubmitting}
            className={baseInputClass}
          />
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Biografia
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            readOnly={!isEditable}
            disabled={!isEditable || isSubmitting}
            className={baseInputClass}
            placeholder="Fale um pouco sobre você..."
          />
        </div>

        {/* Website - Mostrar apenas para instrutores e instituições */}
        {!isStudent ? (
          <div className="sm:col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                <LinkIcon className="h-4 w-4 mr-1" />
                https://
              </span>
              <input
                type="text"
                name="website"
                id="website"
                value={formData.website.replace('https://', '')}
                onChange={handleWebsiteChange}
                readOnly={!isEditable}
                disabled={!isEditable || isSubmitting}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md ${baseInputClass}`}
                placeholder="seusite.com"
              />
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800 flex items-start">
              <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                Apenas instrutores e instituições podem adicionar website e telefone de contato.
              </span>
            </div>
          </div>
        )}

        {/* Contact Phone - Mostrar apenas para instrutores e instituições */}
        {!isStudent && (
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefone
            </label>

            {/* Se não for editável e não há telefone, mostrar mensagem amigável */}
            {!isEditable && !formData.contactPhone ? (
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-2 rounded-xl text-sm mt-2">
                <PhoneOff className="h-4 w-4" />
                <span>Número de telefone não fornecido</span>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  readOnly={!isEditable}
                  disabled={!isEditable || isSubmitting}
                  className={baseInputClass}
                  placeholder="(00) 00000-0000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Section */}
      {isEditable && (
        <>
          {!showPasswordFields ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Alterar senha
              </button>
            </div>
          ) : (
            <div className="space-y-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Alterar senha
              </h4>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha atual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`${baseInputClass} ${errors.currentPassword ? 'border-red-500' : ''}`}
                  aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                />
                {errors.currentPassword && (
                  <p id="currentPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nova senha
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={baseInputClass}
                />
                <PasswordStrengthMeter password={formData.newPassword} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={baseInputClass}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit Button */}
      {isEditable && (
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      )}
    </form>
  );
}