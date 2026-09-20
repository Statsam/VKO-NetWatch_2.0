import { NetworkMeasurement } from '../types/measurement';
import { isUsingMockApi, request } from './client';
import { getMockSchools } from './schools';

export interface HistoricalDataPoint {
  time: string;
  ping: number;
  jitter: number;
  packetLoss: number;
  download: number;
  upload: number;
}

export function normalizeMeasurement(raw: any): NetworkMeasurement {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid measurement payload received from backend');
  }

  return {
    id: String(raw.id ?? raw.Id ?? `m-${Date.now()}`),
    schoolId: String(raw.schoolId ?? raw.SchoolId ?? ''),
    deviceId: String(raw.deviceId ?? raw.DeviceId ?? 'DEV-AGENT-01'),
    timestamp: String(raw.timestamp ?? raw.Timestamp ?? new Date().toISOString()),
    pingMs: Number(raw.pingMs ?? raw.PingMs ?? raw.ping ?? raw.Ping ?? 0),
    jitterMs: Number(raw.jitterMs ?? raw.JitterMs ?? raw.jitter ?? raw.Jitter ?? 0),
    packetLossPercent: Number(raw.packetLossPercent ?? raw.PacketLossPercent ?? raw.packetLoss ?? raw.PacketLoss ?? 0),
    downloadMbps: Number(raw.downloadMbps ?? raw.DownloadMbps ?? raw.download ?? raw.Download ?? 0),
    uploadMbps: Number(raw.uploadMbps ?? raw.UploadMbps ?? raw.upload ?? raw.Upload ?? 0),
  };
}

export const measurementsApi = {
  async getLatestForSchool(schoolId: string): Promise<NetworkMeasurement | null> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 60));
      const school = getMockSchools().find((s) => s.id === schoolId);
      return school ? school.lastMeasurement : null;
    }
    try {
      const response = await request<any>(`/api/measurements/latest/${schoolId}`);
      return response ? normalizeMeasurement(response) : null;
    } catch {
      return null;
    }
  },

  async getHistorical(
    schoolId: string,
    timeRange: '15m' | '1h' | '6h' | '24h' | '7d' = '1h'
  ): Promise<HistoricalDataPoint[]> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 120));
      const school = getMockSchools().find((s) => s.id === schoolId);
      const basePing = school?.lastMeasurement.pingMs || 35;
      const baseJitter = school?.lastMeasurement.jitterMs || 6;
      const basePacketLoss = school?.lastMeasurement.packetLossPercent || 0.1;
      const baseDown = school?.lastMeasurement.downloadMbps || 75;
      const baseUp = school?.lastMeasurement.uploadMbps || 35;

      const pointsCount = timeRange === '15m' ? 15 : timeRange === '1h' ? 24 : timeRange === '6h' ? 30 : timeRange === '24h' ? 24 : 28;
      const result: HistoricalDataPoint[] = [];
      const now = Date.now();
      const stepMs =
        timeRange === '15m'
          ? 60 * 1000
          : timeRange === '1h'
          ? 2.5 * 60 * 1000
          : timeRange === '6h'
          ? 12 * 60 * 1000
          : timeRange === '24h'
          ? 60 * 60 * 1000
          : 6 * 60 * 60 * 1000;

      for (let i = pointsCount - 1; i >= 0; i--) {
        const d = new Date(now - i * stepMs);
        const timeStr =
          timeRange === '7d'
            ? d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit' })
            : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const progress = 1 - i / pointsCount;
        const noise = (Math.random() - 0.5) * 4;
        
        let pointPing = Math.max(8, Math.round(basePing * (0.85 + progress * 0.15) + noise));
        let pointJitter = Math.max(1, Math.round(baseJitter * (0.8 + progress * 0.2) + (Math.random() - 0.5) * 2));
        let pointLoss = Math.max(0, Number((basePacketLoss * (0.7 + progress * 0.3) + (Math.random() > 0.8 ? 0.3 : 0)).toFixed(1)));
        let pointDown = Math.max(1, Number((baseDown * (1.1 - progress * 0.1) + (Math.random() - 0.5) * 5).toFixed(1)));
        let pointUp = Math.max(0.5, Number((baseUp * (1.05 - progress * 0.05) + (Math.random() - 0.5) * 2).toFixed(1)));

        if (school?.status === 'critical' && i < 6) {
          pointPing = Math.round(pointPing * 1.4);
          pointLoss = Math.min(25, Number((pointLoss + (6 - i) * 1.5).toFixed(1)));
          pointDown = Math.max(1.2, Number((pointDown * 0.4).toFixed(1)));
        }

        result.push({
          time: timeStr,
          ping: pointPing,
          jitter: pointJitter,
          packetLoss: pointLoss,
          download: pointDown,
          upload: pointUp,
        });
      }
      return result;
    }

    try {
      const response = await request<any>(`/api/measurements/historical/${schoolId}?range=${timeRange}`);
      const items = Array.isArray(response)
        ? response
        : (response?.$values || response?.data || response?.items || []);
      
      return items.map((pt: any) => ({
        time: String(pt.time ?? pt.Time ?? ''),
        ping: Number(pt.ping ?? pt.Ping ?? pt.pingMs ?? pt.PingMs ?? 0),
        jitter: Number(pt.jitter ?? pt.Jitter ?? pt.jitterMs ?? pt.JitterMs ?? 0),
        packetLoss: Number(pt.packetLoss ?? pt.PacketLoss ?? pt.packetLossPercent ?? pt.PacketLossPercent ?? 0),
        download: Number(pt.download ?? pt.Download ?? pt.downloadMbps ?? pt.DownloadMbps ?? 0),
        upload: Number(pt.upload ?? pt.Upload ?? pt.uploadMbps ?? pt.UploadMbps ?? 0),
      }));
    } catch {
      // If historical endpoint is not yet provided by the ASP.NET Core backend, return empty array gracefully
      return [];
    }
  },

  async recordMeasurement(measurement: Partial<NetworkMeasurement>): Promise<NetworkMeasurement> {
    if (isUsingMockApi()) {
      return {
        id: `m-${Date.now()}`,
        schoolId: measurement.schoolId || 'SCH-001',
        deviceId: measurement.deviceId || 'DEV-AGENT-01',
        timestamp: new Date().toISOString(),
        pingMs: measurement.pingMs || 25,
        jitterMs: measurement.jitterMs || 4,
        packetLossPercent: measurement.packetLossPercent || 0,
        downloadMbps: measurement.downloadMbps || 80,
        uploadMbps: measurement.uploadMbps || 40,
      };
    }
    const response = await request<any>('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(measurement),
    });
    return normalizeMeasurement(response);
  },
};
