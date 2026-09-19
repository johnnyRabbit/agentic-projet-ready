import { mockPR, mockDecisions, mockQuestions } from '../data/mockData';
import { 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Scale,
  MessageSquare,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export function Reviews() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reviews & Approvals</h1>
        <p className="text-slate-400 text-sm mt-1">Items requiring your attention as Tech Lead / CTO</p>
      </div>

      <div className="space-y-6">
        {/* PR Ready for Review */}
        <div className="glass-card rounded-xl p-6 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GitPullRequest size={20} className="text-success" />
              <div>
                <h2 className="text-lg font-semibold text-white">Pull Request #{mockPR.number}</h2>
                <p className="text-sm text-slate-400">{mockPR.title}</p>
              </div>
            </div>
            <span className="bg-success/20 text-success text-xs px-3 py-1 rounded-full font-medium">
              Ready for Review
            </span>
          </div>

          {/* Verification Checklist */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Requirements', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Implementation', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Tests', status: 'passed', icon: <CheckCircle2 size={14} />, detail: `${mockPR.testsPassing}/${mockPR.testsTotal}` },
              { label: 'Agent Review', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Security Review', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Typecheck', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Lint', status: 'passed', icon: <CheckCircle2 size={14} /> },
              { label: 'Risk', status: mockPR.risk, icon: <Shield size={14} /> },
            ].map((item, i) => (
              <div key={i} className={`bg-dark-700 rounded-lg p-3 flex items-center gap-2 ${
                item.status === 'passed' ? 'border border-success/20' :
                item.status === 'low' ? 'border border-success/20' :
                'border border-warning/20'
              }`}>
                <span className={item.status === 'passed' || item.status === 'low' ? 'text-success' : 'text-warning'}>
                  {item.icon}
                </span>
                <div>
                  <div className="text-xs text-slate-300">{item.label}</div>
                  {item.detail && <div className="text-xs text-success">{item.detail} ✓</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{mockPR.filesChanged}</div>
              <div className="text-xs text-slate-400">Files Changed</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-success">+{mockPR.linesAdded}</div>
              <div className="text-xs text-slate-400">Lines Added</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-danger">-{mockPR.linesRemoved}</div>
              <div className="text-xs text-slate-400">Lines Removed</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{mockPR.estimatedHumanEffort}</div>
              <div className="text-xs text-slate-400">Human Effort Saved</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-success">€{mockPR.agentCost}</div>
              <div className="text-xs text-slate-400">AI Cost</div>
            </div>
          </div>

          {/* Attention items */}
          {(mockPR.decisionsRequiringAttention > 0 || mockPR.knownLimitations > 0) && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-warning" />
                <span className="text-xs font-medium text-warning">Items Requiring Attention</span>
              </div>
              <div className="flex gap-4 text-xs text-slate-300">
                <span>{mockPR.decisionsRequiringAttention} decisions need review</span>
                <span>{mockPR.knownLimitations} known limitation(s)</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-success hover:bg-success/90 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <ThumbsUp size={16} />
              Approve & Merge
            </button>
            <button className="flex-1 bg-dark-600 hover:bg-dark-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-dark-400 flex items-center justify-center gap-2">
              <ExternalLink size={16} />
              Review Code
            </button>
            <button className="bg-dark-600 hover:bg-dark-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-dark-400 flex items-center justify-center gap-2">
              <ThumbsDown size={16} />
              Request Changes
            </button>
          </div>
        </div>

        {/* Decisions Requiring Review */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={18} className="text-warning" />
            <h2 className="text-sm font-semibold text-white">Decisions Requiring Review</h2>
            <span className="bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full ml-2">
              {mockDecisions.filter(d => d.status === 'escalated').length}
            </span>
          </div>
          <div className="space-y-3">
            {mockDecisions.filter(d => d.status === 'escalated').map(decision => (
              <div key={decision.id} className="bg-dark-700 rounded-lg p-4 border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{decision.title}</h3>
                  <span className="text-xs text-warning">Needs Decision</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{decision.context}</p>
                <div className="space-y-1.5 mb-3">
                  {decision.agents.map((agent, i) => (
                    <div key={i} className="text-xs text-slate-300 bg-dark-600 rounded p-2">
                      <span className="text-indigo-300 font-medium">{agent.name}:</span> {agent.position}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="bg-success/20 hover:bg-success/30 text-success px-3 py-1.5 rounded text-xs font-medium transition-colors">
                    Option A
                  </button>
                  <button className="bg-dark-600 hover:bg-dark-500 text-white px-3 py-1.5 rounded text-xs font-medium border border-dark-400">
                    Option B
                  </button>
                  <button className="bg-dark-600 hover:bg-dark-500 text-white px-3 py-1.5 rounded text-xs font-medium border border-dark-400">
                    Custom Decision
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-info" />
            <h2 className="text-sm font-semibold text-white">Blocking Questions</h2>
            <span className="bg-info/20 text-info text-xs px-2 py-0.5 rounded-full ml-2">
              {mockQuestions.filter(q => q.status === 'open' && q.priority === 'blocking').length}
            </span>
          </div>
          <div className="space-y-3">
            {mockQuestions.filter(q => q.status === 'open').map(q => (
              <div key={q.id} className="bg-dark-700 rounded-lg p-4 border border-dark-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.priority === 'blocking' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  }`}>{q.priority.toUpperCase()}</span>
                  <span className="text-xs text-slate-400">Confidence: {q.confidence}%</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, i) => (
                    <button key={i} className="bg-dark-600 hover:bg-dark-500 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs border border-dark-400 transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
                {q.recommendation && (
                  <div className="mt-3 text-xs text-indigo-300 bg-indigo-500/10 rounded p-2">
                    💡 AI recommends: {q.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
