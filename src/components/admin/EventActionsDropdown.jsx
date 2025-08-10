import Dropdown from '../common/Dropdown';
import Icon from '../common/Icon';

export default function EventActionsDropdown({ eventId, status }) {
  const actions = [
    { 
      label: 'Ver detalhes', 
      icon: 'eye', 
      action: () => console.log('Visualizar', eventId) 
    },
    { 
      label: 'Editar evento', 
      icon: 'edit', 
      action: () => console.log('Editar', eventId) 
    },
    status === 'scheduled' && { 
      label: 'Iniciar evento', 
      icon: 'play', 
      action: () => console.log('Iniciar', eventId) 
    },
    status === 'live' && { 
      label: 'Encerrar evento', 
      icon: 'stop-circle', 
      action: () => console.log('Encerrar', eventId) 
    },
    { 
      label: 'Cancelar', 
      icon: 'x-circle', 
      action: () => console.log('Cancelar', eventId),
      danger: true 
    }
  ].filter(Boolean);

  return (
    <Dropdown
      trigger={
        <button 
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Ações do evento"
        >
          <Icon name="more-vertical" size="sm" />
        </button>
      }
      items={actions.map(action => ({
        ...action,
        icon: <Icon 
                name={action.icon} 
                size="sm" 
                className={action.danger ? 'text-red-500' : ''} 
              />
      }))}
    />
  );
}