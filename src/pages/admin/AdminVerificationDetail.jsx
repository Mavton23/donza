import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  User,
  Building2,
  Check,
  X,
  ArrowLeft,
  Download,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function AdminVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/verifications/${id}`);
        setVerification(response.data.data);
      } catch (err) {
        toast.error('Falha ao carregar detalhes da verificação');
        console.error('Erro:', err);
        navigate('/admin/verifications');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [id, navigate]);

  const handleVerification = async (action) => {
    try {
      setProcessing(true);
      await api.put(`/admin/verifications/${id}`, { 
        action,
        rejectionReason: action === 'reject' ? 'Documentação insuficiente' : undefined
      });
      
      toast.success(`Verificação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
      navigate('/admin/verifications');
    } catch (err) {
      toast.error(`Falha ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} verificação`);
      console.error('Erro:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDocumentAction = async (docId, action) => {
    try {
      await api.put(`/admin/documents/${docId}/review`, { 
        action,
        rejectionReason: action === 'reject' ? 'Documento inválido ou ilegível' : undefined
      });
      
      // Atualiza o documento localmente
      setVerification(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.docId === docId 
            ? { 
                ...doc, 
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewDate: new Date().toISOString(),
                rejectionReason: action === 'reject' ? 'Documento inválido ou ilegível' : null
              } 
            : doc
        )
      }));
      
      toast.success(`Documento ${action === 'approve' ? 'aprovado' : 'rejeitado'}`);
    } catch (err) {
      toast.error(`Falha ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} documento`);
      console.error('Erro:', err);
    }
  };

  const downloadDocument = async (docId, originalName) => {
    try {
      const response = await api.get(`/admin/documents/${docId}/download`);
      
      if (response.data && response.data.downloadUrl) {
        const downloadUrl = response.data.downloadUrl;
        
        // Criar link e disparar download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = originalName || response.data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } else {
        throw new Error('URL de download não disponível');
      }
      
    } catch (err) {
      console.error('Erro no download:', err);
      toast.error('Falha ao baixar documento');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Verificação não encontrada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate('/admin/verifications')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para verificações
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {verification.role === 'institution' ? (
                  <Building2 className="h-6 w-6 mr-2 text-blue-500" />
                ) : (
                  <User className="h-6 w-6 mr-2 text-green-500" />
                )}
                {verification.role === 'institution' 
                  ? verification.institutionName 
                  : verification.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="capitalize">
                    {verification.role === 'institution' ? 'Instituição' : 'Instrutor'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</p>
                  <p>{verification.email}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <Badge 
                    variant={
                      verification.status === 'pending' ? 'warning' :
                      verification.status === 'approved' ? 'success' : 'destructive'
                    }
                  >
                    {verification.status === 'pending' ? 'Pendente' :
                     verification.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Cadastro</p>
                  <p>{new Date(verification.createdAt).toLocaleDateString()}</p>
                </div>
                
                {verification.reviewDate && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Revisão</p>
                    <p>{new Date(verification.reviewDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {verification.rejectionReason && (
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Motivo da Rejeição</p>
                    <p className="text-red-600 dark:text-red-400">{verification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações específicas do tipo */}
          <Card>
            <CardHeader>
              <CardTitle>
                {verification.role === 'institution' 
                  ? 'Detalhes da Instituição' 
                  : 'Detalhes do Instrutor'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verification.role === 'institution' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Instituição</p>
                    <p>{verification.institutionType || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano de Fundação</p>
                    <p>{verification.yearFounded || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                    <p>
                      {verification.website ? (
                        <a 
                          href={verification.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {verification.website}
                        </a>
                      ) : 'Não informado'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</p>
                    <p>{verification.contactPhone || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Credenciamento</p>
                    <p>{verification.accreditation || 'Não informado'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nível de Educação</p>
                    <p>
                      {verification.educationLevel 
                        ? verification.educationLevel === 'graduation' ? 'Graduação' :
                          verification.educationLevel === 'specialization' ? 'Especialização' :
                          verification.educationLevel === 'masters' ? 'Mestrado' : 'Doutorado'
                        : 'Não informado'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Área de Formação</p>
                    <p>{verification.educationField || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experiência em Ensino</p>
                    <p>
                      {verification.teachingExperience 
                        ? `${verification.teachingExperience} anos` 
                        : 'Não informado'}
                    </p>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Áreas de Especialização</p>
                    <div className="flex flex-wrap gap-2">
                      {verification.expertise?.length > 0 ? (
                        verification.expertise.map((exp, index) => (
                          <Badge key={index} variant="outline">
                            {exp}
                          </Badge>
                        ))
                      ) : (
                        <p>Não informado</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentos e ações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verification.documents?.length > 0 ? (
                verification.documents.map((doc) => (
                  <div key={doc.docId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {getDocumentTypeLabel(doc.documentType)}
                          </p>
                          <p className="text-sm text-gray-500">{doc.originalName}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          doc.status === 'pending' ? 'warning' :
                          doc.status === 'approved' ? 'success' : 'destructive'
                        }
                        className="ml-2"
                      >
                        {doc.status === 'pending' ? 'Pendente' :
                         doc.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(doc.docId, doc.originalName)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={doc.status === 'approved'}
                          onClick={() => handleDocumentAction(doc.docId, 'approve')}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={doc.status === 'rejected'}
                          onClick={() => handleDocumentAction(doc.docId, 'reject')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                    
                    {doc.rejectionReason && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        <p><strong>Motivo:</strong> {doc.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhum documento enviado</p>
              )}
            </CardContent>
          </Card>

          {/* Ações de verificação */}
          {verification.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <Button
                    variant="success"
                    className="w-full"
                    disabled={processing}
                    onClick={() => handleVerification('approve')}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Aprovar Cadastro
                  </Button>
                  
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={processing}
                    onClick={() => handleVerification('reject')}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rejeitar Cadastro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de visualização de documento */}
      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

// Função auxiliar para traduzir tipos de documento
function getDocumentTypeLabel(type) {
  const labels = {
    alvara: 'Alvará',
    credenciamento: 'Credenciamento',
    estatutos: 'Estatutos',
    endereco: 'Comprovante de Endereço',
    nuit: 'NUIT',
    diploma: 'Diploma',
    identidade: 'Documento de Identificação',
    cv: 'Currículo',
    certificacoes: 'Certificações',
    comprovante_matricula: 'Comprovante de Matrícula',
    other: 'Outro'
  };
  return labels[type] || type;
}