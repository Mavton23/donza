import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HexColorPicker } from "react-colorful";

export default function InstitutionAppearanceSettings({ institution }) {
  const [branding, setBranding] = useState(institution.branding || {
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    logo: null
  });

  const handleSave = async () => {
    try {
      await api.put(`/institutions/${institution.id}/branding`, branding);
      toast.success('Aparência atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar aparência');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Cor Primária</h3>
          <HexColorPicker
            color={branding.primaryColor}
            onChange={(color) => setBranding({...branding, primaryColor: color})}
          />
        </div>
        <div>
          <h3 className="font-medium mb-2">Cor Secundária</h3>
          <HexColorPicker
            color={branding.secondaryColor}
            onChange={(color) => setBranding({...branding, secondaryColor: color})}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Aparência</Button>
      </div>
    </div>
  );
}