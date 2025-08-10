import { useState } from 'react';
import { FiUserX, FiClock, FiX } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const banDurations = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '1 week' },
  { value: 30, label: '1 month' },
  { value: 0, label: 'Permanent' },
];

export default function BanUserModal({
  user,
  isOpen,
  onClose,
  onBan,
}) {
  const [duration, setDuration] = useState(1);
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onBan({
      userId: user.userId,
      duration,
      reason: reason || 'No reason provided',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <FiUserX />
              Ban User
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] mt-2 pr-1">
            <div className="space-y-4">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.joinedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ban Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {banDurations.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDuration(option.value)}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm transition-colors',
                        duration === option.value
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'bg-muted hover:bg-muted/70'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        {option.value > 0 && <FiClock className="mr-1" />}
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this user is being banned..."
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm Ban
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
