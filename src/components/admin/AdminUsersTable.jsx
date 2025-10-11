import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Table from '../common/Table';
import UserStatusBadge from '../common/UserStatusBadge';
import Pagination from '../common/Pagination';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/users/', {
        params: { page, limit: 10 }
      });
      
      setUsers(response.data.users);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      });
    } catch (err) {
      console.error('Falha ao carregar usuários', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log("User deleted: ", userId);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      accessorKey: 'username',
      header: 'Usuário',
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {row.original.avatarUrl ? (
                <img 
                  src={row.original.avatarUrl} 
                  alt={row.original.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {row.original.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span>{row.original.username}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => (
        <span className="capitalize px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'isVerified',
      header: 'Verificação',
      cell: ({ row }) => <UserStatusBadge verified={row.original.isVerified} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Cadastrado em',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDeleteUser(row.original.userId)}
              className="cursor-pointer text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciamento de Usuários
        </h2>
      </div>

      <div className="rounded-md border dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <Table
              data={users}
              columns={columns}
              className="w-full"
            />
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t dark:border-gray-700">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={fetchUsers}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}