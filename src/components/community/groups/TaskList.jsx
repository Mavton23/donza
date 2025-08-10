import { useState, useEffect } from 'react';
import { FiCheckCircle, FiFilter, FiPlus, FiList, FiClock } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import AssignModal from './AssignModal';
import NewTaskModal from './NewTaskModal';
import EditTaskModal from './EditTaskModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskList({ role, groupId, canEdit, members }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const { user } = useAuth();

  // Buscar tarefas do grupo
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/task/groups/${groupId}/tasks`);
        setTasks(response.data.data);
      } catch (error) {
        handleError(error, 'Erro ao carregar tarefas');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [groupId]);

  // Buscar detalhes de uma tarefa específica
  const fetchTaskDetails = async (taskId) => {
    try {
      const response = await api.get(`/task/${groupId}/tasks/${taskId}`);
      return response.data.data;
    } catch (error) {
      handleError(error, 'Erro ao carregar detalhes da tarefa');
    }
  };

  const handleError = (error, defaultMessage) => {
    toast({
      title: defaultMessage,
      description: error.response?.data?.message || 'Ocorreu um erro inesperado',
      variant: 'destructive'
    });
  };

  const handleAssign = async (task, userId) => {
    try {
      await api.post(`/task/tasks/${task.taskId}/assign`, { userId });
      
      // Atualiza a lista de tarefas com os novos assignees
      const updatedTask = await fetchTaskDetails(task.taskId);
      
      setTasks(prev => prev.map(t => 
        t.taskId === task.taskId ? updatedTask : t
      ));
      
      toast.success('Tarefa atribuída com sucesso');
    } catch (error) {
      handleError(error, 'Erro ao atribuir tarefa');
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      const response = await api.post(`/task/groups/${groupId}/tasks`, newTask);
      
      setTasks(prev => [...prev, response.data.data]);
      toast.success('Tarefa criada com sucesso');
      setIsNewTaskModalOpen(false);
    } catch (error) {
      toast.error(error.data.message || 'Ocorreu um erro durante a criacao, tente novamente!');
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const { taskId, ...taskData } = updatedTask;
      await api.patch(`/task/tasks/${taskId}`, taskData);
      
      const freshTask = await fetchTaskDetails(taskId);
      setTasks(prev => prev.map(t => t.taskId === taskId ? freshTask : t));
      
      toast.success('Tarefa atualizada com sucesso');
      setIsEditTaskModalOpen(false);
    } catch (error) {
      handleError(error, 'Erro ao atualizar tarefa');
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete(`/task/tasks/${currentTask.taskId}`);
      setTasks(prev => prev.filter(t => t.taskId !== currentTask.taskId));
      toast.success('Tarefa excluída com sucesso');
      setIsDeleteModalOpen(false);
    } catch (error) {
      handleError(error, 'Erro ao excluir tarefa');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      // Primeiro encontramos o assignmentId para esta tarefa
      const task = tasks.find(t => t.taskId === taskId);
      const assignmentId = task?.assignments?.[0]?.assignmentId;
      
      if (!assignmentId) {
        throw new Error('Atribuição não encontrada');
      }

      await api.patch(`/task/assignments/${assignmentId}`, { status });
      
      setTasks(prev => prev.map(t => 
        t.taskId === taskId 
          ? { 
              ...t, 
              status,
              assignments: t.assignments?.map(a => 
                a.assignmentId === assignmentId ? { ...a, status } : a
              ),
              ...(status === 'completed' && { completedAt: new Date() })
            } 
          : t
      ));
      
      toast.success('Status da tarefa atualizado');
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || 'Falha ao atualizar status');
    }
  };

  const canManageTask = (task) => {
    // Verifica se o usuário tem permissão para gerenciar a tarefa
    return ['instructor', 'leader', 'co-leader'].includes(role) || 
           task.createdBy === user.userId; // assumindo que você tem o userId disponível
  };

  const filteredTasks = tasks.filter(task => 
    filter === 'all' || task.status === filter
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Cabeçalho e filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
            <FiList className="text-gray-500 dark:text-gray-400 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
              className="flex items-center gap-1"
            >
              <FiFilter size={14} />
              Todas
            </Button>
            <Button 
              variant={filter === 'pending' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
              className="flex items-center gap-1"
            >
              <FiClock size={14} />
              Pendentes
            </Button>
            <Button 
              variant={filter === 'completed' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
              className="flex items-center gap-1"
            >
              <FiCheckCircle size={14} />
              Concluídas
            </Button>
          </div>
        </div>
        
        {canEdit && (
          <Button 
            variant="primary" 
            size="sm" 
            icon={<FiPlus />}
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Nova Tarefa
          </Button>
        )}
      </div>

      {/* Lista de tarefas */}
      {filteredTasks.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredTasks.map((task, index) => (
            <TaskItem 
              key={task.taskId} 
              task={task} 
              canEdit={canEdit}
              canManage={canManageTask(task)}
              isLast={index === filteredTasks.length - 1}
              onAssignClick={() => {
                setCurrentTask(task);
                setIsAssignModalOpen(true);
              }}
              onEditClick={(task) => {
                setCurrentTask(task);
                setIsEditTaskModalOpen(true);
              }}
              onDeleteClick={(task) => {
                setCurrentTask(task);
                setIsDeleteModalOpen(true);
              }}
              onStatusChange={(newStatus) => handleUpdateTaskStatus(task.taskId, newStatus)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <FiList className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filter === 'all' 
              ? 'Comece adicionando uma nova tarefa' 
              : filter === 'pending' 
                ? 'Nenhuma tarefa pendente no momento' 
                : 'Nenhuma tarefa concluída ainda'}
          </p>
          {canEdit && filter === 'all' && (
            <Button
              variant="primary"
              size="sm"
              icon={<FiPlus />}
              onClick={() => setIsNewTaskModalOpen(true)}
              className="mt-4"
            >
              Criar primeira tarefa
            </Button>
          )}
        </div>
      )}

      {/* Modais */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        members={members}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        onSubmit={handleUpdateTask}
        task={currentTask}
        members={members}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        members={members}
        currentAssignee={currentTask?.assignments?.[0] || null}
        onAssign={(member) => {
          if (currentTask) {
            handleAssign(currentTask, member.userId);
          }
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta tarefa?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}