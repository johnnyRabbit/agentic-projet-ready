import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
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
import { AuthProvider, AuthGuard, UserMenu } from './auth/AuthUI';
import { useAuthStore } from './auth/AuthStore';
import { backendAPI } from './backend/BackendAPI';

export type Page = 'command-center' | 'delivery' | 'platform' | 'analytics' | 'engine' | 'execution' | 'project' | 'work-request' | 'reviews' | 'agents' | 'github';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('command-center');
  const [selectedProject, setSelectedProject] = useState<string>('proj-001');
  const { user } = useAuthStore();

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
        return <ProjectDetail projectId={selectedProject} onBack={() => setCurrentPage('command-center')} />;
      case 'work-request':
        return <WorkRequest />;
      case 'reviews':
        return <Reviews />;
      case 'agents':
        return <Agents />;
      case 'github':
        return <GitHubIntegration />;
      default:
        return <CommandCenter onNavigate={setCurrentPage} onSelectProject={setSelectedProject} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {user && (
          <div className="absolute top-4 right-4 z-50">
            <UserMenu />
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize backend API
    backendAPI.initialize().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  );
}
