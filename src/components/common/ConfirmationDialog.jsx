import { Button } from '@/components/ui/button';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  variant = "danger"
}) {
  const buttonVariants = {
    danger: "bg-red-600 hover:bg-red-700",
    primary: "bg-indigo-600 hover:bg-indigo-700",
    warning: "bg-yellow-600 hover:bg-yellow-700"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={buttonVariants[variant]}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}