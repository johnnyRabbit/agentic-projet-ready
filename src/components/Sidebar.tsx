import { Page } from '../App';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Plus, 
  CheckSquare, 
  Bot, 
  Activity,
  Shield,
  Settings,
  Cpu,
  Terminal,
  Rocket
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
  { id: 'delivery', label: 'Delivery', icon: <Rocket size={20} /> },
  { id: 'engine', label: 'Engine', icon: <Cpu size={20} /> },
  { id: 'execution', label: 'Execution', icon: <Terminal size={20} /> },
  { id: 'project', label: 'Projects', icon: <FolderKanban size={20} /> },
  { id: 'work-request', label: 'Work Requests', icon: <Plus size={20} /> },
  { id: 'reviews', label: 'Reviews', icon: <CheckSquare size={20} /> },
  { id: 'agents', label: 'Agents', icon: <Bot size={20} /> },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-500 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-500">
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentPage === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {item.icon}
            {item.label}
            {item.id === 'reviews' && (
              <span className="ml-auto bg-danger/20 text-danger text-xs px-1.5 py-0.5 rounded-full">2</span>
            )}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-dark-500">
        <div className="glass-card rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-slate-300">System Status</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Provider</span>
              <span className="text-success">Groq ✓</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Active Agents</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Budget Used</span>
              <span className="text-warning">€18.74/€25</span>
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
  );
}
