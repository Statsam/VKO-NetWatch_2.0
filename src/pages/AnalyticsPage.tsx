import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { exportToCsv } from '../utils/exportCsv';
import {
  BarChart3,
  Calendar,
  Download,
  Activity,
  Layers,
  Globe,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { schools, healthSummary } = useDashboard();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');

  // Group schools by district / city for district comparison chart
  const districtData = [
    { district: 'Усть-Каменогорск', avgPing: 24, avgDownload: 86, schools: 6 },
    { district: 'Семей', avgPing: 29, avgDownload: 78, schools: 4 },
    { district: 'Риддер', avgPing: 42, avgDownload: 62, schools: 2 },
    { district: 'Алтай', avgPing: 54, avgDownload: 48, schools: 3 },
    { district: 'Зайсан', avgPing: 72, avgDownload: 32, schools: 2 },
    { district: 'Курчатов', avgPing: 31, avgDownload: 82, schools: 1 },
    { district: 'Аягоз', avgPing: 58, avgDownload: 41, schools: 1 },
    { district: 'Катон-Карагай', avgPing: 94, avgDownload: 22, schools: 1 },
  ];

  // Connection type distribution
  const connectionTypes = [
    { name: 'Оптика (GPON)', value: 11, color: '#06b6d4' },
    { name: 'Metro Ethernet', value: 4, color: '#3b82f6' },
    { name: 'Радиорелейная линия', value: 3, color: '#f59e0b' },
    { name: 'Медь / VDSL', value: 1, color: '#8b5cf6' },
    { name: '4G LTE Фиксированный', value: 1, color: '#f43f5e' },
  ];

  // Hourly latency progression across the region
  const regionalHourlyTrends = [
    { hour: '06:00', ping: 26, packetLoss: 0.1, trafficLoad: 12 },
    { hour: '08:00', ping: 34, packetLoss: 0.4, trafficLoad: 45 },
    { hour: '10:00', ping: 48, packetLoss: 1.2, trafficLoad: 88 },
    { hour: '12:00', ping: 44, packetLoss: 0.9, trafficLoad: 72 },
    { hour: '14:00', ping: 52, packetLoss: 1.6, trafficLoad: 94 },
    { hour: '16:00', ping: 39, packetLoss: 0.6, trafficLoad: 60 },
    { hour: '18:00', ping: 29, packetLoss: 0.2, trafficLoad: 25 },
    { hour: '20:00', ping: 25, packetLoss: 0.1, trafficLoad: 15 },
  ];

  const handleExportAnalytics = () => {
    const exportData = districtData.map((d) => ({
      Район_Город: d.district,
      Средний_Пинг_мс: d.avgPing,
      Средний_Download_Мбит: d.avgDownload,
      Количество_Школ: d.schools,
    }));
    exportToCsv('vko-netwatch-analitika-rayonov', exportData);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Analytics Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Региональная телеметрия и аналитика инфраструктуры ВКО
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Сравнительный анализ качества связи по районам, средам передачи данных и стабильности соединений.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['today', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {r === 'today' ? 'Сегодня' : r === '7d' ? '7 дней' : '30 дней'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Экспорт отчёта в CSV</span>
          </button>
        </div>
      </div>

      {/* Regional Averages Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Средний Ping</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {healthSummary?.averagePingMs ?? 34} <span className="text-xs text-slate-400 font-normal">мс</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-500">В норме у 85% школ области</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Региональный Jitter</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {healthSummary?.averageJitterMs ?? 9.2} <span className="text-xs text-slate-400 font-normal">мс</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Плавная видеосвязь для уроков</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Потери пакетов</div>
          <div className="mt-1 text-2xl font-black font-mono text-emerald-500">
            {healthSummary?.averagePacketLossPercent ?? 0.8}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">В пределах допустимого (&lt; 2%)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Средний Download</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {healthSummary?.averageDownloadMbps ?? 64.5} <span className="text-xs text-slate-400 font-normal">Мб/с</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-500">+12% к прошлому кварталу</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Средний Upload</div>
          <div className="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {healthSummary?.averageUploadMbps ?? 28.1} <span className="text-xs text-slate-400 font-normal">Мб/с</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Достаточно для Kundelik.kz</div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Latency & Throughput Comparison */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Сравнение скорости и задержки по районам ВКО
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Задержка (мс) vs Скорость загрузки (Мбит/с)
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="district"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
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
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                <Bar dataKey="avgDownload" name="Download (Мбит/с)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgPing" name="Задержка (мс)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connection Type Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Распределение типов подключения
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Доля оптики, радиоканалов и медных линий в школах
              </p>
            </div>
            <PieChartIcon className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={connectionTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {connectionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Hourly Profile (Classroom Peak Hours) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Суточный профиль задержки и сетевой нагрузки
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Пик школьной нагрузки приходится на 10:00 - 14:00 (онлайн-тестирования, электронные журналы)
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regionalHourlyTrends} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
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
                  dataKey="ping"
                  name="Средний Ping (мс)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="trafficLoad"
                  name="Нагрузка канала (%)"
                  stroke="#a855f7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
