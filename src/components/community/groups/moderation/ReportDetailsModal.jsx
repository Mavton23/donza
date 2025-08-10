import { useState } from 'react';
import { FiAlertTriangle, FiX, FiCheck, FiUser, FiMessageSquare, FiFile, FiTrash2, FiEyeOff, FiUserX } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/common/Avatar';
import TimeAgo from '@/components/common/TimeAgo';
import ModerationLog from './ModerationLog';
import ContentModerationActions from './ContentModerationActions';

const contentIcons = {
  message: <FiMessageSquare className="text-blue-500" />,
  topic: <FiMessageSquare className="text-green-500" />,
  file: <FiFile className="text-purple-500" />,
  user: <FiUser className="text-amber-500" />
};

export default function ReportDetailsModal({ 
  report, 
  onClose, 
  onResolve 
}) {
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleResolve = () => {
    onResolve(report.reportId);
    onClose();
  };

  const handleModerateContent = (action) => {
    setSelectedAction(action);
    if (action === 'BAN') {
      setIsBanModalOpen(true);
    }
  };

  return (
    <>
      <Dialog open={!!report} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" />
              Report Details
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400">
                      <FiAlertTriangle />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium capitalize">{report.reason.replace('_', ' ')}</h4>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {contentIcons[report.contentType]}
                        <span className="ml-1 capitalize">{report.contentType}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <TimeAgo date={report.reportedAt} />
                  </span>
                </div>

                {report.description && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reporter's Note</h5>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-3 rounded">
                      {report.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Reported Content</h5>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400">
                    {contentIcons[report.contentType]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{report.content.title || report.content.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                      {report.content.text || report.content.bio || 'No additional content'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Reporter</h5>
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={report.reporter.avatarUrl} 
                    alt={report.reporter.username} 
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{report.reporter.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Joined <TimeAgo date={report.reporter.joinedAt} />
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Content Author</h5>
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={report.content.author?.avatarUrl} 
                    alt={report.content.author?.username} 
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{report.content.author?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Joined <TimeAgo date={report.content.author?.joinedAt} />
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResolve}
                >
                  <FiCheck className="mr-2" />
                  Mark as Resolved
                </Button>
                
                <ContentModerationActions
                  content={report.content}
                  onDelete={() => handleModerateContent('DELETE')}
                  onHide={() => handleModerateContent('HIDE')}
                  onBanUser={() => handleModerateContent('BAN')}
                  isModerator={true}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ModerationLog actions={report.moderationHistory || []} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Modal would be implemented here if needed */}
    </>
  );
}