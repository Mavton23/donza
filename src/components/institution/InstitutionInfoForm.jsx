import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InstitutionInfoForm({ institution }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: institution.name,
      email: institution.email,
      phone: institution.phone,
      address: institution.address
    }
  });

  const onSubmit = async (data) => {
    try {
      await api.put(`/institutions/${institution.id}`, data);
      toast.success('Informações atualizadas com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar informações');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nome da Instituição</Label>
          <Input
            id="name"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={errors.name}
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail Institucional</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'E-mail inválido'
              }
            })}
            error={errors.email}
          />
        </div>
        {/* Outros campos... */}
      </div>
      <div className="flex justify-end">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </form>
  );
}