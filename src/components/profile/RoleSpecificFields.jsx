import { useState, useEffect, useRef } from 'react';
import { TagsInput } from 'react-tag-input-component';
import { Tooltip } from 'react-tooltip';
import { Info, Plus, X, Check } from 'lucide-react';

export default function RoleSpecificFields({ role, formData = {}, setFormData, errors = {}, setErrors }) {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const initialLoad = useRef(true);

  const suggestions = {
    instructor: [
      'React', 'Node.js', 'TypeScript', 'GraphQL', 
      'AWS', 'Docker', 'Python', 'Machine Learning',
      'Cybersecurity', 'Data Engineering', 'Cloud Architecture'
    ],
    student: [
      'Web Development', 'Data Science', 'UI/UX Design',
      'Mobile Development', 'Artificial Intelligence',
      'DevOps', 'Blockchain', 'Digital Marketing'
    ],
    institution: [
      'Educação Infantil', 'Ensino Fundamental', 
      'Ensino Médio', 'Ensino Técnico', 'Graduação',
      'Pós-Graduação', 'MBA', 'Doutorado',
      'Ciências Exatas', 'Ciências Biológicas',
      'Engenharias', 'Ciências da Saúde', 'Ciências Agrárias',
      'Ciências Sociais', 'Ciências Humanas',
      'Linguística e Artes', 'Educação a Distância',
      'Ensino Híbrido', 'Cursos Livres'
    ]
  };

  const fieldConfig = {
    instructor: {
      fieldName: 'expertise',
      label: 'Áreas de Especialização *',
      placeholder: 'Adicione especializações (ex: React, Node.js)',
      tooltip: 'Liste suas principais habilidades técnicas',
      minItems: 3,
      errorKey: 'expertise'
    },
    student: {
      fieldName: 'interests',
      label: 'Interesses *',
      placeholder: 'Adicione interesses (ex: Web Development)',
      tooltip: 'Selecione tópicos que você quer aprender',
      minItems: 1,
      errorKey: 'interests'
    },
    institution: {
      fieldName: 'academicPrograms',
      label: 'Programas Acadêmicos *',
      placeholder: 'Adicione programas oferecidos (ex: Graduação)',
      tooltip: 'Liste os programas acadêmicos oferecidos',
      minItems: 1,
      errorKey: 'academicPrograms'
    }
  };

  const config = fieldConfig[role] || {};

  // Inicialização segura
  useEffect(() => {
    if (initialLoad.current && formData[config.fieldName]) {
      setTags(formData[config.fieldName]);
      initialLoad.current = false;
    }
  }, [role]); // Apenas role como dependência

  // Atualização controlada do formData
  useEffect(() => {
    if (!initialLoad.current) {
      setFormData(prev => ({
        ...prev,
        [config.fieldName]: tags
      }));
    }
  }, [tags]);

  // Validação otimizada
  useEffect(() => {
    const errorMessage = tags.length < config.minItems 
      ? `Adicione pelo menos ${config.minItems} ${config.fieldName === 'expertise' ? 'áreas' : config.fieldName === 'interests' ? 'interesses' : 'programas'}`
      : undefined;

    setErrors(prev => ({
      ...prev,
      [config.errorKey]: errorMessage
    }));
  }, [tags.length]);

  const handleTagAdd = (newTags) => {
    setTags(newTags);
  };

  const handleTagRemove = (removedTag) => {
    setTags(prev => prev.filter(tag => tag !== removedTag));
  };

  const filteredSuggestions = suggestions[role]?.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addSuggestion = (suggestion) => {
    if (!tags.includes(suggestion)) {
      setTags(prev => [...prev, suggestion]);
    }
    setInputValue('');
  };

  if (!role) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          {config.label}
          <span data-tooltip-id={`${role}-tooltip`} className="text-gray-400 hover:text-gray-500 cursor-pointer">
            <Info size={16} />
          </span>
        </label>
        {config.minItems > 1 && (
          <span className="text-xs text-gray-500">
            {tags.length}/{config.minItems} mínimo
          </span>
        )}
      </div>

      <Tooltip id={`${role}-tooltip`} place="top">
        {config.tooltip}
      </Tooltip>

      <div className={`relative border ${errors[config.errorKey] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm`}>
        <TagsInput
          value={tags}
          onChange={handleTagAdd}
          onRemoved={handleTagRemove}
          name={config.fieldName}
          placeHolder={config.placeholder}
          onInputChange={setInputValue}
          classNames={{
            input: 'react-tags-input py-2 px-3 w-full',
            tag: 'react-tags-input-tag bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {isFocused && inputValue && filteredSuggestions?.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
            {filteredSuggestions.map(suggestion => (
              <div
                key={suggestion}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                onClick={() => addSuggestion(suggestion)}
              >
                <span>{suggestion}</span>
                <Plus size={16} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {errors[config.errorKey] && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <X size={14} /> {errors[config.errorKey]}
        </p>
      )}

      {tags.length >= config.minItems && (
        <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
          <Check size={14} /> Requisito mínimo atendido
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {(suggestions[role] || []).slice(0, 5).map(suggestion => (
          <button
            key={suggestion}
            type="button"
            className={`text-xs px-2 py-1 rounded-full ${
              tags.includes(suggestion)
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => addSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}