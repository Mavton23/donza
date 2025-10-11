import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, ChevronDown, ChevronUp, Download, FileText, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InstitutionBilling() {
  usePageTitle();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    paid: true,
    pending: true,
    overdue: true,
    refunded: false,
    subscription: true,
    course: true,
    event: true,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'descending',
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/institution/${user.userId}/billing`);
        setTransactions(response.data);
        setFilteredTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Erro ao carregar transações', {
          description: 'Não foi possível carregar o histórico financeiro'
        });
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        (filters.paid && transaction.status === 'paid') ||
        (filters.pending && transaction.status === 'pending') ||
        (filters.overdue && transaction.status === 'overdue') ||
        (filters.refunded && transaction.status === 'refunded');
      
      const matchesType = 
        (filters.subscription && transaction.type === 'subscription') ||
        (filters.course && transaction.type === 'course') ||
        (filters.event && transaction.type === 'event');
      
      return matchesSearch && matchesStatus && matchesType;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'date' || sortConfig.key === 'dueDate') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'ascending' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTransactions(result);
  }, [transactions, searchTerm, filters, sortConfig]);

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const variants = {
      subscription: 'bg-purple-100 text-purple-800',
      course: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
    };
    return variants[type] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit_card: <CreditCard className="h-4 w-4" />,
      pix: <FileText className="h-4 w-4" />,
      boleto: <FileText className="h-4 w-4" />,
      transfer: <RefreshCw className="h-4 w-4" />,
    };
    return icons[method] || <CreditCard className="h-4 w-4" />;
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const downloadInvoice = (transactionId) => {
    toast.promise(
      api.get(`/institution/billing/${transactionId}/invoice`, { responseType: 'blob' })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `recibo-${transactionId}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }),
      {
        loading: 'Gerando recibo...',
        success: 'Download do recibo iniciado',
        error: 'Erro ao gerar recibo'
      }
    );
  };

  const exportFinancialReport = () => {
    toast.promise(
      api.get('/institution/billing/export', { 
        params: {
          status: filters.paid ? 'paid' : filters.pending ? 'pending' : filters.overdue ? 'overdue' : '',
          type: filters.subscription ? 'subscription' : filters.course ? 'course' : filters.event ? 'event' : '',
          search: searchTerm
        },
        responseType: 'blob'
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }),
      {
        loading: 'Gerando relatório financeiro...',
        success: 'Relatório exportado com sucesso',
        error: 'Erro ao gerar relatório'
      }
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Financeiro da Instituição</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar transações..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.paid}
                onCheckedChange={(checked) => setFilters({...filters, paid: checked})}
              >
                Pagas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.pending}
                onCheckedChange={(checked) => setFilters({...filters, pending: checked})}
              >
                Pendentes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.overdue}
                onCheckedChange={(checked) => setFilters({...filters, overdue: checked})}
              >
                Vencidas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.refunded}
                onCheckedChange={(checked) => setFilters({...filters, refunded: checked})}
              >
                Reembolsadas
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.subscription}
                onCheckedChange={(checked) => setFilters({...filters, subscription: checked})}
              >
                Assinaturas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.course}
                onCheckedChange={(checked) => setFilters({...filters, course: checked})}
              >
                Cursos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.event}
                onCheckedChange={(checked) => setFilters({...filters, event: checked})}
              >
                Eventos
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={exportFinancialReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center gap-2">
                  Data
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort('description')}
              >
                <div className="flex items-center gap-2">
                  Descrição
                  {sortConfig.key === 'description' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort('type')}
              >
                <div className="flex items-center gap-2">
                  Tipo
                  {sortConfig.key === 'type' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center justify-end gap-2">
                  Valor
                  {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                    {transaction.invoiceNumber && (
                      <div className="text-sm text-gray-500">
                        #{transaction.invoiceNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.studentName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(transaction.type)}>
                      {transaction.type === 'subscription' ? 'Assinatura' : 
                       transaction.type === 'course' ? 'Curso' : 'Evento'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(transaction.status)}>
                      {transaction.status === 'paid' ? 'Pago' : 
                       transaction.status === 'pending' ? 'Pendente' :
                       transaction.status === 'overdue' ? 'Vencido' : 'Reembolsado'}
                    </Badge>
                    {transaction.dueDate && transaction.status !== 'paid' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Vence em {formatDate(transaction.dueDate)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => downloadInvoice(transaction.id)}
                        title="Baixar recibo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center text-gray-500">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-500">Receita Total</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(
              filteredTransactions
                .filter(t => t.status === 'paid')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-500">Pendente</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(
              filteredTransactions
                .filter(t => t.status === 'pending')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-500">Vencido</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(
              filteredTransactions
                .filter(t => t.status === 'overdue')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}