import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, History, Download } from 'lucide-react';
import PaymentMethodForm from './PaymentMethodForm';

export default function InstitutionBillingSettings({ institution }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchBillingData = async () => {
      const [methodsRes, invoicesRes] = await Promise.all([
        api.get(`/institutions/${institution.id}/payment-methods`),
        api.get(`/institutions/${institution.id}/invoices`)
      ]);
      setPaymentMethods(methodsRes.data);
      setInvoices(invoicesRes.data);
    };

    fetchBillingData();
  }, [institution.id]);

  const handleDownloadInvoice = (invoiceId) => {
    api.get(`/institutions/${institution.id}/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Métodos de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm 
            institutionId={institution.id} 
            paymentMethods={paymentMethods}
            onUpdate={setPaymentMethods}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Fatura #{invoice.number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString()} - {invoice.amount}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}