import { useState } from 'react';

interface DraggableItem {
  id: string;
  content: React.ReactNode;
}

interface DragDropListProps {
  items: DraggableItem[];
  onReorder: (items: DraggableItem[]) => void;
  renderItem?: (item: DraggableItem, index: number) => React.ReactNode;
}

export function DragDropList({ items, onReorder, renderItem }: DragDropListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    onReorder(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            relative cursor-move transition-all
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-indigo-500' : ''}
          `}
        >
          {renderItem ? renderItem(item, index) : (
            <div className="p-3 bg-dark-700 rounded-lg border border-dark-500 hover:border-indigo-500/50 transition-colors">
              {item.content}
            </div>
          )}
          
          {/* Drag handle indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 opacity-0 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// Kanban board column
interface KanbanColumn {
  id: string;
  title: string;
  items: DraggableItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMoveItem: (itemId: string, fromColumnId: string, toColumnId: string) => void;
}

export function KanbanBoard({ columns, onMoveItem }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<{ id: string; fromColumn: string } | null>(null);

  const handleDragStart = (itemId: string, columnId: string) => {
    setDraggedItem({ id: itemId, fromColumn: columnId });
  };

  const handleDrop = (toColumnId: string) => {
    if (draggedItem && draggedItem.fromColumn !== toColumnId) {
      onMoveItem(draggedItem.id, draggedItem.fromColumn, toColumnId);
    }
    setDraggedItem(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-dark-800 rounded-xl p-4 border border-dark-500"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span>{column.title}</span>
            <span className="text-xs text-slate-400 bg-dark-700 px-2 py-0.5 rounded">
              {column.items.length}
            </span>
          </h3>
          
          <div className="space-y-2 min-h-[200px]">
            {column.items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id, column.id)}
                className={`
                  p-3 bg-dark-700 rounded-lg border border-dark-500 
                  hover:border-indigo-500/50 transition-all cursor-move
                  ${draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''}
                `}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
