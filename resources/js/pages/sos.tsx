import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    MapPin,
    Camera,
    Clock,
    CheckCircle2,
    Siren,
    Phone,
    Navigation,
    Hospital,
    Plus,
    X,
    ExternalLink,
    Star,
    Video,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';
import { ModernSelect } from '@/components/ui/modern-select';
import { Spinner } from '@/components/ui/spinner';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import {
    fetchNearbyVetClinics,
    forwardGeocode,
    reverseGeocode,
} from '@/lib/geocoding';
import type {
    NearbyMapVet} from '@/lib/geocoding';
import { formatPhoneNumber } from '@/lib/phone-formatter';
import { haversineDistanceKm } from '@/lib/routing';

const EMERGENCY_CONTACTS = [
    {
        name: 'Iligan City Veterinary Office',
        phone: '(063) 221-4563',
        type: 'Government Vet',
        available: '24/7',
    },
    {
        name: 'Animal Welfare Coalition Iligan',
        phone: '0912 345 6789',
        type: 'Rescue Hotline',
        available: '24/7',
    },
    {
        name: 'ISF Emergency Response',
        phone: '0923 456 7890',
        type: 'ISF Direct Line',
        available: '24/7',
    },
    {
        name: 'Barangay Animal Welfare',
        phone: '(063) 221-8888',
        type: 'Local Barangay',
        available: 'Office Hours',
    },
];

const NEARBY_VETS = [
    {
        name: 'Iligan Veterinary Clinic',
        address: 'Quezon Ave, Poblacion',
        distance: '1.2 km',
        contact: '(063) 221-3344',
        hours: '8AM - 8PM',
    },
    {
        name: 'Pet Care Center Iligan',
        address: 'Tibanga Highway',
        distance: '2.5 km',
        contact: '(063) 225-1122',
        hours: '24/7 Emergency',
    },
    {
        name: 'Animal Medical Center',
        address: 'Pala-o, Iligan City',
        distance: '3.8 km',
        contact: '(063) 223-9900',
        hours: '9AM - 6PM',
    },
    {
        name: 'Compassionate Vet Clinic',
        address: 'Mahayahay, Iligan',
        distance: '4.1 km',
        contact: '(063) 228-7766',
        hours: '8AM - 5PM',
    },
];

interface VeterinaryClinic {
    id: number;
    name: string;
    slug: string;
    badge_title?: string | null;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    operating_hours?: string | null;
    is_emergency: boolean;
    is_featured: boolean;
    display_order: number;
}

const isVideoFile = (file?: File | null): boolean => {
    if (!file) {
return false;
}

    return (
        file.type.startsWith('video/') ||
        /\.(mp4|mov|avi|webm|mkv|3gp)$/i.test(file.name)
    );
};

