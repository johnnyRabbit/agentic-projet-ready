import { useState } from 'react';
import { mockWorkRequests } from '../data/mockData';
import { 
  Plus, 
  Upload, 
  Link2, 
  FileText, 
  GitBranch,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export function WorkRequest() {
  const [inputMode, setInputMode] = useState<'text' | 'url' | 'file' | 'jira' | 'github'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (inputValue.trim()) {
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Work Request</h1>
        <p className="text-slate-400 text-sm mt-1">
          Provide a user story, bug report, feature request, or any work item. The AI team will analyze, plan, and execute.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="col-span-2 space-y-6">
          {/* Source Selection */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Input Source</h2>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'text', label: 'Text', icon: <FileText size={14} /> },
                { id: 'url', label: 'URL', icon: <Link2 size={14} /> },
                { id: 'jira', label: 'Jira', icon: <AlertCircle size={14} /> },
                { id: 'github', label: 'GitHub', icon: <GitBranch size={14} /> },
                { id: 'file', label: 'File/PDF', icon: <Upload size={14} /> },
              ].map(source => (
                <button
                  key={source.id}
                  onClick={() => setInputMode(source.id as typeof inputMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    inputMode === source.id
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-dark-700 text-slate-400 hover:text-white border border-dark-500'
                  }`}
                >
                  {source.icon}
                  {source.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="relative">
              {inputMode === 'text' && (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste your user story, bug report, feature request, or requirements here...

Example:
US-124: Smart Charging Timeline
As an EV owner, I want to see a 7-day charging schedule so that I can optimize my charging costs based on electricity prices.

Acceptance Criteria:
- Timeline shows next 7 days with hourly granularity
- Off-peak hours are highlighted in green
- User can drag to reschedule charging sessions
- Real-time price updates from smart grid API"
                  className="w-full h-48 bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50"
                />
              )}
              {inputMode === 'url' && (
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://github.com/org/repo/issues/124"
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              )}
              {inputMode === 'jira' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="US-124"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Jira project URL or domain (e.g., company.atlassian.net)"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}
              {inputMode === 'github' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="org/repo#124"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Repository URL"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}
              {inputMode === 'file' && (
                <div className="border-2 border-dashed border-dark-500 rounded-lg p-8 text-center hover:border-indigo-500/30 transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300">Drop PDF, document, or design file here</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, PNG, FIG</p>
                </div>
              )}
            </div>

            {/* Repository field */}
            <div className="mt-4">
              <label className="text-xs text-slate-400 block mb-1.5">Target Repository</label>
              <input
                type="text"
                placeholder="https://github.com/org/repo"
                className="w-full bg-dark-700 border border-dark-500 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!inputValue.trim() || isAnalyzing}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                !inputValue.trim() || isAnalyzing
                  ? 'bg-dark-600 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Analyze & Implement
                </>
              )}
            </button>
          </div>

          {/* Analysis Result (shown after analysis) */}
          {!isAnalyzing && inputValue.trim() && (
            <div className="glass-card rounded-xl p-6 gradient-border animate-slide-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-success" />
                <h3 className="text-sm font-semibold text-white">Analysis Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-dark-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Requirements Found</div>
                  <div className="text-lg font-bold text-white">6</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Ambiguities Detected</div>
                  <div className="text-lg font-bold text-warning">2</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Estimated Effort</div>
                  <div className="text-lg font-bold text-white">8–12h</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Estimated AI Cost</div>
                  <div className="text-lg font-bold text-success">€2.74</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <ArrowRight size={14} />
                  Start Implementation
                </button>
                <button className="px-4 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm font-medium transition-colors border border-dark-400">
                  View Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Recent Requests</h2>
            <div className="space-y-3">
              {mockWorkRequests.map(wr => (
                <div key={wr.id} className="bg-dark-700 rounded-lg p-3 border border-dark-500 hover:border-indigo-500/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      wr.status === 'implementing' ? 'bg-indigo-400 animate-pulse-glow' :
                      wr.status === 'review' ? 'bg-purple-400' :
                      wr.status === 'planning' ? 'bg-warning' :
                      wr.status === 'intake' ? 'bg-slate-400' :
                      'bg-success'
                    }`} />
                    <span className="text-xs text-slate-500">{wr.source}</span>
                    <span className="text-xs text-slate-600 ml-auto">{wr.createdAt}</span>
                  </div>
                  <p className="text-xs text-white font-medium truncate">{wr.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{wr.project}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left bg-dark-700 hover:bg-dark-600 rounded-lg p-3 transition-colors border border-dark-500">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-indigo-400" />
                  <span className="text-xs text-white">Import from GitHub Issue</span>
                </div>
              </button>
              <button className="w-full text-left bg-dark-700 hover:bg-dark-600 rounded-lg p-3 transition-colors border border-dark-500">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-blue-400" />
                  <span className="text-xs text-white">Import from Jira</span>
                </div>
              </button>
              <button className="w-full text-left bg-dark-700 hover:bg-dark-600 rounded-lg p-3 transition-colors border border-dark-500">
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-purple-400" />
                  <span className="text-xs text-white">Freelance Opportunity</span>
                </div>
              </button>
              <button className="w-full text-left bg-dark-700 hover:bg-dark-600 rounded-lg p-3 transition-colors border border-dark-500">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-green-400" />
                  <span className="text-xs text-white">From Requirements Doc</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
