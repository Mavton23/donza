import { useState } from 'react';
import { FiX, FiUser, FiCheck } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/common/Avatar';

export default function AssignModal({ isOpen, onClose, members, currentAssignee, onAssign }) {
  const [selectedMember, setSelectedMember] = useState(currentAssignee?.userId || null);

  const handleSubmit = () => {
    const member = members.find((m) => m.userId === selectedMember);
    onAssign(member || null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Assign Task</DialogTitle>
          <DialogDescription>
            Selecione um membro do grupo para atribuir esta tarefa ou deixe como não atribuída.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <div
            className={`flex items-center p-3 rounded-lg cursor-pointer ${
              !selectedMember
                ? 'bg-indigo-50 dark:bg-indigo-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedMember(null)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
              <FiUser className="text-gray-500 dark:text-gray-300" />
            </div>
            <span className="font-medium">Unassigned</span>
            {!selectedMember && <FiCheck className="ml-auto text-indigo-600 dark:text-indigo-400" />}
          </div>

          {members.map((member) => (
            <div
              key={member.userId}
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                selectedMember === member.userId
                  ? 'bg-indigo-50 dark:bg-indigo-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedMember(member.userId)}
            >
              <Avatar src={member.avatarUrl} alt={member.username} size="sm" className="mr-3" />
              <div>
                <p className="font-medium">{member.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
              </div>
              {selectedMember === member.userId && (
                <FiCheck className="ml-auto text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
