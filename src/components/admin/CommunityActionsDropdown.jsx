import { useState, useRef, useEffect } from 'react';
import Icon from '../common/Icon';
import ConfirmationModal from '../common/ConfirmationModal';

export default function CommunityActionsDropdown({ 
  communityId, 
  status, 
  onStatusChange, 
  onDelete 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      await onStatusChange(communityId, newStatus);
      setIsOpen(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await onDelete(communityId);
      setShowDeleteModal(false);
      setIsOpen(false);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusActions = () => {
    if (status === 'active') {
      return [
        {
          label: 'Suspender',
          icon: 'pause',
          action: () => handleStatusUpdate('suspended'),
          description: 'Suspender a comunidade temporariamente'
        },
        {
          label: 'Arquivar',
          icon: 'archive',
          action: () => handleStatusUpdate('archived'),
          description: 'Arquivar a comunidade'
        }
      ];
    } else if (status === 'suspended') {
      return {
        label: 'Reativar',
        icon: 'play',
        action: () => handleStatusUpdate('active'),
        description: 'Reativar a comunidade'
      };
    } else if (status === 'archived') {
      return {
        label: 'Restaurar',
        icon: 'refresh-cw',
        action: () => handleStatusUpdate('active'),
        description: 'Restaurar comunidade para ativa'
      };
    }
    return null;
  };

  const statusActions = getStatusActions() || [];
  const statusActionArray = Array.isArray(statusActions) ? statusActions : [statusActions];

  const actions = [
    ...statusActionArray,
    { 
      label: 'Excluir', 
      icon: 'trash', 
      action: () => setShowDeleteModal(true),
      description: 'Excluir comunidade permanentemente',
      danger: true 
    }
  ].filter(action => action);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar dropdown ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Ações da comunidade"
        >
          <Icon name="more-vertical" size="sm" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                  disabled={actionLoading === (action.label === 'Excluir' ? 'delete' : action.label?.toLowerCase())}
                  className={`
                    block w-full text-left px-4 py-2 text-sm
                    transition-colors duration-150
                    ${action.danger 
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                    flex items-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <Icon 
                    name={action.icon} 
                    size="sm" 
                    className={`mr-2.5 ${action.danger ? 'text-red-500' : ''}`} 
                  />
                  {action.label}
                  {actionLoading === (action.label === 'Excluir' ? 'delete' : action.label?.toLowerCase()) && (
                    <Icon name="loader" size="sm" className="ml-auto animate-spin" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Comunidade"
        message="Tem certeza que deseja excluir esta comunidade permanentemente? Todos os dados associados (membros, posts, grupos de estudo) serão perdidos. Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={actionLoading === 'delete'}
      />
    </>
  );
}