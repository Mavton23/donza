import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import PasswordStrengthBar from 'react-password-strength-bar';

const EmailPasswordStep = ({
  register,
  errors,
  watchInit,
  onSubmit,
  loading,
  selectedRole,
  onBack,
  showPassword,
  setShowPassword
}) => {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
        {onBack && (
            <button
                type="button"
                onClick={onBack}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                ← Voltar para seleção de perfil
            </button>
        )}
        
        <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
        </label>
        <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`mt-1 block w-full px-3 py-2 border ${
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            placeholder={
            selectedRole === 'institution' 
                ? 'contato@instituicao.edu.mz' 
                : 'seu@email.com'
            }
        />
        {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
        </div>

        <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Senha *
        </label>
        <div className="relative mt-1">
            <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                className={`block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Mínimo 8 caracteres"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
                <Eye className="h-5 w-5 text-gray-400" />
            )}
            </button>
        </div>
        {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
        <PasswordStrengthBar 
            password={watchInit('password') || ''} 
            className="mt-2"
            scoreWords={['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']}
            shortScoreWord="Muito curta"
        />
        </div>

        <div>
        <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
        >
            {loading ? (
                <>
                    <LoadingSpinner 
                        size="small" 
                        spinnerColor="border-white"
                        inline
                    />
                    <span>Enviando email...</span>
                </>
                ) : (
                    'Enviar Email de Verificação'
            )}
        </button>
        </div>
    </form>
  );
};

export default EmailPasswordStep;