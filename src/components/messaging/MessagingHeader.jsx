import Icon from '../common/Icon';
import { Button } from '../ui/button';

export default function MessagingHeader({ onNewMessage }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-semibold">Mensagens</h1>
      <div className="flex items-center gap-4">
        <Button onClick={onNewMessage}>
          <Icon name="MailPlus" className="w-4 h-4 mr-2" />
            Nova Mensagem
        </Button>
      </div>
    </div>
  );
}
