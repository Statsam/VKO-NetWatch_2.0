import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Incident } from '../types/incident';
import { StatusBadge } from '../components/ui/StatusBadge';
import { exportToCsv } from '../utils/exportCsv';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ArrowLeft,
  Check,
  Wrench,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const {
    incidents,
    navigateTo,
    acknowledgeIncident,
    resolveIncident,
    selectedIncidentId,
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [search, setSearch] = useState<string>('');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchSearch =
        !search.trim() ||
        inc.id.toLowerCase().includes(search.toLowerCase()) ||
        inc.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        inc.schoolId.toLowerCase().includes(search.toLowerCase()) ||
        inc.value.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSeverity && matchSearch;
    });
  }, [incidents, statusFilter, severityFilter, search]);

  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status === 'active').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  const handleExportCsv = () => {
    const data = filteredIncidents.map((i) => ({
      ID_Инцидента: i.id,
      ID_Школы: i.schoolId,
      Название_Школы: i.schoolName,
      Тип: i.type,
      Уровень: i.severity === 'critical' ? 'Критический' : 'Внимание',
      Статус: i.status === 'active' ? 'Активен' : 'Решён',
      Значение: i.value,
      Порог: i.threshold,
      Время_Обнаружения: i.timeDetected || i.createdAt,
      Длительность: i.duration || '24 мин',
      Причина: i.potentialReason || i.description,
    }));
    exportToCsv('vko-netwatch-intsidenty', data);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Критические нерешённые
            </div>
            <div className="mt-1 text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {criticalCount}
            </div>
            <span className="text-[11px] text-slate-500">Требуется вмешательство инженера</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              Всего активных инцидентов
            </div>
            <div className="mt-1 text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {activeCount}
            </div>
            <span className="text-[11px] text-slate-500">Текущие нарушения порогов</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              Решено за последние 24ч
            </div>
            <div className="mt-1 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {resolvedCount}
            </div>
            <span className="text-[11px] text-slate-500">Нормальная связь восстановлена</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID инцидента, школе, типу проблемы..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['all', 'active', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'Все' : st === 'active' ? 'Активные' : 'Решённые'}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['all', 'critical', 'warning'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  severityFilter === sev
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sev === 'all' ? 'Все уровни' : sev === 'critical' ? 'Критические' : 'Внимание'}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Экспорт в CSV</span>
          </button>
        </div>
      </div>

      {/* Incidents List (Section 10 requirement) */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-12 text-center text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-semibold">Инцидентов по выбранным фильтрам не найдено.</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isCritical = incident.severity === 'critical';
            return (
              <div
                key={incident.id}
                onClick={() => navigateTo('incident-details', incident.id)}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        {incident.id}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {isCritical ? 'Критический' : 'Внимание'}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          incident.status === 'active'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {incident.status === 'active' ? 'Активен' : 'Решён'}
                      </span>
                      {incident.acknowledged && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                          Принят дежурным инженером
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition truncate">
                        {incident.schoolName}
                      </h3>
                      <span className="font-mono text-xs text-slate-400 shrink-0">
                        ({incident.schoolId})
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      {incident.value}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {incident.description}
                    </p>

                    {incident.potentialReason && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                        <strong>Возможная причина:</strong> {incident.potentialReason}
                      </div>
                    )}
                  </div>

                  {/* Right: Telemetry metrics snapshot & actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Обнаружено: {incident.timeDetected || incident.createdAt}</span>
                      </div>
                      <div className="text-slate-500">
                        Длительность: <span className="font-bold text-slate-800 dark:text-slate-200">{incident.duration || '24 мин'}</span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!incident.acknowledged && incident.status === 'active' && (
                        <button
                          onClick={() => acknowledgeIncident(incident.id)}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                        >
                          Подтвердить
                        </button>
                      )}

                      {incident.status === 'active' && (
                        <button
                          onClick={() => resolveIncident(incident.id)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs"
                        >
                          Закрыть
                        </button>
                      )}

                      <button
                        onClick={() => navigateTo('incident-details', incident.id)}
                        className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1 shadow-xs"
                      >
                        <span>Расследование</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
