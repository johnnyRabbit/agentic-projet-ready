import { useState } from 'react';
import { AgentRegistry } from '../engine/agents/AgentRegistry';
import { Bot, Cpu, Zap, DollarSign, Activity, Search, ChevronRight } from 'lucide-react';

const agentRegistry = new AgentRegistry();

// Emoji mapping for agent roles
const agentEmojis: Record<string, string> = {
  lead: '🧠',
  requirements: '📋',
  planner: '📝',
  developer: '💻',
  reviewer: '🔍',
  tester: '🧪',
  security: '🛡️',
  critic: '🎯',
  debugger: '🐛',
  architect: '🏗️',
  estimator: '📊',
  risk: '⚠️',
  'data-analyst': '📊',
  'ui-ux-designer': '🎨',
  'documentation-writer': '📚',
  'devops-engineer': '🔧',
  'mobile-specialist': '📱',
  'database-specialist': '🗄️',
  'api-designer': '🌐',
  'performance-engineer': '⚡',
};

export function Agents() {
  const [searchTerm, setSearchTerm] = useState('');
  const allAgents = agentRegistry.getAll();

  const filteredAgents = allAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Agent Registry</h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic team assembly — {allAgents.length} specialized agents available
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents by name, role, or skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-500 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={16} className="text-indigo-400" />
            <span className="text-xs text-slate-400">Total Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">{allAgents.length}</div>
          <div className="text-xs text-slate-400">specialized roles</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-success" />
            <span className="text-xs text-slate-400">Categories</span>
          </div>
          <div className="text-2xl font-bold text-success">6</div>
          <div className="text-xs text-slate-400">specialization areas</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-warning" />
            <span className="text-xs text-slate-400">Avg Budget</span>
          </div>
          <div className="text-2xl font-bold text-white">
            €{(allAgents.reduce((sum, a) => sum + a.maxBudget, 0) / allAgents.length).toFixed(1)}
          </div>
          <div className="text-xs text-slate-400">per agent run</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-purple-400" />
            <span className="text-xs text-slate-400">Models</span>
          </div>
          <div className="text-2xl font-bold text-white">5</div>
          <div className="text-xs text-slate-400">Groq models available</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">
          Available Agents ({filteredAgents.length})
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-dark-700 rounded-lg p-4 border border-dark-500 hover:border-indigo-500/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{agentEmojis[agent.role] || '🤖'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">{agent.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{agent.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded border border-dark-500"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-3 text-xs border-t border-dark-500 pt-3">
                    <div className="flex items-center gap-1">
                      <Cpu size={12} className="text-slate-400" />
                      <span className="text-slate-400">{agent.preferredModel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-slate-400" />
                      <span className="text-white">€{agent.maxBudget.toFixed(1)} max</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={12} className="text-slate-400" />
                      <span className="text-white">{agent.maxRetries} retries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Assembly Examples */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Dynamic Team Assembly</h2>
        <p className="text-xs text-slate-400 mb-4">
          The Lead Agent assembles the minimum team needed for each task type.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
            <h3 className="text-xs font-medium text-white mb-3">📱 Mobile App</h3>
            <div className="space-y-1.5">
              {[
                'Lead',
                'Requirements',
                'UI/UX Designer',
                'Mobile Specialist',
                'Backend Dev',
                'Database Specialist',
                'QA',
                'Reviewer',
              ].map((a, i) => (
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
              {[
                'Lead',
                'Requirements',
                'API Designer',
                'Backend Dev',
                'Database Specialist',
                'DevOps',
                'QA',
                'Security',
                'Reviewer',
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <ChevronRight size={10} className="text-indigo-400" />
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 border border-dark-500">
            <h3 className="text-xs font-medium text-white mb-3">🐛 Bug Fix</h3>
            <div className="space-y-1.5">
              {['Lead', 'Debugger', 'Developer', 'QA', 'Reviewer'].map((a, i) => (
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
