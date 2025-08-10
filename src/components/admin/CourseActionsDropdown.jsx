import Dropdown from '../common/Dropdown';
import Icon from '../common/Icon';

export default function CourseActionsDropdown({ courseId, status }) {
  const actions = [
    { 
      label: 'Ver detalhes', 
      icon: 'eye', 
      action: () => console.log('View', courseId) 
    },
    { 
      label: 'Editar curso', 
      icon: 'edit', 
      action: () => console.log('Edit', courseId) 
    },
    status === 'published' && { 
      label: 'Despublicar', 
      icon: 'eye-off', 
      action: () => console.log('Unpublish', courseId) 
    },
    status !== 'published' && { 
      label: 'Publicar', 
      icon: 'check-circle', 
      action: () => console.log('Publish', courseId) 
    },
    { 
      label: 'Excluir', 
      icon: 'trash', 
      action: () => console.log('Delete', courseId),
      danger: true 
    }
  ].filter(Boolean);

  return (
    <Dropdown
      trigger={
        <button 
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Ações do curso"
        >
          <Icon name="more-vertical" size="sm" />
        </button>
      }
      items={actions.map(action => ({
        ...action,
        icon: <Icon name={action.icon} size="sm" className={action.danger ? 'text-red-500' : ''} />
      }))}
      position="bottom"
    />
  );
}