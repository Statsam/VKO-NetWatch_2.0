import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RadialHealthGauge } from '../components/ui/RadialHealthGauge';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Activity,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Bell,
  Cpu,
  Clock,
  Check,
} from 'lucide-react';

export const NetworkHealthPage: React.FC = () => {
  const { healthSummary, earlyWarnings, schools, navigateTo } = useDashboard();

  // Interactive Health Score Simulator
  const [simPing, setSimPing] = useState<number>(35);
  const [simJitter, setSimJitter] = useState<number>(8);
  const [simLoss, setSimLoss] = useState<number>(0.2);
  const [simDown, setSimDown] = useState<number>(65);

  const calculateSimScore = (ping: number, jitter: number, loss: number, down: number) => {
    let penalty = 0;
    // Loss penalty: 3.0 pts per 1% loss
    penalty += loss * 3.0;
    // Latency penalty: 0.4 pts per ms above 80ms
    if (ping > 80) penalty += (ping - 80) * 0.4;
    // Jitter penalty: 0.5 pts per ms above 20ms
    if (jitter > 20) penalty += (jitter - 20) * 0.5;
    // Bandwidth penalty: 1.5 pts per Mbps below 20 Mbps
    if (down < 20) penalty += (20 - down) * 1.5;

    return Math.max(10, Math.min(100, Math.round(100 - penalty)));
  };

  const calculatedScore = calculateSimScore(simPing, simJitter, simLoss, simDown);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Smart Network Health & Predictive Early Warning Engine
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Algorithmic quality scoring based on international ITU-T standards for classroom digital education and video conferencing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 text-right">
            <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {healthSummary?.overallScore ?? 92}/100
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Regional Average</span>
          </div>
        </div>
      </div>

      {/* Section 13: Early Warning Cards */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Predictive Anomaly Warnings ({earlyWarnings.length} Active)
            </h3>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
            Pre-Incident Mitigation Phase
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earlyWarnings.map((warning) => (
            <div
              key={warning.id}
              className="rounded-xl border border-amber-500/20 bg-white dark:bg-slate-900/90 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-500">{warning.schoolId}</span>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase">
                      Degrading
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {warning.schoolName}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-500">
                    <Clock className="h-3.5 w-3.5" />
                    {warning.projectedTime || warning.detectedAt || '~15 min'}
                  </span>
                  <div className="text-[10px] text-slate-400">Projected Breach</div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Observed Trend: </span>
                {warning.detectedPattern}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-200">Recommended Action: </strong>
                {warning.recommendedAction}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => navigateTo('school-details', warning.schoolId)}
                  className="text-cyan-500 font-semibold hover:underline"
                >
                  Inspect Telemetry Graph →
                </button>
                <button
                  onClick={() => alert(`ISP Alert transmitted for ${warning.schoolName}. Ticket #WARN-551 opened.`)}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-xs font-semibold shadow-xs transition"
                >
                  Notify ISP Dispatch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 12: Scoring Formula & Interactive Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scoring Algorithm Breakdown */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            <Cpu className="h-4 w-4 text-cyan-500" />
            <span>Mathematical Health Index Model</span>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-cyan-400 overflow-x-auto leading-relaxed border border-slate-800">
            <div>Score = 100 - (</div>
            <div className="pl-4 text-rose-400">LossPenalty: PacketLoss% * 3.0 +</div>
            <div className="pl-4 text-amber-400">PingPenalty: (Ping &gt; 80ms ? (Ping - 80) * 0.4 : 0) +</div>
            <div className="pl-4 text-purple-400">JitterPenalty: (Jitter &gt; 20ms ? (Jitter - 20) * 0.5 : 0) +</div>
            <div className="pl-4 text-blue-400">BandwidthDeficit: (Down &lt; 20Mbps ? (20 - Down) * 1.5 : 0)</div>
            <div>)</div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Unlike simple ping averages, the VKO NetWatch score severely penalizes frame loss (which destroys video conferencing and online exam submissions) while providing headroom for satellite radio delays in mountain districts.
          </p>

          {/* Weight Visualizers */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Packet Loss Impact (Integrity)</span>
                <span className="font-mono text-rose-500">40% Weight</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[40%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Round-Trip Latency (Responsiveness)</span>
                <span className="font-mono text-amber-500">25% Weight</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Throughput SLA (Bandwidth)</span>
                <span className="font-mono text-blue-500">20% Weight</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[20%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Jitter & Bufferbloat (Stability)</span>
                <span className="font-mono text-purple-500">15% Weight</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[15%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Formula Calculator / Simulator */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              <Sliders className="h-4 w-4 text-cyan-500" />
              <span>Interactive Formula Simulator</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Simulated Ping:</span>
                  <span className="font-mono font-bold text-cyan-500">{simPing} ms</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  value={simPing}
                  onChange={(e) => setSimPing(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Simulated Jitter:</span>
                  <span className="font-mono font-bold text-purple-500">{simJitter} ms</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={simJitter}
                  onChange={(e) => setSimJitter(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Simulated Packet Loss:</span>
                  <span className="font-mono font-bold text-rose-500">{simLoss.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={simLoss}
                  onChange={(e) => setSimLoss(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Simulated Download:</span>
                  <span className="font-mono font-bold text-blue-500">{simDown} Mbps</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  value={simDown}
                  onChange={(e) => setSimDown(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">
            <RadialHealthGauge
              score={calculatedScore}
              size={130}
              strokeWidth={10}
              subtitle="Calculated Output"
            />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Classified Tier</span>
              <div className="mt-1">
                <StatusBadge
                  status={calculatedScore >= 85 ? 'healthy' : calculatedScore >= 65 ? 'warning' : 'critical'}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
