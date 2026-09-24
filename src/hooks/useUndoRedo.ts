import { useState, useCallback } from 'react';

// ============================================================
// UNDO/REDO SYSTEM - Command Pattern Implementation
// ============================================================

export interface Command {
  id: string;
  type: string;
  description: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
}

export class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxSize = 50;

  /**
   * Execute a command and add to history
   */
  execute(command: Omit<Command, 'id' | 'timestamp'>): void {
    const fullCommand: Command = {
      ...command,
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Remove any commands after current index (redo history)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new command
    this.history.push(fullCommand);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }

    // Execute the command
    command.execute();
  }

  /**
   * Undo the last command
   */
  undo(): Command | null {
    if (this.currentIndex < 0) return null;

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    return command;
  }

  /**
   * Redo the next command
   */
  redo(): Command | null {
    if (this.currentIndex >= this.history.length - 1) return null;

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();

    return command;
  }

  /**
   * Check if can undo
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if can redo
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get history
   */
  getHistory(): Command[] {
    return [...this.history];
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

// React Hook for Undo/Redo
export function useUndoRedo() {
  const [history] = useState(() => new CommandHistory());
  const [, setForceUpdate] = useState(0);

  const execute = useCallback(
    (command: Omit<Command, 'id' | 'timestamp'>) => {
      history.execute(command);
      setForceUpdate((n) => n + 1);
    },
    [history]
  );

  const undo = useCallback(() => {
    const result = history.undo();
    setForceUpdate((n) => n + 1);
    return result;
  }, [history]);

  const redo = useCallback(() => {
    const result = history.redo();
    setForceUpdate((n) => n + 1);
    return result;
  }, [history]);

  const canUndo = history.canUndo();
  const canRedo = history.canRedo();
  const historyList = history.getHistory();
  const currentIndex = history.getCurrentIndex();

  return {
    execute,
    undo,
    redo,
    canUndo,
    canRedo,
    history: historyList,
    currentIndex,
    clear: () => {
      history.clear();
      setForceUpdate((n) => n + 1);
    },
  };
}

// Command Creators
export const createAddTaskCommand = (
  addTask: (task: any) => void,
  removeTask: (taskId: string) => void,
  task: any
): Omit<Command, 'id' | 'timestamp'> => ({
  type: 'add-task',
  description: `Add task: ${task.title}`,
  execute: () => addTask(task),
  undo: () => removeTask(task.id),
});

export const createUpdateTaskCommand = (
  updateTask: (taskId: string, updates: any) => void,
  taskId: string,
  oldTask: any,
  newTask: any
): Omit<Command, 'id' | 'timestamp'> => ({
  type: 'update-task',
  description: `Update task: ${newTask.title}`,
  execute: () => updateTask(taskId, newTask),
  undo: () => updateTask(taskId, oldTask),
});

export const createDeleteTaskCommand = (
  addTask: (task: any) => void,
  removeTask: (taskId: string) => void,
  task: any
): Omit<Command, 'id' | 'timestamp'> => ({
  type: 'delete-task',
  description: `Delete task: ${task.title}`,
  execute: () => removeTask(task.id),
  undo: () => addTask(task),
});

export const createMoveTaskCommand = (
  moveTask: (taskId: string, fromColumn: string, toColumn: string) => void,
  taskId: string,
  fromColumn: string,
  toColumn: string
): Omit<Command, 'id' | 'timestamp'> => ({
  type: 'move-task',
  description: `Move task from ${fromColumn} to ${toColumn}`,
  execute: () => moveTask(taskId, fromColumn, toColumn),
  undo: () => moveTask(taskId, toColumn, fromColumn),
});
