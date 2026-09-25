import { useState } from 'react';
import { AgentRun } from '../engine/types';
import {
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  Shield,
  Brain,
} from 'lucide-react';

interface AgentOutputPanelProps {
  runs: AgentRun[];
}

export function AgentOutputPanel({ runs }: AgentOutputPanelProps) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (role: string) => {
    switch (role) {
      case 'developer':
        return <Code size={14} className="text-indigo-400" />;
      case 'reviewer':
        return <Shield size={14} className="text-purple-400" />;
      case 'requirements':
        return <FileText size={14} className="text-blue-400" />;
      case 'planner':
        return <Brain size={14} className="text-green-400" />;
      default:
        return <Brain size={14} className="text-slate-400" />;
    }
  };

  const formatOutput = (output: string, _role: string) => {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return output;
    }
  };

  if (runs.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Agent Outputs</h3>
        <p className="text-xs text-slate-500">Execute a workflow to see agent outputs here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Agent Outputs</h3>
      <div className="space-y-2">
        {runs
          .slice()
          .reverse()
          .map((run) => (
            <div key={run.id} className="border border-dark-500 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                className="w-full flex items-center gap-3 p-3 bg-dark-700 hover:bg-dark-600 transition-colors text-left"
              >
                {getIcon(run.agentRole)}
                <span className="text-xs text-white font-medium capitalize flex-1">
                  {run.agentRole}
                </span>
                <span
                  className={`text-xs ${run.status === 'complete' ? 'text-success' : 'text-danger'}`}
                >
                  {run.status === 'complete' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                </span>
                <span className="text-xs text-slate-400">€{run.totalCost.toFixed(4)}</span>
                {expandedRun === run.id ? (
                  <ChevronUp size={14} className="text-slate-400" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400" />
                )}
              </button>

              {expandedRun === run.id && run.output && (
                <div className="bg-dark-900 p-4 border-t border-dark-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">
                      Model: {run.modelCalls[0]?.model || '—'} | Tokens: {run.totalTokens} |
                      Latency: {run.modelCalls[0]?.latency || 0}ms
                    </span>
                    <button
                      onClick={() => handleCopy(run.output || '', run.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <Copy size={12} />
                      {copiedId === run.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                    {formatOutput(run.output, run.agentRole)}
                  </pre>
                  {run.confidence && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-dark-500">
                      <span className="text-xs text-slate-500">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-dark-500 rounded-full overflow-hidden max-w-32">
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
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
