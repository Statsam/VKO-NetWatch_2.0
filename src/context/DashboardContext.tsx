import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { School, SchoolStatus } from '../types/school';
import { Incident, IncidentStatus } from '../types/incident';
import { EarlyWarning, ActivityEvent, NotificationItem, NetworkHealthSummary } from '../types/health';
import { MetricThresholds } from '../types/measurement';
import { schoolsApi, getMockSchools, updateMockSchools } from '../api/schools';
import { incidentsApi, getMockIncidents, updateMockIncidents } from '../api/incidents';
import { analyticsApi } from '../api/analytics';
import { INITIAL_ACTIVITIES, INITIAL_NOTIFICATIONS, INITIAL_EARLY_WARNINGS } from '../api/mockData';
import { getApiBaseUrl, setApiBaseUrl, isUsingMockApi, setUsingMockApi } from '../api/client';

export type PageView =
  | 'overview'
  | 'map'
  | 'schools'
  | 'school-details'
  | 'incidents'
  | 'incident-details'
  | 'analytics'
  | 'network-health'
  | 'settings';

interface SearchResult {
  type: 'school' | 'incident' | 'device';
  id: string;
  title: string;
  subtitle: string;
  status?: string;
}

interface DashboardContextType {
  // Navigation
  currentPage: PageView;
  selectedSchoolId: string | null;
  selectedIncidentId: string | null;
  navigateTo: (page: PageView, id?: string) => void;

  // Data
  schools: School[];
  incidents: Incident[];
  earlyWarnings: EarlyWarning[];
  activityFeed: ActivityEvent[];
  notifications: NotificationItem[];
  healthSummary: NetworkHealthSummary | null;

  // States
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  lastSyncSecondsAgo: number;
  isApiConnected: boolean;

  // Demo & Polling
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshData: () => Promise<void>;
  refreshIntervalSec: number;
  setRefreshIntervalSec: (sec: number) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];

  // Incidents Actions
  acknowledgeIncident: (id: string) => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;

  // Notification Actions
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Thresholds & Settings
  thresholds: MetricThresholds;
  updateThresholds: (newThresholds: Partial<MetricThresholds>) => void;
  apiBaseUrl: string;
  updateApiBaseUrl: (url: string) => void;
  setApiBaseUrl: (url: string) => void;
  useMockApi: boolean;
  toggleUseMockApi: (useMock: boolean) => void;
  setUseMockApi: (useMock: boolean) => void;
  checkApiConnection: () => Promise<boolean>;
}

