import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Check, 
  X, 
  Star, 
  BookOpen,
  Users,
  Loader2
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function InviteInstructorModal({ 
  open, 
  onOpenChange,
  currentInstructors = [] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const { user: currentInstitution } = useAuth();

  // Filtra para evitar convites duplicados
  const filteredResults = searchResults.filter(
    user => !currentInstructors.some(instructor => instructor.userId === user.userId)
  );

  const handleSearch = async () => {
  if (!searchQuery.trim()) return;
  
  try {
    setIsSearching(true);
    const response = await api.get('/search/instructors', {
      params: {
        query: searchQuery,
        excludeInstitutionId: currentInstitution?.userId
      }
    });

    const formattedResults = response.data.data.map(instructor => ({
      userId: instructor.userId,
      fullName: instructor.fullName,
      avatarUrl: instructor.avatarUrl,
      expertise: instructor.expertise,
      bio: instructor.bio,
      rating: instructor.rating,
      coursesCount: instructor.coursesCount,
      studentsCount: instructor.studentsCount,
      isVerified: instructor.isVerified
    }));

    setSearchResults(formattedResults);
  } catch (error) {
    toast({
      title: 'Erro na busca',
      description: error.response?.data?.message || 'Falha ao buscar instrutores',
      variant: 'destructive'
    });
  } finally {
    setIsSearching(false);
  }
};

  const handleSendInvite = async () => {
    if (!selectedInstructor) return;
    
    try {
      setIsSendingInvite(true);
      await api.post('/institution/invites', {
        instructorId: selectedInstructor.userId,
        message: inviteMessage
      });
      
      toast({
        title: 'Convite enviado!',
        description: `${selectedInstructor.fullName} foi convidado para sua instituição`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao enviar convite',
        description: error.response?.data?.message || 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Instrutor
          </DialogTitle>
          <DialogDescription>
            Busque por instrutores na plataforma e envie um convite para se juntar à sua instituição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou área de expertise..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSearching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {filteredResults.length > 0 ? (
                <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                  {filteredResults.map((user) => (
                    <Card 
                      key={user.userId}
                      className={`cursor-pointer transition-colors ${
                        selectedInstructor?.userId === user.userId 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedInstructor(user)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar 
                          src={user.avatarUrl} 
                          name={user.fullName} 
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{user.fullName}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {user.expertise?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {user.expertise.slice(0, 2).join(', ')}
                                {user.expertise.length > 2 && '...'}
                              </span>
                            )}
                            {user.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {user.rating.toFixed(1)}
                              </span>
                            )}
                            {user.studentsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {user.studentsCount} alunos
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum instrutor encontrado para "{searchQuery}"
                  </div>
                )
              )}
            </>
          )}

          {selectedInstructor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar 
                  src={selectedInstructor.avatarUrl} 
                  name={selectedInstructor.fullName} 
                  size="lg"
                />
                <div>
                  <h4 className="font-medium">{selectedInstructor.fullName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedInstructor.expertise?.join(', ')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem pessoal (opcional)</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  placeholder={`Ex: Olá ${selectedInstructor.fullName.split(' ')[0]}, gostaríamos que você ministrasse cursos em nossa instituição...`}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedInstructor || isSendingInvite}
              onClick={handleSendInvite}
            >
              {isSendingInvite ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}