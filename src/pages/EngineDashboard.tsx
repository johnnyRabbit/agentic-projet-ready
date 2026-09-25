import { useEffect, useRef } from 'react';
import { useEngineStore } from '../store/engineStore';
import { AgentOutputPanel } from '../components/AgentOutputPanel';
import {
  Play,
  Zap,
  Cpu,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Terminal,
  Settings,
  Activity,
  Brain,
  FileCode,
  GitBranch,
} from 'lucide-react';

export function EngineDashboard() {
  const {
    isInitialized,
    isGroqConnected,
    groqApiKey,
    isExecuting,
    executionLog,
    activeWorkflow,
    completedRuns,
    costRecords,
    initialize,
    setGroqApiKey,
    testGroqConnection,
    executeWorkflow,
    modelRouter,
    budgetEngine,
    agentRegistry,
    currentProjectId,
  } = useEngineStore();

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize().catch((err) => console.error('Failed to initialize:', err));
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLog]);

  const totalCost = costRecords.reduce((sum, r) => sum + r.cost, 0);
  const totalTokens = costRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);

  const handleExecute = async (type: 'user-story' | 'bug-fix' | 'feature') => {
    const inputs = {
      'user-story':
        'US-124: Smart Charging Timeline\nAs an EV owner, I want to see a 7-day charging schedule so that I can optimize my charging costs based on electricity prices.\n\nAcceptance Criteria:\n- Timeline shows next 7 days with hourly granularity\n- Off-peak hours highlighted in green\n- User can drag to reschedule charging sessions\n- Real-time price updates from smart grid API',
      'bug-fix':
        'BUG-89: Notification badge not updating when new notifications arrive via WebSocket. The badge count stays at 0 even when notifications are received.',
      feature:
        'FEATURE-42: Add dark mode support to the application. Users should be able to toggle between light and dark themes. The preference should persist across sessions.',
    };
    await executeWorkflow(type, inputs[type]);
  };

  if (!isInitialized) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Cpu size={24} className="text-indigo-400" />
            Engine Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Agent Harness • Model Router • Budget Engine • Context Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              isGroqConnected
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-dark-700 text-slate-400 border border-dark-500'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isGroqConnected ? 'bg-success' : 'bg-slate-500'}`}
            />
            {isGroqConnected ? 'Groq Connected' : 'Simulation Mode'}
          </div>
          <button
            onClick={() => testGroqConnection()}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 rounded-lg text-xs border border-dark-500 transition-colors"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Groq API Key */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Settings size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400">Groq API Key:</span>
          <input
            type="password"
            value={groqApiKey}
            onChange={(e) => setGroqApiKey(e.target.value)}
            placeholder="gsk_... (leave empty for simulation mode)"
            className="flex-1 bg-dark-700 border border-dark-500 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <span className="text-xs text-slate-500">
            {!groqApiKey ? 'Using realistic simulation' : 'Using live Groq API'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-indigo-400" />
            <span className="text-xs text-slate-400">Agent Runs</span>
          </div>
          <div className="text-xl font-bold text-white">{completedRuns.length}</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-success" />
            <span className="text-xs text-slate-400">Total Cost</span>
          </div>
          <div className="text-xl font-bold text-white">€{totalCost.toFixed(4)}</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={14} className="text-purple-400" />
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="text-xl font-bold text-white">{(totalTokens / 1000).toFixed(1)}k</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-warning" />
            <span className="text-xs text-slate-400">Avg Latency</span>
          </div>
          <div className="text-xl font-bold text-white">
            {costRecords.length > 0
              ? `${Math.round(costRecords.reduce((s, r) => s + r.latency, 0) / costRecords.length)}ms`
              : '—'}
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={14} className="text-pink-400" />
            <span className="text-xs text-slate-400">Models Available</span>
          </div>
          <div className="text-xl font-bold text-white">
            {modelRouter.getActiveProviders().length > 0 ? '5' : '0'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Execute Workflow */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Play size={16} className="text-indigo-400" />
              Execute Workflow
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleExecute('user-story')}
                disabled={isExecuting}
                className="w-full flex items-center gap-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-3 border border-dark-500 transition-all text-left"
              >
                <FileCode size={18} className="text-indigo-400" />
                <div>
                  <div className="text-sm text-white font-medium">User Story Delivery</div>
                  <div className="text-xs text-slate-400">
                    Full pipeline: Requirements → Plan → Code → Test → Review
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleExecute('bug-fix')}
                disabled={isExecuting}
                className="w-full flex items-center gap-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-3 border border-dark-500 transition-all text-left"
              >
                <AlertTriangle size={18} className="text-warning" />
                <div>
                  <div className="text-sm text-white font-medium">Bug Fix</div>
                  <div className="text-xs text-slate-400">
                    Lightweight: Analyze → Fix → Test → Review
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleExecute('feature')}
                disabled={isExecuting}
                className="w-full flex items-center gap-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-3 border border-dark-500 transition-all text-left"
              >
                <Zap size={18} className="text-purple-400" />
                <div>
                  <div className="text-sm text-white font-medium">Feature Delivery</div>
                  <div className="text-xs text-slate-400">Full feature with architecture phase</div>
                </div>
              </button>
            </div>
          </div>

          {/* Available Agents */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Agent Registry</h2>
            <div className="space-y-2">
              {agentRegistry.getAll().map((agent) => (
                <div key={agent.id} className="flex items-center gap-2 bg-dark-700 rounded p-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isExecuting &&
                      activeWorkflow?.steps.some(
                        (s) => s.agentRole === agent.role && s.status === 'running'
                      )
                        ? 'bg-success animate-pulse-glow'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs text-white font-medium flex-1">{agent.name}</span>
                  <span className="text-xs text-slate-500">{agent.preferredModel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Router */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Model Router</h2>
            <div className="space-y-2">
              {modelRouter.getActiveProviders().map((provider) => {
                const p = modelRouter.getProvider(provider);
                return p?.getModels().map((model) => (
                  <div key={model.id} className="flex items-center gap-2 bg-dark-700 rounded p-2.5">
                    <Cpu size={12} className="text-indigo-400" />
                    <span className="text-xs text-white flex-1 font-mono">{model.id}</span>
                    <span className="text-xs text-slate-500">{model.speed}</span>
                  </div>
                ));
              })}
            </div>
          </div>
        </div>

        {/* Center: Workflow Execution */}
        <div className="space-y-6">
          {/* Active Workflow */}
          {activeWorkflow && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <GitBranch size={16} className="text-indigo-400" />
                  {activeWorkflow.name}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeWorkflow.status === 'complete'
                      ? 'bg-success/20 text-success'
                      : activeWorkflow.status === 'failed'
                        ? 'bg-danger/20 text-danger'
                        : activeWorkflow.status === 'running'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {activeWorkflow.status}
                </span>
              </div>

              <div className="space-y-2">
                {activeWorkflow.steps.map((step, i) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      step.status === 'running'
                        ? 'bg-indigo-500/5 border-indigo-500/30'
                        : step.status === 'complete'
                          ? 'bg-success/5 border-success/20'
                          : step.status === 'failed'
                            ? 'bg-danger/5 border-danger/20'
                            : 'bg-dark-700 border-dark-500'
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-600 text-xs font-bold text-slate-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-medium">{step.name}</span>
                        {step.status === 'running' && (
                          <Loader2 size={12} className="animate-spin text-indigo-400" />
                        )}
                        {step.status === 'complete' && (
                          <CheckCircle2 size={12} className="text-success" />
                        )}
                        {step.status === 'failed' && <XCircle size={12} className="text-danger" />}
                      </div>
                      <span className="text-xs text-slate-500">{step.agentRole} agent</span>
                    </div>
                    {step.status === 'complete' && step.completedAt && step.startedAt && (
                      <span className="text-xs text-slate-400">
                        {Math.round(
                          (new Date(step.completedAt).getTime() -
                            new Date(step.startedAt).getTime()) /
                            1000
                        )}
                        s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Log */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Terminal size={16} className="text-green-400" />
              Execution Log
            </h2>
            <div className="bg-dark-900 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto">
              {executionLog.length === 0 ? (
                <p className="text-slate-500">
                  No execution yet. Click a workflow button to start.
                </p>
              ) : (
                executionLog.map((log, i) => (
                  <div key={i} className="py-0.5 text-slate-300">
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                    {log}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Completed Runs */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Agent Runs</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {completedRuns.length === 0 ? (
                <p className="text-xs text-slate-500">No runs yet.</p>
              ) : (
                completedRuns
                  .slice()
                  .reverse()
                  .map((run) => (
                    <div key={run.id} className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${run.status === 'complete' ? 'bg-success' : 'bg-danger'}`}
                        />
                        <span className="text-xs text-white font-medium capitalize">
                          {run.agentRole}
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          €{run.totalCost.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{run.totalTokens} tokens</span>
                        <span>{run.modelCalls[0]?.model || '—'}</span>
                        <span>{run.modelCalls[0]?.latency || 0}ms</span>
                      </div>
                      {run.confidence && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs text-slate-500">Confidence:</span>
                          <div className="flex-1 h-1 bg-dark-500 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                run.confidence > 0.8
                                  ? 'bg-success'
                                  : run.confidence > 0.6
                                    ? 'bg-warning'
                                    : 'bg-danger'
                              }`}
                              style={{ width: `${run.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-white">
                            {(run.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Cost Breakdown</h2>
            {costRecords.length === 0 ? (
              <p className="text-xs text-slate-500">No costs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {budgetEngine.getCostBreakdown(currentProjectId).map((item) => (
                  <div key={item.phase} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 capitalize">{item.phase}</span>
                    <div className="flex-1 h-2 bg-dark-500 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white w-16 text-right">
                      €{item.cost.toFixed(4)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-dark-500 flex justify-between text-xs">
                  <span className="text-slate-400">Total</span>
                  <span className="text-white font-medium">€{totalCost.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Agent Outputs */}
          <AgentOutputPanel runs={completedRuns} />
        </div>
      </div>
    </div>
  );
}
