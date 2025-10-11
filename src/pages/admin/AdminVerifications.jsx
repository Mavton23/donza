import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, User, Building2, Check, X } from 'lucide-react';

export default function AdminVerifications() {
  usePageTitle();
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const navigate = useNavigate();

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/verifications', {
        params: { status: selectedTab === 'all' ? undefined : 'pending' }
      });
      setPendingVerifications(response.data.data);
    } catch (err) {
      toast.error('Falha ao carregar verificações pendentes');
      console.error('Erro ao buscar verificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, [selectedTab]);

  const handleVerification = async (id, action) => {
    try {
      setLoading(true);
      await api.put(`/admin/verifications/${id}`, { action });
      toast.success(`Verificação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
      fetchPendingVerifications();
    } catch (err) {
      toast.error(`Falha ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} verificação`);
      console.error('Erro ao processar verificação:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      instructor: 'Instrutor',
      institution: 'Instituição'
    };
    return roles[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verificação de Cadastros
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedTab === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('pending')}
          >
            Pendentes
          </Button>
        </div>
      </div>

      <div className="rounded-md border dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : pendingVerifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhuma verificação pendente
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {verification.role === 'institution' ? (
                        <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                      ) : (
                        <User className="h-5 w-5 mr-2 text-green-500" />
                      )}
                      {getRoleLabel(verification.role)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {verification.role === 'institution' 
                      ? verification.institutionName 
                      : verification.fullName}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/verifications/${verification.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={verification.status === 'pending' ? 'warning' : 
                              verification.status === 'approved' ? 'success' : 'destructive'}
                    >
                      {verification.status === 'pending' ? 'Pendente' : 
                       verification.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(verification.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {verification.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleVerification(verification.id, 'approve')}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerification(verification.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}