import { useState } from 'react';
import { FiRefreshCw, FiCheck, FiCalendar } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

export default function CalendarSyncButton({ 
  onSyncGoogle, 
  onSyncOutlook,
  isSynced 
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = (service, close) => {
    setIsSyncing(true);
    const syncAction = service === 'google' ? onSyncGoogle() : onSyncOutlook();
    syncAction.finally(() => {
      setIsSyncing(false);
      close(); // fecha o diálogo após sincronização
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isSynced ? 'success' : 'secondary'}
          size="sm"
          icon={isSynced ? <FiCheck /> : <FiRefreshCw />}
        >
          {isSynced ? 'Synced' : 'Sync Calendar'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <FiCalendar className="mr-2" />
            Sync Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <DialogClose asChild>
            <button
              onClick={(e) => {
                e.preventDefault(); // evita o fechamento imediato
              }}
              disabled={isSyncing}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleSync('google', () => document.activeElement?.click());
                }}
              >
                Google Calendar
              </span>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                alt="Google Calendar" 
                className="h-6 w-6"
              />
            </button>
          </DialogClose>

          <DialogClose asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              disabled={isSyncing}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleSync('outlook', () => document.activeElement?.click());
                }}
              >
                Outlook Calendar
              </span>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
                alt="Outlook Calendar" 
                className="h-6 w-6"
              />
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
