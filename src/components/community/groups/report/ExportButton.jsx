import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ExportButton({ onExportPDF, onExportCSV, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type) => {
    if (type === 'pdf') {
      onExportPDF();
    } else {
      onExportCSV();
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <FiDownload />
        Export
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="w-full justify-between"
            >
              <span>PDF Document</span>
              <span className="text-xs text-muted-foreground">(Best for printing)</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="w-full justify-between"
            >
              <span>CSV Spreadsheet</span>
              <span className="text-xs text-muted-foreground">(Best for analysis)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
