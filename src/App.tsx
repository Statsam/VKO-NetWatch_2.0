import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { SchoolDetailsPage } from './pages/SchoolDetailsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NetworkHealthPage } from './pages/NetworkHealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { Radio, Server, Activity, ShieldCheck, Heart } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentPage, isDemoMode, isApiConnected, lastSyncSecondsAgo } = useDashboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'map':
        return <LiveMapPage />;
      case 'schools':
        return <SchoolsPage />;
      case 'school-details':
        return <SchoolDetailsPage />;
      case 'incidents':
        return <IncidentsPage />;
      case 'incident-details':
        return <IncidentDetailsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'network-health':
        return <NetworkHealthPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Demo Mode Notification Ribbon */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-cyan-600/90 via-blue-600/90 to-cyan-700/90 text-white px-4 py-1.5 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-200" />
              <span>
                <strong>Demo Mode Active:</strong> Simulating real-time school computer agent telemetry across East Kazakhstan.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-cyan-100">
              <span>● Heartbeat Interval: 4s</span>
              <span>● Simulated Nodes: 20</span>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 py-6 lg:px-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 px-4 py-4 lg:px-8 text-xs text-slate-500 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">VKO NetWatch</span>
              <span>—</span>
              <span>East Kazakhstan Regional Education Internet Monitoring System (ВКО)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                ASP.NET Core REST Ready
              </span>
              <span>•</span>
              <span>Version 2.4.0-prod</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
