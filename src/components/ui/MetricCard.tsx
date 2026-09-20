import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  badge?: string;
  variant?: 'default' | 'healthy' | 'warning' | 'critical' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  variant = 'default',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'healthy':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          hoverBorder: 'hover:border-emerald-500/40',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          hoverBorder: 'hover:border-amber-500/40',
        };
      case 'critical':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          hoverBorder: 'hover:border-rose-500/40',
        };
      default:
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          hoverBorder: 'hover:border-cyan-500/30',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-all duration-200 ${
        onClick ? `cursor-pointer ${vStyles.hoverBorder} hover:shadow-md hover:-translate-y-0.5` : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {value}
            </span>
            {badge && (
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${vStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isNeutral
                ? 'text-slate-500 dark:text-slate-400'
                : trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
