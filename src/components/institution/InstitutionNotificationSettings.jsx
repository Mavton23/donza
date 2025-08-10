import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Bell, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function InstitutionNotificationsSettings({ institution }) {
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    appEnabled: true,
    newMembers: true,
    payments: true,
    warnings: true
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const response = await api.get(`/institutions/${institution.id}/notification-settings`);
      setNotificationSettings(response.data);
    };

    fetchNotificationSettings();
  }, [institution.id]);

  const handleSave = async () => {
    try {
      await api.put(`/institutions/${institution.id}/notification-settings`, notificationSettings);
      toast.success('Configurações de notificação atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por E-mail</Label>
                <p className="text-sm text-gray-500">
                  Receber notificações importantes por e-mail
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailEnabled}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações no Aplicativo</Label>
                <p className="text-sm text-gray-500">
                  Receber notificações no aplicativo
                </p>
              </div>
              <Switch
                checked={notificationSettings.appEnabled}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appEnabled: checked})}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">Tipos de Notificação</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Novos Membros</Label>
                <p className="text-sm text-gray-500">
                  Notificar quando novos membros se juntarem
                </p>
              </div>
              <Switch
                checked={notificationSettings.newMembers}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newMembers: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Pagamentos</Label>
                <p className="text-sm text-gray-500">
                  Notificar sobre pagamentos e cobranças
                </p>
              </div>
              <Switch
                checked={notificationSettings.payments}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, payments: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Avisos Importantes</Label>
                <p className="text-sm text-gray-500">
                  Notificar sobre avisos e manutenção
                </p>
              </div>
              <Switch
                checked={notificationSettings.warnings}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, warnings: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}