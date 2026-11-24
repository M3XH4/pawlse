import { router } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    HeartPulse,
    Image as ImageIcon,
    Loader2,
    LocateFixed,
    Map as MapIcon,
    MapPin,
    Plus,
    ShieldAlert,
    Stethoscope,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ModernDateTimePicker } from '@/components/ui/modern-date-time-picker';
import { ModernSelect } from '@/components/ui/modern-select';
import { reverseGeocode } from '@/lib/geocoding';
import { formatPhotoUrl } from '@/lib/utils';

interface InjuryReportItem {
    id: number;
    incident_type: string;
    severity: string;
    body_part: string | null;
    location: string | null;
    incident_occurred_at: string;
    description: string;
    first_aid_applied: boolean;
    first_aid_notes: string | null;
    photo_url: string | null;
    status: 'reported' | 'medical_aid_initiated' | 'confirmed';
    medical_aid_type: string | null;
    medical_facility: string | null;
    medical_aid_notes: string | null;
    medical_aid_initiated_at: string | null;
    confirmed_at: string | null;
    confirmation_notes: string | null;
    created_at: string;
    initiated_by?: { id: number; name: string } | null;
    confirmed_by?: { id: number; name: string } | null;
    assigned_task?: {
        id: number;
        role: string;
        event?: { id: number; title: string } | null;
        feeding_schedule?: { id: number; zone: string } | null;
        pet_report?: { id: number; name?: string | null; animal_type?: string | null; location?: string | null } | null;
    } | null;
}

interface RecentTaskOption {
    id: number;
    label: string;
}

interface VolunteerInjuryReportsProps {
    reports: {
        data: InjuryReportItem[];
        total: number;
    };
    recentTasks: RecentTaskOption[];
    incidentTypes: Record<string, string>;
    severities: Record<string, string>;
    medicalAidTypes: Record<string, string>;
}

