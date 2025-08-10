import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import api from '@/services/api';

export default function DocumentPreviewModal({ document, onClose }) {
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/documents/${document.docId}/preview`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setFileUrl(url);
      } catch (err) {
        setError('Falha ao carregar documento');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [document.docId]);

  const isPdf = document.mimeType === 'application/pdf';
  const isImage = document.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium">{document.originalName}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Carregando documento...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              {error}
            </div>
          ) : isPdf ? (
            <iframe 
              src={fileUrl} 
              className="w-full h-[70vh] border rounded" 
              title={document.originalName}
            />
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt={document.originalName} 
              className="max-w-full max-h-[70vh] mx-auto"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>Visualização não disponível para este tipo de arquivo</p>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.setAttribute('download', document.originalName);
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
          >
            Baixar Documento
          </Button>
        </div>
      </div>
    </div>
  );
}