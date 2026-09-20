import { useState, useEffect } from 'react';
import { database } from '../persistence/Database';
import { browserFileSystem } from '../filesystem/BrowserFileSystem';
import { analyticsEngine } from '../analytics/AnalyticsEngine';
import { webWorkerSandbox } from '../sandbox/WebWorkerSandbox';
import { 
  Database as DatabaseIcon, 
  Folder, 
  TrendingUp, 
  Cpu, 
  Download, 
  Upload,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HardDrive,
  Activity
} from 'lucide-react';

export function PlatformDashboard() {
  const [dbStats, setDbStats] = useState<any>(null);
  const [fsAvailable, setFsAvailable] = useState(false);
  const [fsDirName, setFsDirName] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Database stats
    const stats = await database.getStats();
    setDbStats(stats);

    // File system availability
    setFsAvailable(browserFileSystem.isAvailable());
    setFsDirName(browserFileSystem.getDirectoryName());

    // Analytics
    const summary = await analyticsEngine.getSummary();
    setAnalytics(summary);

    // Worker sandbox
    await webWorkerSandbox.initialize();
    setWorkerReady(true);
  };

  const handleSelectDirectory = async () => {
    const success = await browserFileSystem.selectDirectory();
    if (success) {
      setFsDirName(browserFileSystem.getDirectoryName());
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await database.exportAll();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-engineering-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        await database.importAll(text);
        await loadData();
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data: ' + (error as Error).message);
      } finally {
        setIsImporting(false);
      }
    };

    input.click();
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    await database.clear('projects');
    await database.clear('worktrees');
    await database.clear('pullRequests');
    await database.clear('agentRuns');
    await database.clear('decisions');
    await database.clear('events');
    
    await loadData();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return (ms / 60000).toFixed(1) + 'm';
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <HardDrive size={24} className="text-indigo-400" />
          Platform Status
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          System Health • Persistence • Analytics • Configuration
        </p>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Database */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DatabaseIcon size={20} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Database</h2>
            <CheckCircle2 size={16} className="text-success ml-auto" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-success">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Projects:</span>
              <span className="text-white">{dbStats?.projects || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deliveries:</span>
              <span className="text-white">{dbStats?.pullRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Size:</span>
              <span className="text-white">{dbStats ? formatBytes(dbStats.totalSize) : '0 B'}</span>
            </div>
          </div>
        </div>

        {/* File System */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Folder size={20} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">File System</h2>
            {fsAvailable ? (
              <CheckCircle2 size={16} className="text-success ml-auto" />
            ) : (
              <XCircle size={16} className="text-warning ml-auto" />
            )}
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">API:</span>
              <span className={fsAvailable ? 'text-success' : 'text-warning'}>
                {fsAvailable ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Directory:</span>
              <span className="text-white truncate ml-2">
                {fsDirName || 'Not selected'}
              </span>
            </div>
            {!fsDirName && fsAvailable && (
              <button
                onClick={handleSelectDirectory}
                className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-xs transition-colors"
              >
                Select Directory
              </button>
            )}
          </div>
        </div>

        {/* Web Worker */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={20} className="text-green-400" />
            <h2 className="text-sm font-semibold text-white">Sandbox</h2>
            <CheckCircle2 size={16} className="text-success ml-auto" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={workerReady ? 'text-success' : 'text-slate-400'}>
                {workerReady ? 'Ready' : 'Initializing...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="text-white">Web Worker</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Isolation:</span>
              <span className="text-success">Full</span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-white">Analytics</h2>
            <CheckCircle2 size={16} className="text-success ml-auto" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cost:</span>
              <span className="text-white">€{analytics?.totalCost.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className="text-success">{analytics?.successRate.toFixed(0) || '0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Duration:</span>
              <span className="text-white">
                {analytics ? formatDuration(analytics.averageDurationPerDelivery) : '0ms'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Download size={16} className="text-indigo-400" />
            Data Management
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 rounded-lg p-3 border border-dark-500 transition-colors text-left"
            >
              <Download size={16} className="text-indigo-400" />
              <div>
                <div className="text-sm text-white font-medium">Export All Data</div>
                <div className="text-xs text-slate-400">Download backup as JSON</div>
              </div>
            </button>

            <button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full flex items-center gap-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 rounded-lg p-3 border border-dark-500 transition-colors text-left"
            >
              <Upload size={16} className="text-green-400" />
              <div>
                <div className="text-sm text-white font-medium">Import Data</div>
                <div className="text-xs text-slate-400">Restore from backup</div>
              </div>
            </button>

            <button
              onClick={handleClearData}
              className="w-full flex items-center gap-2 bg-dark-700 hover:bg-danger/20 rounded-lg p-3 border border-dark-500 transition-colors text-left"
            >
              <XCircle size={16} className="text-danger" />
              <div>
                <div className="text-sm text-white font-medium">Clear All Data</div>
                <div className="text-xs text-slate-400">Remove all projects and history</div>
              </div>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-purple-400" />
            Top Agents
          </h2>
          <div className="space-y-2">
            {analytics?.topAgents?.slice(0, 5).map((agent: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium capitalize">{agent.role}</div>
                  <div className="text-xs text-slate-400">{agent.count} runs</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">€{agent.cost.toFixed(2)}</div>
                </div>
              </div>
            )) || <p className="text-xs text-slate-500">No agent data yet</p>}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {analytics?.costByPhase && analytics.costByPhase.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Cost by Phase</h2>
          <div className="space-y-3">
            {analytics.costByPhase.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24">{item.phase}</span>
                <div className="flex-1 h-2 bg-dark-500 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-white w-20 text-right">
                  €{item.cost.toFixed(2)} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadData}
          className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-dark-500"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    </div>
  );
}
