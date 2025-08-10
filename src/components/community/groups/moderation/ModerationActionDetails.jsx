import { useState } from 'react';
import {
  FiX,
  FiUser,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiRotateCcw
} from 'react-icons/fi';

import Avatar from '@/components/common/Avatar';
import TimeAgo from '@/components/common/TimeAgo';
import { useModeration } from '@/hooks/useModeration';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const actionMeta = {
  BAN: {
    icon: <FiUser className="text-red-500" />,
    color: 'bg-red-50 dark:bg-red-900/20',
    label: 'Ban'
  },
  WARN: {
    icon: <FiAlertTriangle className="text-yellow-500" />,
    color: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Warning'
  },
  DELETE: {
    icon: <FiFileText className="text-red-500" />,
    color: 'bg-red-50 dark:bg-red-900/20',
    label: 'Content Deleted'
  },
  RESOLVE: {
    icon: <FiCheckCircle className="text-green-500" />,
    color: 'bg-green-50 dark:bg-green-900/20',
    label: 'Report Resolved'
  }
};

export default function ModerationActionDetails({ action, onClose, onAppealReview }) {
  const [appealDecision, setAppealDecision] = useState(null);
  const [appealNotes, setAppealNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { reviewAppeal } = useModeration();
  const meta = actionMeta[action.actionType] || {};

  const handleAppealSubmit = async (decision) => {
    setIsProcessing(true);
    try {
      await reviewAppeal(action.actionId, decision, appealNotes);
      onAppealReview(decision);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${meta.color}`}>
              {meta.icon}
            </div>
            <div>
              {meta.label} Action
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TimeAgo date={action.createdAt} />
                {action.isAutomated && (
                  <Badge variant="secondary">Automated</Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Detalhes da Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Moderator</h4>
            <div className="flex items-center gap-3">
              <Avatar src={action.moderator.avatarUrl} alt={action.moderator.username} />
              <div>
                <p className="font-medium">{action.moderator.username}</p>
                <p className="text-sm text-muted-foreground">{action.moderator.role}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Target User</h4>
            <div className="flex items-center gap-3">
              <Avatar src={action.targetUser.avatarUrl} alt={action.targetUser.username} />
              <div>
                <p className="font-medium">{action.targetUser.username}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(action.targetUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Razão e Detalhes */}
        <div className="space-y-4 mt-6">
          <div>
            <h4 className="font-medium">Reason</h4>
            <p className="text-sm text-muted-foreground">{action.reason}</p>
          </div>

          {action.details && (
            <div>
              <h4 className="font-medium">Details</h4>
              <pre className="bg-muted rounded p-3 text-sm overflow-x-auto">
                {JSON.stringify(action.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Revisar Apelação */}
        {action.appealStatus === 'pending' && (
          <div className="border-t border-border pt-4 mt-6 space-y-4">
            <h4 className="font-medium">Appeal Review</h4>

            <div className="flex gap-2">
              <Button
                variant={appealDecision === 'upheld' ? 'destructive' : 'outline'}
                onClick={() => setAppealDecision('upheld')}
              >
                Uphold Action
              </Button>
              <Button
                variant={appealDecision === 'overturned' ? 'default' : 'outline'}
                onClick={() => setAppealDecision('overturned')}
              >
                Overturn Action
              </Button>
            </div>

            <Textarea
              value={appealNotes}
              onChange={(e) => setAppealNotes(e.target.value)}
              placeholder="Add review notes..."
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => handleAppealSubmit(appealDecision)}
                disabled={!appealDecision || isProcessing}
              >
                <FiRotateCcw className="mr-2 h-4 w-4" />
                Submit Review
              </Button>
            </div>
          </div>
        )}

        {/* Resultado da Apelação */}
        {action.appealStatus && action.appealStatus !== 'pending' && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              action.appealStatus === 'upheld'
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {action.appealStatus === 'upheld' ? (
                <FiAlertTriangle className="text-red-500" />
              ) : (
                <FiCheckCircle className="text-green-500" />
              )}
              <span className="font-medium">
                Appeal {action.appealStatus === 'upheld' ? 'Denied' : 'Approved'}
              </span>
            </div>
            {action.appealNotes && (
              <p className="text-sm mt-1 text-muted-foreground">{action.appealNotes}</p>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Reviewed by {action.appealReviewedBy.username} •{' '}
              <TimeAgo date={action.appealReviewedAt} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
