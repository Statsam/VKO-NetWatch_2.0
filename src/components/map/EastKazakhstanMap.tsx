import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { School } from '../../types/school';
import { StatusBadge } from '../ui/StatusBadge';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  AlertTriangle,
  ArrowUpRight,
  History,
  X,
  SlidersHorizontal,
  MapPin,
  Flame,
} from 'lucide-react';

interface EastKazakhstanMapProps {
  schools: School[];
  onSelectSchool: (schoolId: string) => void;
  onViewIncident?: (incidentId: string) => void;
  selectedSchoolId?: string | null;
}

// Center of Ust-Kamenogorsk, East Kazakhstan
const VKO_CENTER: [number, number] = [49.9575, 82.6050];
const VKO_DEFAULT_ZOOM = 7;
const VKO_BOUNDS: [[number, number], [number, number]] = [
  [46.8, 78.0],
  [51.4, 86.5],
];

interface ClusterGroup {
  id: string;
  lat: number;
  lng: number;
  schools: School[];
  hasCritical: boolean;
  hasWarning: boolean;
}

export const EastKazakhstanMap: React.FC<EastKazakhstanMapProps> = ({
  schools,
  onSelectSchool,
  onViewIncident,
  selectedSchoolId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(VKO_DEFAULT_ZOOM);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'healthy' | 'warning' | 'critical' | 'offline' | 'incident' | 'problems_only'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeSchool, setActiveSchool] = useState<School | null>(() => {
    return schools.find((s) => s.id === selectedSchoolId) || schools[0] || null;
  });

  // Filter schools based on selection
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      if (activeFilter === 'healthy') return s.status === 'healthy';
      if (activeFilter === 'warning') return s.status === 'warning';
      if (activeFilter === 'critical') return s.status === 'critical';
      if (activeFilter === 'offline') return s.agentStatus === 'offline';
      if (activeFilter === 'incident') return s.status === 'critical' || s.status === 'warning';
      if (activeFilter === 'problems_only') return s.status !== 'healthy' || s.agentStatus === 'offline';
      return true;
    });
  }, [schools, activeFilter]);

  // Search matching schools
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [schools, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: VKO_CENTER,
      zoom: VKO_DEFAULT_ZOOM,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false, // We provide modern customized controls
      attributionControl: false,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Attribution control in a clean, unobtrusive format
    L.control
      .attribution({
        position: 'bottomleft',
        prefix: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    // Layer group for dynamic markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Listen to zoom and move events to trigger responsive clustering
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selected school if prop changes
  useEffect(() => {
    if (selectedSchoolId) {
      const found = schools.find((s) => s.id === selectedSchoolId);
      if (found) {
        setActiveSchool(found);
      }
    }
  }, [selectedSchoolId, schools]);

  // Dynamic Clustering algorithm based on screen pixel distance
  const clusters = useMemo(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      // Fallback: 1-to-1 clusters
      return filteredSchools.map((s) => ({
        id: s.id,
        lat: s.latitude,
        lng: s.longitude,
        schools: [s],
        hasCritical: s.status === 'critical',
        hasWarning: s.status === 'warning',
      }));
    }

    // Cluster threshold in pixels: when zoomed in (> 11), don't cluster
    const clusterRadiusPx = currentZoom >= 11 ? 0 : 50;

    if (clusterRadiusPx === 0) {
      return filteredSchools.map((s) => ({
        id: s.id,
        lat: s.latitude,
        lng: s.longitude,
        schools: [s],
        hasCritical: s.status === 'critical',
        hasWarning: s.status === 'warning',
      }));
    }

    const groups: ClusterGroup[] = [];

    filteredSchools.forEach((school) => {
      const schoolPoint = map.latLngToLayerPoint([school.latitude, school.longitude]);
      let matchedGroup: ClusterGroup | null = null;

      for (const group of groups) {
        const groupPoint = map.latLngToLayerPoint([group.lat, group.lng]);
        const dist = schoolPoint.distanceTo(groupPoint);
        if (dist <= clusterRadiusPx) {
          matchedGroup = group;
          break;
        }
      }

      if (matchedGroup) {
        matchedGroup.schools.push(school);
        if (school.status === 'critical') matchedGroup.hasCritical = true;
        if (school.status === 'warning') matchedGroup.hasWarning = true;
      } else {
        groups.push({
          id: `cluster-${school.id}`,
          lat: school.latitude,
          lng: school.longitude,
          schools: [school],
          hasCritical: school.status === 'critical',
          hasWarning: school.status === 'warning',
        });
      }
    });

    return groups;
  }, [filteredSchools, currentZoom]);

  // Render Leaflet markers for clusters and individual schools
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    clusters.forEach((cluster) => {
      const isSingle = cluster.schools.length === 1;

      if (isSingle) {
        const school = cluster.schools[0];
        const isSelected = activeSchool?.id === school.id;
        const isCritical = school.status === 'critical';
        const isWarning = school.status === 'warning';

        const color = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';
        const symbol = isCritical ? '●' : isWarning ? '▲' : '●';
        const pulseHtml = isCritical
          ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-60 bg-rose-500"></span>`
          : isWarning
          ? `<span class="absolute -inset-1.5 rounded-full animate-ping opacity-40 bg-amber-500"></span>`
          : '';

        const haloHtml = isSelected
          ? `<span class="absolute -inset-2.5 rounded-full border-2 border-cyan-400 border-dashed animate-spin"></span>`
          : '';

        const iconHtml = `
          <div class="custom-school-pin relative flex items-center justify-center w-8 h-8">
            ${haloHtml}
            ${pulseHtml}
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shadow-lg border-2 border-white dark:border-slate-900" style="background-color: ${color};">
              <span>${symbol}</span>
            </div>
            <div class="absolute -bottom-4 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-950/80 text-white border border-slate-700 whitespace-nowrap pointer-events-none shadow-md">
              ${school.id}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([school.latitude, school.longitude], { icon: customIcon });

        marker.on('click', () => {
          setActiveSchool(school);
          map.panTo([school.latitude, school.longitude], { animate: true, duration: 0.6 });
        });

        markersGroup.addLayer(marker);
      } else {
        // Multi-school Cluster Badge (Requirement Section 8)
        const count = cluster.schools.length;
        const clusterBg = cluster.hasCritical
          ? 'linear-gradient(135deg, #f43f5e, #be123c)'
          : cluster.hasWarning
          ? 'linear-gradient(135deg, #f59e0b, #b45309)'
          : 'linear-gradient(135deg, #0ea5e9, #0284c7)';

        const clusterHtml = `
          <div class="custom-cluster-pin relative flex items-center justify-center w-10 h-10 rounded-full text-white text-xs font-black shadow-xl border-2 border-white dark:border-slate-900 cursor-pointer" style="background: ${clusterBg};">
            ${cluster.hasCritical ? '<span class="absolute -inset-1 rounded-full animate-ping opacity-50 bg-rose-500"></span>' : ''}
            <div class="relative flex items-center justify-center gap-0.5">
              <span>${count}</span>
              <span class="text-[9px] opacity-80">◉</span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          className: 'custom-div-cluster',
          html: clusterHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const clusterMarker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        clusterMarker.on('click', () => {
          // Zoom into cluster bounds
          const lats = cluster.schools.map((s) => s.latitude);
          const lngs = cluster.schools.map((s) => s.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          if (minLat === maxLat && minLng === maxLng) {
            map.setView([minLat, minLng], map.getZoom() + 2);
          } else {
            const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
          }
        });

        markersGroup.addLayer(clusterMarker);
      }
    });
  }, [clusters, activeSchool]);

  // Actions
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetBounds = () => {
    mapInstanceRef.current?.setView(VKO_CENTER, VKO_DEFAULT_ZOOM, { animate: true });
  };

  const handleFlyToSchool = (school: School) => {
    setActiveSchool(school);
    setIsSearchOpen(false);
    setSearchQuery('');
    mapInstanceRef.current?.flyTo([school.latitude, school.longitude], 12, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  };

  return (
    <div className="relative flex flex-col h-[740px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 dark:bg-slate-950/90 p-1.5 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-xl">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Поиск школы (№, город, ID)..."
              className="w-48 sm:w-56 rounded-lg bg-slate-800/90 pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Search Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden z-50 divide-y divide-slate-800">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  Найдено школ: {searchResults.length}
                </div>
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleFlyToSchool(s)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.id} • {s.city} ({s.district})
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        s.status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : s.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {s.healthScore}/100
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-700" />

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[420px] scrollbar-none py-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                activeFilter === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Все ({schools.length})
            </button>
            <button
              onClick={() => setActiveFilter('healthy')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'healthy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
              }`}
            >
              <span>●</span>
              <span>Норма</span>
            </button>
            <button
              onClick={() => setActiveFilter('warning')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'warning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/60'
              }`}
            >
              <span>▲</span>
              <span>Внимание</span>
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
              }`}
            >
              <span>●</span>
              <span>Критические</span>
            </button>
            <button
              onClick={() => setActiveFilter('offline')}
              className={`rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap transition ${
                activeFilter === 'offline'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
              }`}
            >
              Офлайн
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'problems_only' ? 'all' : 'problems_only')}
              className={`rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'problems_only'
                  ? 'bg-rose-500 text-white ring-2 ring-rose-400/40'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Только проблемы</span>
            </button>
          </div>
        </div>

        {/* Right: Map Navigation Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 dark:bg-slate-950/90 p-1.5 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-xl">
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Приблизить"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Отдалить"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetBounds}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 transition flex items-center gap-1"
            title="Вся область ВКО"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Вся ВКО</span>
          </button>
          <div className="px-2 text-[10px] font-mono text-slate-400 border-l border-slate-800">
            Зум: {currentZoom}
          </div>
        </div>
      </div>

      {/* Leaflet Real Map Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10" />

      {/* Selected School Interactive Telemetry Card (Section 7 requirement) */}
      {activeSchool && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[410px] z-[1000] rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {activeSchool.id}
                </span>
                <StatusBadge status={activeSchool.status} size="sm" />
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeSchool.isp.split(' ')[0]}
                </span>
              </div>
              <h3 className="mt-1 text-sm font-bold text-white leading-snug line-clamp-2">
                {activeSchool.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeSchool.city} • {activeSchool.district}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-white leading-none">
                {activeSchool.healthScore}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Состояние
              </span>
            </div>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-xl bg-slate-800/80 p-2.5 text-center text-xs border border-slate-700/50">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Ping</div>
              <div
                className={`font-bold font-mono ${
                  activeSchool.lastMeasurement.pingMs >= 150
                    ? 'text-rose-400'
                    : activeSchool.lastMeasurement.pingMs >= 100
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {activeSchool.lastMeasurement.pingMs} мс
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Jitter</div>
              <div
                className={`font-bold font-mono ${
                  activeSchool.lastMeasurement.jitterMs >= 50
                    ? 'text-rose-400'
                    : activeSchool.lastMeasurement.jitterMs >= 25
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {activeSchool.lastMeasurement.jitterMs} мс
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Потери</div>
              <div
                className={`font-bold font-mono ${
                  activeSchool.lastMeasurement.packetLossPercent >= 10
                    ? 'text-rose-400'
                    : activeSchool.lastMeasurement.packetLossPercent >= 3
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {activeSchool.lastMeasurement.packetLossPercent}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Download</div>
              <div
                className={`font-bold font-mono ${
                  activeSchool.lastMeasurement.downloadMbps < 5
                    ? 'text-rose-400'
                    : activeSchool.lastMeasurement.downloadMbps < 15
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {activeSchool.lastMeasurement.downloadMbps} Мб/с
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Upload</div>
              <div className="font-bold text-slate-100 font-mono">
                {activeSchool.lastMeasurement.uploadMbps} Мб/с
              </div>
            </div>
          </div>

          {/* Telemetry info line */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Последнее измерение: {activeSchool.lastMeasurement.timestamp.slice(11, 19)}
            </span>
            <span
              className={`font-mono text-[10px] font-semibold flex items-center gap-1 ${
                activeSchool.agentStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span>●</span>
              <span>{activeSchool.agentStatus === 'online' ? 'Агент Онлайн' : 'Агент Офлайн'}</span>
            </span>
          </div>

          {/* Action Buttons (Section 7 requirement: 'Открыть школу', 'История', 'Открыть инцидент') */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onSelectSchool(activeSchool.id)}
              className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2 px-3 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <span>Открыть школу</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onSelectSchool(activeSchool.id)}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 py-2 px-3 text-xs font-semibold text-slate-200 transition flex items-center gap-1"
            >
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span>История</span>
            </button>
            {activeSchool.status !== 'healthy' && (
              <button
                onClick={() => onViewIncident && onViewIncident('INC-4091')}
                className="rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 py-2 px-3 text-xs font-semibold text-rose-300 transition flex items-center gap-1"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Инцидент</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-md z-[1000]">
        <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
          Статус узла:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>● Норма (85-100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>▲ Внимание (65-84)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>● Критический (&lt;65)</span>
        </div>
      </div>
    </div>
  );
};
