import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  AlertTriangle,
  BarChart3,
  Activity,
  Settings,
  Radio,
  Server,
} from 'lucide-react';
import { useDashboard, PageView } from '../../context/DashboardContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const {
    currentPage,
    navigateTo,
    incidents,
    earlyWarnings,
    isApiConnected,
    lastSyncSecondsAgo,
    isDemoMode,
    toggleDemoMode,
    useMockApi,
  } = useDashboard();

  const activeIncidentsCount = incidents.filter((i) => i.status === 'active').length;

  const navItems: { id: PageView; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Обзор сети', icon: LayoutDashboard },
    { id: 'map', label: 'Интерактивная карта', icon: MapPin },
    { id: 'schools', label: 'Школы', icon: GraduationCap },
    {
      id: 'incidents',
      label: 'Инциденты',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    {
      id: 'network-health',
      label: 'Состояние сети',
      icon: Activity,
      badge: earlyWarnings.length > 0 ? `${earlyWarnings.length}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30',
    },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="sidebar-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  VKO NetWatch
                </span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                  ВКО
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Мониторинг интернета школ
              </p>
            </div>
          </div>
        </div>

        {/* Tagline Ribbon */}
        <div className="bg-slate-50/80 dark:bg-slate-900/40 px-5 py-2 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="font-mono tracking-wider uppercase text-slate-400 dark:text-slate-400 text-[10px]">
            Мониторинг • Обнаружение • Прогноз
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            NOC Live
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Основное меню
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  navigateTo(item.id);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Mode Toggle & Status Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950">
          {/* Demo Mode Pill */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-500" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Демо-режим
                </div>
                <div className="text-[10px] text-slate-400">
                  {isDemoMode ? 'Активная симуляция' : 'Симуляция на паузе'}
                </div>
              </div>
            </div>
            <button
              onClick={toggleDemoMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isDemoMode ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={isDemoMode}
              title="Переключить демо-режим"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* System Status Display (Section 4 requirement) */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-2.5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-slate-400" />
                <span>Статус сервера:</span>
              </span>
              <span
                className={`font-semibold inline-flex items-center gap-1 ${
                  isApiConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isApiConnected ? 'API подключён' : 'Офлайн'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span>Синхронизация:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {lastSyncSecondsAgo === 0 ? 'Только что' : `${lastSyncSecondsAgo} сек назад`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Источник данных:</span>
              <span className="font-mono text-cyan-500 dark:text-cyan-400 font-semibold">
                {useMockApi ? 'Тестовый Mock API' : 'ASP.NET Core REST'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
