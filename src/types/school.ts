import { NetworkMeasurement } from './measurement';

export type SchoolStatus = 'healthy' | 'warning' | 'critical';
export type AgentStatus = 'online' | 'offline' | 'inactive';
export type HealthTrend = 'improving' | 'stable' | 'degrading';

export interface School {
  id: string;
  name: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  status: SchoolStatus;
  healthScore: number; // 0 - 100
  lastMeasurement: NetworkMeasurement;
  agentStatus: AgentStatus;
  lastHeartbeat: string;
  deviceId: string;
  agentVersion: string;
  ipAddress: string;
  isp: string;
  connectionType: 'Fiber' | 'Wireless / Radio' | 'Satellite' | 'DSL';
  studentCount: number;
  trend: HealthTrend;
  recentPingHistory: number[];
  recentDownloadHistory: number[];
  mainIssue?: string;
}
