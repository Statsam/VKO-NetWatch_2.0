import { isUsingMockApi, request } from './client';
import { NetworkHealthSummary, EarlyWarning } from '../types/health';
import { School } from '../types/school';
import { Incident } from '../types/incident';
import { getMockSchools } from './schools';
import { getMockIncidents } from './incidents';
import { INITIAL_EARLY_WARNINGS } from './mockData';

export interface RegionalPerformance {
  district: string;
  totalSchools: number;
  avgHealthScore: number;
  avgPing: number;
  avgDownload: number;
  incidentCount: number;
}

export interface AnalyticsTrendPoint {
  date: string;
  healthScore: number;
  avgPing: number;
  avgPacketLoss: number;
  avgDownload: number;
  incidentsCount: number;
}

/**
 * Computes health summary dynamically from School[] and Incident[]
 * if the backend does not yet have a dedicated /api/analytics/health-summary endpoint.
 */
export function computeHealthSummary(
  schools: School[],
  incidents: Incident[]
): NetworkHealthSummary {
  const total = schools.length;
  if (total === 0) {
    return {
      overallScore: 100,
      status: 'Healthy',
      healthySchoolsCount: 0,
      warningSchoolsCount: 0,
      criticalSchoolsCount: 0,
      totalSchoolsCount: 0,
      activeIncidentsCount: 0,
      averagePingMs: 0,
      averageJitterMs: 0,
      averagePacketLossPercent: 0,
      averageDownloadMbps: 0,
      averageUploadMbps: 0,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      scoreDeductions: [],
    };
  }

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const healthy = schools.filter((s) => s.status === 'healthy').length;
  const warning = schools.filter((s) => s.status === 'warning').length;
  const critical = schools.filter((s) => s.status === 'critical').length;

  const avgHealth = Math.round(schools.reduce((acc, s) => acc + (s.healthScore || 0), 0) / total);
  const avgPing = Math.round(schools.reduce((acc, s) => acc + (s.lastMeasurement?.pingMs || 0), 0) / total);
  const avgJitter = Math.round(schools.reduce((acc, s) => acc + (s.lastMeasurement?.jitterMs || 0), 0) / total);
  const avgLoss = Number((schools.reduce((acc, s) => acc + (s.lastMeasurement?.packetLossPercent || 0), 0) / total).toFixed(2));
  const avgDown = Number((schools.reduce((acc, s) => acc + (s.lastMeasurement?.downloadMbps || 0), 0) / total).toFixed(1));
  const avgUp = Number((schools.reduce((acc, s) => acc + (s.lastMeasurement?.uploadMbps || 0), 0) / total).toFixed(1));

  const penalties = [];
  if (critical > 0) {
    penalties.push({
      factor: 'Критическая задержка и потеря пакетов',
      penalty: critical * 5,
      description: `${critical} школ(ы) с критическими показателями связи в удалённых районах`,
    });
  }
  if (warning > 0) {
    penalties.push({
      factor: 'Колебания параметров канала',
      penalty: warning * 2,
      description: `${warning} школ(ы) в зоне повышенного внимания мониторинга`,
    });
  }
  if (schools.some((s) => s.agentStatus === 'offline')) {
    penalties.push({
      factor: 'Офлайн агенты',
      penalty: 2,
      description: 'Зафиксировано отсутствие телеметрии от школьного шлюза',
    });
  }

  return {
    overallScore: Math.max(0, Math.min(100, avgHealth)),
    status: avgHealth >= 85 ? 'Healthy' : avgHealth >= 65 ? 'Warning' : 'Critical',
    healthySchoolsCount: healthy,
    warningSchoolsCount: warning,
    criticalSchoolsCount: critical,
    totalSchoolsCount: total,
    activeIncidentsCount: activeIncidents.length,
    averagePingMs: avgPing,
    averageJitterMs: avgJitter,
    averagePacketLossPercent: avgLoss,
    averageDownloadMbps: avgDown,
    averageUploadMbps: avgUp,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    scoreDeductions: penalties,
  };
}

