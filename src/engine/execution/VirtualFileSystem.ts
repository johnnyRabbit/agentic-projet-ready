// ============================================================
// VIRTUAL FILE SYSTEM — In-Memory File Operations
// ============================================================
// Simulates real filesystem operations for browser environment.
// Structure ready for backend replacement (Node.js fs, Docker volumes).

import { FileNode } from './types';

export class VirtualFileSystem {
  private root: FileNode;

  constructor() {
    this.root = this.createDirectory('root');
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<string> {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    if (node.type !== 'file') {
      throw new Error(`Not a file: ${path}`);
    }
    return node.content || '';
  }

  /**
   * Write file content (creates parent directories if needed)
   */
  async writeFile(path: string, content: string): Promise<void> {
    const parts = this.parsePath(path);
    const fileName = parts.pop()!;
    
    // Ensure parent directory exists
    let current = this.root;
    for (const dir of parts) {
      if (!current.children) {
        current.children = new Map();
      }
      if (!current.children.has(dir)) {
        current.children.set(dir, this.createDirectory(dir));
      }
      current = current.children.get(dir)!;
    }

    // Create or update file
    if (!current.children) {
      current.children = new Map();
    }

    const now = new Date().toISOString();
    if (current.children.has(fileName)) {
      const existing = current.children.get(fileName)!;
      existing.content = content;
      existing.modifiedAt = now;
    } else {
      current.children.set(fileName, {
        name: fileName,
        type: 'file',
        content,
        createdAt: now,
        modifiedAt: now
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    const parts = this.parsePath(path);
    const fileName = parts.pop()!;
    
    const parent = this.getNode(parts.join('/'));
    if (!parent || !parent.children) {
      throw new Error(`Parent directory not found: ${parts.join('/')}`);
    }

    if (!parent.children.has(fileName)) {
      throw new Error(`File not found: ${path}`);
    }

    parent.children.delete(fileName);
  }

  /**
   * List files in directory
   */
  async listFiles(path: string = ''): Promise<string[]> {
    const node = path ? this.getNode(path) : this.root;
    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }
    if (node.type !== 'directory') {
      throw new Error(`Not a directory: ${path}`);
    }

    const files: string[] = [];
    if (node.children) {
      for (const [name, child] of node.children) {
        const fullPath = path ? `${path}/${name}` : name;
        files.push(fullPath);
        
        // Recursively list subdirectories
        if (child.type === 'directory') {
          const subFiles = await this.listFiles(fullPath);
          files.push(...subFiles);
        }
      }
    }

    return files.sort();
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    return this.getNode(path) !== null;
  }

  /**
   * Get file/directory node
   */
  getNode(path: string): FileNode | null {
    if (!path || path === '/') {
      return this.root;
    }

    const parts = this.parsePath(path);
    let current = this.root;

    for (const part of parts) {
      if (!current.children || !current.children.has(part)) {
        return null;
      }
      current = current.children.get(part)!;
    }

    return current;
  }

  /**
   * Create a copy of the filesystem (for worktrees)
   */
  clone(): VirtualFileSystem {
    const cloned = new VirtualFileSystem();
    cloned.root = this.cloneNode(this.root);
    return cloned;
  }

  /**
   * Export filesystem as JSON (for persistence)
   */
  export(): string {
    return JSON.stringify(this.serializeNode(this.root), null, 2);
  }

  /**
   * Import filesystem from JSON
   */
  import(json: string): void {
    const data = JSON.parse(json);
    this.root = this.deserializeNode(data);
  }

  /**
   * Get total size in bytes
   */
  getSize(): number {
    return this.calculateSize(this.root);
  }

  // --- Private helpers ---

  private parsePath(path: string): string[] {
    return path.split('/').filter(p => p && p !== '.' && p !== '..');
  }

  private createDirectory(name: string): FileNode {
    const now = new Date().toISOString();
    return {
      name,
      type: 'directory',
      children: new Map(),
      createdAt: now,
      modifiedAt: now
    };
  }

  private cloneNode(node: FileNode): FileNode {
    const cloned: FileNode = {
      name: node.name,
      type: node.type,
      content: node.content,
      createdAt: node.createdAt,
      modifiedAt: node.modifiedAt
    };

    if (node.children) {
      cloned.children = new Map();
      for (const [key, child] of node.children) {
        cloned.children.set(key, this.cloneNode(child));
      }
    }

    return cloned;
  }

  private serializeNode(node: FileNode): any {
    const result: any = {
      name: node.name,
      type: node.type,
      content: node.content,
      createdAt: node.createdAt,
      modifiedAt: node.modifiedAt
    };

    if (node.children) {
      result.children = {};
      for (const [key, child] of node.children) {
        result.children[key] = this.serializeNode(child);
      }
    }

    return result;
  }

  private deserializeNode(data: any): FileNode {
    const node: FileNode = {
      name: data.name,
      type: data.type,
      content: data.content,
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt
    };

    if (data.children) {
      node.children = new Map();
      for (const [key, childData] of Object.entries(data.children)) {
        node.children.set(key, this.deserializeNode(childData));
      }
    }

    return node;
  }

  private calculateSize(node: FileNode): number {
    let size = 0;

    if (node.content) {
      size += node.content.length;
    }

    if (node.children) {
      for (const child of node.children.values()) {
        size += this.calculateSize(child);
      }
    }

    return size;
  }
}
