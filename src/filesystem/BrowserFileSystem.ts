// ============================================================
// BROWSER FILE SYSTEM — Real File Access via File System API
// ============================================================
// Uses the File System Access API (Chrome/Edge) for real
// filesystem operations. Falls back to download/upload for
// other browsers.

export interface BrowserFileHandle {
  name: string;
  kind: 'file' | 'directory';
  handle?: FileSystemHandle;
}

export class BrowserFileSystem {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  /**
   * Check if File System Access API is available
   */
  isAvailable(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Request access to a directory
   */
  async selectDirectory(): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('File System Access API not available in this browser');
    }

    try {
      this.directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false; // User cancelled
      }
      throw error;
    }
  }

  /**
   * List files in the selected directory
   */
  async listFiles(path: string = ''): Promise<BrowserFileHandle[]> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    const files: BrowserFileHandle[] = [];
    let currentHandle = this.directoryHandle;

    // Navigate to path
    if (path) {
      const parts = path.split('/').filter(p => p);
      for (const part of parts) {
        try {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        } catch {
          return []; // Path doesn't exist
        }
      }
    }

    // List files
    // @ts-ignore - entries() is available in modern browsers
    for await (const entry of (currentHandle as any).values()) {
      files.push({
        name: entry.name,
        kind: entry.kind,
        handle: entry
      });
    }

    return files;
  }

  /**
   * Read a file
   */
  async readFile(path: string): Promise<string> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop()!;

    // Navigate to directory
    let currentHandle = this.directoryHandle;
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    // Get file
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * Write a file
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop()!;

    // Navigate to directory (create if needed)
    let currentHandle = this.directoryHandle;
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }

    // Create/write file
    const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop()!;

    // Navigate to directory
    let currentHandle = this.directoryHandle;
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    // Remove file
    await currentHandle.removeEntry(fileName);
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    if (!this.directoryHandle) {
      return false;
    }

    try {
      const parts = path.split('/').filter(p => p);
      const fileName = parts.pop()!;

      let currentHandle = this.directoryHandle;
      for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      }

      await currentHandle.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current directory name
   */
  getDirectoryName(): string | null {
    return this.directoryHandle?.name || null;
  }

  /**
   * Release directory handle
   */
  release(): void {
    this.directoryHandle = null;
  }
}

// Singleton instance
export const browserFileSystem = new BrowserFileSystem();
