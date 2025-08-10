import { useState } from 'react';
import api from '@/services/api';
import LessonItem from './LessonItem';
import { PlusIcon, ChevronDownIcon, FileIcon, TrashIcon } from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';
import MediaUploader from '../common/MediaUploader';

const LESSON_TYPES = [
  { value: 'video', label: 'Video Lesson' },
  { value: 'text', label: 'Text Content' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'quiz', label: 'Quiz/Assessment' },
  { value: 'audio', label: 'Audio Lesson' },
  { value: 'assignment', label: 'Practical Assignment' }
];

export default function ModuleManager({ courseId, modules, onUpdate }) {
  // Estado para novo módulo
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    isExpanded: false
  });
  
  // Estado para nova lição
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    lessonType: 'video',
    videoUrl: '',
    file: null,
    fileUrl: '',
    duration: 0,
    isFree: false,
    isPublished: false,
    moduleId: null,
    isExpanded: false,
    externalResources: []
  });

  // Fila de lições para criação em massa
  const [lessonQueue, setLessonQueue] = useState([]);

  // Adicionar novo módulo
  const addModule = async () => {
    if (!newModule.title.trim()) return;
    
    try {
      const response = await api.post(`/modules/${courseId}/modules`, {
        title: newModule.title.trim(),
        description: newModule.description,
        order: modules.length + 1
      });
      
      onUpdate(prev => ({
        ...prev,
        modules: [...prev.modules, {
          ...response.data.data,
          lessons: [],
          isExpanded: true
        }]
      }));
      
      setNewModule({ title: '', description: '', isExpanded: false });
    } catch (err) {
      console.error('Failed to add module:', err);
    }
  };

  // Alternar status de publicação do módulo
  const toggleModulePublish = async (moduleId, currentStatus) => {
    try {
      const response = await api.put(`/modules/${courseId}/modules/${moduleId}`, {
        isPublished: !currentStatus
      });
      
      onUpdate(prev => ({
        ...prev,
        modules: prev.modules.map(m => 
          m.moduleId === moduleId ? { 
            ...m, 
            isPublished: response.data.data.isPublished,
            publishedAt: response.data.data.publishedAt 
          } : m
        )
      }));
    } catch (error) {
      console.error("Failed to toggle module status:", error);
    }
  };

  // Adicionar uma única lição
  const addLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.moduleId) return;

    try {
      const response = await api.post(
        `/lessons/${courseId}/modules/${newLesson.moduleId}/lessons`, 
        buildLessonPayload(newLesson)
      );

      updateModulesWithNewLesson(response.data.data);
      resetLessonForm();
    } catch (err) {
      console.error('Failed to add lesson:', err);
    }
  };

  // Adicionar múltiplas lições
  const addLessonBatch = async () => {
    if (lessonQueue.length === 0) return;
    
    try {
      const results = [];
      for (const lesson of lessonQueue) {
        const response = await api.post(
          `/lessons/${courseId}/modules/${lesson.moduleId}/lessons`, 
          buildLessonPayload(lesson)
        );
        results.push(response.data.data);
      }
      
      // Atualizar estado com todas as lições criadas
      onUpdate(prev => {
        const updatedModules = [...prev.modules];
        results.forEach(newLesson => {
          const moduleIndex = updatedModules.findIndex(m => m.moduleId === newLesson.moduleId);
          if (moduleIndex !== -1) {
            updatedModules[moduleIndex] = {
              ...updatedModules[moduleIndex],
              lessons: [...(updatedModules[moduleIndex].lessons || []), newLesson],
              isExpanded: true
            };
          }
        });
        
        return { ...prev, modules: updatedModules };
      });
      
      setLessonQueue([]);
    } catch (err) {
      console.error('Failed to add lessons:', err);
    }
  };

  // Construir payload da lição para a API
  const buildLessonPayload = (lesson) => ({
    title: lesson.title.trim(),
    description: lesson.description,
    content: lesson.content,
    lessonType: lesson.lessonType,
    videoUrl: lesson.videoUrl,
    duration: lesson.duration,
    isFree: lesson.isFree,
    isPublished: lesson.isPublished,
    externalResources: lesson.externalResources.filter(r => r.trim() !== ''),
    order: modules.find(m => m.moduleId === lesson.moduleId)?.lessons?.length + 1 || 1
  });

  // Atualizar módulos com nova lição
  const updateModulesWithNewLesson = (newLessonData) => {
    onUpdate(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.moduleId === newLesson.moduleId
          ? {
              ...m,
              lessons: [...(m.lessons || []), newLessonData],
              isExpanded: true
            }
          : m
      )
    }));
  };

  // Resetar formulário de lição
  const resetLessonForm = () => {
    setNewLesson({
      title: '',
      description: '',
      content: '',
      lessonType: 'video',
      videoUrl: '',
      duration: 0,
      isFree: false,
      isPublished: false,
      moduleId: null,
      isExpanded: false,
      externalResources: []
    });
  };

  // Alternar expansão do módulo
  const toggleModuleExpand = (moduleId) => {
    onUpdate(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.moduleId === moduleId
          ? { ...m, isExpanded: !m.isExpanded }
          : m
      )
    }));
  };

  // Adicionar lição à fila
  const addToLessonQueue = () => {
    if (!newLesson.title.trim() || !newLesson.moduleId) return;
    
    setLessonQueue(prev => [...prev, newLesson]);
    setNewLesson(prev => ({
      ...prev,
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      duration: 0,
      isFree: false,
      isPublished: false,
      externalResources: []
    }));
  };

  // Renderizar campos específicos do tipo de lição
  const renderLessonTypeSpecificFields = () => {
    switch (newLesson.lessonType) {
      case 'video':
      case 'pdf':
      case 'audio':
        return (
          <div className="space-y-4">
            <MediaUploader
              type={newLesson.lessonType}
              onFileUpload={(file, duration) => {
                setNewLesson(prev => ({
                  ...prev,
                  file,
                  fileUrl: file ? URL.createObjectURL(file) : null,
                  ...((newLesson.lessonType === 'video' || newLesson.lessonType === 'audio') && {
                    duration: duration || 0
                  })
                }));
              }}
              preview={newLesson.fileUrl}
              maxSize={
                newLesson.lessonType === 'video' ? 100 :
                newLesson.lessonType === 'pdf' ? 20 :
                10
              }
              durationInput={newLesson.lessonType === 'video'}
          />

            {/* Campo de duração (para vídeo ou quando precisa editar) */}
            {(newLesson.lessonType === 'video' || newLesson.lessonType === 'audio') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson(prev => ({ 
                    ...prev, 
                    duration: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  min="0"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <RichTextEditor
              value={newLesson.content}
              onChange={(content) => setNewLesson(prev => ({ ...prev, content }))}
            />
          </div>
        );
      
      case 'quiz':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quiz Configuration
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quiz configuration will be available in the lesson editor after creation.
              </p>
            </div>
          </div>
        );
      
      case 'assignment':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignment Instructions *
            </label>
            <RichTextEditor
              value={newLesson.content}
              onChange={(content) => setNewLesson(prev => ({ ...prev, content }))}
              placeholder="Provide clear instructions for the assignment..."
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Creation Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setNewModule(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
        >
          <h2 className="text-lg font-semibold">Create New Module</h2>
          <ChevronDownIcon 
            className={`h-5 w-5 transition-transform ${newModule.isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
        
        {newModule.isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Module Title *
              </label>
              <input
                type="text"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Introduction to Course"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will students learn in this module?"
                rows="3"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <button
              onClick={addModule}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              disabled={!newModule.title.trim()}
            >
              Create Module
            </button>
          </div>
        )}
      </div>

      {/* Lesson Creation Panel */}
      {modules.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setNewLesson(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
          >
            <h2 className="text-lg font-semibold">Create New Lesson</h2>
            <ChevronDownIcon 
              className={`h-5 w-5 transition-transform ${newLesson.isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
          
          {newLesson.isExpanded && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Module *
                  </label>
                  <select
                    value={newLesson.moduleId || ''}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, moduleId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a module</option>
                    {modules.map(module => (
                      <option key={module.moduleId} value={module.moduleId}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lesson Type *
                  </label>
                  <select
                    value={newLesson.lessonType}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, lessonType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {LESSON_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Lesson 1: Introduction"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What will this lesson cover?"
                  rows="3"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Campos específicos por tipo de lição */}
              {renderLessonTypeSpecificFields()}
              
              {/* Recursos externos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  External Resources
                </label>
                <div className="space-y-2">
                  {newLesson.externalResources.map((resource, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={resource}
                        onChange={(e) => {
                          const updatedResources = [...newLesson.externalResources];
                          updatedResources[index] = e.target.value;
                          setNewLesson(prev => ({ ...prev, externalResources: updatedResources }));
                        }}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Resource URL or description"
                      />
                      <button
                        onClick={() => {
                          const updatedResources = newLesson.externalResources.filter((_, i) => i !== index);
                          setNewLesson(prev => ({ ...prev, externalResources: updatedResources }));
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setNewLesson(prev => ({ 
                      ...prev, 
                      externalResources: [...prev.externalResources, ''] 
                    }))}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Resource
                  </button>
                </div>
              </div>
              
              {/* Opções de publicação */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLesson.isFree}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Free Lesson</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLesson.isPublished}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Publish Immediately</span>
                </label>
              </div>
              
              {/* Fila de lições */}
              {lessonQueue.length > 0 && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Lessons in Queue ({lessonQueue.length})</h3>
                    <button
                      onClick={() => setLessonQueue([])}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lessonQueue.map((lesson, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {LESSON_TYPES.find(t => t.value === lesson.lessonType)?.label} • Module: {modules.find(m => m.moduleId === lesson.moduleId)?.title}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setLessonQueue(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botões de ação */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={addToLessonQueue}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!newLesson.title.trim() || !newLesson.moduleId}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add to Queue
                </button>
                
                <button
                  onClick={addLesson}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={!newLesson.title.trim() || !newLesson.moduleId}
                >
                  Create Single Lesson
                </button>
                
                {lessonQueue.length > 0 && (
                  <button
                    onClick={addLessonBatch}
                    className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Create {lessonQueue.length} Lessons
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.moduleId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center">
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => toggleModuleExpand(module.moduleId)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-lg">{module.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    module.isPublished 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {module.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {module.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleModulePublish(module.moduleId, module.isPublished);
                  }}
                  className={`px-3 py-1 text-sm rounded-md ${
                    module.isPublished
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } transition-colors`}
                >
                  {module.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <ChevronDownIcon 
                  className={`h-5 w-5 transition-transform ${module.isExpanded ? 'rotate-180' : ''}`}
                  onClick={() => toggleModuleExpand(module.moduleId)}
                />
              </div>
            </div>
            
            {module.isExpanded && (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {module.lessons?.length > 0 ? (
                  module.lessons.map(lesson => (
                    <LessonItem 
                      key={lesson.lessonId} 
                      lesson={lesson} 
                      courseId={courseId}
                      moduleId={module.moduleId}
                      onUpdate={(updatedLesson) => {
                        onUpdate(prev => ({
                          ...prev,
                          modules: prev.modules.map(m => 
                            m.moduleId === module.moduleId
                              ? {
                                  ...m,
                                  lessons: m.lessons.map(l =>
                                    l.lessonId === updatedLesson.lessonId ? updatedLesson : l
                                  )
                                }
                              : m
                          )
                        }));
                      }}
                      onDelete={(deletedLessonId) => {
                        onUpdate(prev => ({
                          ...prev,
                          modules: prev.modules.map(m => 
                            m.moduleId === module.moduleId
                              ? {
                                  ...m,
                                  lessons: m.lessons.filter(l => l.lessonId !== deletedLessonId)
                                }
                              : m
                          )
                        }));
                      }}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    This module has no lessons yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}