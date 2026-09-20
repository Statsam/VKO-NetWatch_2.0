import { Incident, IncidentStatus, IncidentSeverity, IncidentTimelineEvent } from '../types/incident';
import { isUsingMockApi, request } from './client';
import { INITIAL_INCIDENTS } from './mockData';

let mockIncidents: Incident[] = [...INITIAL_INCIDENTS];

export const getMockIncidents = (): Incident[] => mockIncidents;
export const updateMockIncidents = (updated: Incident[]) => {
  mockIncidents = updated;
};

/**
 * Normalizes raw ASP.NET Core Incident entity/DTO into a frontend-compatible Incident.
 */
export function normalizeIncident(raw: any): Incident {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid incident payload received from backend');
  }

  const id = String(raw.id ?? raw.Id ?? '');
  const schoolId = String(raw.schoolId ?? raw.SchoolId ?? '');
  const schoolName = String(raw.schoolName ?? raw.SchoolName ?? 'Школа');
  const type = String(raw.type ?? raw.Type ?? 'Network degradation') as any;

  let severity: IncidentSeverity = 'warning';
  const rawSev = raw.severity ?? raw.Severity;
  if (typeof rawSev === 'number') {
    severity = rawSev === 1 ? 'critical' : 'warning';
  } else if (typeof rawSev === 'string' && rawSev.toLowerCase().includes('crit')) {
    severity = 'critical';
  }

  let status: IncidentStatus = 'active';
  const rawStatus = raw.status ?? raw.Status;
  if (typeof rawStatus === 'number') {
    status = rawStatus === 1 ? 'resolved' : 'active';
  } else if (typeof rawStatus === 'string' && rawStatus.toLowerCase().includes('res')) {
    status = 'resolved';
  }

  const acknowledged = Boolean(raw.acknowledged ?? raw.Acknowledged ?? false);

  const rawTimeline = raw.timeline ?? raw.Timeline;
  let timeline: IncidentTimelineEvent[] = [];
  if (Array.isArray(rawTimeline) && rawTimeline.length > 0) {
    timeline = rawTimeline.map((ev: any) => ({
      timestamp: String(ev.timestamp ?? ev.Timestamp ?? ev.time ?? ev.Time ?? ''),
      stage: String(ev.stage ?? ev.Stage ?? ev.event ?? ev.Event ?? 'Событие'),
      note: String(ev.note ?? ev.Note ?? ev.detail ?? ev.Detail ?? ''),
      level: (ev.level ?? ev.Level ?? 'info') as any,
    }));
  } else {
    timeline = [
      {
        timestamp: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toLocaleTimeString()),
        stage: 'Обнаружен',
        note: String(raw.description ?? raw.Description ?? 'Зафиксировано отклонение метрик от нормы'),
        level: severity === 'critical' ? 'critical' : 'warning',
      },
    ];
  }

  return {
    id,
    schoolId,
    schoolName,
    type,
    severity,
    status,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
    resolvedAt: raw.resolvedAt ?? raw.ResolvedAt ? String(raw.resolvedAt ?? raw.ResolvedAt) : undefined,
    value: String(raw.value ?? raw.Value ?? ''),
    threshold: String(raw.threshold ?? raw.Threshold ?? ''),
    description: String(raw.description ?? raw.Description ?? ''),
    acknowledged,
    acknowledgedAt: raw.acknowledgedAt ?? raw.AcknowledgedAt ? String(raw.acknowledgedAt ?? raw.AcknowledgedAt) : undefined,
    acknowledgedBy: raw.acknowledgedBy ?? raw.AcknowledgedBy ? String(raw.acknowledgedBy ?? raw.AcknowledgedBy) : undefined,
    timeline,
    duration: raw.duration ?? raw.Duration,
    timeDetected: raw.timeDetected ?? raw.TimeDetected,
    potentialReason: raw.potentialReason ?? raw.PotentialReason,
    telemetrySnapshot: raw.telemetrySnapshot ?? raw.TelemetrySnapshot,
  };
}

export const incidentsApi = {
  async getAll(statusFilter?: IncidentStatus): Promise<Incident[]> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 100));
      if (!statusFilter) return [...mockIncidents];
      return mockIncidents.filter((i) => i.status === statusFilter);
    }
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const response = await request<any>(`/api/incidents${query}`);
    const items = Array.isArray(response)
      ? response
      : (response?.$values || response?.data || response?.items || []);
    return items.map(normalizeIncident);
  },

  async getById(id: string): Promise<Incident | null> {
    if (isUsingMockApi()) {
      await new Promise((r) => setTimeout(r, 80));
      const found = mockIncidents.find((i) => i.id === id);
      return found ? { ...found } : null;
    }
    const response = await request<any>(`/api/incidents/${id}`);
    return response ? normalizeIncident(response) : null;
  },

  async acknowledge(id: string, acknowledgedBy = 'Оператор ситуационного центра'): Promise<Incident> {
    if (isUsingMockApi()) {
      const idx = mockIncidents.findIndex((i) => i.id === id);
      if (idx !== -1) {
        mockIncidents[idx] = {
          ...mockIncidents[idx],
          acknowledged: true,
          acknowledgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledgedBy,
          timeline: [
            ...mockIncidents[idx].timeline,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              stage: 'В работе',
              note: `Инцидент подтверждён: ${acknowledgedBy}`,
              level: 'info',
            },
          ],
        };
        return { ...mockIncidents[idx] };
      }
      throw new Error(`Incident with ID ${id} not found.`);
    }
    const response = await request<any>(`/api/incidents/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgedBy }),
    });
    return normalizeIncident(response);
  },

  async resolve(id: string): Promise<Incident> {
    if (isUsingMockApi()) {
      const idx = mockIncidents.findIndex((i) => i.id === id);
      if (idx !== -1) {
        mockIncidents[idx] = {
          ...mockIncidents[idx],
          status: 'resolved',
          resolvedAt: 'Только что',
          timeline: [
            ...mockIncidents[idx].timeline,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              stage: 'Решён',
              note: 'Параметры соединения нормализованы в пределах нормы SLA.',
              level: 'normal',
            },
          ],
        };
        return { ...mockIncidents[idx] };
      }
      throw new Error(`Incident with ID ${id} not found.`);
    }
    const response = await request<any>(`/api/incidents/${id}/resolve`, {
      method: 'POST',
    });
    return normalizeIncident(response);
  },
};
