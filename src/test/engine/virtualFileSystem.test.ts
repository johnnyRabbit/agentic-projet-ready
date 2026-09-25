import { describe, it, expect } from 'vitest';
import { VirtualFileSystem } from '../../engine/execution/VirtualFileSystem';
import { ExecutionEngine } from '../../engine/execution/ExecutionEngine';

describe('VirtualFileSystem boundaries', () => {
  it('builds a navigable tree including nested files and empty directories', async () => {
    const engine = new ExecutionEngine();
    await engine.createWorktree('tree-test', 'main', 'feature/tree');
    await engine.writeFile('tree-test', 'src/nested/main.ts', 'export const value = 1;');
    await engine.writeFile('tree-test', 'empty/temp.txt', 'temporary');
    await engine.deleteFile('tree-test', 'empty/temp.txt');
    const tree = await engine.getFileTree('tree-test');
    expect(tree.src).toMatchObject({
      type: 'directory',
      children: {
        nested: {
          type: 'directory',
          children: { 'main.ts': { type: 'file', path: 'src/nested/main.ts' } },
        },
      },
    });
    expect(tree.empty).toEqual({ type: 'directory', children: {} });
  });

  it('creates directories and preserves file content through export/import', async () => {
    const original = new VirtualFileSystem();
    await original.writeFile('src/nested/main.ts', 'export const value = 42;');
    const restored = new VirtualFileSystem();
    restored.import(original.export());
    expect(await restored.readFile('src/nested/main.ts')).toBe('export const value = 42;');
    await restored.deleteFile('src/nested/main.ts');
    expect(await restored.fileExists('src/nested/main.ts')).toBe(false);
    expect(await original.fileExists('src/nested/main.ts')).toBe(true);
  });

  it('rejects empty paths rather than creating an unnamed file', async () => {
    const fs = new VirtualFileSystem();
    await expect(fs.writeFile('/', 'text')).rejects.toThrow('File path must not be empty');
    await expect(fs.deleteFile('')).rejects.toThrow('File path must not be empty');
    expect(await fs.listFiles()).toEqual([]);
  });

  it('does not overwrite a directory or traverse a regular file', async () => {
    const fs = new VirtualFileSystem();
    await fs.writeFile('src/main.ts', 'original');
    await expect(fs.writeFile('src', 'replacement')).rejects.toThrow('Not a file');
    await expect(fs.writeFile('src/main.ts/child.ts', 'replacement')).rejects.toThrow(
      'Not a directory'
    );
    expect(await fs.readFile('src/main.ts')).toBe('original');
  });
});
