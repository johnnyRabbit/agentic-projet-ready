import { logger } from '../utils/logger';
import { useState, useEffect, useRef } from 'react';
import { Search, Command, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comandos disponíveis
  const commands: CommandItem[] = [
    // Navegação
    {
      id: 'nav-dashboard',
      label: 'Ir para Dashboard',
      description: 'Abrir o painel principal',
      shortcut: 'G D',
      action: () => (window.location.hash = '#/dashboard'),
      category: 'Navegação',
    },
    {
      id: 'nav-projects',
      label: 'Ir para Projetos',
      description: 'Ver todos os projetos',
      shortcut: 'G P',
      action: () => (window.location.hash = '#/projects'),
      category: 'Navegação',
    },
    {
      id: 'nav-agents',
      label: 'Ir para Agentes',
      description: 'Gerenciar agentes de IA',
      shortcut: 'G A',
      action: () => (window.location.hash = '#/agents'),
      category: 'Navegação',
    },

    // Ações
    {
      id: 'action-new-project',
      label: 'Novo Projeto',
      description: 'Criar um novo projeto',
      shortcut: '⌘ N',
      action: () => logger.debug('New project'),
      category: 'Ações',
    },
    {
      id: 'action-new-task',
      label: 'Nova Tarefa',
      description: 'Criar uma nova tarefa',
      shortcut: '⌘ T',
      action: () => logger.debug('New task'),
      category: 'Ações',
    },
    {
      id: 'action-run-agent',
      label: 'Executar Agente',
      description: 'Iniciar um agente de IA',
      action: () => logger.debug('Run agent'),
      category: 'Ações',
    },

    // Configurações
    {
      id: 'settings-theme',
      label: 'Alternar Tema',
      description: 'Mudar entre modo claro e escuro',
      action: () => {
        const html = document.documentElement;
        html.classList.toggle('dark');
      },
      category: 'Configurações',
    },
    {
      id: 'settings-preferences',
      label: 'Preferências',
      description: 'Abrir configurações',
      action: () => logger.debug('Open preferences'),
      category: 'Configurações',
    },

    // Ajuda
    {
      id: 'help-shortcuts',
      label: 'Atalhos de Teclado',
      description: 'Ver todos os atalhos disponíveis',
      shortcut: '?',
      action: () => logger.debug('Show shortcuts'),
      category: 'Ajuda',
    },
    {
      id: 'help-docs',
      label: 'Documentação',
      description: 'Abrir documentação',
      action: () => window.open('https://docs.example.com', '_blank'),
      category: 'Ajuda',
    },
  ];

  // Filtrar comandos baseado na query
  const filteredCommands = commands.filter((cmd) => {
    const searchStr = `${cmd.label} ${cmd.description || ''} ${cmd.category || ''}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  // Agrupar por categoria
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      const category = cmd.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  // Resetar seleção quando query mudar
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-dark-800 rounded-xl border border-dark-500 shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-b border-dark-500">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando ou busque..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
          />
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Nenhum comando encontrado</div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        globalIndex === selectedIndex
                          ? 'bg-indigo-500/20 text-white'
                          : 'hover:bg-dark-700 text-slate-300'
                      }`}
                    >
                      {cmd.icon && <div className="text-slate-400">{cmd.icon}</div>}
                      <div className="flex-1">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-slate-500">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-dark-700 rounded border border-dark-500 text-slate-400">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-dark-500 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-dark-700 rounded border border-dark-500">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-dark-700 rounded border border-dark-500">↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-dark-700 rounded border border-dark-500">esc</kbd>
              fechar
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para abrir Command Palette com Cmd/Ctrl+K
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
