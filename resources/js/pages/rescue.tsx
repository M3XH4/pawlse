import {
    Siren,
    Camera,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Heart,
    Activity,
    MessageSquare,
    Brain,
    Sparkles,
    Info,
    Pencil,
    X,
    ChevronDown,
    Upload,
    AlertTriangle,
    AlertCircle,
    MapPin,
    FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PhoneInput } from '@/components/phone-input';
import { reverseGeocode } from '@/lib/geocoding';
import { LoadingTimeUI } from '@/components/ui/loading-time-ui';
import { Spinner } from '@/components/ui/spinner';

type BreedPrediction = {
    name: string;
    raw_name?: string;
    confidence: number;
    image?: string | null;
};

type AnimalPrediction = {
    index: number;
    species: 'cat' | 'dog';
    species_confidence?: number;
    breed: string;
    raw_breed?: string;
    confidence: number;
    confidence_level?: string;
    is_confident?: boolean;
    confidence_message?: string;
    is_mixed_breed?: boolean;
    mixed_confidence?: number;
    age_group?: string;
    age_confidence?: number;
    age_reason?: string;
    suggested_names?: string[];
    neutral_names?: string[];
    box?: number[];
    detection_confidence?: number;
    breeds?: BreedPrediction[];
    similar_breeds?: BreedPrediction[];
};

type AIResult = {
    species: 'cat' | 'dog';
    breed: string;
    ageCategory: string;
    gender: string;
    suggestedName: string;

    rawBreed: string;

    confidence: number;
    confidenceLevel: string;
    isConfident: boolean;
    confidenceMessage: string;

    isMixedBreed: boolean;
    mixedConfidence: number;

    breeds: BreedPrediction[];
    similarBreeds: BreedPrediction[];

    totalAnimalsDetected?: number;
    animals?: AnimalPrediction[];
};

export type AnimalReviewItem = {
    index: number;
    species: 'Dog' | 'Cat';
    breed: string;
    rawBreed?: string;
    ageCategory: string;
    gender: string;
    suggestedName: string;
    confidence: number;
    confidenceLevel?: string;
    isConfident?: boolean;
    confidenceMessage?: string;
    isMixedBreed?: boolean;
    mixedConfidence?: number;
    box?: number[];
    included: boolean;
};

type ReportMode = 'selection' | 'ai-full' | 'ai-only' | 'manual' | 'success';

export interface RescuePageProps {
    aiStatus?: {
        enabled: boolean;
        available: boolean;
        reporting_enabled: boolean;
        identifying_enabled: boolean;
        reporting_active: boolean;
        identifying_active: boolean;
        reporting_disabled_reason?: 'admin_disabled' | 'service_unavailable' | null;
        identifying_disabled_reason?: 'admin_disabled' | 'service_unavailable' | null;
        reporting_message?: string | null;
        identifying_message?: string | null;
        health?: {
            is_healthy: boolean;
            status: string;
            message?: string;
        };
    };
}

