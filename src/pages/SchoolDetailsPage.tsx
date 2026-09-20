import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { measurementsApi, HistoricalDataPoint } from '../api/measurements';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../components/ui/SkeletonLoader';
import {
  ArrowLeft,
  Activity,
  Wifi,
  HardDrive,
  Clock,
  Radio,
  Server,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const SchoolDetailsPage: React.FC = () => {
  const { selectedSchoolId, schools, incidents, navigateTo, earlyWarnings } = useDashboard();
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h' | '7d'>('1h');
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isSimulatingPing, setIsSimulatingPing] = useState<boolean>(false);

  const school = schools.find((s) => s.id === selectedSchoolId) || schools[0];

  useEffect(() => {
    if (!school) return;
    let isMounted = true;
    setIsLoadingHistory(true);
    measurementsApi.getHistorical(school.id, timeRange).then((data) => {
      if (isMounted) {
        setHistory(data);
        setIsLoadingHistory(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [school?.id, timeRange]);

  if (!school) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Школа не найдена.</p>
        <button
          onClick={() => navigateTo('schools')}
          className="mt-4 text-xs font-semibold text-cyan-500"
        >
          Вернуться к списку школ
        </button>
      </div>
    );
  }

  const m = school.lastMeasurement;
  const schoolIncidents = incidents.filter((i) => i.schoolId === school.id);
  const schoolWarning = earlyWarnings.find((w) => w.schoolId === school.id);

  const handleSimulatePing = () => {
    setIsSimulatingPing(true);
    setTimeout(() => {
      setIsSimulatingPing(false);
    }, 1200);
  };

  const timeRangeLabels: Record<typeof timeRange, string> = {
    '15m': '15 минут',
    '1h': '1 час',
    '6h': '6 часов',
    '24h': '24 часа',
    '7d': '7 дней',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-sm">
        <div className="space-y-1">
          <button
            onClick={() => navigateTo('schools')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-cyan-500 transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Назад ко всем школам</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {school.name}
            </h2>
            <span className="font-mono text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-md">
              {school.id}
            </span>
            <StatusBadge status={school.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {school.city}, {school.district} • {school.isp} ({school.connectionType === 'Fiber' ? 'Оптика' : school.connectionType === 'Wireless / Radio' ? 'Радиоканал' : school.connectionType === 'DSL' ? 'Медь / VDSL' : 'Спутник'}) • IP: {school.ipAddress}
          </p>
        </div>

        {/* Right Header Stats & Ping Simulator */}
        <div className="flex items-center gap-4 self-start md:self-auto">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 text-right border border-slate-200/60 dark:border-slate-700/50">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {school.healthScore}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Индекс здоровья</span>
          </div>

          <button
            onClick={handleSimulatePing}
            disabled={isSimulatingPing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSimulatingPing ? 'animate-spin' : ''}`} />
            <span>{isSimulatingPing ? 'Опрос агента...' : 'Запустить зонд агента'}</span>
          </button>
        </div>
      </div>

      {/* Early Warning Banner if active for this school */}
      {schoolWarning && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-800 dark:text-amber-300">
                Раннее предупреждение: Обнаружен тренд постепенного ухудшения связи
              </div>
              <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                {schoolWarning.detectedPattern}. Ожидаемый подход к критическому порогу через {schoolWarning.projectedTime}.
              </p>
              <div className="mt-2 text-slate-600 dark:text-slate-400">
                <strong>Рекомендуемое действие:</strong> {schoolWarning.recommendedAction}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards (Ping, Jitter, Loss, Down, Up) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ping (Задержка)</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {m.pingMs} <span className="text-xs text-slate-400 font-normal">мс</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">RTT до шлюза ВКО</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Jitter (Дрожание)</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {m.jitterMs} <span className="text-xs text-slate-400 font-normal">мс</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Колебания задержки</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Потери пакетов</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {m.packetLossPercent} <span className="text-xs text-slate-400 font-normal">%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Отброшенные кадры</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Download (Входящая)</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {m.downloadMbps} <span className="text-xs text-slate-400 font-normal">Мб/с</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Пропускная способность</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Upload (Исходящая)</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {m.uploadMbps} <span className="text-xs text-slate-400 font-normal">Мб/с</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Канал передачи данных</div>
        </div>
      </div>

      {/* Time Range Selector Tabs (15 минут, 1 час, 6 часов, 24 часа, 7 дней) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Исторические графики телеметрии
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['15m', '1h', '6h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {timeRangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Latency & Jitter */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Задержка (Ping) и Джиттер
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Круговое время доставки пакетов (мс)
              </p>
            </div>
            <span className="font-mono text-xs text-cyan-500 font-semibold">мс</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="pingMs"
                  name="Ping (мс)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="jitterMs"
                  name="Jitter (мс)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Throughput (Download & Upload) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Скорость загрузки и отдачи
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Реальная пропускная способность канала (Мбит/с)
              </p>
            </div>
            <span className="font-mono text-xs text-emerald-500 font-semibold">Мбит/с</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="downloadMbps"
                  name="Download (Мбит/с)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#downGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="uploadMbps"
                  name="Upload (Мбит/с)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hardware Agent Diagnostics & Active School Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hardware Agent Specifications */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Параметры агента и оборудования
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">Статус агента</span>
              <div className="mt-1 font-bold flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{school.agentStatus === 'online' ? 'Агент Онлайн' : 'Агент Офлайн'}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">Идентификатор устройства</span>
              <div className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                {school.deviceId}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">Версия ПО Агента</span>
              <div className="mt-1 font-mono font-bold text-cyan-500">
                {school.agentVersion}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">IP-адрес в школьной сети</span>
              <div className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                {school.ipAddress}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">Провайдер связи (ISP)</span>
              <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                {school.isp}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400 text-[11px]">Число учащихся в школе</span>
              <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                {school.studentCount} учеников
              </div>
            </div>
          </div>
        </div>

        {/* Right: Incidents for this school */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Журнал инцидентов школы ({schoolIncidents.length})
            </h3>
            <button
              onClick={() => navigateTo('incidents')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Все инциденты
            </button>
          </div>

          {schoolIncidents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <span>По данной школе нет активных или недавних инцидентов.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {schoolIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => navigateTo('incident-details', inc.id)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-500">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.status === 'active'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {inc.status === 'active' ? 'Активен' : 'Решён'}
                    </span>
                  </div>
                  <div className="mt-1 font-bold text-xs text-slate-900 dark:text-white">
                    {inc.value}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">
                    {inc.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
