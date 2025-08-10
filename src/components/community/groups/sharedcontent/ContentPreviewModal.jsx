import { useEffect } from 'react';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ContentPreviewModal({ content, isOpen, onClose, onDownload }) {
  useEffect(() => {
    if (isOpen && content?.fileType === 'video') {
      // Inicializar player de vídeo se necessário
    }
  }, [isOpen, content]);

  const renderContent = () => {
    switch (content?.fileType) {
      case 'pdf':
        return (
          <iframe
            src={content.fileUrl}
            className="w-full h-[70vh]"
            title={content.title}
          />
        );
      case 'image':
        return (
          <img
            src={content.fileUrl}
            alt={content.title}
            className="max-w-full max-h-[70vh] object-contain mx-auto"
          />
        );
      case 'video':
        return (
          <video controls className="max-w-full max-h-[70vh] mx-auto">
            <source
              src={content.fileUrl}
              type={`video/${content.fileUrl.split('.').pop()}`}
            />
          </video>
        );
      case 'link':
        return (
          <div className="p-4">
            <a
              href={content.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              {content.externalUrl}
              <FiExternalLink className="ml-1" />
            </a>
          </div>
        );
      default:
        return <div className="p-8 text-center">Preview not available</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Preview</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 p-1 rounded-full z-10">
              <FiX size={20} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-auto">{renderContent()}</div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">{content?.title}</h3>
            <p className="text-sm text-muted-foreground">{content?.description}</p>
          </div>
          {content?.fileType !== 'link' && (
            <Button
              variant="secondary"
              onClick={() => {
                onDownload(content.contentId);
                onClose();
              }}
            >
              <FiDownload className="mr-2" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
