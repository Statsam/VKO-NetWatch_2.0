export interface NetworkMeasurement {
  id: string;
  schoolId: string;
  deviceId: string;
  timestamp: string;
  pingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  downloadMbps: number;
  uploadMbps: number;
}

export interface MetricThresholds {
  pingWarningMs: number;
  pingCriticalMs: number;
  jitterWarningMs: number;
  jitterCriticalMs: number;
  packetLossWarningPercent: number;
  packetLossCriticalPercent: number;
  downloadCriticalMbps: number;
  downloadWarningMbps: number;
  uploadCriticalMbps: number;
  uploadWarningMbps: number;
  agentOfflineTimeoutMinutes: number;
}
