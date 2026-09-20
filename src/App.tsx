import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandCenter } from './pages/CommandCenter';
import { ProjectDetail } from './pages/ProjectDetail';
import { WorkRequest } from './pages/WorkRequest';
import { Reviews } from './pages/Reviews';
import { Agents } from './pages/Agents';
import { EngineDashboard } from './pages/EngineDashboard';
import { ExecutionDashboard } from './pages/ExecutionDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';

export type Page = 'command-center' | 'project' | 'work-request' | 'reviews' | 'agents' | 'engine' | 'execution' | 'delivery';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('command-center');
  const [selectedProject, setSelectedProject] = useState<string>('proj-001');

  const renderPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter onNavigate={setCurrentPage} onSelectProject={setSelectedProject} />;
      case 'project':
        return <ProjectDetail projectId={selectedProject} onBack={() => setCurrentPage('command-center')} />;
      case 'work-request':
        return <WorkRequest />;
      case 'reviews':
        return <Reviews />;
      case 'agents':
        return <Agents />;
      case 'engine':
        return <EngineDashboard />;
      case 'execution':
        return <ExecutionDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      default:
        return <CommandCenter onNavigate={setCurrentPage} onSelectProject={setSelectedProject} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
