import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Shield, Key } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function InstitutionSecuritySettings({ institution }) {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordComplexity: true
  });

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      const response = await api.get(`/institutions/${institution.id}/security-settings`);
      setSecuritySettings(response.data);
    };

    fetchSecuritySettings();
  }, [institution.id]);

  const handleSave = async () => {
    try {
      await api.put(`/institutions/${institution.id}/security-settings`, securitySettings);
      toast.success('Configurações de segurança atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactor">Autenticação de Dois Fatores</Label>
              <p className="text-sm text-gray-500">
                Exige verificação adicional para acessar a conta
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Política de Senhas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="complexity">Complexidade de Senha</Label>
              <p className="text-sm text-gray-500">
                Exige senhas fortes (mínimo 8 caracteres, maiúsculas, números)
              </p>
            </div>
            <Switch
              id="complexity"
              checked={securitySettings.passwordComplexity}
              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordComplexity: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}