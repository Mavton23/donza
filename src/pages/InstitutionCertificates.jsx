import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, ChevronDown, ChevronUp, Download, FileUp, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function InstitutionCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    valid: true,
    expired: true,
    revoked: true,
    course: true,
    event: true,
    participation: false,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'issueDate',
    direction: 'descending',
  });

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await api.get('/institution/certificates');
        setCertificates(response.data);
        setFilteredCertificates(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Erro ao carregar certificados', {
          description: 'Não foi possível carregar a lista de certificados'
        });
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  useEffect(() => {
    let result = certificates.filter(certificate => {
      const matchesSearch = certificate.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          certificate.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          certificate.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = 
        (filters.valid && isCertificateValid(certificate)) ||
        (filters.expired && isCertificateExpired(certificate)) ||
        (filters.revoked && certificate.revoked);
      
      const matchesType = 
        (filters.course && certificate.type === 'course') ||
        (filters.event && certificate.type === 'event') ||
        (filters.participation && certificate.type === 'participation');
      
      return matchesSearch && matchesFilters && matchesType;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'issueDate' || sortConfig.key === 'expiryDate') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
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

    setFilteredCertificates(result);
  }, [certificates, searchTerm, filters, sortConfig]);

  const isCertificateValid = (cert) => {
    if (cert.revoked) return false;
    const now = new Date();
    const expiryDate = new Date(cert.expiryDate);
    return now < expiryDate;
  };

  const isCertificateExpired = (cert) => {
    if (cert.revoked) return false;
    const now = new Date();
    const expiryDate = new Date(cert.expiryDate);
    return now >= expiryDate;
  };

  const getCertificateStatus = (cert) => {
    if (cert.revoked) return 'revoked';
    return isCertificateValid(cert) ? 'valid' : 'expired';
  };

  const getStatusBadge = (cert) => {
    const status = getCertificateStatus(cert);
    const variants = {
      valid: 'bg-green-100 text-green-800',
      expired: 'bg-yellow-100 text-yellow-800',
      revoked: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const variants = {
      course: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      participation: 'bg-green-100 text-green-800',
    };
    return variants[type] || 'bg-gray-100 text-gray-800';
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const revokeCertificate = async (certificateId) => {
    try {
      await api.patch(`/institution/certificates/${certificateId}/revoke`);
      setCertificates(certs => 
        certs.map(c => 
          c.id === certificateId ? {...c, revoked: true} : c
        )
      );
      toast.success('Certificado revogado com sucesso');
    } catch (error) {
      toast.error('Erro ao revogar certificado', {
        description: error.response?.data?.message || 'Tente novamente mais tarde'
      });
    }
  };

  const downloadCertificate = (certificateId) => {
    toast.promise(
      api.get(`/institution/certificates/${certificateId}/download`, { responseType: 'blob' })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `certificado-${certificateId}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }),
      {
        loading: 'Preparando certificado para download...',
        success: 'Download iniciado com sucesso',
        error: 'Erro ao baixar certificado'
      }
    );
  };

  const bulkDownload = () => {
    if (filteredCertificates.length === 0) {
      toast.warning('Nenhum certificado para exportar');
      return;
    }
    toast.info('Exportação em lote iniciada', {
      description: 'Esta operação pode demorar alguns minutos'
    });
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
        <h1 className="text-2xl font-bold">Certificados da Instituição</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar certificados..."
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
                checked={filters.valid}
                onCheckedChange={(checked) => setFilters({...filters, valid: checked})}
              >
                Válidos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.expired}
                onCheckedChange={(checked) => setFilters({...filters, expired: checked})}
              >
                Expirados
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.revoked}
                onCheckedChange={(checked) => setFilters({...filters, revoked: checked})}
              >
                Revogados
              </DropdownMenuCheckboxItem>
              <Separator />
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
              <DropdownMenuCheckboxItem
                checked={filters.participation}
                onCheckedChange={(checked) => setFilters({...filters, participation: checked})}
              >
                Participação
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={bulkDownload}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 p-4 border-b">
          <div 
            className="col-span-3 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('studentName')}
          >
            Aluno
            {sortConfig.key === 'studentName' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div 
            className="col-span-2 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('type')}
          >
            Tipo
            {sortConfig.key === 'type' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div className="col-span-2 font-medium">Curso/Evento</div>
          <div 
            className="col-span-2 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('issueDate')}
          >
            Emissão
            {sortConfig.key === 'issueDate' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div 
            className="col-span-2 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('expiryDate')}
          >
            Validade
            {sortConfig.key === 'expiryDate' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div className="col-span-1 font-medium">Ações</div>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum certificado encontrado com os filtros atuais
          </div>
        ) : (
          filteredCertificates.map((certificate) => (
            <div key={certificate.id} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 transition-colors items-center">
              <div className="col-span-3 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={certificate.studentAvatar} />
                  <AvatarFallback>
                    {certificate.studentName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{certificate.studentName}</p>
                  <p className="text-sm text-gray-500">{certificate.verificationCode}</p>
                </div>
              </div>
              <div className="col-span-2">
                <Badge className={getTypeBadge(certificate.type)}>
                  {certificate.type === 'course' ? 'Curso' : 
                   certificate.type === 'event' ? 'Evento' : 'Participação'}
                </Badge>
              </div>
              <div className="col-span-2">
                {certificate.courseName || certificate.eventName || '-'}
              </div>
              <div className="col-span-2 text-sm">
                {new Date(certificate.issueDate).toLocaleDateString()}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Badge className={getStatusBadge(certificate)}>
                  {getCertificateStatus(certificate) === 'valid' ? 'Válido' : 
                   getCertificateStatus(certificate) === 'expired' ? 'Expirado' : 'Revogado'}
                </Badge>
                <span className="text-sm">
                  {new Date(certificate.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => downloadCertificate(certificate.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {!certificate.revoked && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => revokeCertificate(certificate.id)}
                    title="Revogar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <FileUp className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}