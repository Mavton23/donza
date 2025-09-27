import { FiAlertTriangle } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message = "Tem certeza de que deseja realizar esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}) {
  const buttonVariants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FiAlertTriangle className="text-yellow-500" size={20} />
            {title}
          </DialogTitle>
          <DialogDescription>
            Esta ação pode ser irreversível. Confirme se deseja continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            type="button" 
            className={buttonVariants[variant]} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}