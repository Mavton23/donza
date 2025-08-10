import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export default function PaymentMethodForm({ institutionId, paymentMethods, onUpdate }) {
  const [newMethod, setNewMethod] = useState({
    type: 'credit_card',
    details: {}
  });

  const handleAddMethod = async () => {
    try {
      const response = await api.post(`/institutions/${institutionId}/payment-methods`, newMethod);
      onUpdate([...paymentMethods, response.data]);
      setNewMethod({ type: 'credit_card', details: {} });
      toast.success('Método de pagamento adicionado');
    } catch (error) {
      toast.error('Erro ao adicionar método');
    }
  };

  const handleRemoveMethod = async (methodId) => {
    try {
      await api.delete(`/institutions/${institutionId}/payment-methods/${methodId}`);
      onUpdate(paymentMethods.filter(m => m.id !== methodId));
      toast.success('Método removido');
    } catch (error) {
      toast.error('Erro ao remover método');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Métodos Cadastrados</h3>
        {paymentMethods.length > 0 ? (
          <div className="space-y-2">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {method.type === 'credit_card' ? 'Cartão de Crédito' : 'Boleto Bancário'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.details.last4 ? `•••• •••• •••• ${method.details.last4}` : method.details.name}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveMethod(method.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum método cadastrado</p>
        )}
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-medium">Adicionar Novo Método</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo</Label>
            <select
              className="w-full p-2 border rounded"
              value={newMethod.type}
              onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
            >
              <option value="credit_card">Cartão de Crédito</option>
              <option value="boleto">Boleto Bancário</option>
            </select>
          </div>
          {/* Campos específicos para cada tipo de pagamento */}
          {newMethod.type === 'credit_card' ? (
            <>
              <div>
                <Label>Número do Cartão</Label>
                <Input placeholder="4242 4242 4242 4242" />
              </div>
              <div>
                <Label>Nome no Cartão</Label>
                <Input placeholder="Nome como no cartão" />
              </div>
              <div>
                <Label>Validade</Label>
                <Input placeholder="MM/AA" />
              </div>
              <div>
                <Label>CVV</Label>
                <Input placeholder="123" />
              </div>
            </>
          ) : (
            <div>
              <Label>Nome do Favorecido</Label>
              <Input 
                placeholder="Nome para identificação" 
                value={newMethod.details.name || ''}
                onChange={(e) => setNewMethod({
                  ...newMethod, 
                  details: {...newMethod.details, name: e.target.value}
                })}
              />
            </div>
          )}
        </div>
        <Button onClick={handleAddMethod}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Método
        </Button>
      </div>
    </div>
  );
}