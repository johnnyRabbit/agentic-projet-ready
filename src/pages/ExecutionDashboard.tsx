import { useState, useEffect, useCallback } from 'react';
import { ExecutionEngine } from '../engine/execution/ExecutionEngine';
import { Worktree, TestSuiteResult } from '../engine/execution/types';
import {
  Folder,
  File,
  GitBranch,
  GitCommit,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Code,
  Terminal,
} from 'lucide-react';

export function ExecutionDashboard() {
  const [engine] = useState(() => new ExecutionEngine());
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [selectedWorktree, setSelectedWorktree] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [testResults, setTestResults] = useState<TestSuiteResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');

  const loadWorktrees = useCallback(async () => {
    const wt = await engine.listWorktrees();
    setWorktrees(wt);
  }, [engine]);

  useEffect(() => {
    loadWorktrees();
  }, [loadWorktrees]);

  const createWorktree = async () => {
    const id = `wt-${Date.now()}`;
    const wt = await engine.createWorktree(id, 'main', `feature/${id}`);
    setWorktrees([...worktrees, wt]);
    setSelectedWorktree(id);
  };

  const selectWorktree = async (id: string) => {
    setSelectedWorktree(id);
    const fileList = await engine.listFiles(id);
    setFiles(fileList);
    setTestResults(null);
    setCommandOutput('');
  };

  const selectFile = async (path: string) => {
    if (!selectedWorktree) return;
    setSelectedFile(path);
    const content = await engine.readFile(selectedWorktree, path);
    setFileContent(content);
  };

  const saveFile = async () => {
    if (!selectedWorktree || !selectedFile) return;
    await engine.writeFile(selectedWorktree, selectedFile, fileContent);
    setCommandOutput(`✓ Saved ${selectedFile}`);
  };

  const createFile = async () => {
    if (!selectedWorktree) return;
    const fileName = prompt('Enter file path (e.g., src/new-file.ts):');
    if (!fileName) return;

    await engine.writeFile(selectedWorktree, fileName, '// New file\n');
    const fileList = await engine.listFiles(selectedWorktree);
    setFiles(fileList);
    setCommandOutput(`✓ Created ${fileName}`);
  };

  const deleteFile = async () => {
    if (!selectedWorktree || !selectedFile) return;
    if (!confirm(`Delete ${selectedFile}?`)) return;

    await engine.deleteFile(selectedWorktree, selectedFile);
    const fileList = await engine.listFiles(selectedWorktree);
    setFiles(fileList);
    setSelectedFile(null);
    setFileContent('');
    setCommandOutput(`✓ Deleted ${selectedFile}`);
  };

  const runTests = async () => {
    if (!selectedWorktree) return;
    setIsRunning(true);
    setCommandOutput('Running tests...\n');

    const results = await engine.runTests(selectedWorktree);
    setTestResults(results);

    let output = `Test Results:\n`;
    output += `Suite: ${results.suite}\n`;
    output += `Passed: ${results.passed}\n`;
    output += `Failed: ${results.failed}\n`;
    output += `Skipped: ${results.skipped}\n`;
    output += `Duration: ${results.duration}ms\n\n`;

    for (const test of results.tests) {
      const icon = test.status === 'pass' ? '✓' : test.status === 'fail' ? '✗' : '○';
      output += `${icon} ${test.name} (${test.duration}ms)\n`;
      if (test.error) {
        output += `  Error: ${test.error}\n`;
      }
    }

    setCommandOutput(output);
    setIsRunning(false);
  };

  const buildProject = async () => {
    if (!selectedWorktree) return;
    setIsRunning(true);
    setCommandOutput('Building project...\n');

    const result = await engine.build(selectedWorktree);

    let output = `Build Result:\n`;
    output += `Status: ${result.success ? 'SUCCESS' : 'FAILED'}\n`;
    output += `Exit Code: ${result.exitCode}\n`;
    output += `Duration: ${result.duration}ms\n\n`;
    output += result.output || result.error || '';

    setCommandOutput(output);
    setIsRunning(false);
  };

  const lintProject = async () => {
    if (!selectedWorktree) return;
    setIsRunning(true);
    setCommandOutput('Linting project...\n');

    const result = await engine.lint(selectedWorktree);

    let output = `Lint Result:\n`;
    output += `Status: ${result.success ? 'SUCCESS' : 'FAILED'}\n`;
    output += `Exit Code: ${result.exitCode}\n`;
    output += `Duration: ${result.duration}ms\n\n`;
    output += result.output || result.error || '';

    setCommandOutput(output);
    setIsRunning(false);
  };

  const commitChanges = async () => {
    if (!selectedWorktree) return;
    const message = prompt('Enter commit message:');
    if (!message) return;

    const commit = await engine.commit(selectedWorktree, message, 'AI Agent');
    setCommandOutput(`✓ Committed: ${commit.hash.substring(0, 7)} - ${message}`);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Terminal size={24} className="text-indigo-400" />
          Execution Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Virtual Filesystem • Git Worktrees • Test Runner • Build System
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left: Worktrees */}
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitBranch size={16} className="text-indigo-400" />
                Worktrees
              </h2>
              <button
                onClick={createWorktree}
                className="p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded transition-colors"
              >
                <Plus size={14} className="text-white" />
              </button>
            </div>

            <div className="space-y-2">
              {worktrees.length === 0 ? (
                <p className="text-xs text-slate-500">No worktrees yet. Create one to start.</p>
              ) : (
                worktrees.map((wt) => (
                  <button
                    key={wt.id}
                    onClick={() => selectWorktree(wt.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedWorktree === wt.id
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-dark-700 border-dark-500 hover:border-indigo-500/20'
                    }`}
                  >
                    <div className="text-xs text-white font-medium">{wt.branch}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {wt.commits.length} commit(s) • Created{' '}
                      {new Date(wt.createdAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          {selectedWorktree && (
            <div className="glass-card rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 rounded-lg p-2.5 border border-dark-500 transition-colors text-left"
                >
                  <Play size={14} className="text-green-400" />
                  <span className="text-xs text-white">Run Tests</span>
                </button>
                <button
                  onClick={buildProject}
                  disabled={isRunning}
                  className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 rounded-lg p-2.5 border border-dark-500 transition-colors text-left"
                >
                  <Code size={14} className="text-blue-400" />
                  <span className="text-xs text-white">Build</span>
                </button>
                <button
                  onClick={lintProject}
                  disabled={isRunning}
                  className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 rounded-lg p-2.5 border border-dark-500 transition-colors text-left"
                >
                  <CheckCircle2 size={14} className="text-purple-400" />
                  <span className="text-xs text-white">Lint</span>
                </button>
                <button
                  onClick={commitChanges}
                  className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 rounded-lg p-2.5 border border-dark-500 transition-colors text-left"
                >
                  <GitCommit size={14} className="text-orange-400" />
                  <span className="text-xs text-white">Commit</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: File Browser */}
        <div className="col-span-2 space-y-4">
          {selectedWorktree ? (
            <>
              {/* File List */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Folder size={16} className="text-yellow-400" />
                    Files
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={createFile}
                      className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded border border-dark-500 transition-colors"
                    >
                      <Plus size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => selectWorktree(selectedWorktree)}
                      className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded border border-dark-500 transition-colors"
                    >
                      <RefreshCw size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-xs text-slate-500">No files yet.</p>
                  ) : (
                    files.map((file) => (
                      <button
                        key={file}
                        onClick={() => selectFile(file)}
                        className={`w-full text-left flex items-center gap-2 p-2 rounded transition-colors ${
                          selectedFile === file
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'hover:bg-dark-700 text-slate-300'
                        }`}
                      >
                        <File size={14} className="text-slate-400" />
                        <span className="text-xs font-mono">{file}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* File Editor */}
              {selectedFile && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <File size={16} className="text-blue-400" />
                      {selectedFile}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={saveFile}
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded text-xs text-white transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={deleteFile}
                        className="p-1.5 bg-dark-700 hover:bg-danger/20 rounded border border-dark-500 transition-colors"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-64 bg-dark-900 border border-dark-500 rounded-lg p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Folder size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">Select or create a worktree to browse files</p>
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          {/* Test Results */}
          {testResults && (
            <div className="glass-card rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                Test Results
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-success/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-success">{testResults.passed}</div>
                  <div className="text-xs text-slate-400">Passed</div>
                </div>
                <div className="bg-danger/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-danger">{testResults.failed}</div>
                  <div className="text-xs text-slate-400">Failed</div>
                </div>
                <div className="bg-slate-500/10 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-slate-400">{testResults.skipped}</div>
                  <div className="text-xs text-slate-400">Skipped</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-2">Duration: {testResults.duration}ms</div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {testResults.tests.map((test, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {test.status === 'pass' ? (
                      <CheckCircle2 size={12} className="text-success mt-0.5" />
                    ) : test.status === 'fail' ? (
                      <XCircle size={12} className="text-danger mt-0.5" />
                    ) : (
                      <Clock size={12} className="text-slate-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-slate-300">{test.name}</div>
                      <div className="text-slate-500">{test.duration}ms</div>
                      {test.error && <div className="text-danger mt-1">{test.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Command Output */}
          <div className="glass-card rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Terminal size={16} className="text-green-400" />
              Output
            </h2>

            <div className="bg-dark-900 rounded-lg p-3 font-mono text-xs max-h-96 overflow-y-auto">
              {commandOutput ? (
                <pre className="text-slate-300 whitespace-pre-wrap">{commandOutput}</pre>
              ) : (
                <p className="text-slate-500">No output yet. Run a command to see results.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
