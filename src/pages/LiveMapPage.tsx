import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { EastKazakhstanMap } from '../components/map/EastKazakhstanMap';
import {
  MapPin,
  Layers,
  Activity,
  Info,
  Radio,
  Wifi,
  Navigation,
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const { schools, navigateTo, selectedSchoolId } = useDashboard();
  const [selectedMapSchoolId, setSelectedMapSchoolId] = useState<string | null>(
    selectedSchoolId || 'SCH-001'
  );

  const healthyCount = schools.filter((s) => s.status === 'healthy').length;
  const warningCount = schools.filter((s) => s.status === 'warning').length;
  const criticalCount = schools.filter((s) => s.status === 'critical').length;
  const offlineCount = schools.filter((s) => s.agentStatus === 'offline').length;

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Геоинформационная карта школьного интернета ВКО
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Интерактивное отображение узлов мониторинга и школьных агентов качества связи на реальной карте OpenStreetMap.
          </p>
        </div>

        {/* Status Distribution Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{healthyCount} в норме</span>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{warningCount} внимание</span>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{criticalCount} критических</span>
          </div>
          {offlineCount > 0 && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>{offlineCount} офлайн</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Full-Size Leaflet Map Component */}
      <EastKazakhstanMap
        schools={schools}
        selectedSchoolId={selectedMapSchoolId}
        onSelectSchool={(id) => navigateTo('school-details', id)}
        onViewIncident={(incId) => navigateTo('incident-details', incId)}
      />

      {/* Map Infrastructure Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            <Navigation className="h-4 w-4 text-cyan-500" />
            <span>Настоящая картография Leaflet</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Полноценная векторно-растровая карта OpenStreetMap с динамической кластеризацией, зумированием, плавным перелётом к найденной школе и карточкой телеметрии.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>Синхронизация школьных агентов</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Школьные компьютеры измеряют задержку к региональным шлюзам в Усть-Каменогорске, оценивая потери и пропускную способность во время учебного процесса.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            <Info className="h-4 w-4 text-amber-500" />
            <span>Географическая специфика ВКО</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Удалённые горные школы (Катон-Карагай, Аксуат, Курчум) подключены через радиорелейные тракты, тогда как городские школы снабжены оптикой (GPON/Metro-E).
          </p>
        </div>
      </div>
    </div>
  );
};