export const analyticsApi = {
  async getHealthSummary(fallbackSchools: School[] = [], fallbackIncidents: Incident[] = []): Promise<NetworkHealthSummary> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 60));
      return computeHealthSummary(getMockSchools(), getMockIncidents());
    }

    try {
      const response = await request<any>('/api/analytics/health-summary');
      if (response && (response.overallScore !== undefined || response.OverallScore !== undefined)) {
        return {
          overallScore: Number(response.overallScore ?? response.OverallScore ?? 90),
          status: (response.status ?? response.Status ?? 'Healthy') as any,
          healthySchoolsCount: Number(response.healthySchoolsCount ?? response.HealthySchoolsCount ?? 0),
          warningSchoolsCount: Number(response.warningSchoolsCount ?? response.WarningSchoolsCount ?? 0),
          criticalSchoolsCount: Number(response.criticalSchoolsCount ?? response.CriticalSchoolsCount ?? 0),
          totalSchoolsCount: Number(response.totalSchoolsCount ?? response.TotalSchoolsCount ?? 0),
          activeIncidentsCount: Number(response.activeIncidentsCount ?? response.ActiveIncidentsCount ?? 0),
          averagePingMs: Number(response.averagePingMs ?? response.AveragePingMs ?? 0),
          averageJitterMs: Number(response.averageJitterMs ?? response.AverageJitterMs ?? 0),
          averagePacketLossPercent: Number(response.averagePacketLossPercent ?? response.AveragePacketLossPercent ?? 0),
          averageDownloadMbps: Number(response.averageDownloadMbps ?? response.AverageDownloadMbps ?? 0),
          averageUploadMbps: Number(response.averageUploadMbps ?? response.AverageUploadMbps ?? 0),
          lastUpdated: String(response.lastUpdated ?? response.LastUpdated ?? new Date().toLocaleTimeString()),
          scoreDeductions: Array.isArray(response.scoreDeductions ?? response.ScoreDeductions)
            ? (response.scoreDeductions ?? response.ScoreDeductions)
            : [],
        };
      }
      return computeHealthSummary(fallbackSchools, fallbackIncidents);
    } catch {
      // If endpoint /api/analytics/health-summary is not implemented on backend, calculate from SQLite schools
      return computeHealthSummary(fallbackSchools, fallbackIncidents);
    }
  },

  async getEarlyWarnings(fallbackSchools: School[] = []): Promise<EarlyWarning[]> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 60));
      return [...INITIAL_EARLY_WARNINGS];
    }
    try {
      const response = await request<any>('/api/analytics/early-warnings');
      const items = Array.isArray(response)
        ? response
        : (response?.$values || response?.data || response?.items || []);
      if (items.length > 0) {
        return items.map((w: any) => ({
          id: String(w.id ?? w.Id ?? `ew-${Date.now()}`),
          schoolId: String(w.schoolId ?? w.SchoolId ?? ''),
          schoolName: String(w.schoolName ?? w.SchoolName ?? 'Школа'),
          currentStatus: (w.currentStatus ?? w.CurrentStatus ?? 'Warning trend') as any,
          detectedPattern: String(w.detectedPattern ?? w.DetectedPattern ?? 'Обнаружена деградация соединения'),
          metricsTrend: Array.isArray(w.metricsTrend ?? w.MetricsTrend) ? (w.metricsTrend ?? w.MetricsTrend) : [30, 45, 60],
          metricType: (w.metricType ?? w.MetricType ?? 'ping') as any,
          currentValue: String(w.currentValue ?? w.CurrentValue ?? ''),
          projectedValue: String(w.projectedValue ?? w.ProjectedValue ?? ''),
          projectedTime: w.projectedTime ?? w.ProjectedTime ? String(w.projectedTime ?? w.ProjectedTime) : undefined,
          recommendedAction: String(w.recommendedAction ?? w.RecommendedAction ?? 'Проверить оборудование'),
          confidence: (w.confidence ?? w.Confidence ?? 'High') as any,
          detectedAt: String(w.detectedAt ?? w.DetectedAt ?? new Date().toLocaleTimeString()),
        }));
      }
    } catch {
      // Graceful fallback from schools
    }

    // Compute early warnings from actual schools that are in warning status or degrading
    const dynamicWarnings: EarlyWarning[] = [];
    fallbackSchools.forEach((s) => {
      if (s.status === 'warning' || s.trend === 'degrading' || (s.lastMeasurement && s.lastMeasurement.pingMs > 80)) {
        dynamicWarnings.push({
          id: `EW-${s.id}`,
          schoolId: s.id,
          schoolName: s.name,
          currentStatus: 'Warning trend',
          detectedPattern: s.trend === 'degrading'
            ? 'Постепенное падение скорости и рост задержки'
            : 'Превышение пороговой задержки RTT',
          metricsTrend: s.recentPingHistory || [s.lastMeasurement.pingMs],
          metricType: (s.lastMeasurement && s.lastMeasurement.packetLossPercent > 2) ? 'packetLoss' : 'ping',
          currentValue: `${s.lastMeasurement?.pingMs || 0} мс`,
          projectedValue: `${Math.round((s.lastMeasurement?.pingMs || 30) * 1.3)} мс`,
          recommendedAction: 'Проверить радиорелейный пролёт и загрузку канала',
          confidence: 'High',
          detectedAt: s.lastHeartbeat || 'Недавно',
        });
      }
    });
    return dynamicWarnings;
  },

  async getRegionalPerformance(fallbackSchools: School[] = [], fallbackIncidents: Incident[] = []): Promise<RegionalPerformance[]> {
    if (isUsingMockApi()) {
      return this.computeRegional(getMockSchools(), getMockIncidents());
    }
    try {
      const response = await request<any>('/api/analytics/regional');
      const items = Array.isArray(response)
        ? response
        : (response?.$values || response?.data || response?.items || []);
      if (items.length > 0) {
        return items.map((r: any) => ({
          district: String(r.district ?? r.District ?? ''),
          totalSchools: Number(r.totalSchools ?? r.TotalSchools ?? 0),
          avgHealthScore: Number(r.avgHealthScore ?? r.AvgHealthScore ?? 0),
          avgPing: Number(r.avgPing ?? r.AvgPing ?? 0),
          avgDownload: Number(r.avgDownload ?? r.AvgDownload ?? 0),
          incidentCount: Number(r.incidentCount ?? r.IncidentCount ?? 0),
        }));
      }
    } catch {
      // Graceful fallback to computing from schools
    }
    return this.computeRegional(fallbackSchools, fallbackIncidents);
  },

  computeRegional(schools: School[], incidents: Incident[]): RegionalPerformance[] {
    const grouped: Record<string, { schools: School[]; incidents: number }> = {};

    schools.forEach((s) => {
      const d = s.district || 'ВКО';
      if (!grouped[d]) {
        grouped[d] = { schools: [], incidents: 0 };
      }
      grouped[d].schools.push(s);
    });

    incidents.filter((i) => i.status === 'active').forEach((inc) => {
      const school = schools.find((s) => s.id === inc.schoolId);
      const d = school?.district || 'ВКО';
      if (grouped[d]) {
        grouped[d].incidents += 1;
      }
    });

    return Object.entries(grouped).map(([district, data]) => {
      const count = data.schools.length;
      const avgHealth = Math.round(data.schools.reduce((a, s) => a + (s.healthScore || 0), 0) / (count || 1));
      const avgPing = Math.round(data.schools.reduce((a, s) => a + (s.lastMeasurement?.pingMs || 0), 0) / (count || 1));
      const avgDown = Number((data.schools.reduce((a, s) => a + (s.lastMeasurement?.downloadMbps || 0), 0) / (count || 1)).toFixed(1));
      return {
        district,
        totalSchools: count,
        avgHealthScore: avgHealth,
        avgPing,
        avgDownload: avgDown,
        incidentCount: data.incidents,
      };
    });
  },

  async getHistoricalTrends(days = 7): Promise<AnalyticsTrendPoint[]> {
    if (isUsingMockApi()) {
      return this.generateTrendFallback(days);
    }
    try {
      const response = await request<any>(`/api/analytics/trends?days=${days}`);
      const items = Array.isArray(response)
        ? response
        : (response?.$values || response?.data || response?.items || []);
      if (items.length > 0) {
        return items.map((pt: any) => ({
          date: String(pt.date ?? pt.Date ?? ''),
          healthScore: Number(pt.healthScore ?? pt.HealthScore ?? 0),
          avgPing: Number(pt.avgPing ?? pt.AvgPing ?? 0),
          avgPacketLoss: Number(pt.avgPacketLoss ?? pt.AvgPacketLoss ?? 0),
          avgDownload: Number(pt.avgDownload ?? pt.AvgDownload ?? 0),
          incidentsCount: Number(pt.incidentsCount ?? pt.IncidentsCount ?? 0),
        }));
      }
    } catch {
      // Fallback
    }
    return this.generateTrendFallback(days);
  },

  generateTrendFallback(days: number): AnalyticsTrendPoint[] {
    const result: AnalyticsTrendPoint[] = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      result.push({
        date: dateStr,
        healthScore: Math.round(89 + Math.sin(i * 1.5) * 4),
        avgPing: Math.round(38 + Math.cos(i) * 5),
        avgPacketLoss: 0.4,
        avgDownload: Math.round(72 + Math.sin(i * 0.8) * 8),
        incidentsCount: Math.max(1, Math.round(3 + Math.sin(i * 2) * 2)),
      });
    }
    return result;
  },
};
