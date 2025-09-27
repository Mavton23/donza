import { useState } from "react";
import api from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';

export default function InviteModal({ isOpen, onClose, onInvite, groupId, currentMembers }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/users/users/search?q=${query}`);
      const filtered = res.data.filter(
        user => !currentMembers.includes(user.userId)
      );
      setSearchResults(filtered);
    } catch (err) {
      toast.error('Falha ao pesquisar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev =>
      prev.some(u => u.userId === user.userId)
        ? prev.filter(u => u.userId !== user.userId)
        : [...prev, user]
    );
  };

  const handleInvite = () => {
    onInvite(selectedUsers.map(u => u.userId));
    setSelectedUsers([]);
    setSearchInput('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar Membros para o Grupo</DialogTitle>
          <DialogDescription>
            Procure utilizadores pelo nome ou email para adicionar ao grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Pesquisar utilizadores por nome ou email..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              searchUsers(e.target.value);
            }}
            icon={<FiSearch />}
          />

          {loading && <LoadingSpinner />}

          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map(user => (
                <div
                  key={user.userId}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedUsers.some(u => u.userId === user.userId)
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="flex items-center">
                    <Avatar src={user.avatarUrl} alt={user.username} size="sm" className="mr-3" />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Membros Selecionados ({selectedUsers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.userId}
                    className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                  >
                    <span className="mr-2">{user.username}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleInvite}
              disabled={selectedUsers.length === 0}
            >
              Enviar Convites
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}