export type IncidentSeverity = 'warning' | 'critical';
export type IncidentStatus = 'active' | 'resolved';
export type IncidentType =
  | 'High latency'
  | 'Packet loss'
  | 'Low download speed'
  | 'High jitter'
  | 'Network degradation';

export interface IncidentTimelineEvent {
  timestamp: string;
  stage: string;
  note: string;
  level: 'normal' | 'info' | 'warning' | 'critical';
  time?: string;
  event?: string;
  detail?: string;
}

export interface Incident {
  id: string;
  schoolId: string;
  schoolName: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt?: string;
  value: string;
  threshold: string;
  description: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  timeline: IncidentTimelineEvent[];
  duration?: string;
  timeDetected?: string;
  potentialReason?: string;
  telemetrySnapshot?: {
    pingMs: number;
    jitterMs: number;
    packetLossPercent: number;
    downloadMbps: number;
    uploadMbps: number;
  };
}
