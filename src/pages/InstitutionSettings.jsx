import { useState, useEffect } from 'react';
import { Settings, Users, Lock, Palette, Mail, CreditCard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InstitutionInfoForm from '@/components/institution/InstitutionInfoForm';
import InstitutionMembersSettings from '@/components/institution/InstitutionMembersSettings';
import InstitutionBillingSettings from '@/components/institution/InstitutionBillingSettings';
import InstitutionAppearanceSettings from '@/components/institution/InstitutionAppearanceSettings';
import InstitutionSecuritySettings from '@/components/institution/InstitutionSecuritySettings';
import InstitutionNotificationsSettings from '@/components/institution/InstitutionNotificationSettings';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function InstitutionSettings() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        if (!user?.userId) {
          throw new Error('Usuário não autenticado');
        }

        const response = await api.get(`/institution/${user.userId}/settings`);
        setInstitution(response.data);
      } catch (err) {
        console.error('Erro ao carregar dados da instituição:', err);
        setError('Erro ao carregar dados da instituição');
        toast.error('Falha ao carregar dados', {
          description: err.response?.data?.message || err.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          Instituição não encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações Institucionais
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da instituição {institution.name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto mb-8">
          <TabsTrigger value="general" className="flex-col h-16 gap-1">
            <Settings className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-col h-16 gap-1">
            <Users className="h-4 w-4" />
            <span>Membros</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex-col h-16 gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Cobrança</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-col h-16 gap-1">
            <Palette className="h-4 w-4" />
            <span>Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-col h-16 gap-1">
            <Lock className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-col h-16 gap-1">
            <Mail className="h-4 w-4" />
            <span>Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <InstitutionInfoForm institution={institution} />
        </TabsContent>
        <TabsContent value="members">
          <InstitutionMembersSettings institutionId={institution.id} />
        </TabsContent>
        <TabsContent value="billing">
          <InstitutionBillingSettings institution={institution} />
        </TabsContent>
        <TabsContent value="appearance">
          <InstitutionAppearanceSettings institution={institution} />
        </TabsContent>
        <TabsContent value="security">
          <InstitutionSecuritySettings institution={institution} />
        </TabsContent>
        <TabsContent value="notifications">
          <InstitutionNotificationsSettings institution={institution} />
        </TabsContent>
      </Tabs>
    </div>
  );
}