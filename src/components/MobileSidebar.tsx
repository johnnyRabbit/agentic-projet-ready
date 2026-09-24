import { useState } from 'react';
import { Page } from '../App';
import { useI18n } from '../i18n/useI18n';
import { useMobile } from '../hooks/useMediaQuery';
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
  Rocket,
  HardDrive,
  TrendingUp,
  Github,
  Menu,
  X,
} from 'lucide-react';

interface MobileSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function MobileSidebar({ currentPage, onNavigate }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();
  const { t } = useI18n();

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'command-center', label: t('nav.commandCenter'), icon: <LayoutDashboard size={20} /> },
    { id: 'delivery', label: t('nav.delivery'), icon: <Rocket size={20} /> },
    { id: 'kanban', label: t('nav.kanban'), icon: <FolderKanban size={20} /> },
    { id: 'platform', label: t('nav.platform'), icon: <HardDrive size={20} /> },
    { id: 'analytics', label: t('nav.analytics'), icon: <TrendingUp size={20} /> },
    { id: 'engine', label: t('nav.engine'), icon: <Cpu size={20} /> },
    { id: 'execution', label: t('nav.execution'), icon: <Terminal size={20} /> },
    { id: 'project', label: t('nav.projects'), icon: <FolderKanban size={20} /> },
    { id: 'work-request', label: t('nav.workRequests'), icon: <Plus size={20} /> },
    { id: 'reviews', label: t('nav.reviews'), icon: <CheckSquare size={20} /> },
    { id: 'agents', label: t('nav.agents'), icon: <Bot size={20} /> },
    { id: 'github', label: t('nav.github'), icon: <Github size={20} /> },
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">AI Engineering</h1>
                  <p className="text-xs text-slate-400">Autonomous Team</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Status */}
            <div className="p-4 border-t border-slate-700">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-slate-300">{t('status.systemStatus')}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('status.provider')}</span>
                    <span className="text-green-500">Groq ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('status.activeAgents')}</span>
                    <span className="text-white">3</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('status.budgetUsed')}</span>
                    <span className="text-yellow-500">€18.74/€25</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 px-1">
                <Shield size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">{t('status.autonomyLevel')} 3</span>
                <Settings
                  size={14}
                  className="text-slate-500 ml-auto cursor-pointer hover:text-slate-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
