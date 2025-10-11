import usePageTitle from "@/hooks/usePageTitle";
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { FiArrowLeft, FiCalendar, FiClock, FiUsers, FiLock, FiLink } from 'react-icons/fi';
import RichTextEditor from '@/components/common/RichTextEditor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WeekdaySelector from '@/components/community/WeekdaySelector';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';
import CustomTagsInput from '@/components/common/CustomTagsInput';
import { toast } from 'sonner';

export default function CreateStudyGroup() {
  usePageTitle();
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 10,
    tags: [],
    meetingSchedule: {
      frequency: 'weekly',
      weekdays: [],
      time: '19:00',
      duration: 60
    },
    privacy: 'public',
    approvalRequired: false,
    coverImageUrl: ''
  });

  if (!isAllowed) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6 text-center">
            <LoadingSpinner fullScreen={false} />
          </div>
        </div>
      );
    }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.name.trim()) {
        throw new Error('Nome do grupo é obrigatório');
      }

      if (formData.meetingSchedule.weekdays.length === 0) {
        throw new Error('Selecione pelo menos um dia para as reuniões');
      }

      // Configuração automática para grupos privados
      const finalData = {
        ...formData,
        creatorId: user.userId,
        approvalRequired: formData.privacy !== 'public'
      };

      const response = await api.post(`/groups/${communityId}/groups`, finalData);

      toast.success('Grupo criado com sucesso!');
      navigate(`/communities/${communityId}/groups/${response.data.data.groupId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Falha ao criar grupo de estudo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          to={`/communities/${communityId}`}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para comunidade
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Criar Grupo de Estudo
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome e Descrição (mantidos iguais) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome do Grupo *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            required
            maxLength={50}
            placeholder="Ex: Grupo de Estudo de React Avançado"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição *
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => setFormData({ ...formData, description: html })}
            placeholder="Descreva o foco do grupo, objetivos e quaisquer pré-requisitos..."
            maxLength={2000}
            className="min-h-[250px]"
          />
        </div>

        {/* Tags (mantido igual) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (Opcional)
          </label>
          <CustomTagsInput
            value={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            maxTags={5}
            maxLength={20}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Adicione tags relevantes para ajudar os membros a encontrar seu grupo
          </p>
        </div>

        {/* Configurações de Privacidade */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FiLock className="mr-2" />
            Configurações de Privacidade
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Grupo *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Público', description: 'Qualquer membro da comunidade pode entrar' },
                  { value: 'private', label: 'Privado', description: 'Membros precisam solicitar entrada' },
                  { value: 'invite_only', label: 'Somente por Convite', description: 'Apenas membros convidados podem entrar' }
                ].map((option) => (
                  <div key={option.value} className="flex items-start">
                    <input
                      type="radio"
                      id={`privacy-${option.value}`}
                      name="privacy"
                      checked={formData.privacy === option.value}
                      onChange={() => setFormData({ ...formData, privacy: option.value })}
                      className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor={`privacy-${option.value}`} className="ml-2 block text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">{option.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {formData.privacy !== 'public' && (
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="approvalRequired"
                  checked={formData.approvalRequired}
                  onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  disabled={formData.privacy === 'invite_only'}
                />
                <label htmlFor="approvalRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Requer aprovação para entrada
                  {formData.privacy === 'invite_only' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      (Obrigatório para grupos por convite)
                    </span>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Configurações de Membros (mantido igual) */}
        <div>
          <label htmlFor="maxMembers" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiUsers className="mr-2" />
            Máximo de Membros
          </label>
          <select
            id="maxMembers"
            value={formData.maxMembers}
            onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
          >
            {[5, 10, 15, 20, 25, 30, 50].map(num => (
              <option key={num} value={num}>{num} membros</option>
            ))}
            <option value={0}>Sem limite</option>
          </select>
        </div>

        {/* Configurações de Reunião (mantido igual) */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FiCalendar className="mr-2" />
            Configurações de Reunião
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="frequency" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequência *
              </label>
              <select
                id="frequency"
                value={formData.meetingSchedule.frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  meetingSchedule: {
                    ...formData.meetingSchedule,
                    frequency: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                required
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            <div>
              <label htmlFor="meetingTime" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiClock className="mr-2" />
                Horário *
              </label>
              <input
                type="time"
                id="meetingTime"
                value={formData.meetingSchedule.time}
                onChange={(e) => setFormData({
                  ...formData,
                  meetingSchedule: {
                    ...formData.meetingSchedule,
                    time: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dias da Reunião *
            </label>
            <WeekdaySelector
              selectedDays={formData.meetingSchedule.weekdays}
              onChange={(weekdays) => setFormData({
                ...formData,
                meetingSchedule: {
                  ...formData.meetingSchedule,
                  weekdays
                }
              })}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duração (minutos) *
            </label>
            <input
              type="number"
              id="duration"
              min="30"
              max="240"
              step="15"
              value={formData.meetingSchedule.duration}
              onChange={(e) => setFormData({
                ...formData,
                meetingSchedule: {
                  ...formData.meetingSchedule,
                  duration: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(`/communities/${communityId}`)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim() || formData.meetingSchedule.weekdays.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Criar Grupo'}
          </button>
        </div>
      </form>
    </div>
  );
}