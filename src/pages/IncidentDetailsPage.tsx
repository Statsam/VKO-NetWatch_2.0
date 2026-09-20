import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Check,
  Send,
  GraduationCap,
  HardDrive,
  Activity,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const IncidentDetailsPage: React.FC = () => {
  const {
    selectedIncidentId,
    incidents,
    schools,
    navigateTo,
    acknowledgeIncident,
    resolveIncident,
  } = useDashboard();

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const incident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const school = schools.find((s) => s.id === incident?.schoolId);

  if (!incident) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Инцидент не найден.</p>
        <button
          onClick={() => navigateTo('incidents')}
          className="mt-4 text-xs font-semibold text-cyan-500"
        >
          Вернуться к журналу инцидентов
        </button>
      </div>
    );
  }

  const handleDispatchTechnician = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchStatus('Выездной инженер направлен: заявка #TECH-8821 передана в службу эксплуатации ВКО (г. Усть-Каменогорск).');
    }, 1200);
  };

  const snapshot = incident.telemetrySnapshot || {
    pingMs: 248,
    jitterMs: 76,
    packetLossPercent: 12.8,
    downloadMbps: 3.4,
    uploadMbps: 1.1,
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <button
        onClick={() => navigateTo('incidents')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-cyan-500 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Назад ко всем инцидентам</span>
      </button>

      {/* Incident Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-cyan-500">
                {incident.id}
              </span>
              <StatusBadge status={incident.status} size="md" />
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                  incident.severity === 'critical'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {incident.severity === 'critical' ? 'Критический' : 'Внимание'}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {incident.schoolName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Условие срабатывания: Значение <span className="font-mono font-bold text-rose-500">{incident.value}</span> превысило установленный порог ({incident.threshold})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {incident.status === 'active' && (
              <>
                {!incident.acknowledged && (
                  <button
                    onClick={() => acknowledgeIncident(incident.id)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Принять в работу (Acknowledge)
                  </button>
                )}
                <button
                  onClick={() => resolveIncident(incident.id)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Отметить как решённый</span>
                </button>
                <button
                  onClick={handleDispatchTechnician}
                  disabled={isDispatching}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>{isDispatching ? 'Направление...' : 'Направить выездного инженера'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {dispatchStatus && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-800 dark:text-cyan-300 font-medium">
            ✓ {dispatchStatus}
          </div>
        )}
      </div>

      {/* Two Column Breakdown: Root Cause & Telemetry Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Root Cause & Diagnostic Findings */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>Диагностика и первопричина сбоя</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs border border-slate-200/50 dark:border-slate-700/50">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Потенциальная причина, выявленная диагностическим модулем:
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {incident.potentialReason || incident.description}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span>Время фиксации</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {incident.timeDetected || incident.createdAt}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span>Длительность сбоя</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {incident.duration || '24 минуты'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span>Канал оповещения</span>
              <span className="text-cyan-500 font-semibold">NOC ВКО / Telegram Webhook</span>
            </div>
            {incident.acknowledged && (
              <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400">
                <span>Подтвердил инженер</span>
                <span>{incident.acknowledgedBy || 'Ерболат К. (NOC)'} ({incident.acknowledgedAt || '14:30'})</span>
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Snapshot at Incident Time */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            <HardDrive className="h-4 w-4 text-rose-500" />
            <span>Снимок телеметрии в момент сбоя</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400">Задержка Ping</span>
              <div className="text-lg font-bold font-mono text-rose-500 mt-1">
                {snapshot.pingMs} мс
              </div>
              <span className="text-[10px] text-slate-400">Порог: 150 мс</span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400">Джиттер</span>
              <div className="text-lg font-bold font-mono text-rose-500 mt-1">
                {snapshot.jitterMs} мс
              </div>
              <span className="text-[10px] text-slate-400">Порог: 30 мс</span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400">Потери пакетов</span>
              <div className="text-lg font-bold font-mono text-rose-500 mt-1">
                {snapshot.packetLossPercent}%
              </div>
              <span className="text-[10px] text-slate-400">Порог: 5.0%</span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <span className="text-slate-400">Скорость Download</span>
              <div className="text-lg font-bold font-mono text-amber-500 mt-1">
                {snapshot.downloadMbps} Мб/с
              </div>
              <span className="text-[10px] text-slate-400">Порог: 10 Мбит/с</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {school?.name || incident.schoolName}
              </span>
            </div>
            <button
              onClick={() => navigateTo('school-details', incident.schoolId)}
              className="text-cyan-500 font-semibold hover:underline"
            >
              Открыть школу →
            </button>
          </div>
        </div>
      </div>

      {/* Incident Progression Timeline */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
          <Clock className="h-4 w-4 text-cyan-500" />
          <span>Временная шкала развития инцидента (Timeline)</span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {incident.timeline.map((step, idx) => (
            <div key={idx} className="relative group">
              <span
                className={`absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${
                  step.level === 'critical'
                    ? 'bg-rose-500 ring-4 ring-rose-500/20'
                    : step.level === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {step.stage}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {step.timestamp || step.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {step.note || step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