const SEVERITY_BADGES: Record<string, string> = {
    minor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    severe: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    reported: {
        label: 'Reported • Awaiting Medical Aid',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    },
    medical_aid_initiated: {
        label: 'Medical Aid Initiated',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    },
    confirmed: {
        label: 'Medical Aid Confirmed',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
};

const DEFAULT_COORDS: [number, number] = [8.228, 124.2452];

export default function VolunteerInjuryReports({
    reports,
    recentTasks,
    incidentTypes,
    severities,
    medicalAidTypes,
}: VolunteerInjuryReportsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [assignedTaskId, setAssignedTaskId] = useState('');
    const [incidentType, setIncidentType] = useState(Object.keys(incidentTypes)[0] || 'animal_bite');
    const [severity, setSeverity] = useState('minor');
    const [bodyPart, setBodyPart] = useState('');
    const [location, setLocation] = useState('');
    const [incidentOccurredAt, setIncidentOccurredAt] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [description, setDescription] = useState('');
    const [firstAidApplied, setFirstAidApplied] = useState(false);
    const [firstAidNotes, setFirstAidNotes] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

    // Location detection & Leaflet map picker state
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [pickedCoords, setPickedCoords] = useState<[number, number] | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.CircleMarker | null>(null);

    const items = reports?.data || [];
    const todayStr = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (!photoFile) {
            setPhotoPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(photoFile);
        setPhotoPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [photoFile]);

    // Initialize / clean up interactive Leaflet map picker
    useEffect(() => {
        if (!isModalOpen || !showMapPicker || !mapContainerRef.current) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
            return;
        }

        const initialCenter = pickedCoords ?? DEFAULT_COORDS;
        const map = L.map(mapContainerRef.current).setView(initialCenter, pickedCoords ? 16 : 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        const placeMarker = (lat: number, lng: number) => {
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.circleMarker([lat, lng], {
                    radius: 9,
                    color: '#e11d48',
                    fillColor: '#f43f5e',
                    fillOpacity: 0.85,
                    weight: 3,
                }).addTo(map);
            }
        };

        if (pickedCoords) {
            placeMarker(pickedCoords[0], pickedCoords[1]);
        }

        map.on('click', async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            setPickedCoords([lat, lng]);
            placeMarker(lat, lng);
            setIsDetectingLocation(true);
            try {
                const address = await reverseGeocode(lat, lng);
                setLocation(address);
            } finally {
                setIsDetectingLocation(false);
            }
        });

        mapInstanceRef.current = map;

        setTimeout(() => {
            map.invalidateSize();
        }, 120);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [isModalOpen, showMapPicker]);

    const handleDetectCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setPickedCoords([latitude, longitude]);

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 16);
                    if (markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        markerRef.current = L.circleMarker([latitude, longitude], {
                            radius: 9,
                            color: '#e11d48',
                            fillColor: '#f43f5e',
                            fillOpacity: 0.85,
                            weight: 3,
                        }).addTo(mapInstanceRef.current);
                    }
                }

                try {
                    const address = await reverseGeocode(latitude, longitude);
                    setLocation(address);
                    toast.success('Current location detected.');
                } catch {
                    setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                setIsDetectingLocation(false);
                toast.error(error.message || 'Unable to detect your location. Please allow location access or pick on the map.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const resetForm = () => {
        setAssignedTaskId('');
        setIncidentType(Object.keys(incidentTypes)[0] || 'animal_bite');
        setSeverity('minor');
        setBodyPart('');
        setLocation('');
        setDescription('');
        setFirstAidApplied(false);
        setFirstAidNotes('');
        setPhotoFile(null);
        setShowMapPicker(false);
        setPickedCoords(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        if (assignedTaskId) {
            formData.append('assigned_task_id', assignedTaskId);
        }
        formData.append('incident_type', incidentType);
        formData.append('severity', severity);
        if (bodyPart) {
            formData.append('body_part', bodyPart);
        }
        if (location) {
            formData.append('location', location);
        }
        formData.append('incident_occurred_at', incidentOccurredAt.replace('T', ' '));
        formData.append('description', description);
        formData.append('first_aid_applied', firstAidApplied ? '1' : '0');
        if (firstAidNotes) {
            formData.append('first_aid_notes', firstAidNotes);
        }
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        router.post('/account/volunteer/injury-reports', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                resetForm();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Failed to submit injury report.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <DashboardSectionPage
            title="Field Injury Reports"
            description="Record injuries sustained during field rescues or feeding routes so shelter admins can initiate and confirm medical aid."
            badge={
                <div className="flex flex-wrap items-center gap-2">
                    <DashboardMetricBadge
                        icon={<HeartPulse className="h-4 w-4" />}
                        label={`${reports?.total || 0} Reports`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex min-h-9 sm:min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-rose-700 whitespace-nowrap shrink-0"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span>Report Field Injury</span>
                    </button>
                </div>
            }
        >
            {items.length === 0 ? (
                <DashboardCard className="p-10 text-center">
                    <ShieldAlert className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={44} />
                    <p className="text-sm font-bold text-[#0B2340] dark:text-white">
                        No field injury reports recorded.
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        If you ever experience an injury while on duty, report it immediately so our team can coordinate medical aid.
                    </p>
                </DashboardCard>
            ) : (
                <div className="flex flex-col gap-4">
                    {items.map((report) => {
                        const statusInfo = STATUS_BADGES[report.status] || STATUS_BADGES.reported;
                        const severityClass = SEVERITY_BADGES[report.severity] || SEVERITY_BADGES.minor;
                        const incidentLabel = incidentTypes[report.incident_type] || report.incident_type;
                        const aidLabel = report.medical_aid_type
                            ? medicalAidTypes[report.medical_aid_type] || report.medical_aid_type
                            : null;

                        return (
                            <DashboardCard key={report.id} className="p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1 space-y-2.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                                #{report.id} • {incidentLabel}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${severityClass}`}>
                                                {severities[report.severity] || report.severity}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {report.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(report.incident_occurred_at).toLocaleString()}
                                            </span>
                                            {report.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {report.location}
                                                </span>
                                            )}
                                            {report.body_part && (
                                                <span>Affected area: {report.body_part}</span>
                                            )}
                                        </div>

                                        {report.first_aid_applied && (
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                Immediate First Aid Applied{report.first_aid_notes ? `: ${report.first_aid_notes}` : '.'}
                                            </p>
                                        )}

                                        {(report.status === 'medical_aid_initiated' || report.status === 'confirmed') && (
                                            <div className="mt-3 rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                                                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-blue-800 uppercase dark:text-blue-300">
                                                    <Stethoscope size={14} />
                                                    Medical Aid Details
                                                </div>
                                                <div className="mt-2 space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {aidLabel && <p>Aid Type: <span className="font-bold">{aidLabel}</span></p>}
                                                    {report.medical_facility && <p>Facility / Provider: <span className="font-bold">{report.medical_facility}</span></p>}
                                                    {report.medical_aid_notes && <p>Instructions / Notes: {report.medical_aid_notes}</p>}
                                                    {report.medical_aid_initiated_at && (
                                                        <p className="text-[11px] text-gray-500">
                                                            Initiated {new Date(report.medical_aid_initiated_at).toLocaleString()}
                                                            {report.initiated_by ? ` by ${report.initiated_by.name}` : ''}
                                                        </p>
                                                    )}
                                                </div>

                                                {report.status === 'confirmed' && (
                                                    <div className="mt-3 border-t border-blue-200/60 pt-2.5 dark:border-blue-800/50">
                                                        <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                                                            <CheckCircle2 size={14} />
                                                            Confirmed & Completed
                                                        </div>
                                                        {report.confirmation_notes && (
                                                            <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                {report.confirmation_notes}
                                                            </p>
                                                        )}
                                                        {report.confirmed_at && (
                                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                                Confirmed {new Date(report.confirmed_at).toLocaleString()}
                                                                {report.confirmed_by ? ` by ${report.confirmed_by.name}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {report.photo_url && (
                                        <img
                                            src={formatPhotoUrl(report.photo_url)}
                                            alt="Injury evidence"
                                            className="h-28 w-28 shrink-0 rounded-2xl border border-gray-200 object-cover dark:border-gray-700"
                                        />
                                    )}
                                </div>
                            </DashboardCard>
                        );
                    })}
                </div>
            )}

            {/* Report Injury Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                        {/* Fixed Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 sm:px-8 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                    <AlertTriangle size={20} />
                                </span>
                                <div>
                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                        Report Field Injury
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400">
                                        Notify shelter admins immediately so medical aid can be dispatched.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form id="injury-report-form" onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8">
                            {/* Section 1: Incident Classification */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <ModernSelect
                                    label="Incident Type"
                                    required
                                    value={incidentType}
                                    onChange={(val) => setIncidentType(val)}
                                    options={Object.entries(incidentTypes).map(([key, label]) => ({
                                        value: key,
                                        label,
                                    }))}
                                />
                                <ModernSelect
                                    label="Severity"
                                    required
                                    value={severity}
                                    onChange={(val) => setSeverity(val)}
                                    options={Object.entries(severities).map(([key, label]) => ({
                                        value: key,
                                        label,
                                    }))}
                                />
                            </div>

                            {recentTasks.length > 0 && (
                                <ModernSelect
                                    label="Related Field Mission (Optional)"
                                    value={assignedTaskId}
                                    onChange={(val) => setAssignedTaskId(val)}
                                    placeholder="Not linked to a specific task"
                                    options={[
                                        { value: '', label: 'Not linked to a specific task' },
                                        ...recentTasks.map((t) => ({
                                            value: String(t.id),
                                            label: t.label,
                                        })),
                                    ]}
                                />
                            )}

                            {/* Section 2: Body Part & Time */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-black tracking-wider text-gray-400 uppercase">
                                        Affected Body Part
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Left hand, Right ankle"
                                        value={bodyPart}
                                        onChange={(e) => setBodyPart(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                                <ModernDateTimePicker
                                    label="When Did It Happen?"
                                    required
                                    value={incidentOccurredAt}
                                    onChange={(val) => setIncidentOccurredAt(val)}
                                    maxDate={todayStr}
                                />
                            </div>

                            {/* Section 3: Field Location with Auto-Detect & Map Picker */}
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="block text-xs font-black tracking-wider text-gray-400 uppercase">
                                        Field Location
                                    </label>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={handleDetectCurrentLocation}
                                            disabled={isDetectingLocation}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                                        >
                                            {isDetectingLocation ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <LocateFixed size={13} />
                                            )}
                                            {isDetectingLocation ? 'Detecting...' : 'Detect My Location'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowMapPicker((prev) => !prev)}
                                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                                                showMapPicker
                                                    ? 'bg-[#0B2340] text-white dark:bg-white dark:text-[#0B2340]'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300'
                                            }`}
                                        >
                                            <MapIcon size={13} />
                                            {showMapPicker ? 'Hide Map' : 'Pick on Map'}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <MapPin size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g., Corner of Rizal Ave & Market St"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-3.5 pl-10 text-sm font-semibold outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                {showMapPicker && (
                                    <div className="space-y-1.5 rounded-2xl border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-slate-800/60">
                                        <p className="px-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                            Click anywhere on the map to pin the exact incident location.
                                        </p>
                                        <div
                                            ref={mapContainerRef}
                                            className="h-52 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Description & First Aid */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black tracking-wider text-gray-400 uppercase">
                                    What Happened? *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe how the injury occurred and your current condition..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-800/70">
                                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#0B2340] dark:text-white">
                                    <input
                                        type="checkbox"
                                        checked={firstAidApplied}
                                        onChange={(e) => setFirstAidApplied(e.target.checked)}
                                        className="h-4 w-4 rounded accent-rose-600"
                                    />
                                    Immediate first aid was applied in the field
                                </label>
                                {firstAidApplied && (
                                    <textarea
                                        rows={2}
                                        placeholder="Describe first aid applied (e.g., cleaned wound with water, applied antiseptic, bandaged)..."
                                        value={firstAidNotes}
                                        onChange={(e) => setFirstAidNotes(e.target.value)}
                                        className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-rose-500 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                                    />
                                )}
                            </div>

                            {/* Section 5: Photo Evidence with Live Preview */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black tracking-wider text-gray-400 uppercase">
                                    Photo Evidence (Optional)
                                </label>

                                {photoPreviewUrl && photoFile ? (
                                    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-slate-800/70">
                                        <img
                                            src={photoPreviewUrl}
                                            alt="Selected injury preview"
                                            className="h-20 w-20 shrink-0 rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-[#0B2340] dark:text-white">
                                                {photoFile.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] font-semibold text-gray-400">
                                                {(photoFile.size / 1024).toFixed(1)} KB
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700 shadow-xs hover:bg-gray-100 dark:bg-slate-900 dark:text-gray-200">
                                                    <ImageIcon size={12} />
                                                    Change
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setPhotoFile(null)}
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                                                >
                                                    <Trash2 size={12} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center transition hover:border-rose-400 hover:bg-rose-50/30 dark:border-gray-700 dark:bg-slate-800/50 dark:hover:border-rose-500">
                                        <Upload size={20} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                            Click to upload wound or scene photo
                                        </span>
                                        <span className="text-[11px] font-medium text-gray-400">
                                            PNG, JPG, WEBP up to 5MB
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                )}
                            </div>
                        </form>

                        {/* Fixed Footer */}
                        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:px-8 dark:border-gray-800 dark:bg-slate-900/80">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 uppercase transition hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="injury-report-form"
                                disabled={isSubmitting}
                                className="cursor-pointer rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Injury Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
