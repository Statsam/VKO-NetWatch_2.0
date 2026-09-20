import React from 'react';

interface RadialHealthGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  subtitle?: string;
  showDetails?: boolean;
}

export const RadialHealthGauge: React.FC<RadialHealthGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  subtitle = 'Network Health',
  showDetails = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 85) {
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-500 dark:text-emerald-400',
        bg: 'text-emerald-500/15',
        glow: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (clampedScore >= 65) {
      return {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-500 dark:text-amber-400',
        bg: 'text-amber-500/15',
        glow: 'rgba(245, 158, 11, 0.25)',
      };
    }
    return {
      stroke: '#f43f5e', // rose-500
      text: 'text-rose-500 dark:text-rose-400',
      bg: 'text-rose-500/15',
      glow: 'rgba(244, 63, 94, 0.25)',
    };
  };

  const colors = getColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>
            {clampedScore}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            / 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</div>
          <div className={`text-sm font-semibold mt-0.5 ${colors.text}`}>
            {clampedScore >= 85 ? 'Optimal / Healthy' : clampedScore >= 65 ? 'Elevated Warning' : 'Critical Degradation'}
          </div>
        </div>
      )}
    </div>
  );
};
