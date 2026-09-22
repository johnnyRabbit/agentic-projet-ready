import { ReactNode } from 'react';
import { Inbox, Search, Plus, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 text-slate-500">
        {icon || <Inbox className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="Nenhum resultado encontrado"
      description={`Não encontramos nada para "${query}". Tente buscar com outros termos.`}
    />
  );
}

export function NoProjects() {
  return (
    <EmptyState
      title="Nenhum projeto ainda"
      description="Comece criando seu primeiro projeto para organizar suas tarefas e acompanhar o progresso."
      action={{
        label: 'Criar Projeto',
        onClick: () => console.log('Create project')
      }}
    />
  );
}

export function NoTasks() {
  return (
    <EmptyState
      title="Nenhuma tarefa"
      description="Adicione tarefas para organizar seu trabalho e acompanhar o progresso."
      action={{
        label: 'Adicionar Tarefa',
        onClick: () => console.log('Add task')
      }}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      title="Sem notificações"
      description="Você está em dia! Nenhuma notificação pendente."
    />
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      title="Erro ao carregar"
      description={message}
      action={onRetry ? {
        label: 'Tentar novamente',
        onClick: onRetry
      } : undefined}
    />
  );
}
