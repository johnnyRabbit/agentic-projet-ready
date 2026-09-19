import { Page } from '../App';
import { mockProjects, mockAgents, mockActivityLog, mockCostBreakdown } from '../data/mockData';
import { 
  Zap, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Pause
} from 'lucide-react';

interface CommandCenterProps {
  onNavigate: (page: Page) => void;
  onSelectProject: (id: string) => void;
}

export function CommandCenter({ onNavigate, onSelectProject }: CommandCenterProps) {
  const activeProjects = mockProjects.filter(p => p.status === 'active');
  const runningAgents = mockAgents.filter(a => a.status === 'running');
  const waitingAgents = mockAgents.filter(a => a.status === 'waiting');

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Autonomous AI Engineering Team — Real-time Overview</p>
        </div>
        <button 
          onClick={() => onNavigate('work-request')}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Zap size={16} />
          New Work Request
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<TrendingUp size={18} />}
          label="Active Projects" 
          value="2" 
          sublabel="1 planning"
          color="indigo"
        />
        <StatCard 
          icon={<Zap size={18} />}
          label="Running Agents" 
          value="3" 
          sublabel="1 waiting"
          color="success"
        />
        <StatCard 
          icon={<DollarSign size={18} />}
          label="AI Cost Today" 
          value="€18.74" 
          sublabel="of €55 budget"
          color="warning"
        />
        <StatCard 
          icon={<Clock size={18} />}
          label="Avg Delivery" 
          value="41m" 
          sublabel="vs 8-12h human"
          color="info"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="col-span-2 space-y-6">
          {/* Projects */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Projects</h2>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
            </div>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => { onSelectProject(project.id); onNavigate('project'); }}
                  className="w-full text-left bg-dark-700 hover:bg-dark-600 rounded-lg p-4 transition-all border border-dark-500 hover:border-indigo-500/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.risks.map((r, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                          r === 'high' ? 'bg-danger/20 text-danger' :
                          r === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">
                        <span className="text-white">{project.completedTasks}</span>/{project.totalTasks} tasks
                      </span>
                      <span className="text-slate-400">
                        <span className="text-white">{project.activeAgents}</span> agents
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Budget: </span>
                      <span className={project.budget.spent / project.budget.total > 0.8 ? 'text-warning' : 'text-success'}>
                        €{project.budget.spent.toFixed(2)} / €{project.budget.total}
                      </span>
                      <ArrowRight size={14} className="text-slate-500 ml-2" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Agents */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Agent Activity</h2>
              <button onClick={() => onNavigate('agents')} className="text-xs text-indigo-400 hover:text-indigo-300">View all agents</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {runningAgents.map(agent => (
                <div key={agent.id} className="bg-dark-700 rounded-lg p-4 border border-dark-500">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{agent.name}</span>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                      </div>
                      <span className="text-xs text-slate-400">{agent.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 truncate mb-2">{agent.currentTask}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cost: <span className="text-white">€{agent.cost.toFixed(2)}</span></span>
                    <span className="text-slate-400">Duration: <span className="text-white">{agent.duration}</span></span>
                  </div>
                </div>
              ))}
              {waitingAgents.map(agent => (
                <div key={agent.id} className="bg-dark-700 rounded-lg p-4 border border-dark-500 opacity-75">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{agent.name}</span>
                        <div className="w-2 h-2 rounded-full bg-warning" />
                      </div>
                      <span className="text-xs text-slate-400">{agent.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 truncate mb-2">{agent.currentTask}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status: <span className="text-warning">Waiting</span></span>
                    <span className="text-slate-400">Cost: <span className="text-white">€{agent.cost.toFixed(2)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attention Required */}
          <div className="glass-card rounded-xl p-6 border-l-2 border-l-warning">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-warning" />
              <h2 className="text-sm font-semibold text-white">Your Attention</h2>
              <span className="bg-warning/20 text-warning text-xs px-1.5 py-0.5 rounded-full ml-auto">2</span>
            </div>
            <div className="space-y-3">
              <div className="bg-dark-700 rounded-lg p-3 border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-warning">BLOCKING QUESTION</span>
                </div>
                <p className="text-xs text-slate-300">Charging behavior on connectivity loss — needs decision</p>
                <button className="text-xs text-indigo-400 mt-2 hover:text-indigo-300">Answer →</button>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-warning">DECISION ESCALATED</span>
                </div>
                <p className="text-xs text-slate-300">Offline-first vs online-first — product decision needed</p>
                <button className="text-xs text-indigo-400 mt-2 hover:text-indigo-300">Review →</button>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Cost Breakdown</h2>
            <div className="space-y-2.5">
              {mockCostBreakdown.map((item) => (
                <div key={item.phase} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-24">{item.phase}</span>
                  <div className="flex-1 h-2 bg-dark-500 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.phase === 'Implementation' ? 'bg-indigo-500' :
                        item.phase === 'Overhead' ? 'bg-slate-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-white w-12 text-right">€{item.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-dark-500 flex justify-between text-xs">
              <span className="text-slate-400">Total AI Cost</span>
              <span className="text-white font-medium">€18.74</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Activity</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {mockActivityLog.map((item, i) => (
                <div key={i} className="flex gap-3 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.type === 'code' ? 'bg-indigo-400' :
                      item.type === 'test' ? 'bg-success' :
                      item.type === 'decision' ? 'bg-warning' :
                      item.type === 'git' ? 'bg-purple-400' :
                      'bg-slate-400'
                    }`} />
                    {i < mockActivityLog.length - 1 && <div className="w-px flex-1 bg-dark-500 mt-1" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-xs text-slate-300">{item.event}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{item.agent}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Status */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Workflow Pipeline</h2>
            <div className="space-y-2">
              <WorkflowStep icon={<CheckCircle2 size={14} />} label="Requirements" status="complete" />
              <WorkflowStep icon={<CheckCircle2 size={14} />} label="Architecture" status="complete" />
              <WorkflowStep icon={<CheckCircle2 size={14} />} label="Planning" status="complete" />
              <WorkflowStep icon={<Loader2 size={14} />} label="Implementation" status="active" />
              <WorkflowStep icon={<Circle size={14} />} label="Testing" status="pending" />
              <WorkflowStep icon={<Circle size={14} />} label="Review" status="pending" />
              <WorkflowStep icon={<Pause size={14} />} label="Human Approval" status="pending" />
              <WorkflowStep icon={<Circle size={14} />} label="Pull Request" status="pending" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color }: { icon: React.ReactNode; label: string; value: string; sublabel: string; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
  };

  return (
    <div className={`glass-card rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sublabel}</div>
    </div>
  );
}

function WorkflowStep({ icon, label, status }: { icon: React.ReactNode; label: string; status: 'complete' | 'active' | 'pending' }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
      status === 'complete' ? 'text-success' :
      status === 'active' ? 'text-indigo-400 bg-indigo-500/10' :
      'text-slate-500'
    }`}>
      {status === 'active' ? <Loader2 size={14} className="animate-spin" /> : icon}
      <span className="text-xs font-medium">{label}</span>
      {status === 'complete' && <CheckCircle2 size={12} className="ml-auto" />}
      {status === 'active' && <span className="ml-auto text-xs">in progress</span>}
    </div>
  );
}
