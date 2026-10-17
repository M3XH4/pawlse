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
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { reverseGeocode } from '@/lib/geocoding';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';
import { Spinner } from '@/components/ui/spinner';

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

export default function SOS() {
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        animalType: '',
        location: '',
        urgency: 'high',
        description: '',
        contactName: '',
        contactPhone: '',
        situationType: '',
    });

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setUploadedFiles(files);

        const newPreviews: string[] = [];
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                const preview = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
                newPreviews.push(preview);
            } else if (file.type.startsWith('video/')) {
                newPreviews.push(URL.createObjectURL(file));
            }
        }
        setFilePreviews(newPreviews);
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
        if (!formData.location) {
            toast.error('Location is required.');
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
        data.append('situationType', formData.situationType);

        uploadedFiles.forEach((file) => {
            data.append('images[]', file);
        });

        router.post('/pet-reports/sos', data, {
            onSuccess: () => {
                setSubmitted(true);
                toast.success('SOS report submitted successfully!');
                setSubmitting(false);
            },
            onError: (errors) => {
                const message = Object.values(errors).flat().join(' ');
                toast.error(message || 'Failed to submit SOS report.');
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
                                            Type of Emergency
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
                                                Animal Type
                                            </label>
                                            <select
                                                required
                                                name="animalType"
                                                value={formData.animalType}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-lg font-bold transition-all outline-none focus:border-red-500"
                                            >
                                                <option value="">
                                                    Select animal type
                                                </option>
                                                <option value="Dog">Dog</option>
                                                <option value="Cat">Cat</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Current Location
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    required
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="flex-1 rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-lg font-bold transition-all outline-none focus:border-red-500"
                                                    placeholder="Type manually or pin your location"
                                                />
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
                                            </div>
                                            <p className="mt-2 ml-1 text-xs font-bold text-gray-400">
                                                Click "Pin Location" to detect
                                                your address
                                            </p>
                                        </div>
                                    </div>

                                    {/* Urgency Level */}
                                    <div>
                                        <label className="mb-4 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Urgency Level
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                {
                                                    id: 'high',
                                                    label: 'CRITICAL',
                                                    desc: 'Life-threatening',
                                                    color: 'red',
                                                },
                                                {
                                                    id: 'medium',
                                                    label: 'URGENT',
                                                    desc: 'Needs help soon',
                                                    color: 'orange',
                                                },
                                                {
                                                    id: 'low',
                                                    label: 'MODERATE',
                                                    desc: 'Can wait',
                                                    color: 'yellow',
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
                                                    className={`rounded-2xl border-4 p-6 transition-all ${
                                                        formData.urgency ===
                                                        level.id
                                                            ? `border-${level.color}-500 bg-${level.color}-50 shadow-xl`
                                                            : 'border-transparent bg-gray-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`h-4 w-4 rounded-full bg-${level.color}-500 mx-auto mb-2`}
                                                    ></div>
                                                    <p className="text-sm font-black tracking-widest text-gray-900 uppercase">
                                                        {level.label}
                                                    </p>
                                                    <p className="mt-1 text-xs font-bold text-gray-500">
                                                        {level.desc}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Detailed Description
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

                                    {/* Photo Upload */}
                                    <div>
                                        <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                            Upload Photo/Video (if safe to do
                                            so)
                                        </label>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept="image/*,video/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="block cursor-pointer rounded-2xl border-4 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-all hover:border-red-300"
                                        >
                                            {uploadedFiles.length === 0 ? (
                                                <>
                                                    <Camera
                                                        size={40}
                                                        className="mx-auto mb-3 text-gray-400"
                                                    />
                                                    <p className="mb-1 font-black text-gray-900">
                                                        Upload evidence
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-500">
                                                        Photo or video of the
                                                        situation (Max 10MB,
                                                        multiple allowed)
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {filePreviews.map(
                                                            (preview, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-gray-50"
                                                                >
                                                                    {uploadedFiles[
                                                                        idx
                                                                    ]?.type.startsWith(
                                                                        'image/',
                                                                    ) ? (
                                                                        <img
                                                                            src={
                                                                                preview
                                                                            }
                                                                            alt="Upload preview"
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <video
                                                                            src={
                                                                                preview
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <CheckCircle2
                                                            size={20}
                                                            className="text-green-600"
                                                        />
                                                        <p className="font-black text-green-600">
                                                            {
                                                                uploadedFiles.length
                                                            }{' '}
                                                            files selected
                                                        </p>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-400">
                                                        Click to change files
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Your Name
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                name="contactName"
                                                value={formData.contactName}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Contact Number
                                            </label>
                                            <input
                                                required
                                                type="tel"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold transition-all outline-none focus:border-red-500"
                                                placeholder="09XX XXX XXXX"
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
                                        className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-red-600 py-6 text-2xl font-black tracking-tight text-white uppercase shadow-2xl shadow-red-600/40 transition-all hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <LoadingTimeUI
                                                isLoading={submitting}
                                                variant="inline"
                                                size="md"
                                                label="SENDING EMERGENCY REPORT..."
                                                showProgress
                                                showTime={false}
                                                className="text-lg text-white sm:text-xl"
                                            />
                                        ) : (
                                            <>
                                                <Siren
                                                    size={28}
                                                    className="animate-bounce"
                                                />
                                                <span>
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
                            <div className="rounded-[40px] bg-white p-12 text-center shadow-2xl">
                                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                </div>
                                <h2 className="mb-4 text-5xl font-black text-gray-900 uppercase">
                                    Report Received!
                                </h2>
                                <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed font-bold text-gray-600">
                                    Emergency responders and nearby volunteers
                                    have been notified. Help is on the way to{' '}
                                    <span className="font-black text-red-600">
                                        {formData.location}
                                    </span>
                                    .
                                </p>
                                <div className="inline-flex items-center gap-3 rounded-full border-2 border-red-200 bg-red-50 px-6 py-3">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-600"></div>
                                    <span className="text-sm font-black tracking-widest text-red-900 uppercase">
                                        Response Team Dispatched
                                    </span>
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
                                <div className="mb-8 flex items-center gap-3">
                                    <Hospital
                                        size={32}
                                        className="text-blue-600"
                                    />
                                    <h3 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                                        Nearest Veterinary Clinics
                                    </h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {NEARBY_VETS.map((vet, index) => (
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
                                                <button className="rounded-xl border-2 border-blue-600 bg-white px-4 font-black text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
                                                    <Navigation size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({
                                            animalType: '',
                                            location: '',
                                            urgency: 'high',
                                            description: '',
                                            contactName: '',
                                            contactPhone: '',
                                            situationType: '',
                                        });
                                        setUploadedFiles([]);
                                        setFilePreviews([]);
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth',
                                        });
                                    }}
                                    className="rounded-[24px] border-2 border-white bg-white px-12 py-5 text-xl font-black text-red-600 shadow-xl transition-all hover:bg-gray-100"
                                >
                                    REPORT ANOTHER EMERGENCY
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
