import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Settings as SettingsIcon,
  Sliders,
  Server,
  Radio,
  Save,
  RotateCw,
  Check,
  AlertTriangle,
  ExternalLink,
  Shield,
  HelpCircle,
  Database,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    useMockApi,
    setUseMockApi,
    apiBaseUrl,
    setApiBaseUrl,
    isApiConnected,
    checkApiConnection,
    isDemoMode,
    toggleDemoMode,
  } = useDashboard();

  // Threshold settings state
  const [pingWarning, setPingWarning] = useState<number>(80);
  const [pingCritical, setPingCritical] = useState<number>(150);
  const [lossWarning, setLossWarning] = useState<number>(2.0);
  const [lossCritical, setLossCritical] = useState<number>(5.0);
  const [jitterWarning, setJitterWarning] = useState<number>(15);
  const [jitterCritical, setJitterCritical] = useState<number>(30);
  const [minDownload, setMinDownload] = useState<number>(20);
  const [minUpload, setMinUpload] = useState<number>(10);

  // Agent settings state
  const [measurementInterval, setMeasurementInterval] = useState<string>('30s');
  const [pingTarget, setPingTarget] = useState<string>(
    'regional-cdn.vko-bilim.kz (195.189.197.1)'
  );
  const [speedTestInterval, setSpeedTestInterval] = useState<string>('15m');
  const [autoUpdateAgent, setAutoUpdateAgent] = useState<boolean>(true);

  // Backend test state
  const [isTestingBackend, setIsTestingBackend] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setIsTestingBackend(true);
    setTestResult(null);

    const connected = await checkApiConnection();
    setIsTestingBackend(false);

    if (useMockApi) {
      setTestResult({
        success: true,
        message: 'Используется демонстрационное хранилище телеметрии (Mock API). Статус: Активно (Задержка: 12 мс).',
      });
    } else if (connected) {
      setTestResult({
        success: true,
        message: `Успешное подключение к ASP.NET Core серверу по адресу ${apiBaseUrl} (Статус: 200 OK).`,
      });
    } else {
      setTestResult({
        success: false,
        message: `Не удалось связаться с сервером по адресу ${apiBaseUrl}. Убедитесь, что бэкенд ASP.NET Core запущен и в нём включен CORS.`,
      });
    }
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Конфигурация системы и телеметрии
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Настройка порогов инцидентов, параметров школьных агентов и подключения к бэкенду ASP.NET Core.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{savedSuccess ? 'Настройки сохранены!' : 'Сохранить все настройки'}</span>
        </button>
      </div>

      {/* Backend & API Configuration (Section 21 requirement) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Подключение к REST API ASP.NET Core
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isApiConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isApiConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span>{isApiConnected ? 'Подключено' : 'Офлайн'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Mock vs Real Toggle */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    Использовать Mock API (Демонстрация)
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Генерирует правдоподобную региональную телеметрию для школ ВКО и симулирует сетевые сбои.
                  </p>
                </div>
                <button
                  onClick={() => setUseMockApi(!useMockApi)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    useMockApi ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={useMockApi}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      useMockApi ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Demo Mode Toggle */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    Интерактивный режим симуляции сбоев
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Каждые 5 секунд обновляет телеметрию и случайным образом генерирует всплески задержек.
                  </p>
                </div>
                <button
                  onClick={toggleDemoMode}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isDemoMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={isDemoMode}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isDemoMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Real Backend URL */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-slate-200 mb-1">
                URL адрес бэкенда ASP.NET Core
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                disabled={useMockApi}
                placeholder="http://localhost:5071"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-cyan-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Подключение к локальному ASP.NET Core API (по умолчанию: http://localhost:5071).
              </p>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTestingBackend}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isTestingBackend ? 'animate-spin' : ''}`} />
              <span>{isTestingBackend ? 'Проверка...' : 'Проверить связь с сервером'}</span>
            </button>

            {testResult && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Developer Integration API Guide */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300 mb-1.5">
            <Database className="h-4 w-4" />
            <span>Готовность к интеграции с ASP.NET Core</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            Фронтенд построен на сервисной архитектуре <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">src/api/client.ts</code>. Чтобы подключить рабочий бэкенд, реализуйте следующие стандартные контроллеры:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              GET /api/schools
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              GET /api/incidents
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              POST /api/incidents/&#123;id&#125;/acknowledge
            </div>
          </div>
        </div>
      </div>

      {/* Incident Thresholds Configuration */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Пороги срабатывания сетевых инцидентов
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Ping */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white">Задержка Ping (мс)</div>
            <div>
              <label className="text-slate-500 block mb-1">Порог внимания</label>
              <input
                type="number"
                value={pingWarning}
                onChange={(e) => setPingWarning(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Критический порог</label>
              <input
                type="number"
                value={pingCritical}
                onChange={(e) => setPingCritical(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Loss */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white">Потери пакетов (%)</div>
            <div>
              <label className="text-slate-500 block mb-1">Порог внимания</label>
              <input
                type="number"
                step="0.5"
                value={lossWarning}
                onChange={(e) => setLossWarning(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Критический порог</label>
              <input
                type="number"
                step="0.5"
                value={lossCritical}
                onChange={(e) => setLossCritical(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Jitter */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white">Джиттер (мс)</div>
            <div>
              <label className="text-slate-500 block mb-1">Порог внимания</label>
              <input
                type="number"
                value={jitterWarning}
                onChange={(e) => setJitterWarning(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Критический порог</label>
              <input
                type="number"
                value={jitterCritical}
                onChange={(e) => setJitterCritical(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Min Bandwidth */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white">Минимальная скорость</div>
            <div>
              <label className="text-slate-500 block mb-1">Мин. Download (Мб/с)</label>
              <input
                type="number"
                value={minDownload}
                onChange={(e) => setMinDownload(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Мин. Upload (Мб/с)</label>
              <input
                type="number"
                value={minUpload}
                onChange={(e) => setMinUpload(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* School Agent Configuration */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Cpu className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Параметры агента на школьных компьютерах (VKO Agent Daemon)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Интервал измерения задержки и потерь
            </label>
            <select
              value={measurementInterval}
              onChange={(e) => setMeasurementInterval(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
            >
              <option value="10s">Каждые 10 секунд (Режим высокого контроля)</option>
              <option value="30s">Каждые 30 секунд (Рекомендуется по умолчанию)</option>
              <option value="60s">Каждые 60 секунд (Экономичный режим)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Периодичность теста скорости (Speedtest)
            </label>
            <select
              value={speedTestInterval}
              onChange={(e) => setSpeedTestInterval(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
            >
              <option value="5m">Каждые 5 минут</option>
              <option value="15m">Каждые 15 минут (Стандарт)</option>
              <option value="30m">Каждые 30 минут</option>
              <option value="60m">Каждый 1 час</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Целевой региональный шлюз для пинга (Target Gateways)
            </label>
            <input
              type="text"
              value={pingTarget}
              onChange={(e) => setPingTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
