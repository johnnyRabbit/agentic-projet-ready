import { useState } from 'react';
import { 
  LayoutDashboard, 
  Rocket, 
  HardDrive, 
  TrendingUp,
  Cpu,
  Terminal,
  FolderKanban,
  Plus,
  CheckSquare,
  Bot,
  Activity,
  Shield,
  Settings
} from 'lucide-react';

type Page = 'command-center' | 'delivery' | 'platform' | 'analytics' | 'engine' | 'execution' | 'project' | 'work-request' | 'reviews' | 'agents';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('command-center');

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0f]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#12131a] border-r border-[#2a2b3a] flex flex-col">
        <div className="p-6 border-b border-[#2a2b3a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI Engineering</h1>
              <p className="text-xs text-slate-400">Autonomous Team</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
            { id: 'delivery', label: 'Delivery', icon: <Rocket size={20} /> },
            { id: 'platform', label: 'Platform', icon: <HardDrive size={20} /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
            { id: 'engine', label: 'Engine', icon: <Cpu size={20} /> },
            { id: 'execution', label: 'Execution', icon: <Terminal size={20} /> },
            { id: 'project', label: 'Projects', icon: <FolderKanban size={20} /> },
            { id: 'work-request', label: 'Work Requests', icon: <Plus size={20} /> },
            { id: 'reviews', label: 'Reviews', icon: <CheckSquare size={20} /> },
            { id: 'agents', label: 'Agents', icon: <Bot size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1a1b25]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a2b3a]">
          <div className="bg-[#1a1b25]/80 backdrop-blur-sm rounded-lg p-3 border border-[#2a2b3a]/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-300">System Status</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Provider</span>
                <span className="text-green-500">Groq ✓</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Active Agents</span>
                <span className="text-white">3</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Budget Used</span>
                <span className="text-yellow-500">€18.74/€25</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3 px-1">
            <Shield size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">Autonomy Level 3</span>
            <Settings size={14} className="text-slate-500 ml-auto cursor-pointer hover:text-slate-300" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Command Center</h1>
              <p className="text-slate-400 text-sm mt-1">Autonomous AI Engineering Team — Real-time Overview</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Rocket size={16} />
              New Work Request
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Projects', value: '2', sublabel: '1 planning', color: 'indigo' },
              { label: 'Running Agents', value: '3', sublabel: '1 waiting', color: 'green' },
              { label: 'AI Cost Today', value: '€18.74', sublabel: 'of €55 budget', color: 'yellow' },
              { label: 'Avg Delivery', value: '41m', sublabel: 'vs 8-12h human', color: 'blue' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1a1b25]/80 backdrop-blur-sm rounded-xl p-4 border border-[#2a2b3a]/50">
                <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Active Projects */}
          <div className="bg-[#1a1b25]/80 backdrop-blur-sm rounded-xl p-6 border border-[#2a2b3a]/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Projects</h2>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Smart Charging Timeline', desc: 'Mobile energy app — EV charging scheduling', progress: 82, tasks: '19/24', agents: 3, budget: '€18.74/€25', risk: 'medium' },
                { name: 'API Rate Limiter', desc: 'Distributed rate limiting for public API', progress: 45, tasks: '7/16', agents: 2, budget: '€11.42/€30', risk: 'high' },
              ].map((project, i) => (
                <div key={i} className="bg-[#12131a] hover:bg-[#1a1b25] rounded-lg p-4 transition-all border border-[#2a2b3a] hover:border-indigo-500/30 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{project.desc}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.risk === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{project.risk}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#2a2b3a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">
                        <span className="text-white">{project.tasks}</span> tasks
                      </span>
                      <span className="text-slate-400">
                        <span className="text-white">{project.agents}</span> agents
                      </span>
                    </div>
                    <span className="text-slate-400">Budget: <span className="text-yellow-400">{project.budget}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Pipeline */}
          <div className="bg-[#1a1b25]/80 backdrop-blur-sm rounded-xl p-6 border border-[#2a2b3a]/50">
            <h2 className="text-sm font-semibold text-white mb-4">Workflow Pipeline</h2>
            <div className="space-y-2">
              {[
                { label: 'Requirements', status: 'complete' },
                { label: 'Architecture', status: 'complete' },
                { label: 'Planning', status: 'complete' },
                { label: 'Implementation', status: 'active' },
                { label: 'Testing', status: 'pending' },
                { label: 'Review', status: 'pending' },
                { label: 'Human Approval', status: 'pending' },
                { label: 'Pull Request', status: 'pending' },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  step.status === 'complete' ? 'text-green-500' :
                  step.status === 'active' ? 'text-indigo-400 bg-indigo-500/10' :
                  'text-slate-500'
                }`}>
                  {step.status === 'complete' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  {step.status === 'active' && <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                  {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                  <span className="text-xs font-medium">{step.label}</span>
                  {step.status === 'complete' && <span className="ml-auto text-xs">✓</span>}
                  {step.status === 'active' && <span className="ml-auto text-xs">in progress</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
