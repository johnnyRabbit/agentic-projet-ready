import { useState } from 'react';
import { DeliveryEngine, DeliveryResult } from '../engine/delivery/DeliveryEngine';
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitPullRequest, 
  FileCode, 
  Shield,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';

export function DeliveryDashboard() {
  const [engine] = useState(() => new DeliveryEngine());
  const [isDelivering, setIsDelivering] = useState(false);
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [userStory, setUserStory] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleDeliver = async () => {
    if (!userStory.trim()) return;

    setIsDelivering(true);
    setResult(null);

    // Simulate requirements extraction
    const requirements = [
      userStory,
      'Implementation must be tested',
      'Code must pass linting',
      'Security review required'
    ];

    // Simulate code generation
    const code = {
      'src/feature.ts': `// Auto-generated implementation
export class Feature {
  constructor() {
    console.log('Feature initialized');
  }

  execute() {
    return 'Feature executed successfully';
  }
}

export default Feature;
`,
      'src/feature.test.ts': `import { describe, it, expect } from 'vitest';
import Feature from './feature';

describe('Feature', () => {
  it('should initialize', () => {
    const feature = new Feature();
    expect(feature).toBeDefined();
  });

  it('should execute', () => {
    const feature = new Feature();
    const result = feature.execute();
    expect(result).toBe('Feature executed successfully');
  });
});
`,
      'README.md': `# Feature Implementation

${userStory}

## Implementation

This feature was implemented autonomously by the AI Engineering Team.

## Testing

All tests passing. See test results in CI/CD pipeline.
`
    };

    const deliveryResult = await engine.deliver({
      userStory,
      requirements,
      plan: 'Implementation plan generated',
      code
    });

    setResult(deliveryResult);
    setIsDelivering(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Rocket size={24} className="text-indigo-400" />
          Delivery Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          End-to-End Delivery: User Story → Pull Request
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">User Story</h2>
        <textarea
          value={userStory}
          onChange={(e) => setUserStory(e.target.value)}
          placeholder="Enter your user story here...

Example:
As a user, I want to filter notifications by unread status so that I can focus on important messages.

Acceptance Criteria:
- Filter button in notification list
- Toggle between all/unread
- Persist filter preference"
          className="w-full h-32 bg-dark-700 border border-dark-500 rounded-lg p-4 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50"
        />
        <button
          onClick={handleDeliver}
          disabled={isDelivering || !userStory.trim()}
          className="mt-4 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
        >
          {isDelivering ? (
            <>
              <Clock size={16} className="animate-spin" />
              Delivering...
            </>
          ) : (
            <>
              <Rocket size={16} />
              Deliver to Pull Request
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`glass-card rounded-xl p-6 ${
            result.success ? 'border-l-4 border-l-success' : 'border-l-4 border-l-danger'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle2 size={32} className="text-success" />
                ) : (
                  <XCircle size={32} className="text-danger" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {result.success ? 'Delivery Successful' : 'Delivery Failed'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {result.success 
                      ? `Pull Request #${result.pullRequest?.number} ready for review`
                      : `${result.errors.length} error(s) occurred`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{(result.duration / 1000).toFixed(1)}s</div>
                <div className="text-xs text-slate-400">Total Duration</div>
              </div>
            </div>
          </div>

          {/* Pull Request Card */}
          {result.pullRequest && (
            <div className="glass-card rounded-xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GitPullRequest size={24} className="text-success" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Pull Request #{result.pullRequest.number}
                    </h3>
                    <p className="text-sm text-slate-400">{result.pullRequest.title}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  result.pullRequest.status === 'approved' ? 'bg-success/20 text-success' :
                  result.pullRequest.status === 'review' ? 'bg-warning/20 text-warning' :
                  'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {result.pullRequest.status}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{result.pullRequest.stats.files}</div>
                  <div className="text-xs text-slate-400">Files Changed</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-success">+{result.pullRequest.stats.additions}</div>
                  <div className="text-xs text-slate-400">Lines Added</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{result.pullRequest.checks.length}</div>
                  <div className="text-xs text-slate-400">Checks Passed</div>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{result.pullRequest.reviews.length}</div>
                  <div className="text-xs text-slate-400">Reviews</div>
                </div>
              </div>

              {/* Cost Report */}
              <div className="bg-dark-700 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-400" />
                  Cost Report
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">AI Cost</div>
                    <div className="text-lg font-bold text-white">€{result.costReport.totalCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Agent Time</div>
                    <div className="text-lg font-bold text-white">{result.costReport.agentDuration}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Human Effort Saved</div>
                    <div className="text-lg font-bold text-success">{result.costReport.estimatedHumanEffort}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-success hover:bg-success/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  ✓ Approve & Merge
                </button>
                <button className="flex-1 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-dark-400">
                  Review Code
                </button>
                <button
                  onClick={() => copyToClipboard(result.pullRequest?.description || '')}
                  className="px-4 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm font-medium transition-colors border border-dark-400 flex items-center gap-2"
                >
                  <Copy size={14} />
                  Copy PR Description
                </button>
              </div>
            </div>
          )}

          {/* Pipeline Results */}
          {result.pipeline && (
            <CollapsibleSection
              title="CI/CD Pipeline"
              icon={<CheckCircle2 size={16} className="text-success" />}
              isExpanded={expandedSection === 'pipeline'}
              onToggle={() => setExpandedSection(expandedSection === 'pipeline' ? null : 'pipeline')}
            >
              <div className="space-y-2">
                {result.pipeline.stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
                    {stage.status === 'success' ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : stage.status === 'failure' ? (
                      <XCircle size={16} className="text-danger" />
                    ) : (
                      <Clock size={16} className="text-slate-400" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{stage.name}</div>
                      {stage.output && (
                        <div className="text-xs text-slate-400 mt-0.5">{stage.output}</div>
                      )}
                    </div>
                    {stage.duration && (
                      <div className="text-xs text-slate-400">{stage.duration}ms</div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Traceability */}
          {result.traceability.length > 0 && (
            <CollapsibleSection
              title="Traceability"
              icon={<FileCode size={16} className="text-blue-400" />}
              isExpanded={expandedSection === 'traceability'}
              onToggle={() => setExpandedSection(expandedSection === 'traceability' ? null : 'traceability')}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-dark-500">
                      <th className="text-left py-2 px-3">Requirement</th>
                      <th className="text-left py-2 px-3">User Story</th>
                      <th className="text-left py-2 px-3">Task</th>
                      <th className="text-left py-2 px-3">Commit</th>
                      <th className="text-left py-2 px-3">Test</th>
                      <th className="text-left py-2 px-3">PR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.traceability.map((link, i) => (
                      <tr key={i} className="border-b border-dark-600">
                        <td className="py-2 px-3 text-white">{link.requirement}</td>
                        <td className="py-2 px-3 text-white">{link.userStory}</td>
                        <td className="py-2 px-3 text-white">{link.task}</td>
                        <td className="py-2 px-3 text-slate-300 font-mono">{link.commit.substring(0, 7)}</td>
                        <td className="py-2 px-3 text-white">{link.test}</td>
                        <td className="py-2 px-3 text-white">{link.pr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}

          {/* Decisions */}
          {result.decisions.length > 0 && (
            <CollapsibleSection
              title="Architecture Decisions"
              icon={<Shield size={16} className="text-purple-400" />}
              isExpanded={expandedSection === 'decisions'}
              onToggle={() => setExpandedSection(expandedSection === 'decisions' ? null : 'decisions')}
            >
              <div className="space-y-3">
                {result.decisions.map((decision, i) => (
                  <div key={i} className="bg-dark-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">{decision.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{decision.context}</p>
                    <div className="space-y-1.5 mb-3">
                      {decision.options.map((opt, j) => (
                        <div key={j} className="text-xs text-slate-300 bg-dark-600 rounded p-2">
                          <span className="text-indigo-300 font-medium">{opt.agent}:</span> {opt.position}
                        </div>
                      ))}
                    </div>
                    <div className="bg-dark-600 rounded p-3 border border-dark-400">
                      <div className="text-xs text-slate-400 mb-1">Final Decision</div>
                      <p className="text-sm text-white">{decision.finalDecision}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Confidence:</span>
                        <div className="flex-1 h-1.5 bg-dark-500 rounded-full overflow-hidden max-w-32">
                          <div className="h-full bg-success rounded-full" style={{ width: `${decision.confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-white">{(decision.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <CollapsibleSection
              title={`Errors (${result.errors.length})`}
              icon={<AlertTriangle size={16} className="text-danger" />}
              isExpanded={expandedSection === 'errors'}
              onToggle={() => setExpandedSection(expandedSection === 'errors' ? null : 'errors')}
            >
              <div className="space-y-2">
                {result.errors.map((error, i) => (
                  <div key={i} className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-dark-700 hover:bg-dark-600 transition-colors text-left"
      >
        {icon}
        <span className="text-sm font-semibold text-white flex-1">{title}</span>
        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-dark-500">
          {children}
        </div>
      )}
    </div>
  );
}