export default function RescuePage({ aiStatus }: RescuePageProps = {}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const isAiReportingDisabled = aiStatus ? !aiStatus.reporting_active : false;
    const isAiIdentifyingDisabled = aiStatus ? !aiStatus.identifying_active : false;

    const reportingDisabledMessage =
        aiStatus?.reporting_message ||
        (aiStatus?.reporting_disabled_reason === 'service_unavailable'
            ? 'AI service is currently unavailable or unreachable. Please use Manual Entry to submit a rescue report.'
            : 'AI reporting is currently disabled by the administrator. Please use Manual Entry.');

    const identifyingDisabledMessage =
        aiStatus?.identifying_message ||
        (aiStatus?.identifying_disabled_reason === 'service_unavailable'
            ? 'AI service is currently unavailable or unreachable. AI animal identification is temporarily disabled.'
            : 'AI identification is currently disabled by the administrator.');

    // Mode selection
    const [mode, setMode] = useState<ReportMode>('selection');
    const [submittedMode, setSubmittedMode] = useState<string>('');

    // Wizard step for AI-full mode
    const [wizardStep, setWizardStep] = useState(1);

    // AI identification state
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [editedResult, setEditedResult] = useState<AIResult | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [predictionLogId, setPredictionLogId] = useState<number | null>(null);
    const [selectedAnimalIdx, setSelectedAnimalIdx] = useState(0);
    const [animalReviews, setAnimalReviews] = useState<AnimalReviewItem[]>([]);

    // File upload state
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);

    const mapAgeCategory = (
        ageGroup: string | undefined,
        speciesType: 'Dog' | 'Cat',
    ) => {
        const ag = (ageGroup || '').toLowerCase();
        if (speciesType === 'Dog') {
            if (
                ag.includes('puppy') ||
                ag.includes('kitten') ||
                ag.includes('young')
            ) {
                return 'Puppy: Birth to 6–7 months';
            }
            if (ag.includes('senior') || ag.includes('geriatric')) {
                return 'Senior: 8+ years (large breeds), 11+ years (small breeds)';
            }
            return 'Adult: 1 to 7 years';
        } else {
            if (
                ag.includes('kitten') ||
                ag.includes('puppy') ||
                ag.includes('young')
            ) {
                return 'Kitten: Birth to 6 months';
            }
            if (ag.includes('senior') || ag.includes('geriatric')) {
                return 'Senior: 11 to 14 years';
            }
            return 'Prime (Young Adult): 3 to 6 years';
        }
    };

    // Form fields
    const [animalType, setAnimalType] = useState<'Dog' | 'Cat'>('Dog');
    const [breed, setBreed] = useState('');
    const [ageCategory, setAgeCategory] = useState('Adult: 1 to 7 years');
    const [gender, setGender] = useState('Male');
    const [suggestedName, setSuggestedName] = useState('');
    const [incidentDesc, setIncidentDesc] = useState('');
    const [location, setLocation] = useState(user?.location || '');

    // Location detection state
    const [detectingLocation, setDetectingLocation] = useState(false);

    // Contact fields
    const [contactName, setContactName] = useState(user?.name || '');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            if (!contactName && user.name) setContactName(user.name);
            if (!contactEmail && user.email) setContactEmail(user.email);
            if (!contactPhone && user.phone) setContactPhone(user.phone);
            if (!location && user.location) setLocation(user.location);
        }
    }, [user]);

    // Age category options based on animal type
    const dogAgeCategories = [
        'Puppy: Birth to 6–7 months',
        'Junior (Adolescent): 7 months to 2 years',
        'Adult: 1 to 7 years',
        'Mature (Middle Age): Over 7 years',
        'Senior: 8+ years (large breeds), 11+ years (small breeds)',
        'Geriatric: At or beyond life expectancy',
    ];

    const catAgeCategories = [
        'Kitten: Birth to 6 months',
        'Junior: 7 months to 2 years',
        'Prime (Young Adult): 3 to 6 years',
        'Mature: 7 to 10 years',
        'Senior: 11 to 14 years',
        'Geriatric/Super Senior: 15+ years',
    ];

    const currentAgeCategories =
        animalType === 'Dog' ? dogAgeCategories : catAgeCategories;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        setUploadedFiles(files);

        // Generate previews
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
        setImageUploaded(true);
        setAnalyzing(true);
        setAiResult(null);
        setIsEditing(false);

        const firstFile = files[0];
        try {
            const formData = new FormData();
            formData.append('image', firstFile);

            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const response = await fetch('/ai/predict', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token ?? '',
                },
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                const errMsg = errData?.message || 'AI prediction failed. Please try again.';
                throw new Error(errMsg);
            }

            const data = await response.json();

            if (data.accepted === false) {
                toast.error(data.message ?? 'Image cannot be processed.');
                setAiResult(null);
                setEditedResult(null);
                setAnimalReviews([]);
                setImageUploaded(false);
                setAnalyzing(false);
                return;
            }

            if (data.prediction_log_id) {
                setPredictionLogId(data.prediction_log_id);
            }

            console.log('AI Response:', data);

            const suggestedName = Array.isArray(data.neutral_names)
                ? data.neutral_names[0]
                : (data.neutral_names ?? data.suggested_name ?? '');

            const detectedAnimal = (data.species === 'dog' ? 'Dog' : 'Cat') as
                | 'Dog'
                | 'Cat';
            const mappedAge = mapAgeCategory(data.age_group, detectedAnimal);

            const suggestions: AIResult = {
                species: data.species,
                breed: data.breed,
                rawBreed: data.raw_breed,
                ageCategory: mappedAge,
                gender: data.gender ?? 'Unknown',
                suggestedName,
                confidence: Math.round((data.confidence ?? 0) * 100),
                confidenceLevel: data.confidence_level ?? 'Unknown',
                isConfident: data.is_confident ?? false,
                confidenceMessage:
                    data.confidence_message ?? 'Review is recommended.',
                isMixedBreed: data.is_mixed_breed ?? false,
                mixedConfidence: data.mixed_confidence ?? 0,
                breeds: data.breeds ?? [],
                similarBreeds: data.similar_breeds ?? [],
                totalAnimalsDetected:
                    data.total_animals_detected ?? data.animals?.length ?? 1,
                animals: data.animals ?? [],
            };
            setAiResult(suggestions);
            setEditedResult(suggestions);
            setSelectedAnimalIdx(0);

            // Populate animalReviews list for multi-species review
            const reviews: AnimalReviewItem[] =
                data.animals && data.animals.length > 0
                    ? data.animals.map((a: AnimalPrediction, i: number) => {
                          const sp = (a.species === 'dog' ? 'Dog' : 'Cat') as
                              | 'Dog'
                              | 'Cat';
                          const ageCat = mapAgeCategory(a.age_group, sp);
                          const name =
                              a.suggested_names?.[0] ??
                              a.neutral_names?.[0] ??
                              '';
                          return {
                              index: i,
                              species: sp,
                              breed: a.breed,
                              rawBreed: a.raw_breed,
                              ageCategory: ageCat,
                              gender: 'Unknown',
                              suggestedName: name,
                              confidence: Math.round((a.confidence ?? 0) * 100),
                              confidenceLevel: a.confidence_level ?? 'High',
                              isConfident: a.is_confident ?? true,
                              confidenceMessage: a.confidence_message ?? '',
                              isMixedBreed: a.is_mixed_breed ?? false,
                              mixedConfidence: a.mixed_confidence ?? 0,
                              box: a.box,
                              included: true,
                          };
                      })
                    : [
                          {
                              index: 0,
                              species: detectedAnimal,
                              breed: suggestions.breed,
                              rawBreed: suggestions.rawBreed,
                              ageCategory: suggestions.ageCategory,
                              gender: suggestions.gender,
                              suggestedName: suggestions.suggestedName,
                              confidence: suggestions.confidence,
                              confidenceLevel: suggestions.confidenceLevel,
                              isConfident: suggestions.isConfident,
                              confidenceMessage: suggestions.confidenceMessage,
                              isMixedBreed: suggestions.isMixedBreed,
                              mixedConfidence: suggestions.mixedConfidence,
                              included: true,
                          },
                      ];
            setAnimalReviews(reviews);

            setAnimalType(detectedAnimal);
            setBreed(suggestions.breed);
            setAgeCategory(suggestions.ageCategory);
            setGender(suggestions.gender);
            setSuggestedName(suggestions.suggestedName);

            if (mode === 'ai-full') {
                setWizardStep(2);
            }

            if ((data.total_animals_detected ?? 1) > 1) {
                toast.success(
                    `AI detected ${data.total_animals_detected} animals in this photo! Multi-animal review activated.`,
                );
            } else {
                toast.success('AI identification complete!');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'AI identification failed. Please try again.');
            setImageUploaded(false);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSelectAnimal = (idx: number) => {
        setSelectedAnimalIdx(idx);
        const animal = animalReviews[idx];
        if (!animal) return;

        setAnimalType(animal.species);
        setBreed(animal.breed);
        setAgeCategory(animal.ageCategory);
        setGender(animal.gender);
        setSuggestedName(animal.suggestedName);

        const updatedAiResult: AIResult = {
            species: animal.species.toLowerCase() as 'dog' | 'cat',
            breed: animal.breed,
            rawBreed: animal.rawBreed || '',
            ageCategory: animal.ageCategory,
            gender: animal.gender,
            suggestedName: animal.suggestedName,
            confidence: animal.confidence,
            confidenceLevel: animal.confidenceLevel ?? 'High',
            isConfident: animal.isConfident ?? true,
            confidenceMessage: animal.confidenceMessage ?? '',
            isMixedBreed: animal.isMixedBreed ?? false,
            mixedConfidence: animal.mixedConfidence ?? 0,
            breeds: aiResult?.breeds ?? [],
            similarBreeds: aiResult?.similarBreeds ?? [],
            totalAnimalsDetected: animalReviews.length,
            animals: aiResult?.animals,
        };
        setAiResult(updatedAiResult);
        setEditedResult(updatedAiResult);
        toast.info(
            `Reviewing Animal #${idx + 1}: ${animal.species} (${animal.breed})`,
        );
    };

    const handleToggleIncludeAnimal = (idx: number) => {
        setAnimalReviews((prev) =>
            prev.map((item, i) => {
                if (i === idx) {
                    const newIncluded = !item.included;
                    toast.info(
                        `Animal #${idx + 1} ${newIncluded ? 'included in' : 'excluded from'} report`,
                    );
                    return { ...item, included: newIncluded };
                }
                return item;
            }),
        );
    };

    const handleDetectLocation = () => {
        if ('geolocation' in navigator) {
            setDetectingLocation(true);
            toast.info('Detecting your location...', {
                id: 'rescue-geo-location',
            });
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const address = await reverseGeocode(
                            latitude,
                            longitude,
                        );
                        setLocation(address);
                        toast.success('Location address pinned!', {
                            id: 'rescue-geo-location',
                        });
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        setLocation(
                            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        );
                        toast.success('Location pinned!', {
                            id: 'rescue-geo-location',
                        });
                    } finally {
                        setDetectingLocation(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error(
                        'Unable to detect location. Please enter manually.',
                        { id: 'rescue-geo-location' },
                    );
                    setDetectingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000 },
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (modeType: string) => {
        if (!location) {
            toast.error('Location is required.');
            return;
        }

        if (!user && (!contactName.trim() || !contactPhone.trim())) {
            toast.error('Contact Name and Phone are required for guests.');
            return;
        }

        const includedAnimals = animalReviews.filter((a) => a.included);
        if (animalReviews.length > 0 && includedAnimals.length === 0) {
            toast.error(
                'Please select at least one animal to include in the rescue report.',
            );
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append('animal_type', animalType);
        formData.append('breed', breed || '');
        formData.append('age_category', ageCategory || '');
        formData.append('gender', gender || '');
        formData.append('name', suggestedName || '');
        formData.append('description', incidentDesc || '');
        formData.append('location', location);

        const reporterName = contactName.trim() || (user?.name ?? '');
        const reporterPhone = contactPhone.trim();
        const reporterEmail = contactEmail.trim() || (user?.email ?? '');

        if (reporterName) {
            formData.append('contact_name', reporterName);
        }
        if (reporterPhone) {
            formData.append('contact_phone', reporterPhone);
        }
        if (reporterEmail) {
            formData.append('contact_email', reporterEmail);
        }

        if (predictionLogId) {
            formData.append('ai_prediction_log_id', predictionLogId.toString());
        }

        if (includedAnimals.length > 0) {
            formData.append('animals', JSON.stringify(includedAnimals));
        }

        uploadedFiles.forEach((file) => {
            formData.append('images[]', file);
        });

        router.post('/pet-reports/rescue', formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSubmittedMode(modeType);
                setMode('success');
                toast.success('Rescue report submitted successfully!');
                setSubmitting(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (errors) => {
                const message = Object.values(errors).flat().join(' ');
                toast.error(message || 'Failed to submit report.');
                setSubmitting(false);
            },
        });
    };

    const handleBackToSelection = () => {
        // Reset all states
        setMode('selection');
        setSubmittedMode('');
        setAiResult(null);
        setEditedResult(null);
        setAnimalReviews([]);
        setPredictionLogId(null);
        setIsEditing(false);
        setImageUploaded(false);
        setUploadedFiles([]);
        setFilePreviews([]);
        setAnimalType('Dog');
        setBreed('');
        setAgeCategory('Adult: 1 to 7 years');
        setGender('Male');
        setSuggestedName('');
        setIncidentDesc('');
        setLocation('');
        setContactName('');
        setContactPhone('');
        setContactEmail('');
    };

    const handleReset = () => {
        setMode('selection');
        setWizardStep(1);
        setAiResult(null);
        setEditedResult(null);
        setAnimalReviews([]);
        setPredictionLogId(null);
        setIsEditing(false);
        setImageUploaded(false);
        setUploadedFiles([]);
        setFilePreviews([]);
        setAnimalType('Dog');
        setBreed('');
        setAgeCategory('Adult: 1 to 7 years');
        setGender('Male');
        setSuggestedName('');
        setIncidentDesc('');
        setLocation('');
        setContactName('');
        setContactPhone('');
        setContactEmail('');
    };

    const handleModeSelect = (selectedMode: ReportMode) => {
        if (selectedMode === 'ai-full' && isAiReportingDisabled) {
            toast.error(reportingDisabledMessage);
            return;
        }
        if (selectedMode === 'ai-only' && isAiIdentifyingDisabled) {
            toast.error(identifyingDisabledMessage);
            return;
        }
        setMode(selectedMode);
        // Reset states when changing modes
        setImageUploaded(false);
        setAnalyzing(false);
        setAiResult(null);
        setAnimalReviews([]);
        setUploadedFiles([]);
        setFilePreviews([]);
    };

    const handleSaveEdit = () => {
        if (editedResult) {
            setAiResult(editedResult);
            setBreed(editedResult.breed);
            setAgeCategory(editedResult.ageCategory);
            setGender(editedResult.gender);
            setSuggestedName(editedResult.suggestedName);

            // Synchronize with active animalReview item
            setAnimalReviews((prev) =>
                prev.map((item, idx) => {
                    if (idx === selectedAnimalIdx) {
                        return {
                            ...item,
                            species: animalType,
                            breed: editedResult.breed,
                            ageCategory: editedResult.ageCategory,
                            gender: editedResult.gender,
                            suggestedName: editedResult.suggestedName,
                        };
                    }
                    return item;
                }),
            );
        }

        setIsEditing(false);
        toast.success(`Animal #${selectedAnimalIdx + 1} details updated!`);
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="mx-auto max-w-7xl px-4">
                    {/* ══════════════════════════════════════════════════════════ */}
                    {/* ── AI-ASSISTED ANIMAL IDENTIFICATION — REPORT RESCUE FORM ── */}
                    {/* ══════════════════════════════════════════════════════════ */}
                    <div className="mb-24">
                        {/* Section Header */}
                        <div className="mb-16 text-center">
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full border-2 border-paw-navy/20 bg-paw-navy/10 px-6 py-2 text-paw-navy">
                                <Sparkles
                                    size={20}
                                    className="animate-pulse text-paw-orange"
                                />
                                <span className="text-sm font-black tracking-widest uppercase">
                                    PAW-AI · Inside Report Rescue
                                </span>
                            </div>
                            <h1 className="mb-6 text-5xl leading-tight font-black text-paw-navy md:text-6xl">
                                AI-Assisted Animal Identification
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed font-bold text-gray-500">
                                Choose how you want to report: use AI for full
                                reporting, identify animals only, or enter
                                details manually.
                            </p>
                        </div>

                        {/* MODE SELECTION - 3 CARDS */}
                        {mode === 'selection' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mx-auto max-w-6xl space-y-6"
                            >
                                {(isAiReportingDisabled || isAiIdentifyingDisabled) && (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs font-semibold text-amber-900 shadow-xs flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                        <span>
                                            {isAiReportingDisabled && isAiIdentifyingDisabled
                                                ? (aiStatus?.reporting_disabled_reason === 'service_unavailable'
                                                    ? 'AI microservice is currently offline or unreachable. AI Report and AI Identification are temporarily disabled, but Manual Entry is fully functional.'
                                                    : 'AI features have been disabled by the system administrator. Manual Entry is fully operational.')
                                                : 'Some AI features are currently restricted. Manual Entry remains fully available.'}
                                        </span>
                                    </div>
                                )}

                                <div className="grid gap-8 md:grid-cols-3">
                                    {/* CARD 1: Use AI for Reporting */}
                                    <motion.div
                                        whileHover={
                                            !isAiReportingDisabled
                                                ? {
                                                      scale: 1.03,
                                                      boxShadow:
                                                          '0 20px 60px rgba(255, 107, 0, 0.3)',
                                                  }
                                                : undefined
                                        }
                                        onClick={() => {
                                            if (isAiReportingDisabled) {
                                                toast.error(reportingDisabledMessage);
                                                return;
                                            }
                                            handleModeSelect('ai-full');
                                        }}
                                        className={`group rounded-[40px] border-2 p-8 shadow-xl transition-all ${
                                            isAiReportingDisabled
                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50/90 opacity-75 select-none shadow-none'
                                                : 'cursor-pointer border-paw-orange/20 bg-gradient-to-br from-white to-orange-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div
                                                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-transform ${
                                                    isAiReportingDisabled
                                                        ? 'bg-gray-400 shadow-none'
                                                        : 'bg-paw-orange shadow-paw-orange/30 group-hover:scale-110'
                                                }`}
                                            >
                                                <Brain size={32} />
                                            </div>
                                            {isAiReportingDisabled && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900">
                                                    <AlertTriangle size={12} className="shrink-0 text-amber-600" />
                                                    {aiStatus?.reporting_disabled_reason === 'service_unavailable'
                                                        ? 'Service Unavailable'
                                                        : 'Disabled by Admin'}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`mb-4 text-2xl font-black ${
                                            isAiReportingDisabled ? 'text-gray-500' : 'text-paw-navy'
                                        }`}>
                                            Use AI for Reporting
                                        </h3>

                                        {isAiReportingDisabled ? (
                                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs font-bold text-amber-900 leading-relaxed shadow-xs">
                                                <p className="flex items-start gap-2">
                                                    <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                                                    <span>{reportingDisabledMessage}</span>
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mb-6 leading-relaxed font-bold text-gray-600">
                                                Upload a photo and let AI identify the
                                                animal. Results auto-fill the rescue
                                                form for quick submission.
                                            </p>
                                        )}

                                        <div className={`flex items-center gap-2 text-sm font-black ${
                                            isAiReportingDisabled ? 'text-gray-400' : 'text-paw-orange'
                                        }`}>
                                            <span>{isAiReportingDisabled ? 'DISABLED' : 'GET STARTED'}</span>
                                            {!isAiReportingDisabled && (
                                                <ArrowRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* CARD 2: AI Identification Only */}
                                    <motion.div
                                        whileHover={
                                            !isAiIdentifyingDisabled
                                                ? {
                                                      scale: 1.03,
                                                      boxShadow:
                                                          '0 20px 60px rgba(30, 50, 100, 0.3)',
                                                  }
                                                : undefined
                                        }
                                        onClick={() => {
                                            if (isAiIdentifyingDisabled) {
                                                toast.error(identifyingDisabledMessage);
                                                return;
                                            }
                                            handleModeSelect('ai-only');
                                        }}
                                        className={`group rounded-[40px] border-2 p-8 shadow-xl transition-all ${
                                            isAiIdentifyingDisabled
                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50/90 opacity-75 select-none shadow-none'
                                                : 'cursor-pointer border-paw-navy/20 bg-gradient-to-br from-white to-blue-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div
                                                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-transform ${
                                                    isAiIdentifyingDisabled
                                                        ? 'bg-gray-400 shadow-none'
                                                        : 'bg-paw-navy shadow-paw-navy/30 group-hover:scale-110'
                                                }`}
                                            >
                                                <Sparkles size={32} />
                                            </div>
                                            {isAiIdentifyingDisabled && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900">
                                                    <AlertTriangle size={12} className="shrink-0 text-amber-600" />
                                                    {aiStatus?.identifying_disabled_reason === 'service_unavailable'
                                                        ? 'Service Unavailable'
                                                        : 'Disabled by Admin'}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`mb-4 text-2xl font-black ${
                                            isAiIdentifyingDisabled ? 'text-gray-500' : 'text-paw-navy'
                                        }`}>
                                            AI Identification Only
                                        </h3>

                                        {isAiIdentifyingDisabled ? (
                                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs font-bold text-amber-900 leading-relaxed shadow-xs">
                                                <p className="flex items-start gap-2">
                                                    <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                                                    <span>{identifyingDisabledMessage}</span>
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mb-6 leading-relaxed font-bold text-gray-600">
                                                Just want to identify an animal? Get AI
                                                suggestions without submitting a rescue
                                                report.
                                            </p>
                                        )}

                                        <div className={`flex items-center gap-2 text-sm font-black ${
                                            isAiIdentifyingDisabled ? 'text-gray-400' : 'text-paw-navy'
                                        }`}>
                                            <span>{isAiIdentifyingDisabled ? 'DISABLED' : 'IDENTIFY NOW'}</span>
                                            {!isAiIdentifyingDisabled && (
                                                <ArrowRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* CARD 3: Manual Entry */}
                                    <motion.div
                                        whileHover={{
                                            scale: 1.03,
                                            boxShadow:
                                                '0 20px 60px rgba(100, 100, 100, 0.3)',
                                        }}
                                        onClick={() => handleModeSelect('manual')}
                                        className={`group cursor-pointer rounded-[40px] border-2 bg-gradient-to-br from-white p-8 shadow-xl transition-all ${
                                            isAiReportingDisabled || isAiIdentifyingDisabled
                                                ? 'border-paw-orange/40 to-orange-50/40 ring-2 ring-paw-orange/30'
                                                : 'border-gray-200 to-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700 text-white shadow-lg shadow-gray-700/30 transition-transform group-hover:scale-110">
                                                <Pencil size={32} />
                                            </div>
                                            {(isAiReportingDisabled || isAiIdentifyingDisabled) && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                                                    <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                                                    Recommended
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mb-4 text-2xl font-black text-paw-navy">
                                            Manual Entry
                                        </h3>
                                        <p className="mb-6 leading-relaxed font-bold text-gray-600">
                                            Prefer to enter all details yourself?
                                            Skip AI and fill out the form manually.
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-black text-gray-700 group-hover:text-paw-orange transition-colors">
                                            <span>ENTER MANUALLY</span>
                                            <ArrowRight
                                                size={16}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* MODE 1: USE AI FOR REPORTING (FULL FLOW) */}
                        {/* ═══════════════════════════════════════ */}
                        {mode === 'ai-full' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mx-auto max-w-4xl"
                            >
                                <button
                                    onClick={handleReset}
                                    className="mb-8 flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-paw-orange"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Wizard Progress Bar */}
                                <div className="mx-auto mb-12 max-w-2xl px-4">
                                    <div className="relative flex items-center justify-between">
                                        {/* Background connecting track */}
                                        <div className="absolute top-5 right-6 left-6 z-0 h-1 -translate-y-1/2 rounded-full bg-gray-200">
                                            <div
                                                className="h-full rounded-full bg-paw-orange transition-all duration-300"
                                                style={{
                                                    width:
                                                        wizardStep === 1
                                                            ? '0%'
                                                            : wizardStep === 2
                                                              ? '50%'
                                                              : '100%',
                                                }}
                                            />
                                        </div>

                                        {/* Step nodes */}
                                        {[
                                            { num: 1, label: 'Upload Photo' },
                                            { num: 2, label: 'AI Results' },
                                            {
                                                num: 3,
                                                label: 'Complete Report',
                                            },
                                        ].map((step) => (
                                            <div
                                                key={step.num}
                                                className="relative z-10 flex flex-col items-center"
                                            >
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ring-4 ring-paw-bg transition-all duration-300 ${
                                                        wizardStep >= step.num
                                                            ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/30'
                                                            : 'bg-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {wizardStep > step.num ? (
                                                        <CheckCircle2
                                                            size={20}
                                                        />
                                                    ) : (
                                                        step.num
                                                    )}
                                                </div>
                                                <span
                                                    className={`mt-2 text-center text-xs font-black tracking-widest whitespace-nowrap uppercase ${
                                                        wizardStep >= step.num
                                                            ? 'text-paw-orange'
                                                            : 'text-gray-400'
                                                    }`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    {/* STEP 1: Upload Photo */}
                                    {wizardStep === 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="mb-8 text-center">
                                                <h2 className="mb-4 text-3xl font-black text-paw-navy">
                                                    Step 1: Upload Animal Photo
                                                </h2>
                                                <p className="font-bold text-gray-600">
                                                    Upload a clear photo for AI
                                                    identification
                                                </p>
                                            </div>

                                            {/* How AI Helps */}
                                            <div className="space-y-4 rounded-3xl border-2 border-paw-orange/10 bg-gradient-to-br from-paw-orange/5 to-orange-50/30 p-6">
                                                <h3 className="flex items-center gap-2 text-lg font-black text-paw-navy">
                                                    <Sparkles
                                                        size={20}
                                                        className="text-paw-orange"
                                                    />
                                                    How AI Helps You
                                                </h3>
                                                <div className="space-y-3">
                                                    {[
                                                        'Identifies possible animal breed using image analysis',
                                                        'Suggests basic attributes such as age category and gender',
                                                        'Automatically fills rescue report details to reduce manual input',
                                                    ].map((text, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start gap-3"
                                                        >
                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-paw-orange/20 text-xs font-black text-paw-orange">
                                                                {idx + 1}
                                                            </div>
                                                            <p className="pt-0.5 text-sm leading-tight font-bold text-gray-600">
                                                                {text}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {!imageUploaded && !analyzing ? (
                                                <div className="cursor-pointer rounded-3xl border-4 border-dashed border-paw-orange/30 bg-gradient-to-br from-white to-orange-50/10 p-12 text-center transition-all hover:border-paw-orange/50">
                                                    <input
                                                        type="file"
                                                        id="rescue-file-upload"
                                                        accept="image/*,video/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="rescue-file-upload"
                                                        className="flex w-full cursor-pointer flex-col items-center justify-center"
                                                    >
                                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-paw-orange text-white shadow-xl shadow-paw-orange/30 transition-transform hover:scale-110">
                                                            <Camera size={36} />
                                                        </div>
                                                        <h3 className="mb-3 text-2xl font-black text-paw-navy">
                                                            Upload a Photo
                                                        </h3>
                                                        <p className="mb-6 max-w-sm font-bold text-gray-500">
                                                            Upload a clear image
                                                            (JPG or PNG). AI
                                                            will generate
                                                            identification
                                                            suggestions.
                                                        </p>
                                                        <div className="flex items-center gap-3 rounded-2xl bg-paw-navy px-10 py-4 font-black text-white shadow-xl transition-all hover:bg-paw-orange">
                                                            <Upload size={18} />{' '}
                                                            SELECT FILE
                                                        </div>
                                                        <p className="mt-4 text-xs font-bold text-gray-400">
                                                            or drag and drop
                                                            here
                                                        </p>
                                                    </label>
                                                </div>
                                            ) : analyzing ? (
                                                <div className="rounded-3xl border-2 border-paw-orange/20 bg-white p-8 text-center shadow-xl">
                                                    <LoadingTimeUI
                                                        isLoading={analyzing}
                                                        variant="card"
                                                        size="lg"
                                                        label="Analyzing Pet Photo with AI..."
                                                        description="Running deep learning model to detect species, predict breed, and identify age characteristics"
                                                        showProgress={true}
                                                        showTime={true}
                                                        showStatusHint={true}
                                                        className="border-0 bg-transparent p-0 shadow-none"
                                                    />
                                                </div>
                                            ) : null}

                                            {/* Disclaimer */}
                                            <div className="rounded-3xl bg-paw-navy p-6 text-white">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <ShieldCheck
                                                        className="text-paw-yellow"
                                                        size={20}
                                                    />
                                                    <h4 className="font-black">
                                                        Disclaimer
                                                    </h4>
                                                </div>
                                                <p className="text-sm leading-relaxed font-bold text-white/80">
                                                    This AI feature provides
                                                    suggested identification
                                                    only and may not always be
                                                    accurate. Users are
                                                    encouraged to review and
                                                    edit the information before
                                                    submission.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: Review AI Results */}
                                    {wizardStep === 2 && aiResult && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="mb-6 text-center">
                                                <h2 className="mb-4 text-3xl font-black text-paw-navy">
                                                    Step 2: Review AI
                                                    Identification
                                                </h2>
                                                <p className="font-bold text-gray-600">
                                                    Review and edit the
                                                    AI-generated details
                                                </p>
                                            </div>

                                            {/* Uploaded Photo Preview */}
                                            {filePreviews.length > 0 && (
                                                <div className="grid grid-cols-2 gap-3 rounded-3xl border-2 border-gray-100 bg-white p-3 sm:grid-cols-3">
                                                    {filePreviews.map(
                                                        (preview, index) => {
                                                            const file =
                                                                uploadedFiles[
                                                                    index
                                                                ];
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-gray-50"
                                                                >
                                                                    {file?.type.startsWith(
                                                                        'image/',
                                                                    ) ? (
                                                                        <img
                                                                            src={
                                                                                preview
                                                                            }
                                                                            alt={`Preview ${index}`}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <video
                                                                            src={
                                                                                preview
                                                                            }
                                                                            controls
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}

                                            {/* AI Results */}
                                            <div className="space-y-5 rounded-3xl border-2 border-paw-orange/20 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paw-orange text-white shadow-lg">
                                                            <Sparkles
                                                                size={20}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-paw-navy">
                                                                AI
                                                                Identification
                                                                Results
                                                            </h3>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <CheckCircle2
                                                                    size={12}
                                                                    className="text-green-600"
                                                                />
                                                                <span className="text-xs font-black text-green-600">
                                                                    {
                                                                        aiResult.confidence
                                                                    }
                                                                    % Confidence
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            isEditing
                                                                ? handleSaveEdit()
                                                                : setIsEditing(
                                                                      true,
                                                                  )
                                                        }
                                                        className={`rounded-xl px-4 py-2 text-xs font-black tracking-widest uppercase transition-all ${
                                                            isEditing
                                                                ? 'bg-paw-navy text-white hover:bg-paw-orange'
                                                                : 'border-2 border-paw-orange/30 bg-white text-paw-orange hover:bg-paw-orange hover:text-white'
                                                        }`}
                                                    >
                                                        {isEditing
                                                            ? 'Save'
                                                            : 'Edit'}
                                                    </button>
                                                </div>

                                                {/* Multi-Animal Detected Selector */}
                                                {animalReviews.length > 1 && (
                                                    <div className="space-y-3 rounded-2xl border-2 border-paw-orange/30 bg-white/95 p-4 shadow-sm backdrop-blur">
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2 text-xs font-black tracking-wider text-paw-navy uppercase">
                                                                <Brain
                                                                    size={16}
                                                                    className="text-paw-orange"
                                                                />
                                                                Multi-Species
                                                                Detection (
                                                                {
                                                                    animalReviews.length
                                                                }{' '}
                                                                Animals
                                                                Detected)
                                                            </span>
                                                            <span className="rounded-full border border-paw-orange/20 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-paw-orange">
                                                                {
                                                                    animalReviews.filter(
                                                                        (a) =>
                                                                            a.included,
                                                                    ).length
                                                                }{' '}
                                                                of{' '}
                                                                {
                                                                    animalReviews.length
                                                                }{' '}
                                                                selected for
                                                                rescue
                                                            </span>
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            {animalReviews.map(
                                                                (
                                                                    animal,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        onClick={() =>
                                                                            handleSelectAnimal(
                                                                                idx,
                                                                            )
                                                                        }
                                                                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border-2 p-3 transition-all ${
                                                                            selectedAnimalIdx ===
                                                                            idx
                                                                                ? 'border-paw-orange bg-orange-50/80 shadow-md shadow-paw-orange/10'
                                                                                : 'border-gray-100 bg-white hover:border-paw-orange/30'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div
                                                                                className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                                                                                    selectedAnimalIdx ===
                                                                                    idx
                                                                                        ? 'bg-paw-orange text-white'
                                                                                        : 'bg-gray-100 text-gray-500'
                                                                                }`}
                                                                            >
                                                                                #
                                                                                {idx +
                                                                                    1}
                                                                            </div>
                                                                            <div>
                                                                                <p className="flex items-center gap-1.5 text-xs font-black text-paw-navy">
                                                                                    <span>
                                                                                        {
                                                                                            animal.species
                                                                                        }
                                                                                        :{' '}
                                                                                        {
                                                                                            animal.breed
                                                                                        }
                                                                                    </span>
                                                                                    {selectedAnimalIdx ===
                                                                                        idx && (
                                                                                        <span className="py-0.2 rounded-md bg-paw-orange px-1.5 text-[9px] font-bold text-white">
                                                                                            Active
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] font-bold text-gray-400">
                                                                                    {
                                                                                        animal.ageCategory.split(
                                                                                            ':',
                                                                                        )[0]
                                                                                    }{' '}
                                                                                    &middot;{' '}
                                                                                    {
                                                                                        animal.confidence
                                                                                    }
                                                                                    %
                                                                                    conf
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handleToggleIncludeAnimal(
                                                                                    idx,
                                                                                );
                                                                            }}
                                                                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-black transition-all ${
                                                                                animal.included
                                                                                    ? 'border-green-600 bg-green-500 text-white'
                                                                                    : 'border-gray-200 bg-gray-100 text-gray-400'
                                                                            }`}
                                                                        >
                                                                            {animal.included
                                                                                ? '✓ Included'
                                                                                : '+ Excluded'}
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <AnimatePresence mode="wait">
                                                    {!isEditing ? (
                                                        <motion.div
                                                            key="view"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            className="grid grid-cols-2 gap-3"
                                                        >
                                                            <div className="col-span-2 rounded-2xl bg-white p-4">
                                                                <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Breed
                                                                </p>
                                                                <p className="font-black text-paw-navy">
                                                                    {
                                                                        aiResult.breed
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="rounded-2xl bg-white p-4">
                                                                <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Age
                                                                </p>
                                                                <p className="text-sm font-black text-paw-navy">
                                                                    {
                                                                        aiResult.ageCategory
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="rounded-2xl bg-white p-4">
                                                                <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Gender
                                                                </p>
                                                                <p className="font-black text-paw-navy">
                                                                    {
                                                                        aiResult.gender
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="col-span-2 rounded-2xl bg-white p-4">
                                                                <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Suggested
                                                                    Name
                                                                </p>
                                                                <p className="font-black text-paw-navy">
                                                                    {
                                                                        aiResult.suggestedName
                                                                    }
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="edit"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Breed
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editedResult?.breed ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditedResult(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                prev
                                                                                    ? {
                                                                                          ...prev,
                                                                                          breed: e
                                                                                              .target
                                                                                              .value,
                                                                                      }
                                                                                    : null,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-paw-orange/30 bg-white p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                        Age
                                                                        Category
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            editedResult?.ageCategory ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setEditedResult(
                                                                                (
                                                                                    prev,
                                                                                ) =>
                                                                                    prev
                                                                                        ? {
                                                                                              ...prev,
                                                                                              ageCategory:
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : null,
                                                                            )
                                                                        }
                                                                        className="w-full rounded-2xl border-2 border-paw-orange/30 bg-white p-4 text-sm font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                                    >
                                                                        {currentAgeCategories.map(
                                                                            (
                                                                                cat,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        cat
                                                                                    }
                                                                                    value={
                                                                                        cat
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        cat
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                        Gender
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            editedResult?.gender ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setEditedResult(
                                                                                (
                                                                                    prev,
                                                                                ) =>
                                                                                    prev
                                                                                        ? {
                                                                                              ...prev,
                                                                                              gender: e
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : null,
                                                                            )
                                                                        }
                                                                        className="w-full rounded-2xl border-2 border-paw-orange/30 bg-white p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                                    >
                                                                        <option value="Male">
                                                                            Male
                                                                        </option>
                                                                        <option value="Female">
                                                                            Female
                                                                        </option>
                                                                        <option value="Unknown">
                                                                            Unknown
                                                                        </option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Suggested
                                                                    Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editedResult?.suggestedName ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditedResult(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                prev
                                                                                    ? {
                                                                                          ...prev,
                                                                                          suggestedName:
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : null,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-paw-orange/30 bg-white p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Auto-Filled Details */}
                                            <div className="space-y-4 rounded-3xl border-2 border-gray-100 bg-white p-6">
                                                <h3 className="flex items-center gap-2 font-black text-paw-navy">
                                                    <FileText
                                                        size={18}
                                                        className="text-paw-orange"
                                                    />
                                                    Auto-Filled Report Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Animal Type
                                                        </label>
                                                        <select
                                                            value={animalType}
                                                            onChange={(e) => {
                                                                setAnimalType(
                                                                    e.target
                                                                        .value as
                                                                        | 'Dog'
                                                                        | 'Cat',
                                                                );
                                                                setAgeCategory(
                                                                    e.target
                                                                        .value ===
                                                                        'Dog'
                                                                        ? dogAgeCategories[0]
                                                                        : catAgeCategories[0],
                                                                );
                                                            }}
                                                            className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                        >
                                                            <option value="Dog">
                                                                Dog
                                                            </option>
                                                            <option value="Cat">
                                                                Cat
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Breed
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={breed}
                                                            onChange={(e) =>
                                                                setBreed(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Age Category
                                                        </label>
                                                        <select
                                                            value={ageCategory}
                                                            onChange={(e) =>
                                                                setAgeCategory(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-4 text-sm font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                        >
                                                            {currentAgeCategories.map(
                                                                (cat) => (
                                                                    <option
                                                                        key={
                                                                            cat
                                                                        }
                                                                        value={
                                                                            cat
                                                                        }
                                                                    >
                                                                        {cat}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Gender
                                                        </label>
                                                        <select
                                                            value={gender}
                                                            onChange={(e) =>
                                                                setGender(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                        >
                                                            <option value="Male">
                                                                Male
                                                            </option>
                                                            <option value="Female">
                                                                Female
                                                            </option>
                                                            <option value="Unknown">
                                                                Unknown
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Suggested Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                suggestedName
                                                            }
                                                            onChange={(e) =>
                                                                setSuggestedName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-4 font-bold text-paw-navy outline-none focus:border-paw-orange"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setWizardStep(3)}
                                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-paw-orange py-5 font-black text-white shadow-xl transition-all hover:bg-orange-600"
                                            >
                                                CONTINUE TO REPORT DETAILS{' '}
                                                <ArrowRight size={20} />
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: Complete Report */}
                                    {wizardStep === 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="mb-6 text-center">
                                                <h2 className="mb-4 text-3xl font-black text-paw-navy">
                                                    Step 3: Complete Rescue
                                                    Report
                                                </h2>
                                                <p className="font-bold text-gray-600">
                                                    Add incident details and
                                                    location
                                                </p>
                                            </div>

                                            <div className="space-y-6 rounded-3xl border-2 border-gray-100 bg-white p-6">
                                                <div>
                                                    <label className="mb-2 block text-sm font-black tracking-widest text-gray-500 uppercase">
                                                        Incident Description *
                                                    </label>
                                                    <textarea
                                                        value={incidentDesc}
                                                        onChange={(e) =>
                                                            setIncidentDesc(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="min-h-[120px] w-full rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                        placeholder="Describe what you observed..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-black tracking-widest text-gray-500 uppercase">
                                                        Location / Landmark *
                                                    </label>
                                                    <div className="flex flex-col gap-3 sm:flex-row">
                                                        <input
                                                            type="text"
                                                            value={location}
                                                            onChange={(e) =>
                                                                setLocation(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="flex-1 rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                            placeholder="Type manually or pin your location"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                detectingLocation
                                                            }
                                                            onClick={
                                                                handleDetectLocation
                                                            }
                                                            className="flex items-center justify-center gap-2 rounded-2xl bg-paw-navy px-6 py-4 font-black whitespace-nowrap text-white transition-all hover:bg-paw-orange disabled:cursor-not-allowed disabled:opacity-60 sm:py-0"
                                                        >
                                                            {detectingLocation ? (
                                                                <Spinner
                                                                    showProgress
                                                                    label="Detecting..."
                                                                    size="xs"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <MapPin
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                    <span className="hidden sm:inline">
                                                                        Pin
                                                                        Location
                                                                    </span>
                                                                    <span className="sm:hidden">
                                                                        Pin My
                                                                        Location
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-xs font-bold text-gray-400">
                                                        Click "Pin Location" to
                                                        detect your address
                                                    </p>
                                                </div>

                                                {/* Contact Details */}
                                                {user ? (
                                                    <div className="space-y-4 rounded-3xl border-2 border-emerald-500/20 bg-emerald-50/60 p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <ShieldCheck
                                                                    className="text-emerald-600"
                                                                    size={20}
                                                                />
                                                                <h4 className="text-sm font-black tracking-wider text-paw-navy uppercase">
                                                                    Your Contact
                                                                    Information
                                                                    (Logged In)
                                                                </h4>
                                                            </div>
                                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                                                Verified Account
                                                            </span>
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        contactName
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setContactName(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                                    placeholder={
                                                                        user.name ||
                                                                        'Reporter Name'
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Phone Number
                                                                    (For
                                                                    Responders)
                                                                </label>
                                                                <PhoneInput
                                                                    value={
                                                                        contactPhone
                                                                    }
                                                                    onChange={(
                                                                        val,
                                                                    ) =>
                                                                        setContactPhone(
                                                                            val,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                                    placeholder="+63 9XX XXX XXXX"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={
                                                                    contactEmail
                                                                }
                                                                onChange={(e) =>
                                                                    setContactEmail(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                                placeholder={
                                                                    user.email ||
                                                                    'email@example.com'
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 rounded-3xl border-2 border-paw-orange/10 bg-orange-50/50 p-6">
                                                        <h4 className="text-sm font-black tracking-wider text-paw-navy uppercase">
                                                            Your Contact
                                                            Information
                                                            (Required for
                                                            Guests)
                                                        </h4>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Name *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={
                                                                        contactName
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setContactName(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                                    placeholder="Reporter Name"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                    Phone *
                                                                </label>
                                                                <PhoneInput
                                                                    required
                                                                    value={
                                                                        contactPhone
                                                                    }
                                                                    onChange={(
                                                                        val,
                                                                    ) =>
                                                                        setContactPhone(
                                                                            val,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                                    placeholder="+63 9XX XXX XXXX"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                                Email (Optional)
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={
                                                                    contactEmail
                                                                }
                                                                onChange={(e) =>
                                                                    setContactEmail(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                                placeholder="email@example.com"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Summary */}
                                                <div className="space-y-3 rounded-2xl border-2 border-paw-orange/10 bg-gradient-to-br from-paw-orange/5 to-orange-50/30 p-5">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-paw-navy">
                                                            Report Summary
                                                        </h4>
                                                        {animalReviews.filter(
                                                            (a) => a.included,
                                                        ).length > 1 && (
                                                            <span className="rounded-full bg-paw-orange px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                                                                🐾{' '}
                                                                {
                                                                    animalReviews.filter(
                                                                        (a) =>
                                                                            a.included,
                                                                    ).length
                                                                }{' '}
                                                                Animals in
                                                                Report
                                                            </span>
                                                        )}
                                                    </div>

                                                    {animalReviews.filter(
                                                        (a) => a.included,
                                                    ).length > 1 ? (
                                                        <div className="space-y-2 border-b border-paw-orange/10 pb-3">
                                                            {animalReviews
                                                                .filter(
                                                                    (a) =>
                                                                        a.included,
                                                                )
                                                                .map(
                                                                    (an, i) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="flex items-center justify-between rounded-xl border border-paw-orange/20 bg-white p-3 text-xs"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-paw-orange/10 text-[10px] font-black text-paw-orange">
                                                                                    #
                                                                                    {i +
                                                                                        1}
                                                                                </span>
                                                                                <div>
                                                                                    <p className="font-black text-paw-navy">
                                                                                        {
                                                                                            an.species
                                                                                        }{' '}
                                                                                        ·{' '}
                                                                                        {
                                                                                            an.breed
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-[10px] font-bold text-gray-400">
                                                                                        {
                                                                                            an.ageCategory.split(
                                                                                                ':',
                                                                                            )[0]
                                                                                        }{' '}
                                                                                        ·{' '}
                                                                                        {
                                                                                            an.gender
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {an.suggestedName && (
                                                                                <span className="rounded-lg bg-paw-bg px-2 py-1 text-[11px] font-bold text-paw-navy">
                                                                                    "
                                                                                    {
                                                                                        an.suggestedName
                                                                                    }
                                                                                    "
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                                            <div>
                                                                <p className="font-bold text-gray-400">
                                                                    Animal
                                                                </p>
                                                                <p className="font-black text-paw-navy">
                                                                    {animalType}{' '}
                                                                    -{' '}
                                                                    {breed ||
                                                                        'Unspecified'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-400">
                                                                    Age/Gender
                                                                </p>
                                                                <p className="font-black text-paw-navy">
                                                                    {
                                                                        ageCategory.split(
                                                                            ':',
                                                                        )[0]
                                                                    }{' '}
                                                                    / {gender}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="border-t border-paw-orange/10 pt-2 text-xs">
                                                        <p className="font-bold text-gray-400">
                                                            Reporter Contact
                                                        </p>
                                                        <p className="font-black text-paw-navy">
                                                            {contactName ||
                                                                (user
                                                                    ? user.name
                                                                    : 'Guest')}
                                                            {contactPhone
                                                                ? ` · ${contactPhone}`
                                                                : ''}
                                                            {contactEmail
                                                                ? ` · ${contactEmail}`
                                                                : user?.email
                                                                  ? ` · ${user.email}`
                                                                  : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                                <AlertTriangle
                                                    size={14}
                                                    className="mt-0.5 shrink-0 text-gray-400"
                                                />
                                                <p className="text-xs leading-tight font-bold text-gray-400">
                                                    This AI feature provides
                                                    suggested identification
                                                    only and may not always be
                                                    accurate. Users are
                                                    encouraged to review and
                                                    edit the information before
                                                    submission.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() =>
                                                        setWizardStep(2)
                                                    }
                                                    className="rounded-2xl bg-gray-200 px-8 py-5 font-black text-paw-navy transition-all hover:bg-gray-300"
                                                >
                                                    BACK
                                                </button>
                                                <button
                                                    disabled={submitting}
                                                    onClick={() =>
                                                        handleSubmit(
                                                            'AI-Assisted Reporting',
                                                        )
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-600 py-5 font-black text-white uppercase shadow-xl transition-all hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {submitting ? (
                                                        <LoadingTimeUI
                                                            isLoading={
                                                                submitting
                                                            }
                                                            variant="inline"
                                                            size="sm"
                                                            label="SUBMITTING REPORT..."
                                                            showProgress
                                                            showTime={false}
                                                            className="text-white"
                                                        />
                                                    ) : (
                                                        <>
                                                            <span>
                                                                SUBMIT RESCUE
                                                                REPORT
                                                            </span>
                                                            <Siren size={20} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* MODE 2: AI IDENTIFICATION ONLY */}
                        {/* ═══════════════════════════════════════ */}
                        {mode === 'ai-only' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mx-auto max-w-4xl"
                            >
                                <button
                                    onClick={handleReset}
                                    className="mb-8 flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-paw-orange"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Upload Section */}
                                {!imageUploaded && !analyzing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex aspect-video flex-col items-center justify-center rounded-[60px] border-4 border-dashed border-paw-navy/30 bg-white p-12 text-center shadow-2xl"
                                    >
                                        <input
                                            type="file"
                                            id="ai-only-upload"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="ai-only-upload"
                                            className="flex w-full cursor-pointer flex-col items-center justify-center"
                                        >
                                            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-paw-navy text-white shadow-xl shadow-paw-navy/30 transition-transform hover:scale-110">
                                                <Camera size={40} />
                                            </div>
                                            <h3 className="mb-4 text-3xl font-black text-paw-navy">
                                                Upload Animal Photo
                                            </h3>
                                            <p className="mb-8 max-w-md font-bold text-gray-400">
                                                Upload a clear image (JPG or
                                                PNG). AI will generate
                                                identification suggestions.
                                            </p>
                                            <div className="flex items-center gap-3 rounded-[24px] bg-paw-navy px-12 py-5 text-xl font-black text-white shadow-xl transition-all hover:bg-paw-orange">
                                                <Upload size={20} /> SELECT FILE
                                            </div>
                                        </label>
                                    </motion.div>
                                )}

                                {/* Analyzing State */}
                                {analyzing && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex aspect-video flex-col items-center justify-center rounded-[60px] border-2 border-paw-navy/10 bg-white p-12 text-center shadow-2xl"
                                    >
                                        <div className="w-full max-w-md">
                                            <LoadingTimeUI
                                                isLoading={analyzing}
                                                variant="card"
                                                size="lg"
                                                label="Analyzing Pet Photo with AI..."
                                                description="Processing visual features, detecting animal breed, and estimating age classification"
                                                showProgress={true}
                                                showTime={true}
                                                showStatusHint={true}
                                                className="border-0 bg-transparent shadow-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Result State - AI Only (No Form) */}
                                {aiResult && !analyzing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Notice Banner */}
                                        <div className="flex items-center gap-4 rounded-[32px] border-2 border-blue-200 bg-blue-50 p-6">
                                            <Info
                                                size={24}
                                                className="shrink-0 text-blue-600"
                                            />
                                            <div>
                                                <p className="mb-1 font-black text-blue-900">
                                                    This is an AI identification
                                                    preview.
                                                </p>
                                                <p className="text-sm font-bold text-blue-700">
                                                    No report will be submitted.
                                                    This is for identification
                                                    purposes only.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Uploaded file preview */}
                                        {filePreviews.length > 0 && (
                                            <div className="grid grid-cols-2 gap-3 rounded-3xl border-2 border-gray-100 bg-white p-3 sm:grid-cols-3">
                                                {filePreviews.map(
                                                    (preview, index) => {
                                                        const file =
                                                            uploadedFiles[
                                                                index
                                                            ];
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-gray-50"
                                                            >
                                                                {file?.type.startsWith(
                                                                    'image/',
                                                                ) ? (
                                                                    <img
                                                                        src={
                                                                            preview
                                                                        }
                                                                        alt={`Preview ${index}`}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={
                                                                            preview
                                                                        }
                                                                        controls
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}

                                        {/* Multi-Animal Detected Selector in AI-Only Mode */}
                                        {animalReviews.length > 1 && (
                                            <div className="space-y-3 rounded-3xl border-2 border-paw-navy/20 bg-white p-4 shadow-md">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-xs font-black tracking-wider text-paw-navy uppercase">
                                                        <Brain
                                                            size={16}
                                                            className="text-paw-orange"
                                                        />
                                                        Multi-Species
                                                        Identification (
                                                        {animalReviews.length}{' '}
                                                        Animals Detected)
                                                    </span>
                                                    <span className="rounded-full border border-paw-navy/10 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-paw-navy">
                                                        Click an animal to
                                                        inspect
                                                    </span>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {animalReviews.map(
                                                        (animal, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSelectAnimal(
                                                                        idx,
                                                                    )
                                                                }
                                                                className={`flex items-center justify-between gap-2 rounded-2xl border-2 p-3 text-left transition-all ${
                                                                    selectedAnimalIdx ===
                                                                    idx
                                                                        ? 'border-paw-navy bg-blue-50 shadow-md shadow-paw-navy/10'
                                                                        : 'border-gray-100 bg-white hover:border-paw-navy/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div
                                                                        className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                                                                            selectedAnimalIdx ===
                                                                            idx
                                                                                ? 'bg-paw-navy text-white'
                                                                                : 'bg-gray-100 text-gray-500'
                                                                        }`}
                                                                    >
                                                                        #
                                                                        {idx +
                                                                            1}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-paw-navy">
                                                                            {
                                                                                animal.species
                                                                            }
                                                                            :{' '}
                                                                            {
                                                                                animal.breed
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] font-bold text-gray-400">
                                                                            {
                                                                                animal.ageCategory.split(
                                                                                    ':',
                                                                                )[0]
                                                                            }{' '}
                                                                            &middot;{' '}
                                                                            {
                                                                                animal.confidence
                                                                            }
                                                                            %
                                                                            conf
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {selectedAnimalIdx ===
                                                                    idx && (
                                                                    <span className="rounded-md bg-paw-navy px-2 py-0.5 text-[9px] font-bold text-white">
                                                                        Viewing
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Result Card */}
                                        <div className="rounded-[40px] border-2 border-paw-navy/20 bg-gradient-to-br from-white to-blue-50/60 p-8 shadow-2xl shadow-paw-navy/10">
                                            <div className="mb-6 flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paw-navy text-white shadow-lg">
                                                    <Sparkles size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-2xl font-black text-paw-navy">
                                                            AI Identification
                                                            Results
                                                        </h4>
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1">
                                                            <CheckCircle2
                                                                size={14}
                                                                className="text-green-600"
                                                            />
                                                            <span className="text-xs font-black text-green-600">
                                                                {
                                                                    aiResult.confidence
                                                                }
                                                                % Confidence
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p
                                                        className={`mt-2 text-xs font-black ${
                                                            aiResult.isConfident
                                                                ? 'text-green-600'
                                                                : 'text-amber-600'
                                                        }`}
                                                    >
                                                        {
                                                            aiResult.confidenceLevel
                                                        }{' '}
                                                        confidence ·{' '}
                                                        {
                                                            aiResult.confidenceMessage
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 rounded-2xl border-2 border-paw-navy/10 bg-white p-4">
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Identified Breed
                                                    </p>
                                                    <p className="text-lg font-black text-paw-navy">
                                                        {aiResult.breed}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 rounded-2xl border-2 border-paw-navy/10 bg-white p-4">
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Age Category
                                                    </p>
                                                    <p className="font-black text-paw-navy">
                                                        {aiResult.ageCategory}
                                                    </p>
                                                </div>
                                                {/* <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Gender</p>
                                                    <p className="font-black text-paw-navy">{aiResult.gender}</p>
                                                </div> */}
                                                <div className="col-span-2 rounded-2xl border-2 border-paw-navy/10 bg-white p-4">
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Suggested Name
                                                    </p>
                                                    <p className="font-black text-paw-navy">
                                                        {aiResult.suggestedName}
                                                    </p>
                                                </div>
                                                {/* Mixed Breed Detection */}
                                                <div className="col-span-2 rounded-2xl border-2 border-paw-navy/10 bg-white p-4">
                                                    <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Mixed Breed Detection
                                                    </p>
                                                    <p className="font-black text-paw-navy">
                                                        {aiResult.isMixedBreed
                                                            ? `Possible mixed breed (${(aiResult.mixedConfidence * 100).toFixed(1)}% mix score)`
                                                            : 'Likely pure / dominant breed'}
                                                    </p>
                                                </div>
                                                {/* Similar Breeds */}
                                                <div className="mt-6">
                                                    <p className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Similar Breeds
                                                    </p>
                                                    {aiResult.similarBreeds
                                                        .length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiResult.similarBreeds.map(
                                                                (
                                                                    breed,
                                                                    idx,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="rounded-full border-2 border-paw-navy/20 bg-white px-4 py-2 text-sm font-bold text-paw-navy"
                                                                    >
                                                                        {
                                                                            breed.name
                                                                        }{' '}
                                                                        (
                                                                        {(
                                                                            breed.confidence *
                                                                            100
                                                                        ).toFixed(
                                                                            1,
                                                                        )}
                                                                        %)
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-400">
                                                            No similar breeds
                                                            above confidence
                                                            threshold.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <button
                                                onClick={() => {
                                                    setMode('ai-full');
                                                    setWizardStep(2);
                                                    toast.info(
                                                        'Switched to full rescue report mode with your AI findings.',
                                                    );
                                                }}
                                                className="flex flex-1 items-center justify-center gap-3 rounded-[24px] bg-paw-orange py-6 text-lg font-black text-white shadow-xl transition-all hover:bg-orange-600"
                                            >
                                                <Siren size={24} />
                                                SUBMIT RESCUE REPORT FOR THIS
                                                ANIMAL
                                            </button>
                                            <button
                                                onClick={handleReset}
                                                className="flex items-center justify-center gap-3 rounded-[24px] bg-paw-navy px-8 py-6 text-lg font-black text-white shadow-xl transition-all hover:bg-gray-800 sm:w-auto"
                                            >
                                                IDENTIFY ANOTHER ANIMAL
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* MODE 3: MANUAL ENTRY */}
                        {/* ═══════════════════════════════════════ */}
                        {mode === 'manual' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mx-auto max-w-4xl"
                            >
                                <button
                                    onClick={handleReset}
                                    className="mb-8 flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-paw-orange"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Manual Entry Form */}
                                <div className="rounded-[40px] border-2 border-gray-200 bg-white p-10 shadow-2xl">
                                    <div className="mb-8 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-700 text-white shadow-lg">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-paw-navy">
                                                Manual Rescue Report
                                            </h3>
                                            <p className="text-sm font-bold text-gray-500">
                                                Enter all details yourself
                                                without AI assistance
                                            </p>
                                        </div>
                                    </div>

                                    {/* Notice */}
                                    <div className="mb-8 flex items-start gap-3 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4">
                                        <Info
                                            size={16}
                                            className="mt-0.5 shrink-0 text-gray-600"
                                        />
                                        <p className="text-sm font-bold text-gray-600">
                                            No AI assistance used. All details
                                            are user-provided.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Upload Photo */}
                                        <div>
                                            <label className="mb-3 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                Upload Photo (Optional)
                                            </label>
                                            <input
                                                type="file"
                                                id="manual-upload"
                                                accept="image/*,video/*"
                                                multiple
                                                onChange={async (e) => {
                                                    const files = e.target.files
                                                        ? Array.from(
                                                              e.target.files,
                                                          )
                                                        : [];
                                                    if (files.length === 0)
                                                        return;

                                                    setUploadedFiles(files);

                                                    const newPreviews: string[] =
                                                        [];
                                                    for (const file of files) {
                                                        if (
                                                            file.type.startsWith(
                                                                'image/',
                                                            )
                                                        ) {
                                                            const reader =
                                                                new FileReader();
                                                            const preview =
                                                                await new Promise<string>(
                                                                    (
                                                                        resolve,
                                                                    ) => {
                                                                        reader.onloadend =
                                                                            () =>
                                                                                resolve(
                                                                                    reader.result as string,
                                                                                );
                                                                        reader.readAsDataURL(
                                                                            file,
                                                                        );
                                                                    },
                                                                );
                                                            newPreviews.push(
                                                                preview,
                                                            );
                                                        } else if (
                                                            file.type.startsWith(
                                                                'video/',
                                                            )
                                                        ) {
                                                            newPreviews.push(
                                                                URL.createObjectURL(
                                                                    file,
                                                                ),
                                                            );
                                                        }
                                                    }
                                                    setFilePreviews(
                                                        newPreviews,
                                                    );
                                                }}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="manual-upload"
                                                className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400"
                                            >
                                                {uploadedFiles.length === 0 ? (
                                                    <>
                                                        <Camera
                                                            size={32}
                                                            className="mx-auto mb-3 text-gray-400"
                                                        />
                                                        <p className="font-bold text-gray-600">
                                                            Click to upload
                                                            photos
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-gray-400">
                                                            JPG, PNG or Videos
                                                            (Multiple allowed)
                                                        </p>
                                                    </>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {filePreviews.map(
                                                                (
                                                                    preview,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
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
                                                                size={18}
                                                                className="text-green-600"
                                                            />
                                                            <p className="font-bold text-green-600">
                                                                {
                                                                    uploadedFiles.length
                                                                }{' '}
                                                                files selected
                                                            </p>
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-400">
                                                            Click to change
                                                            files
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        {/* Animal Type and Breed */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Animal Type
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={animalType}
                                                        onChange={(e) => {
                                                            setAnimalType(
                                                                e.target
                                                                    .value as
                                                                    | 'Dog'
                                                                    | 'Cat',
                                                            );
                                                            // Reset age category to first option when animal type changes
                                                            setAgeCategory(
                                                                e.target
                                                                    .value ===
                                                                    'Dog'
                                                                    ? dogAgeCategories[0]
                                                                    : catAgeCategories[0],
                                                            );
                                                        }}
                                                        className="w-full appearance-none rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                    >
                                                        <option value="Dog">
                                                            Dog
                                                        </option>
                                                        <option value="Cat">
                                                            Cat
                                                        </option>
                                                    </select>
                                                    <ChevronDown
                                                        size={16}
                                                        className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Animal Breed
                                                </label>
                                                <input
                                                    type="text"
                                                    value={breed}
                                                    onChange={(e) =>
                                                        setBreed(e.target.value)
                                                    }
                                                    className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                    placeholder="e.g. Aspin, Domestic Short Hair"
                                                />
                                            </div>
                                        </div>

                                        {/* Age and Gender */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Age Category
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={ageCategory}
                                                        onChange={(e) =>
                                                            setAgeCategory(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none rounded-2xl border-2 border-transparent bg-paw-bg p-5 text-sm font-bold transition-all outline-none focus:border-paw-orange"
                                                    >
                                                        {currentAgeCategories.map(
                                                            (category) => (
                                                                <option
                                                                    key={
                                                                        category
                                                                    }
                                                                    value={
                                                                        category
                                                                    }
                                                                >
                                                                    {category}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <ChevronDown
                                                        size={16}
                                                        className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                    Gender
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={gender}
                                                        onChange={(e) =>
                                                            setGender(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full appearance-none rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                    >
                                                        <option value="Male">
                                                            Male
                                                        </option>
                                                        <option value="Female">
                                                            Female
                                                        </option>
                                                        <option value="Unknown">
                                                            Unknown
                                                        </option>
                                                    </select>
                                                    <ChevronDown
                                                        size={16}
                                                        className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggested Name */}
                                        <div>
                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                Suggested Name
                                            </label>
                                            <input
                                                type="text"
                                                value={suggestedName}
                                                onChange={(e) =>
                                                    setSuggestedName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                placeholder="e.g. Buddy, Luna"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                Description / Condition
                                            </label>
                                            <textarea
                                                value={incidentDesc}
                                                onChange={(e) =>
                                                    setIncidentDesc(
                                                        e.target.value,
                                                    )
                                                }
                                                className="min-h-[120px] w-full rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                placeholder="Describe the animal's condition and situation..."
                                            />
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                Location / Landmark
                                            </label>
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) =>
                                                        setLocation(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 rounded-2xl border-2 border-transparent bg-paw-bg p-5 font-bold transition-all outline-none focus:border-paw-orange"
                                                    placeholder="Type manually or pin your location"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={detectingLocation}
                                                    onClick={
                                                        handleDetectLocation
                                                    }
                                                    className="flex items-center justify-center gap-2 rounded-2xl bg-paw-navy px-6 py-4 font-black whitespace-nowrap text-white transition-all hover:bg-paw-orange disabled:cursor-not-allowed disabled:opacity-60 sm:py-0"
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

                                        {/* Contact Details */}
                                        {user ? (
                                            <div className="space-y-4 rounded-3xl border-2 border-emerald-500/20 bg-emerald-50/60 p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <ShieldCheck
                                                            className="text-emerald-600"
                                                            size={20}
                                                        />
                                                        <h4 className="text-sm font-black tracking-wider text-paw-navy uppercase">
                                                            Your Contact
                                                            Information (Logged
                                                            In)
                                                        </h4>
                                                    </div>
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                                        Verified Account
                                                    </span>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={contactName}
                                                            onChange={(e) =>
                                                                setContactName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                            placeholder={
                                                                user.name ||
                                                                'Reporter Name'
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Phone Number (For
                                                            Responders)
                                                        </label>
                                                        <PhoneInput
                                                            value={contactPhone}
                                                            onChange={(val) =>
                                                                setContactPhone(
                                                                    val,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                            placeholder="+63 9XX XXX XXXX"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={contactEmail}
                                                        onChange={(e) =>
                                                            setContactEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-emerald-500"
                                                        placeholder={
                                                            user.email ||
                                                            'email@example.com'
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 rounded-3xl border-2 border-paw-orange/10 bg-orange-50/50 p-6">
                                                <h4 className="text-sm font-black tracking-wider text-paw-navy uppercase">
                                                    Your Contact Information
                                                    (Required for Guests)
                                                </h4>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={contactName}
                                                            onChange={(e) =>
                                                                setContactName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                            placeholder="Reporter Name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                            Phone *
                                                        </label>
                                                        <PhoneInput
                                                            required
                                                            value={contactPhone}
                                                            onChange={(val) =>
                                                                setContactPhone(
                                                                    val,
                                                                )
                                                            }
                                                            className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                            placeholder="+63 9XX XXX XXXX"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                        Email (Optional)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={contactEmail}
                                                        onChange={(e) =>
                                                            setContactEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm font-bold text-paw-navy transition-all outline-none focus:border-paw-orange"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            disabled={submitting}
                                            onClick={() =>
                                                handleSubmit('Manual Entry')
                                            }
                                            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 py-6 text-xl font-black text-white uppercase shadow-xl shadow-red-600/30 transition-all hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <LoadingTimeUI
                                                    isLoading={submitting}
                                                    variant="inline"
                                                    size="md"
                                                    label="SUBMITTING REPORT..."
                                                    showProgress
                                                    showTime={false}
                                                    className="text-white"
                                                />
                                            ) : (
                                                <>
                                                    <span>
                                                        SUBMIT RESCUE REPORT
                                                    </span>
                                                    <Siren size={24} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* SUCCESS SCREEN */}
                        {/* ═══════════════════════════════════════ */}
                        {mode === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mx-auto max-w-3xl"
                            >
                                <div className="rounded-[60px] border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-12 text-center shadow-2xl">
                                    {/* Success Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            delay: 0.2,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-xl shadow-green-500/30"
                                    >
                                        <CheckCircle2
                                            size={48}
                                            className="text-white"
                                        />
                                    </motion.div>

                                    {/* Thank You Message */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h2 className="mb-4 text-4xl font-black text-paw-navy md:text-5xl">
                                            Thank You!
                                        </h2>
                                        <p className="mb-6 text-xl font-bold text-gray-600">
                                            Your rescue report has been
                                            submitted successfully
                                        </p>
                                        <div className="mb-8 rounded-2xl border-2 border-green-100 bg-white p-6">
                                            <p className="mb-2 text-sm font-black tracking-widest text-green-700 uppercase">
                                                Report Type
                                            </p>
                                            <p className="text-lg font-bold text-paw-navy">
                                                {submittedMode}
                                            </p>
                                        </div>
                                        <div className="mb-8 rounded-2xl border-2 border-green-200 bg-green-50 p-6">
                                            <div className="flex items-start gap-4">
                                                <Info
                                                    size={24}
                                                    className="mt-1 shrink-0 text-green-600"
                                                />
                                                <div className="text-left">
                                                    <p className="mb-2 font-bold text-green-900">
                                                        What happens next?
                                                    </p>
                                                    <ul className="space-y-2 text-sm font-bold text-green-700">
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2
                                                                size={16}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            <span>
                                                                Our dispatch
                                                                team will verify
                                                                your report
                                                                within 15
                                                                minutes
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2
                                                                size={16}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            <span>
                                                                Nearby
                                                                volunteers will
                                                                be notified for
                                                                immediate
                                                                response
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2
                                                                size={16}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            <span>
                                                                You'll receive
                                                                updates via SMS
                                                                once rescue is
                                                                complete
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                            <button
                                                onClick={handleBackToSelection}
                                                className="flex items-center justify-center gap-3 rounded-2xl bg-paw-orange px-10 py-5 text-lg font-black text-white shadow-xl transition-all hover:bg-orange-600"
                                            >
                                                <Sparkles size={20} />
                                                REPORT ANOTHER RESCUE
                                            </button>
                                            <button
                                                onClick={() =>
                                                    (window.location.href = '/')
                                                }
                                                className="flex items-center justify-center gap-3 rounded-2xl bg-paw-navy px-10 py-5 text-lg font-black text-white shadow-xl transition-all hover:bg-gray-800"
                                            >
                                                <Heart size={20} />
                                                BACK TO HOME
                                            </button>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="mt-8 border-t-2 border-gray-200 pt-8">
                                            <p className="mb-3 text-sm font-bold text-gray-500">
                                                Need immediate assistance?
                                            </p>
                                            <a
                                                href="tel:+639123456789"
                                                className="inline-flex items-center gap-2 text-lg font-black text-red-600 transition-colors hover:text-red-700"
                                            >
                                                <Siren
                                                    size={20}
                                                    className="animate-bounce"
                                                />
                                                Call Emergency Hotline: +63 912
                                                345 6789
                                            </a>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Rescue Process ── */}
                    <div className="mb-24">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-black text-paw-navy">
                                Our Rescue Process
                            </h2>
                            <p className="mx-auto max-w-2xl font-bold text-gray-500">
                                From report to recovery, we follow a strict
                                protocol to ensure the safety and health of
                                every stray.
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-4">
                            {[
                                {
                                    id: 1,
                                    title: 'Report',
                                    desc: 'Community members report incidents via the app or SOS hotline.',
                                    icon: <MessageSquare />,
                                },
                                {
                                    id: 2,
                                    title: 'Verify',
                                    desc: 'Dispatchers verify the report and assess urgency levels.',
                                    icon: <Activity />,
                                },
                                {
                                    id: 3,
                                    title: 'Respond',
                                    desc: 'Nearby volunteers or the rapid response team is deployed.',
                                    icon: <Siren />,
                                },
                                {
                                    id: 4,
                                    title: 'Rehabilitate',
                                    desc: 'The animal is taken to a vet partner for medical care.',
                                    icon: <Heart />,
                                },
                            ].map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group rounded-[40px] border-2 border-transparent bg-white p-8 text-center shadow-2xl shadow-paw-navy/5 transition-all hover:border-paw-orange/10"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-paw-bg text-paw-orange shadow-xl shadow-black/5 transition-all group-hover:bg-paw-orange group-hover:text-white">
                                        {step.icon}
                                    </div>
                                    <span className="mb-2 block text-[10px] font-black tracking-[0.2em] text-paw-orange uppercase">
                                        Step 0{step.id}
                                    </span>
                                    <h3 className="mb-4 text-xl font-black text-paw-navy">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed font-bold text-gray-400">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ── Call to Action ── */}
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Small helper icon component
// function FileTextIcon() {
//   return (
//     <div className="w-8 h-8 bg-paw-orange/10 rounded-xl flex items-center justify-center text-paw-orange">
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
//         <polyline points="14 2 14 8 20 8"/>
//         <line x1="16" y1="13" x2="8" y2="13"/>
//         <line x1="16" y1="17" x2="8" y2="17"/>
//         <polyline points="10 9 9 9 8 9"/>
//       </svg>
//     </div>
//   );
// }
