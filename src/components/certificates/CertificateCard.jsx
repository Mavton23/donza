import { Award } from 'lucide-react';
import {Button} from '@/components/ui/button';

export default function CertificateCard({ certificate, onDownload }) {
  if (!certificate) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Award className="h-8 w-8 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {certificate.title || 'Certificado sem título'}
          </h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <p>Emitido por: {certificate.issuer || 'Emissor desconhecido'}</p>
          <p>Data: {certificate.date || certificate.issuedDate || 'Data não disponível'}</p>
          {certificate.credentialId && (
            <p>ID: {certificate.credentialId}</p>
          )}
        </div>

        <Button
          onClick={() => onDownload(certificate.id)}
          variant="primary"
          className="w-full"
        >
          Baixar Certificado
        </Button>
      </div>
    </div>
  );
}