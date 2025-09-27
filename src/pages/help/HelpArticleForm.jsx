import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SelectInput from '../../components/common/SelectInput';
import RichTextEditor from '../../components/common/RichTextEditor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function HelpArticleForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'getting-started',
    content: '',
    excerpt: '',
    status: 'draft'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        slug: initialData.slug,
        category: initialData.category,
        content: initialData.content,
        excerpt: initialData.excerpt || '',
        status: initialData.status || 'draft'
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title' && !initialData?.slug) {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    { id: 'starting', value: 'getting-started', label: 'Getting Started', description: 'Artigos introdutórios para novos usuários' },
    { id: 'account', value: 'account', label: 'Account', description: 'Gerenciamento de conta e perfil' },
    { id: 'courses', value: 'courses', label: 'Courses', description: 'Dúvidas sobre cursos e aprendizagem' },
    { id: 'payments', value: 'payments', label: 'Payments', description: 'Informações sobre pagamentos e assinaturas' },
    { id: 'technical', value: 'technical', label: 'Technical', description: 'Problemas técnicos e requisitos do sistema' }
  ];

  const statusOptions = [
    { id: 'draft', value: 'draft', label: 'Draft', description: 'Rascunho não visível ao público' },
    { id: 'published', value: 'published', label: 'Published', description: 'Artigo publicado e visível' },
    { id: 'archived', value: 'archived', label: 'Archived', description: 'Artigo desativado mas mantido no histórico' }
  ];

  const FieldTooltip = ({ content }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-600" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Título do Artigo
            </label>
            <FieldTooltip content="Título claro e objetivo que descreve o conteúdo do artigo (máx. 100 caracteres)" />
          </div>
          <Textarea
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ex: Como redefinir minha senha"
            required
            maxLength={100}
            className="min-h-[60px]"
          />
          <p className="text-xs text-gray-500">{formData.title.length}/100 caracteres</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL Amigável)
            </label>
            <FieldTooltip content="Identificador único na URL. Gerado automaticamente mas pode ser ajustado (não use espaços ou caracteres especiais)" />
          </div>
          <Textarea
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="Ex: redefinir-senha"
            required
            disabled={!!initialData?.slug}
            className="min-h-[60px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <FieldTooltip content="Selecione a categoria mais relevante para facilitar a organização e busca" />
          </div>
          <SelectInput
            options={categories}
            value={formData.category}
            onChange={(value) => handleChange('category', value)}
            required
            withDescriptions
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <FieldTooltip content="Controle a visibilidade do artigo. Rascunhos só são visíveis para administradores" />
          </div>
          <SelectInput
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            required
            withDescriptions
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Resumo (Excerpt)
          </label>
          <FieldTooltip content="Breve descrição (até 200 caracteres) que aparece nos resultados de busca e listagens" />
        </div>
        <Textarea
          value={formData.excerpt}
          onChange={(e) => handleChange('excerpt', e.target.value)}
          placeholder="Ex: Aprenda como redefinir sua senha em poucos passos..."
          maxLength={200}
          rows={3}
          className="min-h-[80px]"
        />
        <p className="text-xs text-gray-500">{formData.excerpt.length}/200 caracteres</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Conteúdo Completo
          </label>
          <FieldTooltip content="Conteúdo detalhado do artigo. Use formatação, imagens e links para melhor compreensão" />
        </div>
        <RichTextEditor
          value={formData.content}
          onChange={(content) => handleChange('content', content)}
          placeholder="Escreva o conteúdo completo do artigo aqui..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? 'Atualizar Artigo' : 'Criar Artigo'}
        </Button>
      </div>
    </form>
  );
}