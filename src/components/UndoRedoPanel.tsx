import { Command } from '../hooks/useUndoRedo';
import { History, Undo2, Redo2, Trash2 } from 'lucide-react';

// ============================================================
// UNDO/REDO TIMELINE - Visual History
// ============================================================

interface UndoRedoPanelProps {
  history: Command[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export function UndoRedoPanel({
  history,
  currentIndex,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}: UndoRedoPanelProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <History size={16} className="text-indigo-400" />
          Action History
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} className="text-white" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={16} className="text-white" />
          </button>
          <button
            onClick={onClear}
            disabled={history.length === 0}
            className="p-2 bg-dark-700 hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Clear History"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No actions yet</p>
        ) : (
          history.map((command, index) => {
            const isCurrent = index === currentIndex;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div
                key={command.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : isPast
                      ? 'bg-dark-700 border-dark-500 opacity-60'
                      : 'bg-dark-700 border-dark-500 opacity-40'
                }`}
              >
                <div className="flex-shrink-0">
                  {isPast && <div className="w-2 h-2 rounded-full bg-success" />}
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                  {isFuture && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-medium truncate">
                    {command.description}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(command.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {isCurrent && <span className="text-xs text-indigo-400 font-medium">Current</span>}
              </div>
            );
          })
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{history.length} actions</span>
            <span>
              Position: {currentIndex + 1} / {history.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