const DEFAULT_THRESHOLDS: MetricThresholds = {
  pingWarningMs: 100,
  pingCriticalMs: 150,
  jitterWarningMs: 25,
  jitterCriticalMs: 50,
  packetLossWarningPercent: 3,
  packetLossCriticalPercent: 10,
  downloadCriticalMbps: 5,
  downloadWarningMbps: 15,
  uploadCriticalMbps: 2,
  uploadWarningMbps: 5,
  agentOfflineTimeoutMinutes: 10,
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('overview');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>('SCH-001');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-4091');

  const [schools, setSchools] = useState<School[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarning[]>(INITIAL_EARLY_WARNINGS);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [healthSummary, setHealthSummary] = useState<NetworkHealthSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncSecondsAgo, setLastSyncSecondsAgo] = useState<number>(0);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(true);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(() => {
    const saved = localStorage.getItem('vko_refresh_interval');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('vko_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(() => {
    const url = getApiBaseUrl();
    if (url === 'http://localhost:5000' || url === 'http://localhost:5000/api') {
      return 'http://localhost:5071';
    }
    return url;
  });
  const [useMockApi, setUseMockApiState] = useState<boolean>(isUsingMockApi);

  const [thresholds, setThresholds] = useState<MetricThresholds>(() => {
    const saved = localStorage.getItem('vko_thresholds');
    if (saved) {
      try {
        return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_THRESHOLDS;
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('vko_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateTo = useCallback((page: PageView, id?: string) => {
    setCurrentPage(page);
    if (page === 'school-details' && id) {
      setSelectedSchoolId(id);
    } else if (page === 'incident-details' && id) {
      setSelectedIncidentId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch / Refresh Data from ASP.NET Core backend
  const refreshData = useCallback(async () => {
    try {
      setHasError(false);
      setErrorMessage(null);

      // Core entities from backend (SQLite via ASP.NET Core controllers)
      const [fetchedSchools, fetchedIncidents] = await Promise.all([
        schoolsApi.getAll(),
        incidentsApi.getAll(),
      ]);

      // Analytics data (uses backend /api/analytics/* if implemented, or computes from schools & incidents)
      const [fetchedSummary, fetchedWarnings] = await Promise.all([
        analyticsApi.getHealthSummary(fetchedSchools, fetchedIncidents),
        analyticsApi.getEarlyWarnings(fetchedSchools),
      ]);

      setSchools(fetchedSchools);
      setIncidents(fetchedIncidents);
      setHealthSummary(fetchedSummary);
      setEarlyWarnings(fetchedWarnings);
      setLastSyncSecondsAgo(0);
      setIsApiConnected(true);
    } catch (err) {
      setHasError(true);
      setIsApiConnected(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Не удалось синхронизироваться с ASP.NET Core сервером на http://localhost:5071.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto polling
  useEffect(() => {
    if (refreshIntervalSec <= 0) return;
    const interval = setInterval(() => {
      refreshData();
    }, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [refreshIntervalSec, refreshData]);

  // Demo Mode Simulation Engine
  // Periodically simulates subtle network heartbeat oscillations, packet tests, and random telemetry
  useEffect(() => {
    if (!isDemoMode) return;

    const demoInterval = setInterval(() => {
      // Pick a random school to oscillate slightly
      setSchools((prevSchools) => {
        if (!prevSchools.length) return prevSchools;
        const targetIndex = Math.floor(Math.random() * prevSchools.length);
        const target = prevSchools[targetIndex];

        // Only fluctuate healthy or warning schools reasonably
        const pingDelta = (Math.random() - 0.48) * 3;
        const newPing = Math.max(12, Math.round(target.lastMeasurement.pingMs + pingDelta));
        const downDelta = (Math.random() - 0.48) * 2;
        const newDown = Math.max(2, Number((target.lastMeasurement.downloadMbps + downDelta).toFixed(1)));

        const updatedHistory = [...target.recentPingHistory.slice(1), newPing];

        const updatedTarget: School = {
          ...target,
          lastMeasurement: {
            ...target.lastMeasurement,
            pingMs: newPing,
            downloadMbps: newDown,
            timestamp: new Date().toISOString(),
          },
          lastHeartbeat: 'Just now',
          recentPingHistory: updatedHistory,
        };

        const next = [...prevSchools];
        next[targetIndex] = updatedTarget;
        updateMockSchools(next);
        return next;
      });

      // Occasionally add a live activity event (e.g. 20% chance per tick)
      if (Math.random() < 0.22) {
        const candidateSchools = getMockSchools();
        if (candidateSchools.length > 0) {
          const s = candidateSchools[Math.floor(Math.random() * candidateSchools.length)];
          const sampleMessages = [
            { type: 'health_improved' as const, msg: `Telemetry ping normalized at ${s.lastMeasurement.pingMs} ms.`, sev: 'normal' as const },
            { type: 'packet_loss' as const, msg: `Minor packet jitter detected: ${s.lastMeasurement.jitterMs} ms on uplink.`, sev: 'info' as const },
            { type: 'early_warning' as const, msg: `Agent report: Bandwidth utilization tested at ${s.lastMeasurement.downloadMbps} Mbps.`, sev: 'info' as const },
          ];
          const chosen = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

          const newEvent: ActivityEvent = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            schoolId: s.id,
            schoolName: s.name,
            type: chosen.type,
            message: `${s.name}: ${chosen.msg}`,
            severity: chosen.sev,
          };

          setActivityFeed((prev) => [newEvent, ...prev.slice(0, 19)]);
        }
      }
    }, 3800);

    return () => clearInterval(demoInterval);
  }, [isDemoMode]);

  // Global Search resolution
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search schools
    schools.forEach((s) => {
      if (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'school',
          id: s.id,
          title: s.name,
          subtitle: `${s.id} • ${s.city} (${s.district})`,
          status: s.status,
        });
      }
      if (s.deviceId.toLowerCase().includes(q)) {
        results.push({
          type: 'device',
          id: s.id,
          title: `Device Agent: ${s.deviceId}`,
          subtitle: `Running at ${s.name} (${s.ipAddress})`,
          status: s.agentStatus,
        });
      }
    });

    // Search incidents
    incidents.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(q) ||
        inc.schoolName.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'incident',
          id: inc.id,
          title: `${inc.id}: ${inc.type}`,
          subtitle: `${inc.schoolName} — ${inc.value}`,
          status: inc.severity,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, schools, incidents]);

  // Incident Actions
  const acknowledgeIncident = async (id: string) => {
    try {
      const updated = await incidentsApi.acknowledge(id, 'Yerbolat K. (NOC Operator)');
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      // Add activity
      const newAct: ActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        schoolId: updated.schoolId,
        schoolName: updated.schoolName,
        type: 'incident_resolved',
        message: `Incident ${id} acknowledged by operator. Remediation ticket dispatched.`,
        severity: 'info',
      };
      setActivityFeed((prev) => [newAct, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveIncident = async (id: string) => {
    try {
      const updated = await incidentsApi.resolve(id);
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      const newAct: ActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        schoolId: updated.schoolId,
        schoolName: updated.schoolName,
        type: 'incident_resolved',
        message: `Incident ${id} marked as resolved. Network health indicators recovered.`,
        severity: 'normal',
      };
      setActivityFeed((prev) => [newAct, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Notification management
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Settings updates
  const updateThresholds = (newThresholds: Partial<MetricThresholds>) => {
    setThresholds((prev) => {
      const updated = { ...prev, ...newThresholds };
      localStorage.setItem('vko_thresholds', JSON.stringify(updated));
      return updated;
    });
  };

  const updateApiBaseUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiBaseUrlState(url);
  };

  const toggleUseMockApi = (useMock: boolean) => {
    setUsingMockApi(useMock);
    setUseMockApiState(useMock);
    refreshData();
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const value = {
    currentPage,
    selectedSchoolId,
    selectedIncidentId,
    navigateTo,

    schools,
    incidents,
    earlyWarnings,
    activityFeed,
    notifications,
    healthSummary,

    isLoading,
    hasError,
    errorMessage,
    lastSyncSecondsAgo,
    isApiConnected,

    isDemoMode,
    toggleDemoMode,
    refreshData,
    refreshIntervalSec,
    setRefreshIntervalSec: (sec: number) => {
      setRefreshIntervalSec(sec);
      localStorage.setItem('vko_refresh_interval', sec.toString());
    },

    theme,
    toggleTheme,

    searchQuery,
    setSearchQuery,
    searchResults,

    acknowledgeIncident,
    resolveIncident,

    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    thresholds,
    updateThresholds,
    apiBaseUrl,
    updateApiBaseUrl,
    setApiBaseUrl: updateApiBaseUrl,
    useMockApi,
    toggleUseMockApi,
    setUseMockApi: toggleUseMockApi,
    checkApiConnection: async () => {
      await refreshData();
      return isApiConnected;
    },
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return ctx;
};
