import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, Calendar, User, Tag } from 'lucide-react';

// ============================================================
// KANBAN BOARD - Real Drag & Drop Implementation
// ============================================================

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  dueDate?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color?: string;
}

// Draggable Task Card
function TaskCard({ task, isDragging }: { task: KanbanTask; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-dark-700 rounded-lg p-3 border border-dark-500 hover:border-indigo-500/50 transition-all cursor-move ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white flex-1">{task.title}</h4>
        <button className="text-slate-400 hover:text-white">
          <MoreVertical size={14} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}

        {task.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{task.assignee}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Droppable Column
function Column({ column }: { column: KanbanColumn }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnColors: Record<string, string> = {
    todo: 'border-blue-500/30',
    'in-progress': 'border-yellow-500/30',
    review: 'border-purple-500/30',
    done: 'border-green-500/30',
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-dark-800 rounded-xl p-4 border-2 transition-colors min-w-[300px] ${
        isOver ? 'border-indigo-500 bg-dark-700' : columnColors[column.id] || 'border-dark-500'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          <span className="text-xs bg-dark-600 text-slate-400 px-2 py-0.5 rounded">
            {column.tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

// Main Kanban Board
export function KanbanBoard({
  columns: initialColumns,
  onColumnsChange,
}: {
  columns: KanbanColumn[];
  onColumnsChange?: (columns: KanbanColumn[]) => void;
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    // Find source column and task
    let sourceColumnIndex = -1;
    let taskIndex = -1;
    let task: KanbanTask | null = null;

    for (let i = 0; i < columns.length; i++) {
      const taskIdx = columns[i].tasks.findIndex((t) => t.id === activeTaskId);
      if (taskIdx !== -1) {
        sourceColumnIndex = i;
        taskIndex = taskIdx;
        task = columns[i].tasks[taskIdx];
        break;
      }
    }

    if (!task || sourceColumnIndex === -1) {
      setActiveId(null);
      return;
    }

    // Find target column
    const targetColumnIndex = columns.findIndex((c) => c.id === overColumnId);

    if (targetColumnIndex === -1 || targetColumnIndex === sourceColumnIndex) {
      setActiveId(null);
      return;
    }

    // Move task
    const newColumns = [...columns];
    newColumns[sourceColumnIndex].tasks.splice(taskIndex, 1);
    newColumns[targetColumnIndex].tasks.push(task);

    setColumns(newColumns);
    onColumnsChange?.(newColumns);
    setActiveId(null);
  };

  const activeTask = columns.flatMap((c) => c.tasks).find((t) => t.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Kanban Board Page
export function KanbanBoardPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'todo',
      title: 'To Do',
      color: 'blue',
      tasks: [
        {
          id: 'task-1',
          title: 'Implement user authentication',
          description: 'Add OAuth login with GitHub and Google',
          priority: 'high',
          assignee: 'John Doe',
          tags: ['backend', 'auth'],
          dueDate: '2026-03-10',
        },
        {
          id: 'task-2',
          title: 'Design dashboard layout',
          description: 'Create responsive layout for main dashboard',
          priority: 'medium',
          assignee: 'Jane Smith',
          tags: ['frontend', 'design'],
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'yellow',
      tasks: [
        {
          id: 'task-3',
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing',
          priority: 'high',
          assignee: 'Bob Johnson',
          tags: ['devops'],
          dueDate: '2026-03-08',
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'purple',
      tasks: [
        {
          id: 'task-4',
          title: 'API documentation',
          description: 'Write OpenAPI specs for all endpoints',
          priority: 'medium',
          assignee: 'Alice Williams',
          tags: ['docs', 'api'],
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'green',
      tasks: [
        {
          id: 'task-5',
          title: 'Project setup',
          description: 'Initialize React + TypeScript project',
          priority: 'low',
          assignee: 'John Doe',
          tags: ['setup'],
        },
      ],
    },
  ]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <p className="text-slate-400 text-sm mt-1">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <KanbanBoard columns={columns} onColumnsChange={setColumns} />
    </div>
  );
}
