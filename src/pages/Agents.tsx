import { mockAgents, mockModelCalls } from '../data/mockData';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Clock, 
  DollarSign,
  Activity,
  Brain,
  Shield,
  GitBranch,
  TestTube,
  Search,
  Settings,
  ChevronRight
} from 'lucide-react';

export function Agents() {
  const totalCost = mockAgents.reduce((sum, a) => sum + a.cost, 0);
  const totalTokens = mockAgents.reduce((sum, a) => sum + a.tokensUsed, 0);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Agent Registry</h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic team assembly — agents are instantiated per task, not permanently running
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={16} className="text-indigo-400" />
            <span className="text-xs text-slate-400">Total Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">{mockAgents.length}</div>
          <div className="text-xs text-slate-400">7 available roles</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-success" />
            <span className="text-xs text-slate-400">Currently Active</span>
          </div>
          <div className="text-2xl font-bold text-success">{mockAgents.filter(a => a.status === 'running').length}</div>
          <div className="text-xs text-slate-400">running tasks</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-warning" />
            <span className="text-xs text-slate-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">€{totalCost.toFixed(2)}</div>
          <div className="text-xs text-slate-400">all agents combined</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-purple-400" />
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white">{(totalTokens / 1000).toFixed(0)}k</div>
          <div className="text-xs text-slate-400">processed</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {mockAgents.map(agent => (
          <div key={agent.id} className="glass-card rounded-xl p-5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'running' ? 'bg-success animate-pulse-glow' :
                    agent.status === 'waiting' ? 'bg-warning' :
                    agent.status === 'complete' ? 'bg-indigo-400' :
                    agent.status === 'idle' ? 'bg-slate-500' :
                    'bg-danger'
                  }`} />
                  <span className={`text-xs capitalize ${
                    agent.status === 'running' ? 'text-success' :
                    agent.status === 'waiting' ? 'text-warning' :
                    agent.status === 'complete' ? 'text-indigo-400' :
                    'text-slate-500'
                  }`}>{agent.status}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{agent.role}</p>
                
                {agent.currentTask && (
                  <div className="bg-dark-700 rounded p-2 mb-3">
                    <p className="text-xs text-slate-300 truncate">{agent.currentTask}</p>
                  </div>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.skills.map(skill => (
                    <span key={skill} className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded border border-dark-500">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs border-t border-dark-500 pt-3">
                  <div className="flex items-center gap-1">
                    <Cpu size={12} className="text-slate-400" />
                    <span className="text-slate-400">{agent.modelUsed || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    <span className="text-white">€{agent.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={12} className="text-slate-400" />
                    <span className="text-white">{(agent.tokensUsed / 1000).toFixed(1)}k tokens</span>
                  </div>
                  {agent.duration && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-white">{agent.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Definitions (Available but not instantiated) */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Available Agent Roles</h2>
        <p className="text-xs text-slate-400 mb-4">These roles are available for dynamic team assembly. They are instantiated on-demand by the Lead Agent.</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: 'Engineering Lead', icon: <Brain size={16} />, desc: 'Orchestration & delegation' },
            { name: 'Intake Agent', icon: <Search size={16} />, desc: 'Request analysis' },
            { name: 'Requirements Agent', icon: <Shield size={16} />, desc: 'Extract & validate requirements' },
            { name: 'Architecture Agent', icon: <Settings size={16} />, desc: 'System design decisions' },
            { name: 'Planner Agent', icon: <Clock size={16} />, desc: 'Task decomposition' },
            { name: 'Frontend Agent', icon: <Bot size={16} />, desc: 'UI implementation' },
            { name: 'Backend Agent', icon: <Bot size={16} />, desc: 'API & server logic' },
            { name: 'Mobile Agent', icon: <Bot size={16} />, desc: 'React Native / mobile' },
            { name: 'Database Agent', icon: <Bot size={16} />, desc: 'Schema & queries' },
            { name: 'DevOps Agent', icon: <GitBranch size={16} />, desc: 'CI/CD & infrastructure' },
            { name: 'Test Agent', icon: <TestTube size={16} />, desc: 'Test writing & execution' },
            { name: 'Security Agent', icon: <Shield size={16} />, desc: 'Security review' },
            { name: 'Reviewer Agent', icon: <Search size={16} />, desc: 'Code review' },
            { name: 'Critic Agent', icon: <Brain size={16} />, desc: 'Challenge decisions' },
            { name: 'Debugger Agent', icon: <Bot size={16} />, desc: 'Bug investigation' },
            { name: 'Integration Agent', icon: <GitBranch size={16} />, desc: 'Merge & integrate' },
          ].map((role, i) => (
            <div key={i} className="bg-dark-700 rounded-lg p-3 border border-dark-500 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-400">{role.icon}</span>
                <span className="text-xs font-medium text-white">{role.name}</span>
              </div>
              <p className="text-xs text-slate-400">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Assembly Examples */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Dynamic Team Assembly</h2>
        <p className="text-xs text-slate-400 mb-4">The Lead Agent assembles the minimum team needed for each task type.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
            <h3 className="text-xs font-medium text-white mb-3">📱 React Native Feature</h3>
            <div className="space-y-1.5">
              {['Lead', 'Requirements', 'Mobile Architect', 'React Native Dev', 'Backend Dev', 'QA', 'Reviewer'].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <ChevronRight size={10} className="text-indigo-400" />
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
            <h3 className="text-xs font-medium text-white mb-3">⚙️ Backend API</h3>
            <div className="space-y-1.5">
              {['Lead', 'Requirements', 'Backend Architect', 'Backend Dev', 'Database Specialist', 'QA', 'Security', 'Reviewer'].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <ChevronRight size={10} className="text-indigo-400" />
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
            <h3 className="text-xs font-medium text-white mb-3">🐛 Small Bug Fix</h3>
            <div className="space-y-1.5">
              {['Lead', 'Debugger', 'Developer', 'Reviewer'].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <ChevronRight size={10} className="text-indigo-400" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
