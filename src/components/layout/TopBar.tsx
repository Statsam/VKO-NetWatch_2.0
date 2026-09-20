import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  Moon,
  Sun,
  Radio,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Flame,
  Check,
  X,
  Building,
} from 'lucide-react';
import { useDashboard, PageView } from '../../context/DashboardContext';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const {
    currentPage,
    navigateTo,
    schools,
    incidents,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    theme,
    toggleTheme,
    lastSyncSecondsAgo,
    isDemoMode,
    toggleDemoMode,
    isApiConnected,
  } = useDashboard();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search filtering
  const matchingSchools = searchQuery.trim()
    ? schools
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const matchingIncidents = searchQuery.trim()
    ? incidents
        .filter(
          (inc) =>
            inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const pageHeaders: Record<PageView, { title: string; subtitle: string }> = {
    overview: {
      title: 'Обзор сети и инфраструктуры',
      subtitle: 'Региональная телеметрия и состояние сети школ ВКО',
    },
    map: {
      title: 'Интерактивная карта ВКО',
      subtitle: 'Географическое распределение школ и узлов связи',
    },
    schools: {
      title: 'Мониторинг школ',
      subtitle: 'Телеметрия сети, статусы агентов и диагностика',
    },
    'school-details': {
      title: 'Детальная телеметрия школы',
      subtitle: 'Показатели в реальном времени, графики и история',
    },
    incidents: {
      title: 'Управление инцидентами',
      subtitle: 'Активные сетевые проблемы и журналы устранения',
    },
    'incident-details': {
      title: 'Расследование инцидента',
      subtitle: 'Временная шкала сбоя и снимок телеметрии',
    },
    analytics: {
      title: 'Аналитика качества связи',
      subtitle: 'Сводные показатели по районам и распределение задержек',
    },
    'network-health': {
      title: 'Умное состояние сети и раннее предупреждение',
      subtitle: 'Прогнозирование ухудшений и индекс риска сети',
    },
    settings: {
      title: 'Настройки системы и агентов',
      subtitle: 'Пороги метрик, интервалы опроса и подключение к ASP.NET Core',
    },
  };

  const header = pageHeaders[currentPage] || pageHeaders.overview;

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 lg:hidden"
          aria-label="Переключить меню"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {header.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {header.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Instant Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="input-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Поиск школы, ID, устройства, инцидента..."
            className="w-64 lg:w-76 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-1.5 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {matchingSchools.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Школы ВКО ({matchingSchools.length})
                  </div>
                  {matchingSchools.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        navigateTo('school-details', s.id);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {s.id} • {s.city} ({s.district})
                        </div>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                          s.status === 'healthy'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : s.status === 'warning'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {s.healthScore}/100
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchingIncidents.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Инциденты ({matchingIncidents.length})
                  </div>
                  {matchingIncidents.map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => {
                        navigateTo('incident-details', inc.id);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <div>
                        <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {inc.id}: {inc.schoolName}
                        </div>
                        <div className="text-[10px] text-slate-400">{inc.value}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchingSchools.length === 0 && matchingIncidents.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  По запросу «{searchQuery}» совпадений не найдено.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${
              isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>
            {lastSyncSecondsAgo === 0 ? 'Обновлено' : `${lastSyncSecondsAgo} с назад`}
          </span>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={toggleDemoMode}
          className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition shadow-xs ${
            isDemoMode
              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
          }`}
          title="Включить или выключить симуляцию сетевых событий"
        >
          <Radio className="h-3.5 w-3.5 text-cyan-500" />
          <span>Демо: {isDemoMode ? 'ВКЛ' : 'ВЫКЛ'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            id="btn-notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            aria-label="Уведомления"
            title="Центр уведомлений"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Центр уведомлений
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {unreadNotifCount} новых
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Прочитать все
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Нет активных уведомлений. Все системы в норме.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.incidentId) {
                          navigateTo('incident-details', notif.incidentId);
                          setIsNotifOpen(false);
                        } else if (notif.schoolId) {
                          navigateTo('school-details', notif.schoolId);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`pt-2 pb-1.5 px-2 rounded-xl text-left cursor-pointer transition ${
                        notif.read
                          ? 'opacity-65 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-cyan-500/5 dark:bg-cyan-500/10 hover:bg-cyan-500/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            NOC
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Администратор NOC
            </div>
            <div className="text-[10px] text-slate-400">
              Управление образования ВКО
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
