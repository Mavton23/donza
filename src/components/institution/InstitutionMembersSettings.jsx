import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function InstitutionMembersSettings({ institutionId }) {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(`/institutions/${institutionId}/members`);
        setMembers(response.data);
      } catch (error) {
        toast.error('Erro ao carregar membros');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [institutionId]);

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/institutions/${institutionId}/members/${memberId}`);
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Membro removido com sucesso');
    } catch (error) {
      toast.error('Erro ao remover membro');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.patch(`/institutions/${institutionId}/members/${memberId}`, { role: newRole });
      setMembers(members.map(m => m.id === memberId ? {...m, role: newRole} : m));
      toast.success('Permissão atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar permissão');
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Carregando membros...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar membros..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {member.role === 'admin' ? 'Administrador' : 'Membro'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                      Administrador
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                      Membro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}