import { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell,
  TableCaption 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/common/Modal';
import HelpArticleForm from '../help/HelpArticleForm';
import { 
  FileText, 
  PlusCircle, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Archive
} from 'lucide-react';

export default function AdminHelpCenter() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/help/articles');
      setArticles(response.data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar artigos de ajuda');
      toast.error('Falha ao carregar conteúdo da central de ajuda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = async (articleId) => {
    try {
      await api.delete(`/help/articles/${articleId}`);
      toast.success('Artigo excluído com sucesso');
      fetchArticles();
    } catch (err) {
      toast.error('Falha ao excluir artigo');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (currentArticle) {
        await api.put(`/help/articles/${currentArticle.articleId}`, formData);
        toast.success('Artigo atualizado com sucesso');
      } else {
        await api.post('/help/articles', formData);
        toast.success('Artigo criado com sucesso');
      }
      setIsModalOpen(false);
      setCurrentArticle(null);
      fetchArticles();
    } catch (err) {
      console.error("ERRO NA CRIACAO: ", err instanceof Error ? err.message : err );
      toast.error('Operação falhou. Por favor, tente novamente.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge variant="success"><Eye className="w-3 h-3 mr-1" /> Publicado</Badge>;
      case 'draft':
        return <Badge variant="warning"><EyeOff className="w-3 h-3 mr-1" /> Rascunho</Badge>;
      case 'archived':
        return <Badge variant="secondary"><Archive className="w-3 h-3 mr-1" /> Arquivado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      'getting-started': 'Primeiros Passos',
      'account': 'Conta',
      'courses': 'Cursos',
      'payments': 'Pagamentos',
      'technical': 'Técnico'
    };
    return <Badge variant="outline">{categoryMap[category] || category}</Badge>;
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento da Central de Ajuda
          </h2>
        </div>
        <Button 
          onClick={() => {
            setCurrentArticle(null);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Criar Novo Artigo
        </Button>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          <p className="font-medium">Erro ao carregar artigos</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Visualizações</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.articleId}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{article.title}</span>
                        <span className="text-xs text-muted-foreground">
                          /{article.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(article.category)}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.viewCount || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(article)}
                        className="h-8 gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Editar</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(article.articleId)}
                        className="h-8 gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <p className="font-medium">Nenhum artigo encontrado</p>
                      <p className="text-sm text-muted-foreground">
                        Comece criando um novo artigo de ajuda
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2"
                      >
                        Criar Artigo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {articles.length > 0 && (
              <TableCaption>
                Exibindo {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
              </TableCaption>
            )}
          </Table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentArticle(null);
        }}
        title={currentArticle ? 'Editar Artigo' : 'Criar Novo Artigo'}
        size="3xl"
      >
        <HelpArticleForm
          initialData={currentArticle}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentArticle(null);
          }}
        />
      </Modal>
    </div>
  );
}