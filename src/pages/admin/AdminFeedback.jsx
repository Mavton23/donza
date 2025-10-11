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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Modal from '@/components/common/Modal';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export default function AdminFeedback() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/help/feedback');
      setFeedbackItems(response.data);
    } catch (err) {
      setError('Falha ao carregar feedbacks');
      toast.error('Falha ao carregar feedback dos usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const getFeedbackStatus = (wasHelpful) => {
    return wasHelpful ? (
      <Badge variant="success" className="gap-1">
        <ThumbsUp className="w-3 h-3" /> Útil
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <ThumbsDown className="w-3 h-3" /> Não Útil
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Gerenciamento de Feedbacks</h2>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-medium">Erro ao carregar feedbacks</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Artigo</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackItems.length > 0 ? (
                feedbackItems.map((feedback) => (
                  <TableRow key={feedback.feedbackId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{feedback.user?.username || 'Anônimo'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="line-clamp-1">
                          {feedback.article?.title || 'Artigo removido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getFeedbackStatus(feedback.wasHelpful)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setIsModalOpen(true);
                        }}
                        className="h-8 gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      <p className="font-medium">Nenhum feedback recebido</p>
                      <p className="text-sm text-muted-foreground">
                        Os feedbacks dos usuários aparecerão aqui quando enviados
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {feedbackItems.length > 0 && (
              <TableCaption>
                Exibindo {feedbackItems.length} {feedbackItems.length === 1 ? 'feedback' : 'feedbacks'}
              </TableCaption>
            )}
          </Table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFeedback(null);
        }}
        title={`Detalhes do Feedback`}
        size="md"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Usuário</h3>
                <p className="mt-1">{selectedFeedback.user?.name || 'Anônimo'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                <p className="mt-1">{formatDate(selectedFeedback.createdAt)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Artigo</h3>
              <p className="mt-1">
                {selectedFeedback.article?.title || 'Artigo removido'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Feedback</h3>
              <div className="mt-1">
                {getFeedbackStatus(selectedFeedback.wasHelpful)}
              </div>
            </div>

            {selectedFeedback.comment && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Comentário</h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                  {selectedFeedback.comment}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}