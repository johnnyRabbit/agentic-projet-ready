import { useState } from 'react';
import {
  mockProjects,
  mockTasks,
  mockRisks,
  mockAgents,
  mockDecisions,
  mockQuestions,
  mockPR,
  mockModelCalls,
} from '../data/mockData';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitPullRequest,
  FileCode,
  Shield,
  Brain,
  DollarSign,
  Activity,
  MessageSquare,
  Scale,
  TestTube,
  ChevronRight,
} from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

type Tab =
  | 'overview'
  | 'requirements'
  | 'architecture'
  | 'plan'
  | 'tasks'
  | 'agents'
  | 'code'
  | 'tests'
  | 'reviews'
  | 'decisions'
  | 'risk'
  | 'cost'
  | 'activity';

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const project = mockProjects.find((p) => p.id === projectId) || mockProjects[0];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'requirements', label: 'Requirements', icon: <FileCode size={14} /> },
    { id: 'architecture', label: 'Architecture', icon: <Brain size={14} /> },
    { id: 'plan', label: 'Plan', icon: <Clock size={14} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 size={14} /> },
    { id: 'agents', label: 'Agents', icon: <Brain size={14} /> },
    { id: 'tests', label: 'Tests', icon: <TestTube size={14} /> },
    { id: 'reviews', label: 'Reviews', icon: <Shield size={14} /> },
    { id: 'decisions', label: 'Decisions', icon: <Scale size={14} /> },
    { id: 'risk', label: 'Risk', icon: <AlertTriangle size={14} /> },
    { id: 'cost', label: 'Cost', icon: <DollarSign size={14} /> },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === 'active'
                  ? 'bg-success/20 text-success'
                  : project.status === 'completed'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Progress</div>
            <div className="text-lg font-bold text-white">{project.progress}%</div>
          </div>
          <div className="w-32 h-2 bg-dark-500 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-dark-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-in">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'agents' && <AgentsTab />}
        {activeTab === 'decisions' && <DecisionsTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'cost' && <CostTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'requirements' && <RequirementsTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'tests' && <TestsTab />}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: (typeof mockProjects)[0] }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* PR Ready Card */}
        {project.progress === 100 && (
          <div className="glass-card rounded-xl p-6 gradient-border">
            <div className="flex items-center gap-3 mb-4">
              <GitPullRequest size={20} className="text-success" />
              <h3 className="text-lg font-semibold text-white">READY FOR REVIEW</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">{mockPR.title}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="text-xs text-slate-400">Files Changed</div>
                <div className="text-lg font-bold text-white">{mockPR.filesChanged}</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="text-xs text-slate-400">Lines</div>
                <div className="text-lg font-bold text-white">
                  +{mockPR.linesAdded} <span className="text-danger">-{mockPR.linesRemoved}</span>
                </div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="text-xs text-slate-400">Tests</div>
                <div className="text-lg font-bold text-success">
                  {mockPR.testsPassing}/{mockPR.testsTotal} ✓
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-400">Estimated Human Effort</div>
                <div className="text-sm font-medium text-white">{mockPR.estimatedHumanEffort}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Agent Execution</div>
                <div className="text-sm font-medium text-white">{mockPR.agentDuration}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">AI Cost</div>
                <div className="text-sm font-medium text-success">€{mockPR.agentCost}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-success hover:bg-success/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                ✓ Approve & Merge
              </button>
              <button className="flex-1 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-dark-400">
                Review Code
              </button>
              <button className="px-4 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm font-medium transition-colors border border-dark-400">
                Request Changes
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-warning" />
            Questions
          </h3>
          <div className="space-y-3">
            {mockQuestions.map((q) => (
              <div
                key={q.id}
                className={`bg-dark-700 rounded-lg p-4 border ${
                  q.priority === 'blocking' ? 'border-danger/30' : 'border-dark-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      q.priority === 'blocking'
                        ? 'bg-danger/20 text-danger'
                        : q.priority === 'important'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {q.priority.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs ${q.status === 'answered' ? 'text-success' : 'text-slate-400'}`}
                  >
                    {q.status === 'answered' ? '✓ Answered' : 'Open'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{q.text}</p>
                <p className="text-xs text-slate-500 mb-3">{q.context}</p>
                {q.recommendation && (
                  <div className="text-xs text-indigo-300 bg-indigo-500/10 rounded p-2">
                    💡 Recommendation: {q.recommendation} (confidence: {q.confidence}%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Budget */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Budget</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white">€{project.budget.spent.toFixed(2)}</div>
            <div className="text-xs text-slate-400">of €{project.budget.total} budget</div>
          </div>
          <div className="h-3 bg-dark-500 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                project.budget.spent / project.budget.total > 0.9
                  ? 'bg-danger'
                  : project.budget.spent / project.budget.total > 0.7
                    ? 'bg-warning'
                    : 'bg-success'
              }`}
              style={{ width: `${(project.budget.spent / project.budget.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{((project.budget.spent / project.budget.total) * 100).toFixed(0)}% used</span>
            <span>€{(project.budget.total - project.budget.spent).toFixed(2)} remaining</span>
          </div>
        </div>

        {/* Risks */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning" />
            Active Risks
          </h3>
          <div className="space-y-2">
            {mockRisks
              .filter((r) => r.status === 'open')
              .map((risk) => (
                <div key={risk.id} className="bg-dark-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        risk.severity === 'high'
                          ? 'bg-danger'
                          : risk.severity === 'medium'
                            ? 'bg-warning'
                            : 'bg-success'
                      }`}
                    />
                    <span className="text-xs font-medium text-white capitalize">
                      {risk.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{risk.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Team */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Team</h3>
          <div className="space-y-2">
            {mockAgents
              .filter((a) => ['running', 'waiting', 'complete'].includes(a.status))
              .map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700"
                >
                  <span className="text-lg">{agent.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{agent.name}</div>
                    <div className="text-xs text-slate-400">{agent.role}</div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'running'
                        ? 'bg-success animate-pulse-glow'
                        : agent.status === 'waiting'
                          ? 'bg-warning'
                          : agent.status === 'complete'
                            ? 'bg-indigo-400'
                            : 'bg-slate-500'
                    }`}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Tasks</h3>
      <div className="space-y-2">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 bg-dark-700 rounded-lg p-4 border border-dark-500"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                task.status === 'done'
                  ? 'bg-success'
                  : task.status === 'in_progress'
                    ? 'bg-indigo-400 animate-pulse-glow'
                    : task.status === 'review'
                      ? 'bg-purple-400'
                      : task.status === 'blocked'
                        ? 'bg-danger'
                        : 'bg-slate-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">{task.id}</span>
                <span className="text-sm text-white">{task.title}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400">→ {task.assignedTo}</span>
                <span className="text-xs text-slate-500">Est: {task.estimate}</span>
                {task.actual && (
                  <span className="text-xs text-slate-500">Actual: {task.actual}</span>
                )}
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                task.priority === 'high'
                  ? 'bg-danger/20 text-danger'
                  : task.priority === 'medium'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {task.priority}
            </span>
            <ChevronRight size={14} className="text-slate-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {mockAgents.map((agent) => (
        <div key={agent.id} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{agent.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{agent.name}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'running'
                      ? 'bg-success animate-pulse-glow'
                      : agent.status === 'waiting'
                        ? 'bg-warning'
                        : agent.status === 'complete'
                          ? 'bg-indigo-400'
                          : agent.status === 'idle'
                            ? 'bg-slate-500'
                            : 'bg-danger'
                  }`}
                />
              </div>
              <span className="text-xs text-slate-400">{agent.role}</span>
            </div>
          </div>
          {agent.currentTask && (
            <p className="text-xs text-slate-300 mb-3 bg-dark-700 rounded p-2">
              {agent.currentTask}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {agent.skills.map((skill) => (
              <span key={skill} className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs border-t border-dark-500 pt-3">
            <span className="text-slate-400">
              Model: <span className="text-white">{agent.modelUsed || '—'}</span>
            </span>
            <span className="text-slate-400">
              Cost: <span className="text-white">€{agent.cost.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              Tokens: <span className="text-white">{(agent.tokensUsed / 1000).toFixed(1)}k</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionsTab() {
  return (
    <div className="space-y-4">
      {mockDecisions.map((decision) => (
        <div
          key={decision.id}
          className={`glass-card rounded-xl p-6 ${decision.status === 'escalated' ? 'border-l-2 border-l-warning' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">{decision.title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                decision.status === 'decided'
                  ? 'bg-success/20 text-success'
                  : decision.status === 'escalated'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {decision.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">{decision.context}</p>

          <div className="space-y-2 mb-4">
            {decision.agents.map((agent, i) => (
              <div key={i} className="flex items-start gap-2 bg-dark-700 rounded p-2.5">
                <span className="text-xs font-medium text-indigo-300 whitespace-nowrap">
                  {agent.name}:
                </span>
                <span className="text-xs text-slate-300">{agent.position}</span>
              </div>
            ))}
          </div>

          <div className="bg-dark-700 rounded-lg p-3 border border-dark-400">
            <div className="text-xs text-slate-400 mb-1">Final Decision</div>
            <p className="text-sm text-white">{decision.finalDecision}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">Confidence:</span>
              <div className="flex-1 h-1.5 bg-dark-500 rounded-full overflow-hidden max-w-32">
                <div
                  className={`h-full rounded-full ${
                    decision.confidence > 80
                      ? 'bg-success'
                      : decision.confidence > 60
                        ? 'bg-warning'
                        : 'bg-danger'
                  }`}
                  style={{ width: `${decision.confidence}%` }}
                />
              </div>
              <span className="text-xs text-white">{decision.confidence}%</span>
            </div>
          </div>

          {decision.requiresApproval && (
            <div className="mt-4 flex gap-3">
              <button className="bg-success hover:bg-success/90 text-white px-3 py-1.5 rounded text-xs font-medium">
                Approve
              </button>
              <button className="bg-dark-600 hover:bg-dark-500 text-white px-3 py-1.5 rounded text-xs font-medium border border-dark-400">
                Request Changes
              </button>
              <button className="bg-dark-600 hover:bg-dark-500 text-white px-3 py-1.5 rounded text-xs font-medium border border-dark-400">
                Escalate Further
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RiskTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-danger">1</div>
          <div className="text-xs text-slate-400">High Risk</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-warning">2</div>
          <div className="text-xs text-slate-400">Medium Risk</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">1</div>
          <div className="text-xs text-slate-400">Mitigated</div>
        </div>
      </div>
      {mockRisks.map((risk) => (
        <div key={risk.id} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  risk.severity === 'high'
                    ? 'bg-danger'
                    : risk.severity === 'medium'
                      ? 'bg-warning'
                      : 'bg-success'
                }`}
              />
              <span className="text-sm font-medium text-white capitalize">{risk.category}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  risk.status === 'open'
                    ? 'bg-warning/20 text-warning'
                    : risk.status === 'mitigated'
                      ? 'bg-success/20 text-success'
                      : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                {risk.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>P: {(risk.probability * 100).toFixed(0)}%</span>
              <span>× I: {(risk.impact * 100).toFixed(0)}%</span>
              <span>
                ={' '}
                <span className="text-white font-medium">
                  {(risk.probability * risk.impact * 100).toFixed(0)}
                </span>
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-3">{risk.description}</p>
          <div className="bg-dark-700 rounded p-3">
            <span className="text-xs text-slate-400">Mitigation: </span>
            <span className="text-xs text-slate-300">{risk.mitigation}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CostTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">€18.74</div>
          <div className="text-xs text-slate-400">Total Spent</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">€6.26</div>
          <div className="text-xs text-slate-400">Remaining</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">301k</div>
          <div className="text-xs text-slate-400">Total Tokens</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">5</div>
          <div className="text-xs text-slate-400">Model Calls</div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Model Calls</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-dark-500">
                <th className="text-left py-2 px-3">Provider</th>
                <th className="text-left py-2 px-3">Model</th>
                <th className="text-right py-2 px-3">Input</th>
                <th className="text-right py-2 px-3">Output</th>
                <th className="text-right py-2 px-3">Cost</th>
                <th className="text-left py-2 px-3">Agent</th>
                <th className="text-left py-2 px-3">Task</th>
                <th className="text-right py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockModelCalls.map((call, i) => (
                <tr key={i} className="border-b border-dark-600 hover:bg-dark-700">
                  <td className="py-2.5 px-3 text-slate-300">{call.provider}</td>
                  <td className="py-2.5 px-3 text-white font-mono">{call.model}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {(call.inputTokens / 1000).toFixed(1)}k
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {(call.outputTokens / 1000).toFixed(1)}k
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-medium">
                    €{call.cost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{call.agent}</td>
                  <td className="py-2.5 px-3 text-slate-300">{call.task}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{call.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Review Status</h3>
      <div className="space-y-4">
        <div className="bg-dark-700 rounded-lg p-4 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-sm text-white font-medium">Agent Review — Passed</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Reviewer Agent found no critical issues. 2 minor suggestions applied.
          </p>
          <div className="flex gap-4 text-xs">
            <span className="text-success">✓ Correctness</span>
            <span className="text-success">✓ Security</span>
            <span className="text-success">✓ Performance</span>
            <span className="text-success">✓ Maintainability</span>
          </div>
        </div>
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-success" />
            <span className="text-sm text-white font-medium">Security Review — Passed</span>
          </div>
          <p className="text-xs text-slate-400">
            No vulnerabilities detected. Input validation verified.
          </p>
        </div>
      </div>
    </div>
  );
}

function RequirementsTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Extracted Requirements</h3>
      <div className="space-y-3">
        {[
          {
            id: 'REQ-001',
            text: 'User can view charging timeline for next 7 days',
            status: 'satisfied',
          },
          {
            id: 'REQ-002',
            text: 'System automatically schedules charging during off-peak hours',
            status: 'satisfied',
          },
          {
            id: 'REQ-003',
            text: 'User can manually override scheduled charging times',
            status: 'satisfied',
          },
          { id: 'REQ-004', text: 'Real-time updates when grid prices change', status: 'satisfied' },
          {
            id: 'REQ-005',
            text: 'Notifications for charging start/complete/error events',
            status: 'in_progress',
          },
          { id: 'REQ-006', text: 'Charging history with cost breakdown', status: 'pending' },
        ].map((req) => (
          <div key={req.id} className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
            <span
              className={`w-2 h-2 rounded-full ${
                req.status === 'satisfied'
                  ? 'bg-success'
                  : req.status === 'in_progress'
                    ? 'bg-warning'
                    : 'bg-slate-500'
              }`}
            />
            <span className="text-xs text-slate-500 font-mono">{req.id}</span>
            <span className="text-sm text-slate-300 flex-1">{req.text}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                req.status === 'satisfied'
                  ? 'bg-success/20 text-success'
                  : req.status === 'in_progress'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {req.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Architecture Decisions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: 'State Management',
            decision: 'XState',
            reason: 'Complex state transitions need formal verification',
          },
          {
            title: 'Database',
            decision: 'PostgreSQL + Partitioned Tables',
            reason: 'Simple initially, can extend to TimescaleDB if needed',
          },
          {
            title: 'Real-time',
            decision: 'WebSocket + Optimistic Updates',
            reason: 'Best UX with server reconciliation fallback',
          },
          {
            title: 'API Pattern',
            decision: 'REST + WebSocket events',
            reason: 'CRUD via REST, live updates via WebSocket',
          },
        ].map((item, i) => (
          <div key={i} className="bg-dark-700 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">{item.title}</div>
            <div className="text-sm text-white font-medium mb-2">{item.decision}</div>
            <div className="text-xs text-slate-400">{item.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Implementation Plan</h3>
      <div className="space-y-3">
        {[
          {
            phase: 'Phase 1',
            title: 'Foundation',
            tasks: 'Database schema, API endpoints, basic state machine',
            status: 'complete',
          },
          {
            phase: 'Phase 2',
            title: 'Core Features',
            tasks: 'Charging timeline UI, real-time updates, scheduling logic',
            status: 'complete',
          },
          {
            phase: 'Phase 3',
            title: 'Integration',
            tasks: 'Smart grid API, WebSocket connection, error handling',
            status: 'active',
          },
          {
            phase: 'Phase 4',
            title: 'Quality',
            tasks: 'Integration tests, security review, performance optimization',
            status: 'pending',
          },
          {
            phase: 'Phase 5',
            title: 'Delivery',
            tasks: 'Final review, PR preparation, documentation',
            status: 'pending',
          },
        ].map((phase, i) => (
          <div
            key={i}
            className={`flex items-start gap-4 bg-dark-700 rounded-lg p-4 ${
              phase.status === 'active' ? 'border border-indigo-500/30' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                phase.status === 'complete'
                  ? 'bg-success/20 text-success'
                  : phase.status === 'active'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-dark-500 text-slate-400'
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{phase.phase}</span>
                <span className="text-sm text-white font-medium">{phase.title}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{phase.tasks}</p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                phase.status === 'complete'
                  ? 'bg-success/20 text-success'
                  : phase.status === 'active'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {phase.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">38/38</div>
          <div className="text-xs text-slate-400">Tests Passing</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">94%</div>
          <div className="text-xs text-slate-400">Coverage</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-slate-400">Flaky Tests</div>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Test Suites</h3>
        <div className="space-y-2">
          {[
            { name: 'Charging State Machine', tests: 12, status: 'pass' },
            { name: 'API Validation', tests: 8, status: 'pass' },
            { name: 'Timeline UI Components', tests: 10, status: 'pass' },
            { name: 'WebSocket Integration', tests: 5, status: 'pass' },
            { name: 'Error Handling', tests: 3, status: 'pass' },
          ].map((suite, i) => (
            <div key={i} className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
              <CheckCircle2 size={14} className="text-success" />
              <span className="text-sm text-white flex-1">{suite.name}</span>
              <span className="text-xs text-slate-400">{suite.tests} tests</span>
              <span className="text-xs text-success">✓ pass</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Activity Log</h3>
      <div className="text-sm text-slate-400">Full activity timeline would appear here...</div>
    </div>
  );
}
