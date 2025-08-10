import { useState } from 'react';
import { FiUserPlus, FiUserMinus, FiVolume2, FiVolumeX } from 'react-icons/fi';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ModerationQuickActions({ groupId, onActionComplete }) {
  const [action, setAction] = useState(null);
  const [username, setUsername] = useState('');
  const [duration, setDuration] = useState('1h');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Substitua isso pela chamada real da API
      await fetch(`/groups/${groupId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          targetUser: username,
          duration: action === 'mute' ? duration : undefined,
          reason,
        }),
      });
      onActionComplete?.();
      setAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabel = action?.charAt(0).toUpperCase() + action?.slice(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="destructive" onClick={() => setAction('ban')}>
          <FiUserMinus className="mr-2" /> Ban Member
        </Button>
        <Button variant="secondary" onClick={() => setAction('mute')}>
          <FiVolumeX className="mr-2" /> Mute Member
        </Button>
        <Button variant="default" onClick={() => setAction('promote')}>
          <FiUserPlus className="mr-2" /> Promote
        </Button>
        <Button variant="outline" onClick={() => setAction('unmute')}>
          <FiVolume2 className="mr-2" /> Unmute
        </Button>
      </div>

      <Dialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionLabel} Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {action === 'mute' && (
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="12h">12 hours</SelectItem>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="3d">3 days</SelectItem>
                    <SelectItem value="1w">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action"
                value={reason}
                rows={3}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={
                action === 'ban'
                  ? 'destructive'
                  : action === 'mute'
                  ? 'secondary'
                  : 'default'
              }
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : `Confirm ${actionLabel}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
