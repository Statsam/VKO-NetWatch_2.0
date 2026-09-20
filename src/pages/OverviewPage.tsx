import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Wifi,
  Radio,
  MapPin,
  Flame,
  ArrowRight,
  Zap,
  CheckCircle,
  BarChart3,
  Cpu,
  Server,
  RotateCw,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/ui/MetricCard';
import { RadialHealthGauge } from '../components/ui/RadialHealthGauge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { EastKazakhstanMap } from '../components/map/EastKazakhstanMap';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const {
    schools,
    incidents,
    healthSummary,
    activityFeed,
    earlyWarnings,
    navigateTo,
    isLoading,
    lastSyncSecondsAgo,
    isDemoMode,
    hasError,
    errorMessage,
    refreshData,
    apiBaseUrl,
    toggleUseMockApi,
  } = useDashboard();

  if (hasError && !healthSummary) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
          <Server className="h-7 w-7 animate-pulse" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Ожидание подключения к ASP.NET Core API
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Фронтенд настроен на работу с реальным бэкендом по адресу <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-cyan-600 dark:text-cyan-400">{apiBaseUrl}</code>.
        </p>
        {errorMessage && (
          <div className="text-left font-mono text-[11px] p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 text-rose-500 border border-rose-500/20 overflow-x-auto">
            {errorMessage}
          </div>
        )}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => refreshData()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Повторить подключение</span>
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <span>Настройки API</span>
          </button>
          <button
            onClick={() => toggleUseMockApi(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            <span>Включить Mock API (офлайн)</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !healthSummary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Schools requiring attention (Section 11 requirement)
  const schoolsRequiringAttention = schools
    .filter((s) => s.status !== 'healthy' || s.trend === 'degrading' || s.agentStatus === 'offline')
    .slice(0, 5);

  // Hourly trend data
  const trendData = [
    { time: '08:00', health: 94, ping: 28, download: 84 },
    { time: '09:00', health: 93, ping: 31, download: 81 },
    { time: '10:00', health: 91, ping: 35, download: 76 },
    { time: '11:00', health: 88, ping: 42, download: 68 },
    { time: '12:00', health: 86, ping: 48, download: 62 },
    { time: '13:00', health: 89, ping: 39, download: 72 },
    { time: '14:00', health: healthSummary.overallScore, ping: healthSummary.averagePingMs, download: healthSummary.averageDownloadMbps },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Early Warning Banner (Section 13 requirement) */}
      {earlyWarnings.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-sm shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Система раннего предупреждения
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    Обнаружено трендов: {earlyWarnings.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{earlyWarnings[0].schoolName}</span>: {earlyWarnings[0].detectedPattern}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('network-health')}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              <span>Проверить умное состояние</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top 5 KPI Cards (Section 5 requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          id="kpi-total-schools"
          title="Всего школ"
          value={healthSummary.totalSchoolsCount}
          subtitle="Мониторинг в ВКО"
          icon={GraduationCap}
          trend={{ value: '+2 школы', label: 'в этом месяце', isPositive: true }}
          onClick={() => navigateTo('schools')}
        />
        <MetricCard
          id="kpi-healthy"
          title="В норме"
          value={healthSummary.healthySchoolsCount}
          subtitle="В пределах нормы SLA"
          icon={ShieldCheck}
          variant="healthy"
          trend={{ value: '79.2%', label: 'доля нормы', isPositive: true }}
          onClick={() => navigateTo('schools')}
        />
        <MetricCard
          id="kpi-warning"
          title="Требуют внимания"
          value={healthSummary.warningSchoolsCount}
          subtitle="Колебания задержки / потерь"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: '3 узла', label: 'повышенная нагрузка', isNeutral: true }}
          onClick={() => navigateTo('schools')}
        />
        <MetricCard
          id="kpi-critical"
          title="Критические"
          value={healthSummary.criticalSchoolsCount}
          subtitle="Требуется вмешательство"
          icon={AlertCircle}
          variant="critical"
          trend={{ value: '2 узла', label: 'превышение порога', isPositive: false }}
          onClick={() => navigateTo('schools')}
        />
        <MetricCard
          id="kpi-active-incidents"
          title="Активные инциденты"
          value={healthSummary.activeIncidentsCount}
          subtitle="Превышение порогов"
          icon={Activity}
          variant={healthSummary.activeIncidentsCount > 0 ? 'critical' : 'healthy'}
          trend={{ value: '1 решён', label: 'за последние 24ч', isNeutral: true }}
          onClick={() => navigateTo('incidents')}
        />
      </div>

      {/* Hero Block: Live Network Status (Section 6 requirement) + Regional Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Network Status Block */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Состояние инфраструктуры
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Состояние сети в реальном времени
                </h2>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Данные обновляются</span>
              </div>
            </div>

            {/* Main Score & Radial Gauge */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-around gap-6">
              <RadialHealthGauge score={healthSummary.overallScore} size={150} />
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Статус: Стабильно (Норма)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[210px]">
                  Интегральный индекс рассчитан на базе задержки, джиттера, потерь и полосы пропускания 24 школ.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                  <TrendingDown className="h-4 w-4" />
                  <span>-2% за последний час</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Averages 5-Metric Matrix (Section 6 requirement) */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              Средние региональные метрики (ВКО)
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-[10px] text-slate-400 font-medium">Ping</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {healthSummary.averagePingMs} мс
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-[10px] text-slate-400 font-medium">Jitter</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {healthSummary.averageJitterMs} мс
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-[10px] text-slate-400 font-medium">Потери</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {healthSummary.averagePacketLossPercent}%
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-[10px] text-slate-400 font-medium">Download</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {healthSummary.averageDownloadMbps}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-[10px] text-slate-400 font-medium">Upload</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {healthSummary.averageUploadMbps}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>● Данные обновляются каждые 30 сек</span>
              <span>Последнее обновление: {lastSyncSecondsAgo} сек назад</span>
            </div>
          </div>
        </div>

        {/* Right: Network Dynamic Graph */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Динамика сети
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Суточный тренд качества и пинга (ВКО)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span>Индекс здоровья (%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Пинг (мс)</span>
              </span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'health' ? `${val}%` : `${val} мс`,
                    name === 'health' ? 'Индекс здоровья' : 'Средний пинг',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="health"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHealth)"
                  name="health"
                />
                <Area
                  type="monotone"
                  dataKey="ping"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPing)"
                  name="ping"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Пик нагрузки зафиксирован в 12:00 (увеличение задержки до 48 мс)</span>
            <button
              onClick={() => navigateTo('analytics')}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Полная аналитика</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* East Kazakhstan Real Interactive Leaflet Map (Section 4 requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Географический мониторинг
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Интерактивная карта Восточно-Казахстанской области
            </h2>
          </div>
          <button
            onClick={() => navigateTo('map')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Развернуть карту во весь экран</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <EastKazakhstanMap
          schools={schools}
          onSelectSchool={(schoolId) => navigateTo('school-details', schoolId)}
          onViewIncident={(incidentId) => navigateTo('incident-details', incidentId)}
        />
      </div>

      {/* Two Columns: Schools Requiring Attention (Section 11) & Live Activity Feed (Section 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Schools Requiring Attention (Section 11 requirement) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Школы, требующие внимания
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Узлы сети с ухудшающейся связью или превышением порогов
                </p>
              </div>
              <button
                onClick={() => navigateTo('schools')}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Все школы ({schools.length})
              </button>
            </div>

            {/* Schools Attention Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2.5">Школа / ID</th>
                    <th className="pb-2.5">Населённый пункт</th>
                    <th className="pb-2.5">Состояние</th>
                    <th className="pb-2.5">Основная проблема</th>
                    <th className="pb-2.5">Тенденция</th>
                    <th className="pb-2.5 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {schoolsRequiringAttention.map((school) => (
                    <tr
                      key={school.id}
                      onClick={() => navigateTo('school-details', school.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 pr-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {school.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{school.id}</div>
                      </td>
                      <td className="py-3 pr-2 text-slate-600 dark:text-slate-300">
                        {school.city}
                      </td>
                      <td className="py-3 pr-2">
                        <StatusBadge status={school.status} size="sm" />
                      </td>
                      <td className="py-3 pr-2 text-slate-500 dark:text-slate-400 text-[11px] max-w-[180px] truncate">
                        {school.mainIssue || 'Флуктуации метрик'}
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                            school.trend === 'degrading'
                              ? 'text-rose-500'
                              : school.trend === 'improving'
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {school.trend === 'degrading' ? (
                            <>
                              <TrendingDown className="h-3.5 w-3.5" />
                              <span>Ухудшается</span>
                            </>
                          ) : school.trend === 'improving' ? (
                            <>
                              <TrendingUp className="h-3.5 w-3.5" />
                              <span>Улучшается</span>
                            </>
                          ) : (
                            <span>Стабильно</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('school-details', school.id);
                          }}
                          className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-600 p-1.5 text-slate-600 dark:text-slate-300 transition"
                          title="Открыть школу"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Feed (Section 12 requirement) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Последние события (Live Activity)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Лента событий и диагностических срабатываний в реальном времени
                </p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>В эфире</span>
              </span>
            </div>

            <div className="space-y-3">
              {activityFeed.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    if (act.schoolId) navigateTo('school-details', act.schoolId);
                  }}
                  className="group flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      act.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-500'
                        : act.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {act.severity === 'critical' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : act.severity === 'warning' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {act.timestamp}
                      </span>
                      <span className="text-[10px] text-cyan-500 group-hover:underline font-medium truncate">
                        {act.schoolId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-snug">
                      {act.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Обновляется агентами школ каждые 30 секунд</span>
            <button
              onClick={() => navigateTo('network-health')}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              Смотреть журнал
            </button>
          </div>
        </div>
      </div>

      {/* 3 Innovative Features Cards (Section 13 requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Инновационные возможности VKO NetWatch
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Интеллектуальный анализ и раннее прогнозирование
            </h2>
          </div>
          <button
            onClick={() => navigateTo('network-health')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Открыть модуль Smart Health</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Smart Network Health */}
          <div
            onClick={() => navigateTo('network-health')}
            className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs hover:border-cyan-500/50 hover:shadow-lg transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                Функция №1
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition">
              Умное состояние сети (Smart Health)
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Не просто онлайн/офлайн: алгоритмический расчёт здоровья каждого узла (0–100) по 5 взвешенным метрикам качества соединения.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              <span>Изучить методику расчёта</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </div>

          {/* Card 2: Early Warning */}
          <div
            onClick={() => navigateTo('network-health')}
            className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs hover:border-amber-500/50 hover:shadow-lg transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Функция №2
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition">
              Раннее предупреждение (Early Warning)
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Обнаружение деградации до наступления сбоя. Анализ последовательного роста задержек (72 → 84 → 96 мс) с прогнозом времени отказа.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span>{earlyWarnings.length} активных тренда</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </div>

          {/* Card 3: Network Risk Index */}
          <div
            onClick={() => navigateTo('network-health')}
            className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-lg transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                Функция №3
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition">
              Индекс риска сети (Risk Index)
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Предиктивная оценка вероятности сбоев по районам ВКО на основе нестабильности среды, типа линии (оптика/радио) и загрузки буферов.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Оценка рисков районов</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
