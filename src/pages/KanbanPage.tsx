import { useState } from 'react';
import { KanbanBoard, KanbanColumn } from '../components/KanbanBoard';
import { UndoRedoPanel } from '../components/UndoRedoPanel';
import { useUndoRedo, createMoveTaskCommand } from '../hooks/useUndoRedo';
import { Plus, Filter, Search } from 'lucide-react';

export function KanbanPage() {
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
        {
          id: 'task-3',
          title: 'Write API documentation',
          description: 'Document all REST endpoints',
          priority: 'low',
          assignee: 'Bob Johnson',
          tags: ['docs'],
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'yellow',
      tasks: [
        {
          id: 'task-4',
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing',
          priority: 'high',
          assignee: 'Alice Williams',
          tags: ['devops'],
          dueDate: '2026-03-08',
        },
        {
          id: 'task-5',
          title: 'Implement search feature',
          description: 'Add full-text search to the application',
          priority: 'medium',
          assignee: 'John Doe',
          tags: ['frontend', 'backend'],
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'purple',
      tasks: [
        {
          id: 'task-6',
          title: 'Code review: Payment module',
          description: 'Review pull request #123',
          priority: 'high',
          assignee: 'Jane Smith',
          tags: ['review'],
          dueDate: '2026-03-07',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'green',
      tasks: [
        {
          id: 'task-7',
          title: 'Project setup',
          description: 'Initialize React + TypeScript project',
          priority: 'low',
          assignee: 'Bob Johnson',
          tags: ['setup'],
        },
        {
          id: 'task-8',
          title: 'Database schema design',
          description: 'Design and implement database schema',
          priority: 'medium',
          assignee: 'Alice Williams',
          tags: ['backend', 'database'],
        },
      ],
    },
  ]);

  const { execute, undo, redo, canUndo, canRedo, history, currentIndex, clear } = useUndoRedo();

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    // Find what changed
    const oldColumns = columns;

    for (const newCol of newColumns) {
      const oldCol = oldColumns.find((c) => c.id === newCol.id);
      if (!oldCol) continue;

      // Check for moved tasks
      for (const newTask of newCol.tasks) {
        const oldTask = oldCol.tasks.find((t) => t.id === newTask.id);
        if (!oldTask) {
          // Task was added to this column (moved from another)
          const sourceCol = oldColumns.find((c) => c.tasks.some((t) => t.id === newTask.id));
          if (sourceCol && sourceCol.id !== newCol.id) {
            // Task was moved
            const command = createMoveTaskCommand(
              (taskId, from, to) => {
                setColumns((prev) => {
                  const updated = prev.map((col) => {
                    if (col.id === from) {
                      return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
                    }
                    if (col.id === to) {
                      const task = prev.flatMap((c) => c.tasks).find((t) => t.id === taskId);
                      return task ? { ...col, tasks: [...col.tasks, task] } : col;
                    }
                    return col;
                  });
                  return updated;
                });
              },
              newTask.id,
              sourceCol.id,
              newCol.id
            );
            execute(command);
            break;
          }
        }
      }
    }

    setColumns(newColumns);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          <p className="text-slate-400 text-sm mt-1">
            Drag and drop tasks between columns • Use Ctrl+Z to undo, Ctrl+Shift+Z to redo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2.5 rounded-lg text-sm transition-colors border border-dark-500">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-500 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Kanban Board */}
        <div className="col-span-3">
          <KanbanBoard columns={columns} onColumnsChange={handleColumnsChange} />
        </div>

        {/* Undo/Redo Panel */}
        <div className="col-span-1">
          <UndoRedoPanel
            history={history}
            currentIndex={currentIndex}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onClear={clear}
          />
        </div>
      </div>
    </div>
  );
}
