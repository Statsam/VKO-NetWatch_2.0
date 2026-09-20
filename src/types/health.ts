export interface EarlyWarning {
  id: string;
  schoolId: string;
  schoolName: string;
  currentStatus: 'Warning trend';
  detectedPattern: string;
  metricsTrend: number[];
  metricType: 'ping' | 'jitter' | 'packetLoss' | 'download';
  currentValue: string;
  projectedValue: string;
  projectedTime?: string;
  recommendedAction: string;
  confidence: 'High' | 'Medium' | 'Low';
  detectedAt: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  schoolId: string;
  schoolName: string;
  type:
    | 'incident_new'
    | 'incident_resolved'
    | 'early_warning'
    | 'agent_offline'
    | 'health_improved'
    | 'packet_loss';
  message: string;
  severity: 'normal' | 'info' | 'warning' | 'critical';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'incident' | 'warning' | 'agent' | 'system';
  schoolId?: string;
  incidentId?: string;
}

export interface NetworkHealthSummary {
  overallScore: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  healthySchoolsCount: number;
  warningSchoolsCount: number;
  criticalSchoolsCount: number;
  totalSchoolsCount: number;
  activeIncidentsCount: number;
  averagePingMs: number;
  averageJitterMs: number;
  averagePacketLossPercent: number;
  averageDownloadMbps: number;
  averageUploadMbps: number;
  lastUpdated: string;
  scoreDeductions: {
    factor: string;
    penalty: number;
    description: string;
  }[];
}
