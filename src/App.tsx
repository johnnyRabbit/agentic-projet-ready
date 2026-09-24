import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { CommandCenter } from './pages/CommandCenter';
import { EngineDashboard } from './pages/EngineDashboard';
import { ExecutionDashboard } from './pages/ExecutionDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { PlatformDashboard } from './pages/PlatformDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { WorkRequest } from './pages/WorkRequest';
import { Reviews } from './pages/Reviews';
import { Agents } from './pages/Agents';
import { GitHubIntegration } from './pages/GitHubIntegration';
import { KanbanPage } from './pages/KanbanPage';
import { AuthProvider, AuthGuard, UserMenu } from './auth/AuthUI';
import { useAuthStore } from './auth/AuthStore';
import { backendAPI } from './backend/BackendAPI';
import { ThemeProvider } from './components/ThemeToggle';
import { ToastContainer, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CommandPalette, useCommandPalette } from './components/CommandPalette';
import { DebugPanel } from './components/DebugPanel';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { auditLog } from './observability/AuditLog';
import './i18n/config';

export type Page =
  | 'command-center'
  | 'delivery'
  | 'platform'
  | 'analytics'
  | 'engine'
  | 'execution'
  | 'project'
  | 'work-request'
  | 'reviews'
  | 'agents'
  | 'github'
  | 'kanban';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('command-center');
  const [selectedProject, setSelectedProject] = useState<string>('proj-001');
  const { user } = useAuthStore();
  const toast = useToast();
  const commandPalette = useCommandPalette();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      description: 'Command Palette',
      action: commandPalette.toggle,
    },
    {
      key: 'n',
      ctrl: true,
      description: 'Novo Projeto',
      action: () => {
        setCurrentPage('work-request');
        toast.info('Criar novo projeto', 'Use o formulário para criar um novo projeto');
      },
    },
    {
      key: '1',
      ctrl: true,
      description: 'Ir para Dashboard',
      action: () => setCurrentPage('command-center'),
    },
    {
      key: '2',
      ctrl: true,
      description: 'Ir para Engine',
      action: () => setCurrentPage('engine'),
    },
    {
      key: '3',
      ctrl: true,
      description: 'Ir para Delivery',
      action: () => setCurrentPage('delivery'),
    },
  ]);

  const renderPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter onNavigate={setCurrentPage} onSelectProject={setSelectedProject} />;
      case 'engine':
        return <EngineDashboard />;
      case 'execution':
        return <ExecutionDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'platform':
        return <PlatformDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'project':
        return (
          <ProjectDetail
            projectId={selectedProject}
            onBack={() => setCurrentPage('command-center')}
          />
        );
      case 'work-request':
        return <WorkRequest />;
      case 'reviews':
        return <Reviews />;
      case 'agents':
        return <Agents />;
      case 'github':
        return <GitHubIntegration />;
      case 'kanban':
        return <KanbanPage />;
      default:
        return <CommandCenter onNavigate={setCurrentPage} onSelectProject={setSelectedProject} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          auditLog.log('navigate', 'page', {
            userId: user?.id,
            details: { page },
          });
          setCurrentPage(page);
        }}
      />
      <MobileSidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          auditLog.log('navigate', 'page', {
            userId: user?.id,
            details: { page },
          });
          setCurrentPage(page);
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {user && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        )}
        {renderPage()}
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Command Palette */}
      <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize backend API
    backendAPI.initialize().catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AuthGuard>
            <AppContent />
          </AuthGuard>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
