import FileUpload from '@/components/common/FileUpload';
import RichTextEditor from '../common/RichTextEditor';
import { Video, FileText, File, Headphones, HelpCircle, FileCheck } from 'lucide-react';

const lessonTypeIcons = {
  video: Video,
  text: FileText,
  pdf: File,
  audio: Headphones,
  quiz: HelpCircle,
  assignment: FileCheck
};

export default function LessonFormContent({ lessonData, setLessonData, uploadProgress }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value) => {
    setLessonData(prev => ({ ...prev, content: value  }))
  }

  const handleMediaUpload = async (file) => {
    if (file) {
      setLessonData(prev => ({
        ...prev,
        mediaFile: file
      }));
      
      // Tentar estimar a duração para vídeos e áudios
      if ((file.type.startsWith('video/') || file.type.startsWith('audio/')) && lessonData.lessonType !== 'text') {
        try {
          const mediaElement = document.createElement(lessonData.lessonType === 'audio' ? 'audio' : 'video');
          mediaElement.preload = 'metadata';
          
          mediaElement.onloadedmetadata = function() {
            window.URL.revokeObjectURL(mediaElement.src);
            const duration = Math.round(mediaElement.duration / 60); // Converter para minutos
            setLessonData(prev => ({
              ...prev,
              duration: duration || 0
            }));
          };
          
          mediaElement.src = URL.createObjectURL(file);
        } catch (err) {
          console.error('Erro ao estimar duração:', err);
        }
      }
    } else {
      setLessonData(prev => ({
        ...prev,
        mediaFile: null,
        duration: 0
      }));
    }
  };

  const getAcceptTypes = () => {
    switch (lessonData.lessonType) {
      case 'video':
        return 'video/*,.mp4,.mov,.avi,.wmv,.flv,.webm,.mkv';
      case 'pdf':
        return '.pdf';
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg,.m4a,.aac';
      default:
        return '*';
    }
  };

  const getMaxSize = () => {
    switch (lessonData.lessonType) {
      case 'video':
        return 500; // 500MB para vídeos
      case 'pdf':
        return 50; // 50MB para PDFs
      case 'audio':
        return 100; // 100MB para áudios
      default:
        return 10;
    }
  };

  const IconComponent = lessonTypeIcons[lessonData.lessonType] || FileText;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
        <span className="text-sm text-indigo-700 dark:text-indigo-300">
          Configurando aula do tipo: <strong>{lessonData.lessonType}</strong>
        </span>
      </div>

      {/* Upload de arquivo para tipos que suportam */}
      {['video', 'pdf', 'audio'].includes(lessonData.lessonType) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lessonData.lessonType === 'video' && 'Arquivo de Vídeo'}
            {lessonData.lessonType === 'pdf' && 'Arquivo PDF'}
            {lessonData.lessonType === 'audio' && 'Arquivo de Áudio'}
            *
          </label>
          <FileUpload
            fileType={lessonData.lessonType}
            accept={getAcceptTypes()}
            onFileUpload={handleMediaUpload}
            maxSize={getMaxSize()}
            disabled={uploadProgress > 0 && uploadProgress < 100}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {lessonData.lessonType === 'video' && 'Formatos suportados: MP4, MOV, AVI, WMV, FLV, WebM, MKV (até 500MB)'}
            {lessonData.lessonType === 'pdf' && 'Apenas arquivos PDF (até 50MB)'}
            {lessonData.lessonType === 'audio' && 'Formatos suportados: MP3, WAV, OGG, M4A, AAC (até 100MB)'}
          </p>
        </div>
      )}

      {/* URL alternativa para vídeos externos */}
      {lessonData.lessonType === 'video' && (
        <div>
          <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ou URL de vídeo externo (YouTube, Vimeo, etc.)
          </label>
          <input
            type="url"
            name="mediaUrl"
            id="mediaUrl"
            value={lessonData.mediaUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use este campo se preferir hospedar o vídeo em plataformas externas
          </p>
        </div>
      )}

      {/* Duração (para vídeo e áudio) */}
      {(lessonData.lessonType === 'video' || lessonData.lessonType === 'audio') && (
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Duração (minutos) *
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            min="0"
            max="1000"
            value={lessonData.duration}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            required
            placeholder="Ex: 45"
          />
        </div>
      )}

      {/* Conteúdo/Descrição */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {lessonData.lessonType === 'text' ? 'Conteúdo Completo *' : 'Descrição da Aula *'}
        </label>
        <RichTextEditor
          value={lessonData.content}
          onChange={handleContentChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          placeholder={
            lessonData.lessonType === 'text' 
              ? 'Digite o conteúdo completo da aula aqui...' 
              : 'Descreva o conteúdo desta aula, objetivos de aprendizagem, etc.'
          }
        />
      </div>

      {/* Instruções para tipos especiais */}
      {lessonData.lessonType === 'quiz' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Questionário:</strong> Após criar a aula, você poderá adicionar perguntas e respostas na edição da aula.
          </p>
        </div>
      )}

      {lessonData.lessonType === 'assignment' && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Tarefa/Atividade:</strong> Após criar a aula, você poderá configurar as instruções da atividade e critérios de avaliação.
          </p>
        </div>
      )}
    </div>
  );
}