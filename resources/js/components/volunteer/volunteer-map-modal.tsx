import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Clock,
    Compass,
    ExternalLink,
    HeartHandshake,
    Loader2,
    MapPin,
    Navigation,
    PawPrint,
    Users,
    Utensils,
    X,
} from 'lucide-react';
import { formatPhotoUrl } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export interface MapFeedingRoutePin {
    id: string;
    record_id: number;
    category: 'feeding_route';
    title: string;
    latitude: number;
    longitude: number;
    day: string;
    time: string;
    volunteers: number;
    strays: number;
    status: string;
}

export interface MapReportPin {
    id: string;
    record_id: number;
    category: 'sos' | 'rescue';
    title: string;
    latitude: number;
    longitude: number;
    type: string;
    status: string;
    urgency: string | null;
    situation_type: string | null;
    animal_type: string;
    breed: string | null;
    color: string | null;
    location: string;
    description: string | null;
    is_assigned_to_me: boolean;
    photo_path: string | null;
    created_at: string | null;
}

type MapPinItem = MapFeedingRoutePin | MapReportPin;
type FilterCategory = 'all' | 'sos' | 'rescue' | 'feeding_route';

interface VolunteerMapModalProps {
    open: boolean;
    onClose: () => void;
    initialFilter?: FilterCategory;
}

const DEFAULT_CENTER: [number, number] = [8.228, 124.2452];

