import React from 'react';
import { SchoolStatus, AgentStatus } from '../../types/school';
import { IncidentSeverity } from '../../types/incident';

interface StatusBadgeProps {
  status: SchoolStatus | AgentStatus | IncidentSeverity | 'active' | 'resolved' | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showIcon = true }) => {
  const s = status.toLowerCase();

  const getStyle = () => {
    switch (s) {
      case 'healthy':
      case 'online':
      case 'resolved':
      case 'improving':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          symbol: '●',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'warning':
      case 'warning trend':
      case 'degrading':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
          dot: 'bg-amber-500',
          symbol: '▲',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'critical':
      case 'active':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400',
          dot: 'bg-rose-500 animate-pulse',
          symbol: '●',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'offline':
      case 'inactive':
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-400',
          dot: 'bg-slate-500',
          symbol: '○',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      default:
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400',
          dot: 'bg-blue-500',
          symbol: '●',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap font-medium ${sizeClasses} ${style.bg}`}
    >
      {showIcon && (
        <span className="text-[10px] leading-none" aria-hidden="true">
          {style.symbol}
        </span>
      )}
      <span>{style.label}</span>
    </span>
  );
};
