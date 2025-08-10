import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export default function InstitutionMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    active: true,
    students: true,
    instructors: true,
    staff: false,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending',
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(`/institution/${user.userId}/members`);
        setMembers(response.data);
        setFilteredMembers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    let result = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = 
        (filters.students && member.role === 'student') ||
        (filters.instructors && member.role === 'instructor') ||
        (filters.staff && member.role === 'staff');
      
      return matchesSearch && matchesFilters && (filters.active ? member.active : true);
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredMembers(result);
  }, [members, searchTerm, filters, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getRoleBadge = (role) => {
    const variants = {
      student: 'bg-blue-100 text-blue-800',
      instructor: 'bg-purple-100 text-purple-800',
      staff: 'bg-green-100 text-green-800',
    };
    return variants[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Membros da Instituição</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar membros..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.active}
                onCheckedChange={(checked) => setFilters({...filters, active: checked})}
              >
                Somente ativos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.students}
                onCheckedChange={(checked) => setFilters({...filters, students: checked})}
              >
                Estudantes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.instructors}
                onCheckedChange={(checked) => setFilters({...filters, instructors: checked})}
              >
                Instrutores
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.staff}
                onCheckedChange={(checked) => setFilters({...filters, staff: checked})}
              >
                Staff
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 p-4 border-b">
          <div 
            className="col-span-4 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('name')}
          >
            Membro
            {sortConfig.key === 'name' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div 
            className="col-span-3 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('role')}
          >
            Tipo
            {sortConfig.key === 'role' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <div className="col-span-3 font-medium">Cursos/Eventos</div>
          <div 
            className="col-span-2 flex items-center gap-2 cursor-pointer font-medium"
            onClick={() => requestSort('lastActive')}
          >
            Última atividade
            {sortConfig.key === 'lastActive' && (
              sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum membro encontrado com os filtros atuais
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 transition-colors">
              <div className="col-span-4 flex items-center gap-4">
                <Link to={`/profile/${member.id}`} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </Link>
              </div>
              <div className="col-span-3 flex items-center">
                <Badge className={getRoleBadge(member.role)}>
                  {member.role === 'student' ? 'Estudante' : 
                   member.role === 'instructor' ? 'Instrutor' : 'Staff'}
                </Badge>
                {!member.active && (
                  <Badge variant="destructive" className="ml-2">
                    Inativo
                  </Badge>
                )}
              </div>
              <div className="col-span-3 flex items-center">
                <div className="flex flex-wrap gap-1">
                  {member.enrollments.slice(0, 3).map((enrollment) => (
                    <Badge key={enrollment.id} variant="outline">
                      {enrollment.course || enrollment.event}
                    </Badge>
                  ))}
                  {member.enrollments.length > 3 && (
                    <Badge variant="outline">+{member.enrollments.length - 3}</Badge>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500">
                {new Date(member.lastActive).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}