export default function SOS({
    veterinaryClinics = [],
    sosGpsEnabled = true,
}: {
    veterinaryClinics?: VeterinaryClinic[];
    sosGpsEnabled?: boolean;
}) {
    const { auth, flash } = usePage<{
        auth?: {
            user?: {
                name?: string;
                email?: string;
                phone?: string;
            } | null;
        };
        flash?: {
            error?: string | null;
            submitted_report?: {
                reference: string;
                email?: string | null;
                type?: string;
                is_duplicate?: boolean;
            } | null;
        };
    }>().props;
    const authUser = auth?.user;

    const [submitted, setSubmitted] = useState(false);
    const [submittedLocation, setSubmittedLocation] = useState('');
    const [submittedReportInfo, setSubmittedReportInfo] = useState<{
        reference: string;
        email?: string | null;
        is_duplicate?: boolean;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [userCoords, setUserCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [mapVets, setMapVets] = useState<NearbyMapVet[]>([]);
    const [loadingMapVets, setLoadingMapVets] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        animalType: '',
        location: '',
        urgency: 'high',
        description: '',
        contactName: authUser?.name || '',
        contactPhone: authUser?.phone ? formatPhoneNumber(authUser.phone) : '',
        contactEmail: authUser?.email || '',
        situationType: '',
    });

    const isFormDirty = !submitted && Boolean(
        formData.situationType ||
        formData.location.trim() ||
        formData.description.trim() ||
        formData.contactName.trim() !== (authUser?.name || '') ||
        formData.contactPhone.trim() !== (authUser?.phone ? formatPhoneNumber(authUser.phone) : '') ||
        formData.contactEmail.trim() !== (authUser?.email || '') ||
        uploadedFiles.length > 0
    );

    const {
        showDialog: showLeaveModal,
        handleContinueEditing,
        handleLeaveAnyway,
    } = useUnsavedChanges({
        isDirty: isFormDirty,
        disabled: submitted,
    });

    useEffect(() => {
        return () => {
            filePreviews.forEach((preview) => {
                if (preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, []);

    useEffect(() => {
        if (!submitted || !sosGpsEnabled) {
return;
}

        let cancelled = false;

        const resolveAndFetchNearby = async () => {
            let coords = userCoords;

            if (!coords && submittedLocation) {
                const coordMatch = submittedLocation.match(
                    /^\s*([\d.-]+)\s*,\s*([\d.-]+)\s*$/,
                );

                if (coordMatch) {
                    coords = {
                        lat: parseFloat(coordMatch[1]),
                        lng: parseFloat(coordMatch[2]),
                    };
                } else {
                    coords = await forwardGeocode(submittedLocation);
                }

                if (!cancelled && coords) {
                    setUserCoords(coords);
                }
            }

            if (coords && !cancelled) {
                setLoadingMapVets(true);
                const nearby = await fetchNearbyVetClinics(
                    coords.lat,
                    coords.lng,
                );

                if (!cancelled) {
                    setMapVets(nearby);
                    setLoadingMapVets(false);
                }
            }
        };

        resolveAndFetchNearby();

        return () => {
            cancelled = true;
        };
    }, [submitted, sosGpsEnabled, submittedLocation, userCoords?.lat, userCoords?.lng]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;

        if (name === 'contactPhone') {
            setFormData({ ...formData, [name]: formatPhoneNumber(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const processFiles = (filesToAdd: File[]) => {
        const validFiles: File[] = [];
        const validPreviews: string[] = [];

        for (const file of filesToAdd) {
            const isImage =
                file.type.startsWith('image/') ||
                /\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i.test(file.name);
            const isVideo = isVideoFile(file);

            if (!isImage && !isVideo) {
                toast.error(
                    `"${file.name}" is not a supported photo or video file.`,
                );
                continue;
            }

            if (isImage && file.size > 10 * 1024 * 1024) {
                toast.error(`Photo "${file.name}" exceeds the 10MB limit.`);
                continue;
            }

            if (isVideo && file.size > 50 * 1024 * 1024) {
                toast.error(`Video "${file.name}" exceeds the 50MB limit.`);
                continue;
            }

            validFiles.push(file);
            validPreviews.push(URL.createObjectURL(file));
        }

        if (validFiles.length > 0) {
            setUploadedFiles((prev) => [...prev, ...validFiles]);
            setFilePreviews((prev) => [...prev, ...validPreviews]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];

        if (files.length === 0) {
return;
}

        processFiles(files);

        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        const previewToRevoke = filePreviews[indexToRemove];

        if (previewToRevoke && previewToRevoke.startsWith('blob:')) {
            URL.revokeObjectURL(previewToRevoke);
        }

        setUploadedFiles((prev) =>
            prev.filter((_, idx) => idx !== indexToRemove),
        );
        setFilePreviews((prev) =>
            prev.filter((_, idx) => idx !== indexToRemove),
        );
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files
            ? Array.from(e.dataTransfer.files)
            : [];

        if (files.length > 0) {
            processFiles(files);
        }
    };

    const handleDetectLocation = () => {
        if ('geolocation' in navigator) {
            setDetectingLocation(true);
            toast.info('Detecting your location...', {
                id: 'sos-geo-location',
            });
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoords({ lat: latitude, lng: longitude });

                    try {
                        const address = await reverseGeocode(
                            latitude,
                            longitude,
                        );
                        setFormData((prev) => ({ ...prev, location: address }));
                        toast.success('Location address pinned!', {
                            id: 'sos-geo-location',
                        });
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        setFormData((prev) => ({
                            ...prev,
                            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        }));
                        toast.success('Location pinned!', {
                            id: 'sos-geo-location',
                        });
                    } finally {
                        setDetectingLocation(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error(
                        'Unable to detect location. Please enter manually.',
                        { id: 'sos-geo-location' },
                    );
                    setDetectingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000 },
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.situationType) {
            toast.error('Please select the type of emergency.');

            return;
        }

        if (!formData.animalType) {
            toast.error('Please select the animal type.');

            return;
        }

        if (!formData.location.trim()) {
            toast.error('Location is required.');

            return;
        }

        if (!formData.description.trim()) {
            toast.error('Detailed description is required.');

            return;
        }

        setSubmitting(true);

        const data = new FormData();
        data.append('animalType', formData.animalType);
        data.append('location', formData.location);
        data.append('urgency', formData.urgency);
        data.append('description', formData.description);
        data.append('contactName', formData.contactName || '');
        data.append('contactPhone', formData.contactPhone || '');
        data.append('contactEmail', formData.contactEmail || '');
        data.append('situationType', formData.situationType);

        uploadedFiles.forEach((file) => {
            data.append('images[]', file);
        });

        const targetLocation = formData.location;
        const targetEmail = formData.contactEmail || authUser?.email || '';

        router.post('/pet-reports/sos', data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const pageFlash = page.props.flash as {
                    error?: string | null;
                    submitted_report?: {
                        reference: string;
                        email?: string | null;
                        is_duplicate?: boolean;
                    } | null;
                } | undefined;

                if (pageFlash?.error) {
                    return;
                }

                if (pageFlash?.submitted_report) {
                    setSubmittedReportInfo(pageFlash.submitted_report);
                } else {
                    setSubmittedReportInfo({
                        reference: '',
                        email: targetEmail || null,
                        is_duplicate: false,
                    });
                }

                setSubmittedLocation(targetLocation);
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (errors) => {
                const message = Object.values(errors).flat().join(' ');
                toast.error(
                    message ||
                        'Your SOS report could not be submitted. Please check the required fields and try again.',
                );
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="mx-auto max-w-6xl px-4">
                    {!submitted ? (
                        <>
                            <div className="mb-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl"
                                >
                                    <Siren
                                        size={48}
                                        className="animate-pulse text-red-600"
                                    />
                                </motion.div>
                                <h1 className="mb-4 text-4xl font-black tracking-tight text-white uppercase md:text-6xl">
                                    Emergency Animal Report
                                </h1>
                                <p className="mx-auto max-w-2xl text-xl leading-relaxed font-bold text-white/80">
                                    Report an animal in distress, being abused,
                                    or in immediate danger. Our emergency
                                    response team will be notified instantly.
                                </p>
                            </div>

                            <div className="rounded-[40px] bg-white p-8 shadow-2xl md:p-12">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-8"
                                >
                                    {/* Emergency Type */}
                                    <div>
                                        <label className="mb-4 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Type of Emergency{' '}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                            {[
                                                'Abuse',
                                                'Injured',
                                                'Trapped',
                                                'Sick',
                                            ].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            situationType: type,
                                                        })
                                                    }
                                                    className={`rounded-2xl border-2 p-4 text-sm font-black tracking-widest uppercase transition-all ${
                                                        formData.situationType ===
                                                        type
                                                            ? 'border-red-600 bg-red-600 text-white shadow-xl'
                                                            : 'border-transparent bg-gray-50 text-gray-600 hover:border-red-200'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Animal & Location */}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Animal Type{' '}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <ModernSelect
                                                searchable={false}
                                                value={formData.animalType}
                                                onChange={(val) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        animalType: val,
                                                    }))
                                                }
                                                placeholder="Select animal type"
                                                options={[
                                                    { value: '', label: 'Select animal type' },
                                                    { value: 'Dog', label: 'Dog' },
                                                    { value: 'Cat', label: 'Cat' },
                                                    { value: 'Other', label: 'Other Animal' },
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Current Location{' '}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    required
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="flex-1 rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-lg font-bold transition-all outline-none focus:border-red-500"
                                                    placeholder={
                                                        sosGpsEnabled
                                                            ? 'Type manually or pin your location'
                                                            : 'Enter street, barangay, or landmark'
                                                    }
                                                />
                                                {sosGpsEnabled && (
                                                    <button
                                                        type="button"
                                                        disabled={detectingLocation}
                                                        onClick={
                                                            handleDetectLocation
                                                        }
                                                        className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-black whitespace-nowrap text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-0"
                                                    >
                                                        {detectingLocation ? (
                                                            <Spinner
                                                                showProgress
                                                                label="Detecting..."
                                                                size="xs"
                                                            />
                                                        ) : (
                                                            <>
                                                                <MapPin size={18} />
                                                                <span className="hidden sm:inline">
                                                                    Pin Location
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    Pin My Location
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {sosGpsEnabled && (
                                                <p className="mt-2 ml-1 text-xs font-bold text-gray-400">
                                                    Click &quot;Pin Location&quot; to detect
                                                    your address
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Urgency Level */}
                                    <div>
                                        <label className="mb-4 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Urgency Level{' '}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
                                            {[
                                                {
                                                    id: 'high',
                                                    label: 'CRITICAL',
                                                    desc: 'Life-threatening',
                                                    activeClasses:
                                                        'border-red-500 bg-red-50 shadow-xl',
                                                    dotClass: 'bg-red-500',
                                                },
                                                {
                                                    id: 'medium',
                                                    label: 'URGENT',
                                                    desc: 'Needs help soon',
                                                    activeClasses:
                                                        'border-orange-500 bg-orange-50 shadow-xl',
                                                    dotClass: 'bg-orange-500',
                                                },
                                                {
                                                    id: 'low',
                                                    label: 'MODERATE',
                                                    desc: 'Can wait',
                                                    activeClasses:
                                                        'border-yellow-500 bg-yellow-50 shadow-xl',
                                                    dotClass: 'bg-yellow-500',
                                                },
                                            ].map((level) => (
                                                <button
                                                    key={level.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            urgency: level.id,
                                                        })
                                                    }
                                                    className={`flex items-center gap-3.5 rounded-2xl border-4 p-3.5 text-left transition-all sm:block sm:p-5 md:p-6 sm:text-center cursor-pointer ${
                                                        formData.urgency ===
                                                        level.id
                                                            ? level.activeClasses
                                                            : 'border-transparent bg-gray-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`h-4 w-4 shrink-0 rounded-full ${level.dotClass} sm:mx-auto sm:mb-2`}
                                                    ></div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black tracking-widest text-gray-900 uppercase">
                                                            {level.label}
                                                        </p>
                                                        <p className="mt-0.5 text-xs font-bold text-gray-500 sm:mt-1">
                                                            {level.desc}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Detailed Description{' '}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="min-h-[150px] w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                            placeholder="Describe what you saw. Include any injuries, behavior, and immediate threats..."
                                        />
                                    </div>

                                    {/* Evidence Upload (Photo or Video) */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Upload Evidence (Photo or Video, if safe to do so)
                                            </label>
                                            {uploadedFiles.length > 0 && (
                                                <span className="text-xs font-bold text-red-600">
                                                    {uploadedFiles.length} file
                                                    {uploadedFiles.length > 1
                                                        ? 's'
                                                        : ''}{' '}
                                                    attached
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="file-upload"
                                            accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.mp4,.mov,.webm,.avi,.mkv,.3gp"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {uploadedFiles.length === 0 ? (
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className={`block cursor-pointer rounded-2xl border-4 border-dashed p-8 text-center transition-all ${
                                                    isDragging
                                                        ? 'scale-[1.01] border-red-500 bg-red-50/50'
                                                        : 'border-gray-200 bg-gray-50 hover:border-red-300'
                                                }`}
                                            >
                                                <div className="mx-auto mb-3 flex items-center justify-center gap-3 text-gray-400">
                                                    <Camera size={36} />
                                                    <Video size={36} />
                                                </div>
                                                <p className="mb-1 font-black text-gray-900">
                                                    Click to upload or drag
                                                    photos or videos here
                                                </p>
                                                <p className="text-sm font-bold text-gray-500">
                                                    Photos (PNG, JPG, WEBP, HEIC up to 10MB) or Videos (MP4, MOV, WEBM up to 50MB)
                                                </p>
                                            </div>
                                        ) : (
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`rounded-2xl border-2 p-4 transition-all ${
                                                    isDragging
                                                        ? 'border-red-500 bg-red-50/40'
                                                        : 'border-gray-100 bg-gray-50/60'
                                                }`}
                                            >
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                    {filePreviews.map(
                                                        (preview, idx) => {
                                                            const fileIsVideo = isVideoFile(
                                                                uploadedFiles[idx],
                                                            );

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="relative aspect-video overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 shadow-sm sm:aspect-square"
                                                                >
                                                                    {fileIsVideo ? (
                                                                        <>
                                                                            <video
                                                                                src={preview}
                                                                                controls
                                                                                muted
                                                                                playsInline
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                            <span className="pointer-events-none absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                                                                                <Video size={10} />
                                                                                Video
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <img
                                                                            src={
                                                                                preview
                                                                            }
                                                                            alt="Upload preview"
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveFile(
                                                                                idx,
                                                                            );
                                                                        }}
                                                                        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white shadow-md transition-colors hover:bg-red-600"
                                                                        title={
                                                                            fileIsVideo
                                                                                ? 'Remove video'
                                                                                : 'Remove photo'
                                                                        }
                                                                    >
                                                                        <X
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-colors hover:border-red-500 hover:text-red-600 sm:aspect-square"
                                                        title="Add more photos"
                                                    >
                                                        <Plus size={24} />
                                                        <span className="text-xs font-bold">
                                                            Add More
                                                        </span>
                                                    </button>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-400">
                                                    <span>
                                                        {uploadedFiles.length}{' '}
                                                        file
                                                        {uploadedFiles.length >
                                                        1
                                                            ? 's'
                                                            : ''}{' '}
                                                        selected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className="cursor-pointer text-red-600 hover:underline"
                                                    >
                                                        Upload more
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Your Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="contactName"
                                                value={formData.contactName}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                                placeholder="Full Name or Anonymous"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Contact Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                                placeholder="+63 912 124 1241"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Email (For Tracking & E-Receipt)
                                            </label>
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={formData.contactEmail}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    <div className="flex items-start gap-4 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                                        <AlertCircle
                                            className="mt-1 shrink-0 text-red-600"
                                            size={24}
                                        />
                                        <div>
                                            <p className="mb-2 text-sm font-black tracking-widest text-red-900 uppercase">
                                                Important Reminder
                                            </p>
                                            <p className="text-sm leading-relaxed font-bold text-red-800">
                                                DO NOT approach aggressive or
                                                dangerous animals. Keep a safe
                                                distance and wait for trained
                                                responders. False reports will
                                                be subject to legal action.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex w-full items-center justify-center gap-2.5 sm:gap-3 rounded-2xl sm:rounded-[24px] bg-red-600 px-4 sm:px-6 py-4 sm:py-6 text-base sm:text-xl md:text-2xl font-black tracking-tight text-white uppercase shadow-2xl shadow-red-600/40 transition-all hover:bg-red-700 disabled:opacity-50 text-center cursor-pointer"
                                    >
                                        {submitting ? (
                                            <LoadingTimeUI
                                                isLoading={submitting}
                                                variant="inline"
                                                size="md"
                                                label="SENDING EMERGENCY REPORT..."
                                                showProgress
                                                showTime={false}
                                                className="text-base sm:text-xl text-white"
                                            />
                                        ) : (
                                            <>
                                                <Siren
                                                    className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 animate-bounce"
                                                />
                                                <span className="leading-tight">
                                                    SEND EMERGENCY REPORT
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Success Message */}
                            <div className="rounded-[40px] bg-white p-8 text-center shadow-2xl md:p-12">
                                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                </div>
                                <h2 className="mb-4 text-4xl font-black text-gray-900 uppercase md:text-5xl">
                                    Emergency Report Logged!
                                </h2>
                                <p className="mx-auto mb-6 max-w-2xl text-xl leading-relaxed font-bold text-gray-600">
                                    Emergency coordinators and nearby volunteers
                                    have been alerted for{' '}
                                    <span className="font-black text-red-600">
                                        {submittedLocation ||
                                            formData.location ||
                                            'the reported location'}
                                    </span>
                                    . If the animal is in immediate
                                    life-threatening danger, please also call
                                    one of the 24/7 hotlines below.
                                </p>

                                {(submittedReportInfo?.reference ||
                                    flash?.submitted_report?.reference) && (
                                    <div className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs font-black tracking-widest text-gray-400 uppercase">
                                            Your SOS Reference Number
                                        </p>
                                        <p className="mt-1 text-2xl font-black tracking-wider text-gray-900">
                                            {submittedReportInfo?.reference ||
                                                flash?.submitted_report
                                                    ?.reference}
                                        </p>
                                        {(submittedReportInfo?.email ||
                                            flash?.submitted_report?.email) && (
                                            <p className="mt-1 text-xs font-bold text-gray-500">
                                                Sent E-Receipt to{' '}
                                                {submittedReportInfo?.email ||
                                                    flash?.submitted_report
                                                        ?.email}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    {submittedReportInfo?.is_duplicate ||
                                    flash?.submitted_report?.is_duplicate ? (
                                        <div className="inline-flex items-center gap-3 rounded-full border-2 border-amber-200 bg-amber-50 px-6 py-3">
                                            <div className="h-3 w-3 animate-pulse rounded-full bg-amber-600"></div>
                                            <span className="text-sm font-black tracking-widest text-amber-900 uppercase">
                                                Linked to Existing Active Alert
                                                in Area
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-3 rounded-full border-2 border-red-200 bg-red-50 px-6 py-3">
                                            <div className="h-3 w-3 animate-pulse rounded-full bg-red-600"></div>
                                            <span className="text-sm font-black tracking-widest text-red-900 uppercase">
                                                Priority SOS Queued • Awaiting
                                                Responder Dispatch
                                            </span>
                                        </div>
                                    )}

                                    {authUser ? (
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-gray-800"
                                        >
                                            <span>Go to Dashboard</span>
                                            <ExternalLink size={16} />
                                        </Link>
                                    ) : (
                                        (submittedReportInfo?.reference ||
                                            flash?.submitted_report?.reference) &&
                                        (submittedReportInfo?.email ||
                                            flash?.submitted_report?.email) && (
                                            <Link
                                                href={`/track?reference=${encodeURIComponent(
                                                    submittedReportInfo?.reference ||
                                                        flash?.submitted_report
                                                            ?.reference ||
                                                        '',
                                                )}&email=${encodeURIComponent(
                                                    submittedReportInfo?.email ||
                                                        flash?.submitted_report
                                                            ?.email ||
                                                        '',
                                                )}`}
                                                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-gray-800"
                                            >
                                                <span>Track SOS Status</span>
                                                <ExternalLink size={16} />
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="rounded-[40px] bg-white p-8 shadow-2xl md:p-12">
                                <div className="mb-8 flex items-center gap-3">
                                    <Phone size={32} className="text-red-600" />
                                    <h3 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                                        Emergency Contacts
                                    </h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {EMERGENCY_CONTACTS.map(
                                        (contact, index) => (
                                            <motion.a
                                                key={index}
                                                href={`tel:${contact.phone}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                                className="group rounded-2xl border-2 border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-6 transition-all hover:border-red-300 hover:shadow-xl"
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <p className="mb-1 text-lg leading-tight font-black text-gray-900">
                                                            {contact.name}
                                                        </p>
                                                        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                                                            {contact.type}
                                                        </p>
                                                    </div>
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 transition-transform group-hover:scale-110">
                                                        <Phone
                                                            size={20}
                                                            className="text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="mb-2 text-2xl font-black text-red-600">
                                                    {contact.phone}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Clock
                                                        size={14}
                                                        className="text-green-600"
                                                    />
                                                    <p className="text-xs font-black tracking-widest text-green-600 uppercase">
                                                        {contact.available}
                                                    </p>
                                                </div>
                                            </motion.a>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* Nearby Vets */}
                            <div className="rounded-[40px] bg-white p-8 shadow-2xl md:p-12">
                                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Hospital
                                            size={32}
                                            className="text-blue-600"
                                        />
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                                                Nearest Veterinary Clinics
                                            </h3>
                                            <p className="text-xs font-bold text-gray-500">
                                                {!sosGpsEnabled
                                                    ? 'Veterinary clinics in Iligan City'
                                                    : loadingMapVets
                                                      ? 'Searching for the nearest veterinary clinics...'
                                                      : userCoords
                                                        ? 'Showing our featured partner vet and the 3 nearest clinics to your location'
                                                        : 'Pin your location to find the 3 nearest clinics'}
                                            </p>
                                        </div>
                                    </div>
                                    {sosGpsEnabled && (
                                        <button
                                            type="button"
                                            disabled={detectingLocation}
                                            onClick={handleDetectLocation}
                                            className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black tracking-widest text-blue-700 uppercase transition-all hover:border-blue-400 hover:bg-blue-100 disabled:opacity-60"
                                        >
                                            <MapPin size={14} />
                                            <span>
                                                {detectingLocation
                                                    ? 'Detecting...'
                                                    : userCoords
                                                      ? 'Refresh GPS'
                                                      : 'Detect Nearest Clinics'}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {!sosGpsEnabled
                                        ? NEARBY_VETS.map((vet, index) => (
                                              <motion.div
                                                  key={index}
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{
                                                      delay: 0.4 + index * 0.1,
                                                  }}
                                                  className="group rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 transition-all hover:border-blue-300 hover:shadow-xl"
                                              >
                                                  <div className="mb-4 flex items-start justify-between">
                                                      <div className="flex-1">
                                                          <p className="mb-2 text-lg leading-tight font-black text-gray-900">
                                                              {vet.name}
                                                          </p>
                                                          <div className="mb-2 flex items-center gap-2 text-gray-600">
                                                              <MapPin
                                                                  size={14}
                                                                  className="text-blue-600"
                                                              />
                                                              <p className="text-sm font-bold">
                                                                  {vet.address}
                                                              </p>
                                                          </div>
                                                          <div className="flex items-center gap-2 text-gray-600">
                                                              <Clock
                                                                  size={14}
                                                                  className="text-blue-600"
                                                              />
                                                              <p className="text-sm font-bold">
                                                                  {vet.hours}
                                                              </p>
                                                          </div>
                                                      </div>
                                                      <div className="text-right">
                                                          <p className="mb-1 text-xs font-bold tracking-widest text-gray-500 uppercase">
                                                              Distance
                                                          </p>
                                                          <p className="text-xl font-black text-blue-600">
                                                              {vet.distance}
                                                          </p>
                                                      </div>
                                                  </div>
                                                  <div className="flex gap-3">
                                                      <a
                                                          href={`tel:${vet.contact}`}
                                                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-blue-700"
                                                      >
                                                          <Phone size={16} />
                                                          Call
                                                      </a>
                                                      <a
                                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vet.name} ${vet.address} Iligan City`)}`}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          title={`Get directions to ${vet.name}`}
                                                          className="flex items-center justify-center rounded-xl border-2 border-blue-600 bg-white px-4 font-black text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                                                      >
                                                          <Navigation
                                                              size={16}
                                                          />
                                                      </a>
                                                  </div>
                                              </motion.div>
                                          ))
                                        : (() => {
                                        const partnerItems =
                                            veterinaryClinics.map((clinic) => ({
                                                key: `partner-${clinic.id}`,
                                                name: clinic.name,
                                                address: clinic.address
                                                    ? clinic.city &&
                                                      !clinic.address
                                                          .toLowerCase()
                                                          .includes(
                                                              clinic.city
                                                                  .toLowerCase()
                                                                  .split(',')[0],
                                                          )
                                                        ? `${clinic.address}, ${clinic.city}`
                                                        : clinic.address
                                                    : clinic.city ||
                                                      'Iligan City',
                                                phone: clinic.phone || null,
                                                operating_hours:
                                                    clinic.operating_hours ||
                                                    null,
                                                latitude: clinic.latitude ?? null,
                                                longitude:
                                                    clinic.longitude ?? null,
                                                is_featured: clinic.is_featured,
                                                is_partner: true,
                                                display_order:
                                                    clinic.display_order,
                                            }));

                                        const seenNames = new Set(
                                            partnerItems.map((p) =>
                                                p.name.trim().toLowerCase(),
                                            ),
                                        );

                                        const discoveredItems = mapVets
                                            .filter(
                                                (m) =>
                                                    !seenNames.has(
                                                        m.name
                                                            .trim()
                                                            .toLowerCase(),
                                                    ),
                                            )
                                            .map((m) => ({
                                                key: m.id,
                                                name: m.name,
                                                address: m.address,
                                                phone: m.phone,
                                                operating_hours:
                                                    m.operating_hours,
                                                latitude: m.latitude,
                                                longitude: m.longitude,
                                                is_featured: false,
                                                is_partner: false,
                                                display_order: 999,
                                            }));

                                        return [
                                            ...partnerItems,
                                            ...discoveredItems,
                                        ]
                                            .map((clinic) => ({
                                                ...clinic,
                                                distanceKm:
                                                    sosGpsEnabled &&
                                                    userCoords &&
                                                    clinic.latitude != null &&
                                                    clinic.longitude != null
                                                        ? haversineDistanceKm(
                                                              userCoords.lat,
                                                              userCoords.lng,
                                                              clinic.latitude,
                                                              clinic.longitude,
                                                          )
                                                        : null,
                                            }))
                                            .sort((a, b) => {
                                                if (
                                                    a.is_featured !==
                                                    b.is_featured
                                                ) {
                                                    return a.is_featured
                                                        ? -1
                                                        : 1;
                                                }

                                                if (
                                                    a.distanceKm !== null &&
                                                    b.distanceKm !== null
                                                ) {
                                                    return (
                                                        a.distanceKm -
                                                        b.distanceKm
                                                    );
                                                }

                                                if (a.distanceKm !== null) {
return -1;
}

                                                if (b.distanceKm !== null) {
return 1;
}

                                                return (
                                                    a.display_order -
                                                    b.display_order
                                                );
                                            })
                                            .slice(0, 4);
                                    })().map((vet, index) => {
                                        const destinationQuery = [
                                            vet.name,
                                            vet.address,
                                        ]
                                            .filter(Boolean)
                                            .join(', ');
                                        const mapsHref = destinationQuery
                                            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`
                                            : vet.latitude != null &&
                                                vet.longitude != null
                                              ? `https://www.google.com/maps/dir/?api=1&destination=${vet.latitude},${vet.longitude}`
                                              : '#';

                                        return (
                                            <motion.div
                                                key={vet.key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.15 + index * 0.08,
                                                }}
                                                className={`group flex flex-col justify-between rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                                                    vet.is_featured
                                                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-cyan-50 to-amber-50/40 ring-2 ring-blue-200/60 hover:border-blue-500'
                                                        : 'border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="mb-4 flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        {vet.is_featured ? (
                                                            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
                                                                <Star
                                                                    size={10}
                                                                    className="fill-amber-300 text-amber-300"
                                                                />
                                                                Featured Vet
                                                            </span>
                                                        ) : !vet.is_partner ? (
                                                            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                                                                <MapPin
                                                                    size={10}
                                                                />
                                                                Nearby on Map
                                                            </span>
                                                        ) : null}
                                                        <p className="mb-2 text-lg leading-tight font-black text-gray-900">
                                                            {vet.name}
                                                        </p>
                                                        <div className="mb-2 flex items-start gap-2 text-gray-600">
                                                            <MapPin
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-blue-600"
                                                            />
                                                            <p className="text-sm font-bold">
                                                                {vet.address}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-gray-600">
                                                            <Clock
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-blue-600"
                                                            />
                                                            <p className="text-sm font-bold">
                                                                {vet.operating_hours ||
                                                                    'Call for clinic hours'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="mb-1 text-xs font-bold tracking-widest text-gray-500 uppercase">
                                                            Distance
                                                        </p>
                                                        <p className="text-xl font-black text-blue-600">
                                                            {vet.distanceKm !==
                                                            null
                                                                ? `${vet.distanceKm.toFixed(1)} km`
                                                                : vet.is_featured
                                                                  ? 'Primary'
                                                                  : 'Iligan'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    {vet.phone ? (
                                                        <a
                                                            href={`tel:${vet.phone}`}
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black tracking-widest text-white uppercase transition-all hover:bg-blue-700"
                                                        >
                                                            <Phone size={16} />
                                                            Call
                                                        </a>
                                                    ) : (
                                                        <span className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 py-3 text-sm font-black tracking-widest text-gray-500 uppercase">
                                                            <Phone size={16} />
                                                            No Phone
                                                        </span>
                                                    )}
                                                    <a
                                                        href={mapsHref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={`Get directions to ${vet.name}`}
                                                        className="flex items-center justify-center rounded-xl border-2 border-blue-600 bg-white px-4 font-black text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                                                    >
                                                        <Navigation size={16} />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setSubmittedLocation('');
                                        setSubmittedReportInfo(null);
                                        setFormData({
                                            animalType: '',
                                            location: '',
                                            urgency: 'high',
                                            description: '',
                                            contactName: authUser?.name || '',
                                            contactPhone: authUser?.phone
                                                ? formatPhoneNumber(
                                                      authUser.phone,
                                                  )
                                                : '',
                                            contactEmail:
                                                authUser?.email || '',
                                            situationType: '',
                                        });
                                        filePreviews.forEach((preview) => {
                                            if (preview.startsWith('blob:')) {
                                                URL.revokeObjectURL(preview);
                                            }
                                        });
                                        setUploadedFiles([]);
                                        setFilePreviews([]);
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth',
                                        });
                                    }}
                                    className="w-full rounded-[24px] border-2 border-white bg-white px-12 py-5 text-xl font-black text-red-600 shadow-xl transition-all hover:bg-gray-100"
                                >
                                    REPORT ANOTHER EMERGENCY
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <UnsavedChangesDialog
                isOpen={showLeaveModal}
                onContinueEditing={handleContinueEditing}
                onLeaveAnyway={handleLeaveAnyway}
            />

            <Footer />
        </div>
    );
}
