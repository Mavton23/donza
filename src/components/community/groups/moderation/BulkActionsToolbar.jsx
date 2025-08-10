import { FiCheck, FiTrash2, FiX, FiArchive } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useModeration } from '@/hooks/useModeration';

export default function BulkActionsToolbar({ count, onResolve, onCancel }) {
  const [action, setAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolveReports } = useModeration();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await resolveReports(selectedReports, action);
      onResolve();
      setAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="font-medium mr-2">{count} selected</span>
          <button 
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiX className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline-success"
            size="sm"
            icon={<FiCheck />}
            onClick={() => setAction('approve')}
            active={action === 'approve'}
          >
            Approve
          </Button>
          
          <Button
            variant="outline-danger"
            size="sm"
            icon={<FiTrash2 />}
            onClick={() => setAction('delete')}
            active={action === 'delete'}
          >
            Delete
          </Button>
          
          <Button
            variant="outline-warning"
            size="sm"
            icon={<FiArchive />}
            onClick={() => setAction('archive')}
            active={action === 'archive'}
          >
            Archive
          </Button>
        </div>

        {action && (
          <Button
            variant={action === 'approve' ? 'success' : action === 'delete' ? 'danger' : 'warning'}
            size="sm"
            onClick={handleConfirm}
            loading={isSubmitting}
          >
            Confirm {action}
          </Button>
        )}
      </div>
    </div>
  );
}