function createPinIcon(pin: MapPinItem, isSelected: boolean): L.DivIcon {
    const category = pin.category;
    const isAssigned = category !== 'feeding_route' && pin.is_assigned_to_me;

    const theme: Record<
        MapPinItem['category'],
        { gradient: string; glow: string; badgeText: string; badgeBg: string; svg: string }
    > = {
        sos: {
            gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            glow: 'rgba(239, 68, 68, 0.45)',
            badgeText: 'SOS',
            badgeBg: '#991B1B',
            svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        },
        rescue: {
            gradient: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
            glow: 'rgba(234, 88, 12, 0.35)',
            badgeText: isAssigned ? 'MINE' : 'RESCUE',
            badgeBg: isAssigned ? '#0B2340' : '#9A3412',
            svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`,
        },
        feeding_route: {
            gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            glow: 'rgba(16, 185, 129, 0.35)',
            badgeText: 'FEED',
            badgeBg: '#065F46',
            svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
        },
    };

    const cfg = theme[category];
    const scale = isSelected ? 1.18 : 1;
    const pulseHtml =
        category === 'sos'
            ? `<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);width:38px;height:38px;border-radius:9999px;background:rgba(239,68,68,0.4);animation:pawlse-sos-pulse 1.8s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></span>`
            : '';

    const assignedDot = isAssigned
        ? `<span style="position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:9999px;background:#FACC15;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>`
        : '';

    const ringStyle = isSelected
        ? `0 0 0 4px #ffffff, 0 0 0 7px #0B2340, 0 10px 22px ${cfg.glow}`
        : `0 0 0 2.5px #ffffff, 0 6px 14px rgba(15,23,42,0.28)`;

    return L.divIcon({
        className: 'pawlse-leaflet-pin',
        html: `
            <div style="position:relative;width:44px;height:54px;display:flex;flex-direction:column;align-items:center;transform:scale(${scale});transform-origin:bottom center;transition:transform 0.16s ease;">
                ${pulseHtml}
                <div style="position:relative;width:36px;height:36px;border-radius:9999px 9999px 9999px 4px;transform:rotate(-45deg);background:${cfg.gradient};box-shadow:${ringStyle};display:flex;align-items:center;justify-content:center;">
                    <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
                        ${cfg.svg}
                    </div>
                    ${assignedDot}
                </div>
                <span style="margin-top:4px;padding:1px 6px;border-radius:9999px;background:${cfg.badgeBg};color:#fff;font-size:8px;font-weight:800;letter-spacing:0.06em;line-height:1.3;box-shadow:0 2px 5px rgba(0,0,0,0.25);white-space:nowrap;">
                    ${cfg.badgeText}
                </span>
            </div>
        `,
        iconSize: [44, 54],
        iconAnchor: [22, 46],
    });
}

export function VolunteerMapModal({
    open,
    onClose,
    initialFilter = 'all',
}: VolunteerMapModalProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const userMarkerRef = useRef<L.CircleMarker | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedingRoutes, setFeedingRoutes] = useState<MapFeedingRoutePin[]>([]);
    const [reports, setReports] = useState<MapReportPin[]>([]);
    const [filter, setFilter] = useState<FilterCategory>(initialFilter);
    const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setFilter(initialFilter);
        let cancelled = false;

        const fetchPins = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/account/volunteer/map-pins', {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || 'Unable to load operations map pins.');
                }
                const data = await res.json();
                if (!cancelled) {
                    setFeedingRoutes(data.feeding_routes || []);
                    setReports(data.reports || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load map data.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPins();

        return () => {
            cancelled = true;
        };
    }, [open, initialFilter]);

    const allPins = useMemo<MapPinItem[]>(() => {
        return [...reports, ...feedingRoutes];
    }, [reports, feedingRoutes]);

    const filteredPins = useMemo<MapPinItem[]>(() => {
        if (filter === 'all') {
            return allPins;
        }
        return allPins.filter((pin) => pin.category === filter);
    }, [allPins, filter]);

    // Initialize Leaflet map when modal opens
    useEffect(() => {
        if (!open || !mapContainerRef.current) {
            return;
        }

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: DEFAULT_CENTER,
                zoom: 13,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            markersLayerRef.current = L.layerGroup().addTo(map);
            mapInstanceRef.current = map;
        }

        const timer = window.setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
        }, 120);

        return () => {
            window.clearTimeout(timer);
        };
    }, [open]);

    // Clean up Leaflet map when modal closes
    useEffect(() => {
        if (!open && mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markersLayerRef.current = null;
            userMarkerRef.current = null;
            setSelectedPin(null);
        }
    }, [open]);

    // Render pins onto map
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layer = markersLayerRef.current;
        if (!open || !map || !layer) {
            return;
        }

        layer.clearLayers();

        if (filteredPins.length === 0) {
            return;
        }

        const bounds = L.latLngBounds([]);

        filteredPins.forEach((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            const marker = L.marker([pin.latitude, pin.longitude], {
                icon: createPinIcon(pin, isSelected),
                zIndexOffset: isSelected ? 500 : pin.category === 'sos' ? 200 : 0,
            });

            const tooltipSubtitle =
                pin.category === 'feeding_route'
                    ? `${pin.day} • ${pin.time}`
                    : `${pin.animal_type} • ${pin.status}`;

            marker.bindTooltip(
                `<div style="font-weight:700;font-size:12px;">${pin.title}</div><div style="font-size:10px;opacity:0.75;text-transform:capitalize;">${tooltipSubtitle}</div>`,
                {
                    direction: 'top',
                    offset: [0, -42],
                },
            );

            marker.on('click', () => {
                setSelectedPin(pin);
                map.panTo([pin.latitude, pin.longitude], { animate: true });
            });

            marker.addTo(layer);
            bounds.extend([pin.latitude, pin.longitude]);
        });

        if (!selectedPin && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
    }, [open, filteredPins, selectedPin]);

    const handleCenterOnMe = () => {
        if (!navigator.geolocation || !mapInstanceRef.current) {
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const map = mapInstanceRef.current;
                if (map) {
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        userMarkerRef.current = L.circleMarker([latitude, longitude], {
                            radius: 8,
                            color: '#1D4ED8',
                            fillColor: '#3B82F6',
                            fillOpacity: 0.9,
                            weight: 3,
                        })
                            .bindTooltip('Your Location')
                            .addTo(map);
                    }
                    map.setView([latitude, longitude], 15, { animate: true });
                }
                setLocating(false);
            },
            () => {
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 },
        );
    };

    if (!open) {
        return null;
    }

    const sosCount = reports.filter((r) => r.category === 'sos').length;
    const rescueCount = reports.filter((r) => r.category === 'rescue').length;
    const feedingCount = feedingRoutes.length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Volunteer Operations Map"
        >
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                {/* Modal Header & Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-100 p-2.5 text-paw-orange dark:bg-orange-950">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white sm:text-xl">
                                Volunteer Operations Map
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Click any pin to inspect feeding route schedules, rescue reports, or SOS alerts side-by-side.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCenterOnMe}
                            disabled={locating}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-[#0B2340] transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            {locating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Navigation className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            My Location
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close map modal"
                            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-2.5 dark:border-gray-800 dark:bg-slate-950/40">
                    <button
                        type="button"
                        onClick={() => {
                            setFilter('all');
                            setSelectedPin(null);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            filter === 'all'
                                ? 'bg-[#0B2340] text-white dark:bg-white dark:text-[#0B2340]'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                        }`}
                    >
                        All Pins ({allPins.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFilter('sos');
                            setSelectedPin(null);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            filter === 'sos'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-red-700 border border-red-200 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-900/50'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        SOS Alerts ({sosCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFilter('rescue');
                            setSelectedPin(null);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            filter === 'rescue'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-300 dark:border-orange-900/50'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        Rescue Reports ({rescueCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFilter('feeding_route');
                            setSelectedPin(null);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            filter === 'feeding_route'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-300 dark:border-emerald-900/50'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        Feeding Routes ({feedingCount})
                    </button>
                </div>

                {/* Side-by-Side Map & Detail Body */}
                <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-5">
                    {/* Left: Leaflet Map */}
                    <div className="relative min-h-[320px] border-b border-gray-100 dark:border-gray-800 lg:col-span-3 lg:min-h-[480px] lg:border-r lg:border-b-0">
                        <style>{`
                            @keyframes pawlse-sos-pulse {
                                0% { transform: translateX(-50%) scale(0.95); opacity: 0.85; }
                                75%, 100% { transform: translateX(-50%) scale(1.65); opacity: 0; }
                            }
                            .pawlse-leaflet-pin { background: transparent !important; border: none !important; }
                        `}</style>
                        <div ref={mapContainerRef} className="h-full w-full min-h-[320px] lg:min-h-[480px]" />

                        {/* Floating Map Legend */}
                        <div className="pointer-events-auto absolute bottom-3 left-3 z-[450] flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/90 px-3 py-2 text-[11px] font-bold text-[#0B2340] shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:bg-slate-900/90 dark:text-white">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-red-200 dark:ring-red-900" />
                                SOS Alert
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-orange-600 ring-2 ring-orange-200 dark:ring-orange-900" />
                                Rescue
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                                Feeding Route
                            </span>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/75 backdrop-blur-xs dark:bg-slate-900/75">
                                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0B2340] shadow-md dark:bg-gray-800 dark:text-white">
                                    <Loader2 className="h-4 w-4 animate-spin text-paw-orange" />
                                    Loading pins...
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-x-4 top-4 z-[1000] rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-200">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right: Side-by-Side Pin Detail Panel */}
                    <div className="flex flex-col overflow-y-auto p-5 lg:col-span-2">
                        {!selectedPin ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center py-8">
                                <div className="mb-3 rounded-2xl bg-orange-50 p-4 text-paw-orange dark:bg-orange-950/40">
                                    <MapPin className="h-8 w-8" />
                                </div>
                                <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                    Select a Pin on the Map
                                </h4>
                                <p className="mt-1 max-w-xs text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Click any <span className="font-bold text-red-600">SOS</span>,{' '}
                                    <span className="font-bold text-orange-600">Rescue</span>, or{' '}
                                    <span className="font-bold text-emerald-600">Feeding Route</span> marker to inspect its details and get directions.
                                </p>

                                {filteredPins.length > 0 && (
                                    <div className="mt-5 w-full space-y-2 text-left">
                                        <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                            Quick Jump ({filteredPins.length})
                                        </p>
                                        <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                            {filteredPins.slice(0, 6).map((pin) => (
                                                <button
                                                    key={pin.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPin(pin);
                                                        mapInstanceRef.current?.setView(
                                                            [pin.latitude, pin.longitude],
                                                            15,
                                                            { animate: true },
                                                        );
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-left text-xs font-bold text-[#0B2340] transition-colors hover:border-paw-orange/40 hover:bg-orange-50/40 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                                                >
                                                    <span className="truncate pr-2">{pin.title}</span>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                                            pin.category === 'sos'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                                : pin.category === 'rescue'
                                                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        {pin.category === 'feeding_route'
                                                            ? 'Feeding'
                                                            : pin.category}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : selectedPin.category === 'feeding_route' ? (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        <Utensils className="h-3.5 w-3.5" /> Feeding Route
                                    </span>
                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-green-700 dark:bg-green-950 dark:text-green-300">
                                        {selectedPin.status}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                        {selectedPin.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Coordinates: {selectedPin.latitude.toFixed(5)},{' '}
                                        {selectedPin.longitude.toFixed(5)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3.5 w-3.5 text-paw-orange" /> Schedule Day
                                        </div>
                                        <p className="mt-1 text-xs font-black text-[#0B2340] dark:text-white">
                                            {selectedPin.day}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5 text-paw-orange" /> Time
                                        </div>
                                        <p className="mt-1 text-xs font-black text-[#0B2340] dark:text-white">
                                            {selectedPin.time}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                            <Users className="h-3.5 w-3.5 text-emerald-600" /> Volunteers Needed
                                        </div>
                                        <p className="mt-1 text-xs font-black text-[#0B2340] dark:text-white">
                                            {selectedPin.volunteers}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                            <PawPrint className="h-3.5 w-3.5 text-amber-600" /> Est. Strays
                                        </div>
                                        <p className="mt-1 text-xs font-black text-[#0B2340] dark:text-white">
                                            {selectedPin.strays} animals
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.latitude},${selectedPin.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Get Directions in Google Maps
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase ${
                                            selectedPin.category === 'sos'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                        }`}
                                    >
                                        {selectedPin.category === 'sos' ? (
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                        ) : (
                                            <HeartHandshake className="h-3.5 w-3.5" />
                                        )}
                                        {selectedPin.category === 'sos' ? 'SOS Alert' : 'Rescue Report'}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        {selectedPin.urgency && (
                                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                                                {selectedPin.urgency} urgency
                                            </span>
                                        )}
                                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            {selectedPin.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                        {selectedPin.title}
                                    </h4>
                                    {selectedPin.created_at && (
                                        <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                                            Reported {selectedPin.created_at}
                                        </p>
                                    )}
                                </div>

                                {selectedPin.photo_path && (
                                    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <ImageWithFallback
                                            src={formatPhotoUrl(selectedPin.photo_path)}
                                            alt={selectedPin.title}
                                            className="h-40 w-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/50">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-paw-orange" />
                                        <span className="font-semibold text-[#0B2340] dark:text-white">
                                            {selectedPin.location}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                        <span className="rounded-md bg-white px-2 py-0.5 dark:bg-gray-900">
                                            Species: {selectedPin.animal_type}
                                        </span>
                                        {selectedPin.breed && (
                                            <span className="rounded-md bg-white px-2 py-0.5 dark:bg-gray-900">
                                                Breed: {selectedPin.breed}
                                            </span>
                                        )}
                                        {selectedPin.situation_type && (
                                            <span className="rounded-md bg-white px-2 py-0.5 dark:bg-gray-900">
                                                Situation: {selectedPin.situation_type}
                                            </span>
                                        )}
                                    </div>
                                    {selectedPin.description && (
                                        <p className="pt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                                            {selectedPin.description}
                                        </p>
                                    )}
                                </div>

                                {selectedPin.is_assigned_to_me && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                                        This report is currently assigned to you.
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pt-1">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.latitude},${selectedPin.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-paw-orange px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-paw-orange/90"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Get Directions in Google Maps
                                    </a>
                                    <Link
                                        href="/account/volunteer/rescue-reports"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-[#0B2340] transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                                    >
                                        Open My Rescue Reports
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
