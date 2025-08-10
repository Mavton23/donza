import { useState } from 'react';
import FileUpload from '../common/FileUpload';
import ArrayInput from '../common/ArrayInput';
import RichTextEditor from '../common/RichTextEditor';

export default function CourseForm({ step, courseData, setCourseData, isEditMode = false }) {
  const [coverPreview, setCoverPreview] = useState(
    isEditMode && courseData.coverImageUrl ? courseData.coverImageUrl : null
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileUpload = (file) => {
    setCourseData(prev => ({ ...prev, coverImage: file }));
    
    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDescriptionChange = (value) => {
    setCourseData(prev => ({ ...prev, description: value }));
  };

  const handleArrayChange = (field) => (items) => {
    setCourseData(prev => ({ ...prev, [field]: items }));
  };

  // Informações Básicas
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título do Curso *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={courseData.title}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          required
          minLength="5"
          maxLength="100"
        />
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição Curta *
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          value={courseData.shortDescription}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          required
          maxLength="200"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Isso aparecerá nos cards do curso (máx. 200 caracteres).
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição Detalhada *
        </label>
        <RichTextEditor
          value={courseData.description}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Idioma *
          </label>
          <select
            id="language"
            name="language"
            value={courseData.language || 'Portuguese'}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="Portuguese">Português</option>
            <option value="English">English</option>
            <option value="Spanish">Español</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duração (horas) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="1"
            value={courseData.duration || 1}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Imagem de Capa {!isEditMode && '*'}
        </label>
        <FileUpload
          accept="image/*"
          onFileUpload={handleFileUpload}
          preview={coverPreview}
          required={!isEditMode}
        />
      </div>
    </div>
  );

  // Conteúdo do Curso
  const renderCourseContent = () => (
    <div className="space-y-6">
      {isEditMode ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Estrutura do Curso
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie módulos e aulas na seção dedicada após salvar.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Estrutura do Curso
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você poderá adicionar módulos e aulas após criar o curso.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoria *
          </label>
          <select
            id="category"
            name="category"
            value={courseData.category}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="technology">Tecnologia & Programação</option>
            <option value="science">Ciência & Engenharia</option>
            <option value="arts">Artes & Humanidades</option>
            <option value="business">Negócios & Empreendedorismo</option>
            <option value="health">Saúde & Bem-estar</option>
            <option value="social">Ciências Sociais</option>
            <option value="education">Educação & Ensino</option>
            <option value="personal">Desenvolvimento Pessoal</option>
            <option value="creative">Artes Criativas</option>
            <option value="professional">Habilidades Profissionais</option>
          </select>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nível *
          </label>
          <select
            id="level"
            name="level"
            value={courseData.level}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArrayInput 
          title="Pré-requisitos"
          description="O que os alunos devem saber antes de fazer este curso?"
          items={courseData.requirements || []}
          onChange={(newRequirements) => setCourseData(prev => ({
            ...prev,
            requirements: newRequirements
          }))}
        />

        <ArrayInput 
          title="Resultados de Aprendizado"
          description="O que os alunos serão capazes de fazer após este curso?"
          items={courseData.learningOutcomes || []}
          onChange={(newOutcomes) => setCourseData(prev => ({
            ...prev,
            learningOutcomes: newOutcomes
          }))}
        />
      </div>
    </div>
  );

  // Preço e Publicação
  const renderPricingPublishing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preço (USD) *
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={courseData.price || 0}
              onChange={handleChange}
              className="block w-full pl-7 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Moeda *
          </label>
          <select
            id="currency"
            name="currency"
            value={courseData.currency || 'USD'}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="USD">USD</option>
            <option value="BRL">BRL</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {isEditMode && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={courseData.isPublic !== undefined ? courseData.isPublic : true}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Tornar este curso público
          </label>
        </div>
      )}

      {!isEditMode && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={courseData.isPublished || false}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Publicar este curso imediatamente
          </label>
        </div>
      )}
    </div>
  );

  switch (step) {
    case 0: // Informações Básicas
      return renderBasicInfo();
    case 1: // Conteúdo do Curso
      return renderCourseContent();
    case 2: // Preço & Publicação
      return renderPricingPublishing();
    default:
      return null;
  }
}