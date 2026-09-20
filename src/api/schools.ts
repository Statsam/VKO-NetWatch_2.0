import { School, SchoolStatus, AgentStatus, HealthTrend } from '../types/school';
import { NetworkMeasurement } from '../types/measurement';
import { isUsingMockApi, request } from './client';
import { INITIAL_SCHOOLS } from './mockData';

// In-memory store for mock manipulations (fallback / testing)
let mockSchools: School[] = [...INITIAL_SCHOOLS];

export const getMockSchools = (): School[] => mockSchools;
export const updateMockSchools = (updated: School[]) => {
  mockSchools = updated;
};

/**
 * Normalizes raw ASP.NET Core entity / DTO (which may use PascalCase,
 * enums as numbers, or flattened SQLite columns) into a complete School object.
 */
export function normalizeSchool(raw: any): School {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid school payload received from backend');
  }

  const id = String(raw.id ?? raw.Id ?? raw.schoolId ?? raw.SchoolId ?? '');
  const name = String(raw.name ?? raw.Name ?? 'Неизвестная школа');
  const district = String(raw.district ?? raw.District ?? 'Восточно-Казахстанская область');
  const city = String(raw.city ?? raw.City ?? district);
  const latitude = Number(raw.latitude ?? raw.Latitude ?? 49.95);
  const longitude = Number(raw.longitude ?? raw.Longitude ?? 82.61);

  // Status mapping (handles string or C# enum numbers)
  let status: SchoolStatus = 'healthy';
  const rawStatus = raw.status ?? raw.Status;
  if (typeof rawStatus === 'number') {
    status = rawStatus === 2 ? 'critical' : rawStatus === 1 ? 'warning' : 'healthy';
  } else if (typeof rawStatus === 'string') {
    const sLower = rawStatus.toLowerCase();
    if (sLower.includes('crit') || sLower === 'error') status = 'critical';
    else if (sLower.includes('warn')) status = 'warning';
    else status = 'healthy';
  }

  const healthScore = Number(
    raw.healthScore ?? raw.HealthScore ?? (status === 'critical' ? 45 : status === 'warning' ? 72 : 94)
  );

  // Agent status mapping
  let agentStatus: AgentStatus = 'online';
  const rawAgent = raw.agentStatus ?? raw.AgentStatus;
  if (typeof rawAgent === 'number') {
    agentStatus = rawAgent === 1 ? 'offline' : rawAgent === 2 ? 'inactive' : 'online';
  } else if (typeof rawAgent === 'string') {
    const aLower = rawAgent.toLowerCase();
    if (aLower.includes('off')) agentStatus = 'offline';
    else if (aLower.includes('inact')) agentStatus = 'inactive';
    else agentStatus = 'online';
  }

  // Last measurement normalization
  const rawM = raw.lastMeasurement ?? raw.LastMeasurement ?? raw.measurement ?? raw.Measurement;
  const lastMeasurement: NetworkMeasurement = {
    id: String(rawM?.id ?? rawM?.Id ?? raw.measurementId ?? `m-${id}`),
    schoolId: id,
    deviceId: String(rawM?.deviceId ?? rawM?.DeviceId ?? raw.deviceId ?? raw.DeviceId ?? 'DEV-AGENT-01'),
    timestamp: String(
      rawM?.timestamp ?? rawM?.Timestamp ?? raw.lastHeartbeat ?? raw.LastHeartbeat ?? new Date().toISOString()
    ),
    pingMs: Number(rawM?.pingMs ?? rawM?.PingMs ?? raw.pingMs ?? raw.PingMs ?? raw.ping ?? raw.Ping ?? 25),
    jitterMs: Number(rawM?.jitterMs ?? rawM?.JitterMs ?? raw.jitterMs ?? raw.JitterMs ?? raw.jitter ?? raw.Jitter ?? 4),
    packetLossPercent: Number(
      rawM?.packetLossPercent ?? rawM?.PacketLossPercent ?? raw.packetLossPercent ?? raw.PacketLossPercent ?? raw.packetLoss ?? raw.PacketLoss ?? 0
    ),
    downloadMbps: Number(
      rawM?.downloadMbps ?? rawM?.DownloadMbps ?? raw.downloadMbps ?? raw.DownloadMbps ?? raw.download ?? raw.Download ?? 75
    ),
    uploadMbps: Number(
      rawM?.uploadMbps ?? rawM?.UploadMbps ?? raw.uploadMbps ?? raw.UploadMbps ?? raw.upload ?? raw.Upload ?? 35
    ),
  };

  // Recent ping history fallback
  const rawPingHist = raw.recentPingHistory ?? raw.RecentPingHistory;
  const recentPingHistory: number[] = Array.isArray(rawPingHist) && rawPingHist.length > 0
    ? rawPingHist
    : [lastMeasurement.pingMs, lastMeasurement.pingMs, lastMeasurement.pingMs, lastMeasurement.pingMs, lastMeasurement.pingMs];

  const rawDownHist = raw.recentDownloadHistory ?? raw.RecentDownloadHistory;
  const recentDownloadHistory: number[] = Array.isArray(rawDownHist) && rawDownHist.length > 0
    ? rawDownHist
    : [lastMeasurement.downloadMbps, lastMeasurement.downloadMbps, lastMeasurement.downloadMbps, lastMeasurement.downloadMbps, lastMeasurement.downloadMbps];

  // Trend mapping
  let trend: HealthTrend = 'stable';
  const rawTrend = String(raw.trend ?? raw.Trend ?? '').toLowerCase();
  if (rawTrend.includes('deg') || rawTrend.includes('worse')) trend = 'degrading';
  else if (rawTrend.includes('imp') || rawTrend.includes('better')) trend = 'improving';

  return {
    id,
    name,
    district,
    city,
    latitude,
    longitude,
    status,
    healthScore,
    lastMeasurement,
    agentStatus,
    lastHeartbeat: String(raw.lastHeartbeat ?? raw.LastHeartbeat ?? 'Недавно'),
    deviceId: String(raw.deviceId ?? raw.DeviceId ?? 'DEV-AGENT-01'),
    agentVersion: String(raw.agentVersion ?? raw.AgentVersion ?? 'v2.4.1'),
    ipAddress: String(raw.ipAddress ?? raw.IpAddress ?? '192.168.1.1'),
    isp: String(raw.isp ?? raw.Isp ?? 'Казахтелеком'),
    connectionType: (raw.connectionType ?? raw.ConnectionType ?? 'Fiber') as any,
    studentCount: Number(raw.studentCount ?? raw.StudentCount ?? 450),
    trend,
    recentPingHistory,
    recentDownloadHistory,
    mainIssue: raw.mainIssue ?? raw.MainIssue ?? undefined,
  };
}

export const schoolsApi = {
  async getAll(): Promise<School[]> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 120));
      return [...mockSchools];
    }
    const response = await request<any>('/api/schools');
    const items = Array.isArray(response)
      ? response
      : (response?.$values || response?.data || response?.items || []);
    return items.map(normalizeSchool);
  },

  async getById(id: string): Promise<School | null> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 80));
      const found = mockSchools.find((s) => s.id === id);
      return found ? { ...found } : null;
    }
    const response = await request<any>(`/api/schools/${id}`);
    return response ? normalizeSchool(response) : null;
  },

  async updateStatus(id: string, status: SchoolStatus, healthScore: number): Promise<School> {
    if (isUsingMockApi()) {
      const idx = mockSchools.findIndex((s) => s.id === id);
      if (idx !== -1) {
        mockSchools[idx] = {
          ...mockSchools[idx],
          status,
          healthScore,
        };
        return { ...mockSchools[idx] };
      }
      throw new Error(`School with ID ${id} not found.`);
    }
    const response = await request<any>(`/api/schools/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, healthScore }),
    });
    return normalizeSchool(response);
  },
};
