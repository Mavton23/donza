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
import { 
  MessageSquareText,
  PlusCircle, 
  Edit, 
  Trash2,
  Check,
  X,
  Star,
  User,
  BookOpen
} from 'lucide-react';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/testimonials', {
        params: {
            status: 'pending',
            limit: 50,
            sortBy: 'createdAt',
            sortOrder: 'ASC'
        }
      });
      setTestimonials(response.data.data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar depoimentos');
      toast.error('Falha ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleModerate = async (testimonialId, action) => {
    try {
      await api.put(`/admin/${testimonialId}/moderate`, { 
        status: action,
        featured: action === 'approved'
      });
      toast.success(`Depoimento ${action === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`);
      fetchTestimonials();
    } catch (err) {
      toast.error(`Falha ao ${action === 'approved' ? 'aprovar' : 'rejeitar'} depoimento`);
    }
  };

  const handleDelete = async (testimonialId) => {
    try {
      await api.delete(`/testimonial/${testimonialId}`);
      toast.success('Depoimento excluído com sucesso');
      fetchTestimonials();
    } catch (err) {
      toast.error('Falha ao excluir depoimento');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success"><Check className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'pending':
        return <Badge variant="warning"><MessageSquareText className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
          />
        ))}
      </div>
    );
  };

  const getAuthorInfo = (testimonial) => {
    if (testimonial.source === 'platform' && testimonial.author) {
      return (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1 text-muted-foreground" />
          <span>{testimonial.author.fullName || testimonial.author.username}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <User className="w-4 h-4 mr-1 text-muted-foreground" />
        <span>{testimonial.externalAuthor}</span>
      </div>
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Depoimentos
          </h2>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          <p className="font-medium">Erro ao carregar depoimentos</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autor</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead className="text-center">Avaliação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Destaque</TableHead>
                <TableHead className="text-center">Curso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.testimonialId}>
                    <TableCell>
                      {getAuthorInfo(testimonial)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {testimonial.content}
                    </TableCell>
                    <TableCell className="text-center">
                      {getRatingStars(testimonial.rating)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(testimonial.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {testimonial.featured ? (
                        <Badge variant="outline">Sim</Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {testimonial.course ? (
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span>{testimonial.course.title}</span>
                        </div>
                      ) : (
                        <Badge variant="outline">Geral</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleModerate(testimonial.testimonialId, 'approved')}
                            className="h-8 gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Aprovar</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleModerate(testimonial.testimonialId, 'rejected')}
                            className="h-8 gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Rejeitar</span>
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(testimonial.testimonialId)}
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MessageSquareText className="w-8 h-8 text-muted-foreground" />
                      <p className="font-medium">Nenhum depoimento encontrado</p>
                      <p className="text-sm text-muted-foreground">
                        Nenhum depoimento para moderar no momento
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {testimonials.length > 0 && (
              <TableCaption>
                Mostrando {testimonials.length} {testimonials.length === 1 ? 'depoimento' : 'depoimentos'}
              </TableCaption>
            )}
          </Table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTestimonial(null);
        }}
        title={currentTestimonial ? 'Editar Depoimento' : 'Criar Depoimento'}
        size="xl"
      >
        {/* Implementar um formulário de edição se necessário */}
        <div className="p-4">
          <p>Formulário de detalhes e edição do depoimento viria aqui</p>
        </div>
      </Modal>
    </div>
  );
}