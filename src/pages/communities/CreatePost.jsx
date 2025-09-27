import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { FiArrowLeft, FiLink } from 'react-icons/fi';
import { Pin, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/common/RichTextEditor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import CustomTagsInput from '@/components/common/CustomTagsInput';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/common/FileUpload';

// Constantes para opções reutilizáveis
const POST_TYPES = [
  { value: 'discussion', label: 'Discussão', icon: <BookOpen size={16} /> },
  { value: 'question', label: 'Pergunta', icon: <AlertCircle size={16} /> },
  { value: 'resource', label: 'Recurso', icon: <BookOpen size={16} /> },
  { value: 'announcement', label: 'Anúncio', icon: <Pin size={16} /> },
  { value: 'assignment', label: 'Tarefa', icon: <GraduationCap size={16} /> }
];

const DIFFICULTY_LEVELS = [
  { value: null, label: 'Não aplicável' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' }
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Público' },
  { value: 'members', label: 'Apenas Membros da Comunidade' },
  { value: 'restricted', label: 'Membros Específicos' }
];

// Tipo inicial do estado do post
const INITIAL_POST_STATE = {
  title: '',
  content: '',
  excerpt: '',
  isPinned: false,
  isOriginalContent: true,
  tags: [],
  postType: 'discussion',
  difficultyLevel: null,
  sourceUrl: '',
  visibility: 'public',
  attachments: []
};

export default function CreatePost() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [state, setState] = useState({
    loading: false,
    error: '',
    uploadProgress: {},
    attachments: []
  });
  
  const [postData, setPostData] = useState(INITIAL_POST_STATE);

  // Limpeza de URLs temporárias
  useEffect(() => {
    return () => {
      state.attachments.forEach(attachment => {
        if (attachment.url?.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.url);
        }
      });
    };
  }, [state.attachments]);

  // Manipuladores de eventos
  const handleInputChange = (field, value) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttachmentUpload = async (files) => {
    const newAttachments = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      type: file.type.split('/')[0] === 'image' ? 'image' : 
            file.type.includes('pdf') ? 'document' : 'file',
      title: file.name,
      isNew: true,
      uploadProgress: 0
    }));
    
    setState(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (index) => {
    const attachment = state.attachments[index];
    if (attachment.url?.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    
    setState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
      uploadProgress: Object.fromEntries(
        Object.entries(prev.uploadProgress).filter(([key]) => key !== attachment.title)
      )
    }));
  };

  const uploadAttachments = async () => {
    const uploadPromises = state.attachments
      .filter(a => a.isNew)
      .map(async (attachment) => {
        try {
          const formData = new FormData();
          formData.append('file', attachment.file);
          
          const response = await api.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              
              setState(prev => ({
                ...prev,
                uploadProgress: {
                  ...prev.uploadProgress,
                  [attachment.title]: progress
                }
              }));
            }
          });
          
          return {
            url: response.data.url,
            type: attachment.type,
            title: attachment.title
          };
        } catch (error) {
          console.error(`Falha no upload de ${attachment.title}:`, error);
          return null;
        }
      });
    
    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean);
  };

  const validateForm = () => {
    if (!postData.title.trim() || postData.title.length < 5) {
      throw new Error('O título deve ter pelo menos 5 caracteres');
    }

    if (!postData.content.trim() || postData.content.length < 50) {
      throw new Error('O conteúdo deve ter pelo menos 50 caracteres');
    }

    if (postData.postType === 'resource' && !postData.sourceUrl) {
      throw new Error('URL da fonte é obrigatória para recursos');
    }

    if (postData.tags.length > 5) {
      throw new Error('Máximo de 5 tags permitidas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      validateForm();
      
      const finalExcerpt = postData.excerpt || 
        postData.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
      
      const uploadedAttachments = await uploadAttachments();
      
      const payload = {
        ...postData,
        excerpt: finalExcerpt,
        authorId: user.userId,
        attachments: uploadedAttachments,
        metadata: {
          createdAt: new Date().toISOString(),
          author: {
            userId: user.userId,
            username: user.username
          }
        }
      };
      
      const response = await api.post(
        `/community/communities/${communityId}/posts`, 
        payload
      );
      
      navigate(`/communities/${communityId}/posts/${response.data.data.postId}`);
    } catch (err) {
      let errorMessage = 'Falha ao criar a publicação';
      
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = 'Arquivo muito grande. Tamanho máximo permitido é 5MB';
        } else if (err.response.data?.errors) {
          errorMessage = err.response.data.errors.join(', ');
        } else {
          errorMessage = err.response.data?.message || err.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
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
          Voltar para a comunidade
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Criar Publicação
        </h1>
      </div>

      {state.error && <ErrorMessage message={state.error} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Publicação *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('postType', type.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  postData.postType === type.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mb-1">{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={postData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            required
            maxLength={120}
            placeholder="Sobre o que é sua publicação?"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {postData.title.length}/120 caracteres
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resumo Curto (Opcional)
          </label>
          <textarea
            id="excerpt"
            value={postData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
            rows={3}
            maxLength={200}
            placeholder="Um breve resumo da sua publicação..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {postData.excerpt.length}/200 caracteres (será gerado automaticamente se vazio)
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conteúdo *
          </label>
          <RichTextEditor
            value={postData.content}
            onChange={(html) => handleInputChange('content', html)}
            placeholder="Escreva o conteúdo da sua publicação aqui..."
            maxLength={5000}
            className="min-h-[300px]"
          />
        </div>

        {/* Difficulty Level */}
        {(postData.postType === 'resource' || postData.postType === 'assignment') && (
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nível de Dificuldade
          </label>
          <div className="relative">
            <select
              id="difficulty"
              value={postData.difficultyLevel || ''}
              onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
              className="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.value || 'na'} value={level.value || ''}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (Opcional)
          </label>
          <CustomTagsInput
            value={postData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            maxTags={5}
            maxLength={20}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Adicione até 5 tags para ajudar a categorizar sua publicação
          </p>
        </div>

        {/* Source URL */}
        <div>
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL da Fonte (Opcional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLink className="text-gray-400" />
            </div>
            <input
              type="url"
              id="sourceUrl"
              value={postData.sourceUrl}
              onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              placeholder="https://exemplo.com"
            />
          </div>
        </div>

        {/* Original Content Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div>
            <label htmlFor="originalContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conteúdo Original
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Este é o seu trabalho original?
            </p>
          </div>
          <Switch
            id="originalContent"
            checked={postData.isOriginalContent}
            onCheckedChange={(checked) => handleInputChange('isOriginalContent', checked)}
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Anexos
          </label>
          <FileUpload
            onUpload={handleAttachmentUpload}
            accept="image/*, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
            multiple
            fileType='auto'
          />
          
          {state.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {state.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-gray-500 dark:text-gray-400">
                      {attachment.type === 'image' ? '🖼️' : 
                       attachment.type === 'document' ? '📄' : '📎'}
                    </span>
                    <span className="truncate">{attachment.title}</span>
                    {state.uploadProgress[attachment.title] > 0 && 
                     state.uploadProgress[attachment.title] < 100 && (
                      <span className="text-xs text-gray-500">
                        ({state.uploadProgress[attachment.title]}%)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Visibilidade
        </label>
        <div className="relative">
          <select
            id="visibility"
            value={postData.visibility}
            onChange={(e) => handleInputChange('visibility', e.target.value)}
            className="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

        {/* Admin Controls */}
        {(user?.role === 'instructor' || user?.role === 'moderator') && (
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <input
              type="checkbox"
              id="isPinned"
              checked={postData.isPinned}
              onChange={(e) => handleInputChange('isPinned', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="isPinned" className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Pin className="mr-1" size={16} />
              Fixar esta publicação (visível no topo da comunidade)
            </label>
          </div>
        )}

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
            disabled={state.loading || !postData.title.trim() || !postData.content.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {state.loading ? <LoadingSpinner size="sm" /> : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}