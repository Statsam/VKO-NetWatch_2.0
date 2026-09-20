import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { School, SchoolStatus } from '../types/school';
import { StatusBadge } from '../components/ui/StatusBadge';
import { exportToCsv } from '../utils/exportCsv';
import {
  Search,
  ArrowUpDown,
  Download,
  Filter,
  GraduationCap,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Radio,
  Server,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const SchoolsPage: React.FC = () => {
  const { schools, navigateTo } = useDashboard();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'critical' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'health' | 'ping' | 'loss' | 'download' | 'lastUpdate'>('health');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter & Sort Logic
  const processedSchools = useMemo(() => {
    let list = [...schools];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'offline') {
        list = list.filter((s) => s.agentStatus === 'offline');
      } else {
        list = list.filter((s) => s.status === statusFilter);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.isp.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortBy) {
        case 'health':
          valA = a.healthScore;
          valB = b.healthScore;
          break;
        case 'ping':
          valA = a.lastMeasurement.pingMs;
          valB = b.lastMeasurement.pingMs;
          break;
        case 'loss':
          valA = a.lastMeasurement.packetLossPercent;
          valB = b.lastMeasurement.packetLossPercent;
          break;
        case 'download':
          valA = a.lastMeasurement.downloadMbps;
          valB = b.lastMeasurement.downloadMbps;
          break;
        case 'lastUpdate':
          valA = new Date(a.lastMeasurement.timestamp).getTime();
          valB = new Date(b.lastMeasurement.timestamp).getTime();
          break;
      }

      if (sortOrder === 'asc') return valA - valB;
      return valB - valA;
    });

    return list;
  }, [schools, statusFilter, search, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedSchools.length / itemsPerPage) || 1;
  const paginatedSchools = processedSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (type: typeof sortBy) => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const exportData = processedSchools.map((s) => ({
      ID_Школы: s.id,
      Название_Школы: s.name,
      Город_Село: s.city,
      Район_ВКО: s.district,
      Статус: s.status === 'healthy' ? 'Норма' : s.status === 'warning' ? 'Внимание' : 'Критический',
      Индекс_Здоровья: s.healthScore,
      Пинг_мс: s.lastMeasurement.pingMs,
      Джиттер_мс: s.lastMeasurement.jitterMs,
      Потери_процент: s.lastMeasurement.packetLossPercent,
      Download_Мбит_с: s.lastMeasurement.downloadMbps,
      Upload_Мбит_с: s.lastMeasurement.uploadMbps,
      Провайдер: s.isp,
      Тип_Линии: s.connectionType,
      Статус_Агента: s.agentStatus === 'online' ? 'Онлайн' : 'Офлайн',
      Последнее_Измерение: s.lastMeasurement.timestamp,
    }));
    exportToCsv('vko-netwatch-shkoly', exportData);
  };

  const filterLabels: Record<typeof statusFilter, string> = {
    all: 'Все школы',
    healthy: '● Норма',
    warning: '▲ Внимание',
    critical: '● Критические',
    offline: 'Агент офлайн',
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Controls Bar: Search, Status Filter, CSV Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Поиск школы по названию, ID, городу, провайдеру..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['all', 'healthy', 'warning', 'critical', 'offline'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {filterLabels[st]}
              </button>
            ))}
          </div>

          {/* Export CSV Button (Section 22 requirement) */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Экспорт в CSV</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-slate-400">
              <th className="py-3.5 px-4 font-semibold">Статус</th>
              <th className="py-3.5 px-4 font-semibold">Школа и населённый пункт</th>
              <th
                className="py-3.5 px-3 font-semibold text-center cursor-pointer hover:text-slate-200"
                onClick={() => handleSort('health')}
              >
                <span className="inline-flex items-center gap-1">
                  Здоровье <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort('ping')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Ping <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">Jitter</th>
              <th
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort('loss')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Потери <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort('download')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Download <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="py-3.5 px-3 font-semibold text-right">Upload</th>
              <th className="py-3.5 px-3 font-semibold text-center">Агент</th>
              <th className="py-3.5 px-4 font-semibold text-right">Синхронизация</th>
              <th className="py-3.5 px-4 font-semibold text-center">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedSchools.map((school) => {
              const m = school.lastMeasurement;
              return (
                <tr
                  key={school.id}
                  onClick={() => navigateTo('school-details', school.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition group"
                >
                  <td className="py-3.5 px-4">
                    <StatusBadge status={school.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                      {school.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-500 font-semibold">{school.id}</span> • {school.city} ({school.isp})
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 font-extrabold font-mono text-xs ${
                        school.healthScore >= 85
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : school.healthScore >= 65
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {school.healthScore}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-semibold">
                    <span
                      className={
                        m.pingMs >= 150
                          ? 'text-rose-400'
                          : m.pingMs >= 80
                          ? 'text-amber-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {m.pingMs} мс
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                    {m.jitterMs} мс
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-semibold">
                    <span
                      className={
                        m.packetLossPercent >= 5
                          ? 'text-rose-500'
                          : m.packetLossPercent >= 1
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }
                    >
                      {m.packetLossPercent}%
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {m.downloadMbps} Мб/с
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                    {m.uploadMbps} Мб/с
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        school.agentStatus === 'online' ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          school.agentStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{school.agentStatus === 'online' ? 'Онлайн' : 'Офлайн'}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {school.lastHeartbeat}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('school-details', school.id);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 transition"
                    >
                      Карточка
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
        {paginatedSchools.map((school) => {
          const m = school.lastMeasurement;
          return (
            <div
              key={school.id}
              onClick={() => navigateTo('school-details', school.id)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm space-y-3 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-500">{school.id}</span>
                    <StatusBadge status={school.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
                    {school.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {school.city} • {school.district}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {school.healthScore}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </div>
                  <span className="text-[10px] uppercase text-slate-400">Индекс</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div>
                  <div className="text-[10px] text-slate-400">Ping</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {m.pingMs} мс
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Jitter</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {m.jitterMs} мс
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Потери</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {m.packetLossPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Скорость</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {m.downloadMbps} Мб/с
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
        <div>
          Показано <span className="font-bold text-slate-900 dark:text-white">{paginatedSchools.length}</span> из{' '}
          <span className="font-bold text-slate-900 dark:text-white">{processedSchools.length}</span> школ ВКО
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Назад</span>
          </button>
          <span className="px-3 font-semibold text-slate-700 dark:text-slate-300">
            Страница {currentPage} из {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span>Вперёд</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
