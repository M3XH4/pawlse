import { Siren, Camera, ShieldCheck, CheckCircle2, ArrowRight, Heart, Activity, MessageSquare, Brain, Sparkles, Info, Pencil, X, ChevronDown, Upload, AlertTriangle, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

type BreedPrediction = {
    name: string;
    raw_name?: string;
    confidence: number;
    image?: string | null;
};

type AIResult = {
    species: 'cat' | 'dog';
    breed: string;
    ageCategory: string;
    gender: string;
    suggestedName: string;

    rawBreed: string,

    confidence: number;
    confidenceLevel: string;
    isConfident: boolean;
    confidenceMessage: string;

    isMixedBreed: boolean;
    mixedConfidence: number;

    breeds: BreedPrediction[];
    similarBreeds: BreedPrediction[];
};

type ReportMode = 'selection' | 'ai-full' | 'ai-only' | 'manual' | 'success';

export default function RescuePage() {
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

    // File upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    // Form fields
    const [animalType, setAnimalType] = useState<'Dog' | 'Cat'>('Dog');
    const [breed, setBreed] = useState('');
    const [ageCategory, setAgeCategory] = useState('Adult: 1 to 7 years');
    const [gender, setGender] = useState('Male');
    const [suggestedName, setSuggestedName] = useState('');
    const [incidentDesc, setIncidentDesc] = useState('');
    const [location, setLocation] = useState('');

    // Age category options based on animal type
    const dogAgeCategories = [
        'Puppy: Birth to 6–7 months',
        'Junior (Adolescent): 7 months to 2 years',
        'Adult: 1 to 7 years',
        'Mature (Middle Age): Over 7 years',
        'Senior: 8+ years (large breeds), 11+ years (small breeds)',
        'Geriatric: At or beyond life expectancy'
    ];

    const catAgeCategories = [
        'Kitten: Birth to 6 months',
        'Junior: 7 months to 2 years',
        'Prime (Young Adult): 3 to 6 years',
        'Mature: 7 to 10 years',
        'Senior: 11 to 14 years',
        'Geriatric/Super Senior: 15+ years'
    ];

    const currentAgeCategories = animalType === 'Dog' ? dogAgeCategories : catAgeCategories;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // eslint-disable-next-line curly
        if (!file) return;

        setUploadedFile(file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            setFilePreview(URL.createObjectURL(file));
        }

        setImageUploaded(true);
        setAnalyzing(true);
        setAiResult(null);
        setIsEditing(false);

        try {
            const formData = new FormData();
            formData.append('image', file);

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
                throw new Error('AI prediction failed');
            }

            const data = await response.json();
                
            if (data.accepted === false) {
                toast.error(data.message ?? 'Image cannot be processed.');

                setAiResult(null);
                setEditedResult(null);
                setImageUploaded(false);
                setAnalyzing(false);

                return;
            }

            console.log('AI Response:', data);

            const suggestedName =
                Array.isArray(data.neutral_names)
                    ? data.neutral_names[0]
                    : data.neutral_names ?? data.suggested_name ?? '';

            const suggestions: AIResult = {
                species: data.species,
                breed: data.breed,
                rawBreed: data.raw_breed,
                ageCategory: data.age_group ?? 'Unknown',
                gender: data.gender ?? 'Unknown',
                suggestedName,
                confidence: Math.round((data.confidence ?? 0) * 100),

                confidenceLevel: data.confidence_level ?? 'Unknown',
                isConfident: data.is_confident ?? false,
                confidenceMessage: data.confidence_message ?? 'Review is recommended.',

                isMixedBreed: data.is_mixed_breed ?? false,
                mixedConfidence: data.mixed_confidence ?? 0,

                breeds: data.breeds ?? [],
                similarBreeds: data.similar_breeds ?? [],
            };
            setAiResult(suggestions);
            setEditedResult(suggestions);

            const detectedAnimal = suggestions.species === 'dog' ? 'Dog' : 'Cat';
            setAnimalType(detectedAnimal);
            setBreed(suggestions.breed);
            setAgeCategory(suggestions.ageCategory);
            setGender(suggestions.gender);
            setSuggestedName(suggestions.suggestedName);

            if (mode === 'ai-full') {
                setWizardStep(2);
            }

            toast.success('AI identification complete!');
        } catch (error) {
            console.error(error);
            toast.error('AI identification failed. Please try again.');
            setImageUploaded(false);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDetectLocation = () => {
        if ('geolocation' in navigator) {
            toast.info('Detecting your location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Current Location)`);
                    toast.success('Location pinned!');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Unable to detect location. Please enter manually.');
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = (modeType: string) => {
        setSubmittedMode(modeType);
        setMode('success');
        toast.success('Rescue report submitted successfully!');
    };

    const handleBackToSelection = () => {
        // Reset all states
        setMode('selection');
        setSubmittedMode('');
        setAiResult(null);
        setEditedResult(null);
        setIsEditing(false);
        setImageUploaded(false);
        setUploadedFile(null);
        setFilePreview(null);
        setAnimalType('Dog');
        setBreed('');
        setAgeCategory('Adult: 1 to 7 years');
        setGender('Male');
        setSuggestedName('');
        setIncidentDesc('');
        setLocation('');
    };

    const handleReset = () => {
        setMode('selection');
        setWizardStep(1);
        setAiResult(null);
        setEditedResult(null);
        setIsEditing(false);
        setImageUploaded(false);
        setUploadedFile(null);
        setFilePreview(null);
        setAnimalType('Dog');
        setBreed('');
        setAgeCategory('Adult: 1 to 7 years');
        setGender('Male');
        setSuggestedName('');
        setIncidentDesc('');
        setLocation('');
    };

    const handleModeSelect = (selectedMode: ReportMode) => {
        setMode(selectedMode);
        // Reset states when changing modes
        setImageUploaded(false);
        setAnalyzing(false);
        setAiResult(null);
        setUploadedFile(null);
        setFilePreview(null);
    };

    const handleSaveEdit = () => {
        if (editedResult) {
            setAiResult(editedResult);
            setBreed(editedResult.breed);
            setAgeCategory(editedResult.ageCategory);
            setGender(editedResult.gender);
            setSuggestedName(editedResult.suggestedName);
        }

        setIsEditing(false);
        toast.success('Details updated!');
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4">

                    {/* ══════════════════════════════════════════════════════════ */}
                    {/* ── AI-ASSISTED ANIMAL IDENTIFICATION — REPORT RESCUE FORM ── */}
                    {/* ══════════════════════════════════════════════════════════ */}
                    <div className="mb-24">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-3 bg-paw-navy/10 text-paw-navy px-6 py-2 rounded-full mb-6 border-2 border-paw-navy/20">
                                <Sparkles size={20} className="text-paw-orange animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-widest">PAW-AI · Inside Report Rescue</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-paw-navy mb-6 leading-tight">
                                AI-Assisted Animal Identification
                            </h1>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-bold">
                                Choose how you want to report: use AI for full reporting, identify animals only, or enter details manually.
                            </p>
                        </div>

                        {/* MODE SELECTION - 3 CARDS */}
                        {mode === 'selection' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                            >
                                {/* CARD 1: Use AI for Reporting */}
                                <motion.div
                                    whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(255, 107, 0, 0.3)' }}
                                    onClick={() => handleModeSelect('ai-full')}
                                    className="bg-gradient-to-br from-white to-orange-50/50 p-8 rounded-[40px] border-2 border-paw-orange/20 shadow-xl cursor-pointer transition-all group"
                                >
                                    <div className="w-16 h-16 bg-paw-orange rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-paw-orange/30">
                                        <Brain size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-paw-navy mb-4">Use AI for Reporting</h3>
                                    <p className="text-gray-600 font-bold mb-6 leading-relaxed">
                                        Upload a photo and let AI identify the animal. Results auto-fill the rescue form for quick submission.
                                    </p>
                                    <div className="flex items-center gap-2 text-paw-orange font-black text-sm">
                                        <span>GET STARTED</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>

                                {/* CARD 2: AI Identification Only */}
                                <motion.div
                                    whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(30, 50, 100, 0.3)' }}
                                    onClick={() => handleModeSelect('ai-only')}
                                    className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-[40px] border-2 border-paw-navy/20 shadow-xl cursor-pointer transition-all group"
                                >
                                    <div className="w-16 h-16 bg-paw-navy rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-paw-navy/30">
                                        <Sparkles size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-paw-navy mb-4">AI Identification Only</h3>
                                    <p className="text-gray-600 font-bold mb-6 leading-relaxed">
                                        Just want to identify an animal? Get AI suggestions without submitting a rescue report.
                                    </p>
                                    <div className="flex items-center gap-2 text-paw-navy font-black text-sm">
                                        <span>IDENTIFY NOW</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>

                                {/* CARD 3: Manual Entry */}
                                <motion.div
                                    whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(100, 100, 100, 0.3)' }}
                                    onClick={() => handleModeSelect('manual')}
                                    className="bg-gradient-to-br from-white to-gray-50/50 p-8 rounded-[40px] border-2 border-gray-200 shadow-xl cursor-pointer transition-all group"
                                >
                                    <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-gray-700/30">
                                        <Pencil size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-paw-navy mb-4">Manual Entry</h3>
                                    <p className="text-gray-600 font-bold mb-6 leading-relaxed">
                                        Prefer to enter all details yourself? Skip AI and fill out the form manually.
                                    </p>
                                    <div className="flex items-center gap-2 text-gray-700 font-black text-sm">
                                        <span>ENTER MANUALLY</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* MODE 1: USE AI FOR REPORTING (FULL FLOW) */}
                        {/* ═══════════════════════════════════════ */}
                        {mode === 'ai-full' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-4xl mx-auto"
                            >
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-gray-600 font-bold mb-8 hover:text-paw-orange transition-colors"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Wizard Progress Bar */}
                                <div className="mb-12">
                                    <div className="flex items-center justify-between mb-4">
                                        {[
                                            { num: 1, label: 'Upload Photo' },
                                            { num: 2, label: 'AI Results' },
                                            { num: 3, label: 'Complete Report' }
                                        ].map((step, idx) => (
                                            <div key={step.num} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${wizardStep >= step.num
                                                        ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/30'
                                                        : 'bg-gray-200 text-gray-400'
                                                        }`}>
                                                        {wizardStep > step.num ? <CheckCircle2 size={20} /> : step.num}
                                                    </div>
                                                    <span className={`text-xs font-black mt-2 uppercase tracking-widest ${wizardStep >= step.num ? 'text-paw-orange' : 'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {idx < 2 && (
                                                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${wizardStep > step.num ? 'bg-paw-orange' : 'bg-gray-200'
                                                        }`} />
                                                )}
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
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-black text-paw-navy mb-4">Step 1: Upload Animal Photo</h2>
                                                <p className="text-gray-600 font-bold">Upload a clear photo for AI identification</p>
                                            </div>

                                            {/* How AI Helps */}
                                            <div className="bg-gradient-to-br from-paw-orange/5 to-orange-50/30 rounded-3xl p-6 space-y-4 border-2 border-paw-orange/10">
                                                <h3 className="text-lg font-black text-paw-navy flex items-center gap-2">
                                                    <Sparkles size={20} className="text-paw-orange" />
                                                    How AI Helps You
                                                </h3>
                                                <div className="space-y-3">
                                                    {[
                                                        'Identifies possible animal breed using image analysis',
                                                        'Suggests basic attributes such as age category and gender',
                                                        'Automatically fills rescue report details to reduce manual input'
                                                    ].map((text, idx) => (
                                                        <div key={idx} className="flex gap-3 items-start">
                                                            <div className="w-6 h-6 bg-paw-orange/20 rounded-lg flex items-center justify-center text-paw-orange shrink-0 font-black text-xs">{idx + 1}</div>
                                                            <p className="text-gray-600 font-bold text-sm leading-tight pt-0.5">{text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {!imageUploaded && !analyzing ? (
                                                <div className="border-4 border-dashed border-paw-orange/30 rounded-3xl p-12 text-center hover:border-paw-orange/50 transition-all cursor-pointer bg-gradient-to-br from-white to-orange-50/10">
                                                    <input
                                                        type="file"
                                                        id="rescue-file-upload"
                                                        accept="image/*,video/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <label htmlFor="rescue-file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                                        <div className="w-20 h-20 bg-paw-orange rounded-3xl flex items-center justify-center text-white mb-6 hover:scale-110 transition-transform shadow-xl shadow-paw-orange/30">
                                                            <Camera size={36} />
                                                        </div>
                                                        <h3 className="text-2xl font-black text-paw-navy mb-3">Upload a Photo</h3>
                                                        <p className="text-gray-500 font-bold mb-6 max-w-sm">
                                                            Upload a clear image (JPG or PNG). AI will generate identification suggestions.
                                                        </p>
                                                        <div className="bg-paw-navy text-white px-10 py-4 rounded-2xl font-black hover:bg-paw-orange transition-all shadow-xl flex items-center gap-3">
                                                            <Upload size={18} /> SELECT FILE
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-bold mt-4">or drag and drop here</p>
                                                    </label>
                                                </div>
                                            ) : analyzing ? (
                                                <div className="rounded-3xl p-12 text-center bg-white border-2 border-paw-orange/10">
                                                    <div className="relative mb-8 inline-block">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                                            className="w-24 h-24 border-8 border-paw-orange/20 border-t-paw-orange rounded-full"
                                                        />
                                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paw-orange" size={32} />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-paw-navy mb-2">Analyzing Image...</h3>
                                                    <div className="flex items-center justify-center gap-2 my-4">
                                                        <span className="w-2 h-2 bg-paw-orange rounded-full animate-bounce" />
                                                        <span className="w-2 h-2 bg-paw-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                        <span className="w-2 h-2 bg-paw-orange rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                                    </div>
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Identifying Attributes</p>
                                                </div>
                                            ) : null}

                                            {/* Disclaimer */}
                                            <div className="bg-paw-navy rounded-3xl p-6 text-white">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <ShieldCheck className="text-paw-yellow" size={20} />
                                                    <h4 className="font-black">Disclaimer</h4>
                                                </div>
                                                <p className="text-white/80 text-sm font-bold leading-relaxed">
                                                    This AI feature provides suggested identification only and may not always be accurate.
                                                    Users are encouraged to review and edit the information before submission.
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
                                            <div className="text-center mb-6">
                                                <h2 className="text-3xl font-black text-paw-navy mb-4">Step 2: Review AI Identification</h2>
                                                <p className="text-gray-600 font-bold">Review and edit the AI-generated details</p>
                                            </div>

                                            {/* Uploaded Photo Preview */}
                                            {uploadedFile && filePreview && (
                                                <div className="rounded-3xl overflow-hidden border-2 border-gray-100">
                                                    {uploadedFile.type.startsWith('image/') && (
                                                        <img src={filePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                                                    )}
                                                    {uploadedFile.type.startsWith('video/') && (
                                                        <video src={filePreview} controls className="w-full max-h-64" />
                                                    )}
                                                </div>
                                            )}

                                            {/* AI Results */}
                                            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-3xl p-6 border-2 border-paw-orange/20 space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-paw-orange rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-paw-navy">AI Identification Results</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <CheckCircle2 size={12} className="text-green-600" />
                                                                <span className="text-xs font-black text-green-600">{aiResult.confidence}% Confidence</span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                                                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isEditing
                                                            ? 'bg-paw-navy text-white hover:bg-paw-orange'
                                                            : 'bg-white text-paw-orange border-2 border-paw-orange/30 hover:bg-paw-orange hover:text-white'
                                                            }`}
                                                    >
                                                        {isEditing ? 'Save' : 'Edit'}
                                                    </button>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {!isEditing ? (
                                                        <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                                                            <div className="bg-white rounded-2xl p-4 col-span-2">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Breed</p>
                                                                <p className="font-black text-paw-navy">{aiResult.breed}</p>
                                                            </div>
                                                            <div className="bg-white rounded-2xl p-4">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Age</p>
                                                                <p className="font-black text-paw-navy text-sm">{aiResult.ageCategory}</p>
                                                            </div>
                                                            <div className="bg-white rounded-2xl p-4">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Gender</p>
                                                                <p className="font-black text-paw-navy">{aiResult.gender}</p>
                                                            </div>
                                                            <div className="bg-white rounded-2xl p-4 col-span-2">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Suggested Name</p>
                                                                <p className="font-black text-paw-navy">{aiResult.suggestedName}</p>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Breed</label>
                                                                <input
                                                                    type="text"
                                                                    value={editedResult?.breed ?? ''}
                                                                    onChange={(e) => setEditedResult(prev => prev ? { ...prev, breed: e.target.value } : null)}
                                                                    className="w-full bg-white p-4 rounded-2xl border-2 border-paw-orange/30 focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Age Category</label>
                                                                    <select
                                                                        value={editedResult?.ageCategory ?? ''}
                                                                        onChange={(e) => setEditedResult(prev => prev ? { ...prev, ageCategory: e.target.value } : null)}
                                                                        className="w-full bg-white p-4 rounded-2xl border-2 border-paw-orange/30 focus:border-paw-orange outline-none font-bold text-paw-navy text-sm"
                                                                    >
                                                                        {currentAgeCategories.map((cat) => (
                                                                            <option key={cat} value={cat}>{cat}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Gender</label>
                                                                    <select
                                                                        value={editedResult?.gender ?? ''}
                                                                        onChange={(e) => setEditedResult(prev => prev ? { ...prev, gender: e.target.value } : null)}
                                                                        className="w-full bg-white p-4 rounded-2xl border-2 border-paw-orange/30 focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                                    >
                                                                        <option value="Male">Male</option>
                                                                        <option value="Female">Female</option>
                                                                        <option value="Unknown">Unknown</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Suggested Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={editedResult?.suggestedName ?? ''}
                                                                    onChange={(e) => setEditedResult(prev => prev ? { ...prev, suggestedName: e.target.value } : null)}
                                                                    className="w-full bg-white p-4 rounded-2xl border-2 border-paw-orange/30 focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Auto-Filled Details */}
                                            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 space-y-4">
                                                <h3 className="font-black text-paw-navy flex items-center gap-2">
                                                    <FileText size={18} className="text-paw-orange" />
                                                    Auto-Filled Report Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Animal Type</label>
                                                        <select
                                                            value={animalType}
                                                            onChange={(e) => {
                                                                setAnimalType(e.target.value as 'Dog' | 'Cat');
                                                                setAgeCategory(e.target.value === 'Dog' ? dogAgeCategories[0] : catAgeCategories[0]);
                                                            }}
                                                            className="w-full bg-paw-bg p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                        >
                                                            <option value="Dog">Dog</option>
                                                            <option value="Cat">Cat</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Breed</label>
                                                        <input
                                                            type="text"
                                                            value={breed}
                                                            onChange={(e) => setBreed(e.target.value)}
                                                            className="w-full bg-paw-bg p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Age Category</label>
                                                        <select
                                                            value={ageCategory}
                                                            onChange={(e) => setAgeCategory(e.target.value)}
                                                            className="w-full bg-paw-bg p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none font-bold text-paw-navy text-sm"
                                                        >
                                                            {currentAgeCategories.map((cat) => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Gender</label>
                                                        <select
                                                            value={gender}
                                                            onChange={(e) => setGender(e.target.value)}
                                                            className="w-full bg-paw-bg p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Unknown">Unknown</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Suggested Name</label>
                                                        <input
                                                            type="text"
                                                            value={suggestedName}
                                                            onChange={(e) => setSuggestedName(e.target.value)}
                                                            className="w-full bg-paw-bg p-4 rounded-2xl border-2 border-transparent focus:border-paw-orange outline-none font-bold text-paw-navy"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setWizardStep(3)}
                                                className="w-full bg-paw-orange text-white py-5 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3"
                                            >
                                                CONTINUE TO REPORT DETAILS <ArrowRight size={20} />
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
                                            <div className="text-center mb-6">
                                                <h2 className="text-3xl font-black text-paw-navy mb-4">Step 3: Complete Rescue Report</h2>
                                                <p className="text-gray-600 font-bold">Add incident details and location</p>
                                            </div>

                                            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 space-y-6">
                                                <div>
                                                    <label className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2 block">Incident Description *</label>
                                                    <textarea
                                                        value={incidentDesc}
                                                        onChange={(e) => setIncidentDesc(e.target.value)}
                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold min-h-[120px]"
                                                        placeholder="Describe what you observed..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2 block">Location / Landmark *</label>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="text"
                                                            value={location}
                                                            onChange={(e) => setLocation(e.target.value)}
                                                            className="flex-1 p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                                                            placeholder="Type manually or pin your location"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleDetectLocation}
                                                            className="px-6 py-4 sm:py-0 bg-paw-navy text-white rounded-2xl font-black hover:bg-paw-orange transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                                        >
                                                            <MapPin size={18} />
                                                            <span className="hidden sm:inline">Pin Location</span>
                                                            <span className="sm:hidden">Pin My Location</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold mt-2">Click "Pin Location" to use your current coordinates</p>
                                                </div>

                                                {/* Summary */}
                                                <div className="bg-gradient-to-br from-paw-orange/5 to-orange-50/30 rounded-2xl p-5 border-2 border-paw-orange/10">
                                                    <h4 className="font-black text-paw-navy mb-3 text-sm">Report Summary</h4>
                                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                                        <div>
                                                            <p className="text-gray-400 font-bold">Animal</p>
                                                            <p className="font-black text-paw-navy">{animalType} - {breed}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-400 font-bold">Age/Gender</p>
                                                            <p className="font-black text-paw-navy">{ageCategory.split(':')[0]} / {gender}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                                <AlertTriangle size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                                <p className="text-xs font-bold text-gray-400 leading-tight">
                                                    This AI feature provides suggested identification only and may not always be accurate.
                                                    Users are encouraged to review and edit the information before submission.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setWizardStep(2)}
                                                    className="px-8 bg-gray-200 text-paw-navy py-5 rounded-2xl font-black hover:bg-gray-300 transition-all"
                                                >
                                                    BACK
                                                </button>
                                                <button
                                                    onClick={() => handleSubmit('AI-Assisted Reporting')}
                                                    className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl flex items-center justify-center gap-3 uppercase"
                                                >
                                                    SUBMIT RESCUE REPORT <Siren size={20} />
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
                                className="max-w-4xl mx-auto"
                            >
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-gray-600 font-bold mb-8 hover:text-paw-orange transition-colors"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Upload Section */}
                                {!imageUploaded && !analyzing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white aspect-video rounded-[60px] border-4 border-dashed border-paw-navy/30 flex flex-col items-center justify-center p-12 text-center shadow-2xl"
                                    >
                                        <input
                                            type="file"
                                            id="ai-only-upload"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="ai-only-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                            <div className="w-24 h-24 bg-paw-navy rounded-[32px] flex items-center justify-center text-white mb-8 hover:scale-110 transition-transform shadow-xl shadow-paw-navy/30">
                                                <Camera size={40} />
                                            </div>
                                            <h3 className="text-3xl font-black text-paw-navy mb-4">Upload Animal Photo</h3>
                                            <p className="text-gray-400 font-bold mb-8 max-w-md">
                                                Upload a clear image (JPG or PNG). AI will generate identification suggestions.
                                            </p>
                                            <div className="bg-paw-navy text-white px-12 py-5 rounded-[24px] font-black text-xl hover:bg-paw-orange transition-all shadow-xl flex items-center gap-3">
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
                                        className="bg-white aspect-video rounded-[60px] flex flex-col items-center justify-center p-12 text-center shadow-2xl border-2 border-paw-navy/10"
                                    >
                                        <div className="relative mb-12">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                                className="w-32 h-32 border-8 border-paw-navy/20 border-t-paw-navy rounded-full"
                                            />
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paw-navy" size={40} />
                                        </div>
                                        <h3 className="text-3xl font-black text-paw-navy mb-2">Analyzing Image...</h3>
                                        <div className="flex items-center gap-2 my-4">
                                            <span className="w-2 h-2 bg-paw-navy rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-paw-navy rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                            <span className="w-2 h-2 bg-paw-navy rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Identifying Attributes</p>
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
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-[32px] p-6 flex items-center gap-4">
                                            <Info size={24} className="text-blue-600 shrink-0" />
                                            <div>
                                                <p className="font-black text-blue-900 mb-1">This is an AI identification preview.</p>
                                                <p className="text-sm font-bold text-blue-700">No report will be submitted. This is for identification purposes only.</p>
                                            </div>
                                        </div>

                                        {/* Uploaded file preview */}
                                        {uploadedFile && filePreview && (
                                            <div className="bg-white rounded-[32px] p-6 border-2 border-paw-navy/10 shadow-xl">
                                                {uploadedFile.type.startsWith('image/') && (
                                                    <img src={filePreview} alt="Preview" className="w-full max-h-96 mx-auto rounded-xl object-contain" />
                                                )}
                                                {uploadedFile.type.startsWith('video/') && (
                                                    <video src={filePreview} controls className="w-full max-h-96 mx-auto rounded-xl" />
                                                )}
                                            </div>
                                        )}
                                        {/* AI Result Card */}
                                        <div className="bg-gradient-to-br from-white to-blue-50/60 rounded-[40px] p-8 shadow-2xl shadow-paw-navy/10 border-2 border-paw-navy/20">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-paw-navy rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                    <Sparkles size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-2xl font-black text-paw-navy">AI Identification Results</h4>
                                                        <div className="inline-flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full">
                                                            <CheckCircle2 size={14} className="text-green-600" />
                                                            <span className="text-xs font-black text-green-600">{aiResult.confidence}% Confidence</span>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs font-black mt-2 ${aiResult.isConfident ? 'text-green-600' : 'text-amber-600'
                                                        }`}>
                                                        {aiResult.confidenceLevel} confidence · {aiResult.confidenceMessage}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10 col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Identified Breed</p>
                                                    <p className="font-black text-paw-navy text-lg">{aiResult.breed}</p>
                                                </div>
                                                <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10 col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Age Category</p>
                                                    <p className="font-black text-paw-navy">{aiResult.ageCategory}</p>
                                                </div>
                                                {/* <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Gender</p>
                                                    <p className="font-black text-paw-navy">{aiResult.gender}</p>
                                                </div> */}
                                                <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10 col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Suggested Name</p>
                                                    <p className="font-black text-paw-navy">{aiResult.suggestedName}</p>
                                                </div>
                                                {/* Mixed Breed Detection */}
                                                <div className="bg-white rounded-2xl p-4 border-2 border-paw-navy/10 col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
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
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Similar Breeds</p>
                                                    {aiResult.similarBreeds.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiResult.similarBreeds.map((breed, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-white px-4 py-2 rounded-full text-sm font-bold text-paw-navy border-2 border-paw-navy/20"
                                                                >
                                                                    {breed.name} ({(breed.confidence * 100).toFixed(1)}%)
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-400">
                                                            No similar breeds above confidence threshold.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                        <button
                                            onClick={handleReset}
                                            className="w-full bg-paw-navy text-white py-6 rounded-[24px] font-black text-xl hover:bg-paw-orange transition-all shadow-xl flex items-center justify-center gap-3"
                                        >
                                            IDENTIFY ANOTHER ANIMAL
                                        </button>
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
                                className="max-w-4xl mx-auto"
                            >
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-gray-600 font-bold mb-8 hover:text-paw-orange transition-colors"
                                >
                                    <X size={20} />
                                    <span>Back to selection</span>
                                </button>

                                {/* Manual Entry Form */}
                                <div className="bg-white rounded-[40px] p-10 shadow-2xl border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-paw-navy">Manual Rescue Report</h3>
                                            <p className="text-sm font-bold text-gray-500">Enter all details yourself without AI assistance</p>
                                        </div>
                                    </div>

                                    {/* Notice */}
                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
                                        <Info size={16} className="text-gray-600 shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold text-gray-600">No AI assistance used. All details are user-provided.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Upload Photo */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Upload Photo (Optional)</label>
                                            <input
                                                type="file"
                                                id="manual-upload"
                                                accept="image/*,video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];

                                                    if (file) {
                                                        setUploadedFile(file);

                                                        if (file.type.startsWith('image/')) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setFilePreview(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                        } else if (file.type.startsWith('video/')) {
                                                            setFilePreview(URL.createObjectURL(file));
                                                        }
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="manual-upload"
                                                className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                            >
                                                {!uploadedFile ? (
                                                    <>
                                                        <Camera size={32} className="mx-auto text-gray-400 mb-3" />
                                                        <p className="font-bold text-gray-600">Click to upload photo</p>
                                                        <p className="text-sm text-gray-400 font-bold mt-1">JPG, PNG or Video</p>
                                                    </>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {filePreview && uploadedFile.type.startsWith('image/') && (
                                                            <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded-xl object-cover" />
                                                        )}
                                                        {filePreview && uploadedFile.type.startsWith('video/') && (
                                                            <video src={filePreview} controls className="max-h-32 mx-auto rounded-xl" />
                                                        )}
                                                        <div className="flex items-center justify-center gap-2">
                                                            <CheckCircle2 size={18} className="text-green-600" />
                                                            <p className="font-bold text-green-600">{uploadedFile.name}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-bold">Click to change file</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        {/* Animal Type and Breed */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Animal Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={animalType}
                                                        onChange={(e) => {
                                                            setAnimalType(e.target.value as 'Dog' | 'Cat');
                                                            // Reset age category to first option when animal type changes
                                                            setAgeCategory(e.target.value === 'Dog' ? dogAgeCategories[0] : catAgeCategories[0]);
                                                        }}
                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold appearance-none"
                                                    >
                                                        <option value="Dog">Dog</option>
                                                        <option value="Cat">Cat</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Animal Breed</label>
                                                <input
                                                    type="text"
                                                    value={breed}
                                                    onChange={(e) => setBreed(e.target.value)}
                                                    className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                                                    placeholder="e.g. Aspin, Domestic Short Hair"
                                                />
                                            </div>
                                        </div>

                                        {/* Age and Gender */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Age Category</label>
                                                <div className="relative">
                                                    <select
                                                        value={ageCategory}
                                                        onChange={(e) => setAgeCategory(e.target.value)}
                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold appearance-none text-sm"
                                                    >
                                                        {currentAgeCategories.map((category) => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Gender</label>
                                                <div className="relative">
                                                    <select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold appearance-none"
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Unknown">Unknown</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggested Name */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Suggested Name</label>
                                            <input
                                                type="text"
                                                value={suggestedName}
                                                onChange={(e) => setSuggestedName(e.target.value)}
                                                className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                                                placeholder="e.g. Buddy, Luna"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Description / Condition</label>
                                            <textarea
                                                value={incidentDesc}
                                                onChange={(e) => setIncidentDesc(e.target.value)}
                                                className="w-full p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold min-h-[120px]"
                                                placeholder="Describe the animal's condition and situation..."
                                            />
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Location / Landmark</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="flex-1 p-5 bg-paw-bg border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-all font-bold"
                                                    placeholder="Type manually or pin your location"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDetectLocation}
                                                    className="px-6 py-4 sm:py-0 bg-paw-navy text-white rounded-2xl font-black hover:bg-paw-orange transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                                >
                                                    <MapPin size={18} />
                                                    <span className="hidden sm:inline">Pin Location</span>
                                                    <span className="sm:hidden">Pin My Location</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold mt-2 ml-1">Click "Pin Location" to use your current coordinates</p>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={() => handleSubmit('Manual Entry')}
                                            className="w-full bg-red-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 uppercase"
                                        >
                                            SUBMIT RESCUE REPORT <Siren size={24} />
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
                                className="max-w-3xl mx-auto"
                            >
                                <div className="bg-gradient-to-br from-green-50 to-white rounded-[60px] p-12 shadow-2xl border-2 border-green-200 text-center">
                                    {/* Success Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30"
                                    >
                                        <CheckCircle2 size={48} className="text-white" />
                                    </motion.div>

                                    {/* Thank You Message */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h2 className="text-4xl md:text-5xl font-black text-paw-navy mb-4">
                                            Thank You!
                                        </h2>
                                        <p className="text-xl text-gray-600 font-bold mb-6">
                                            Your rescue report has been submitted successfully
                                        </p>
                                        <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-green-100">
                                            <p className="text-sm font-black text-green-700 uppercase tracking-widest mb-2">
                                                Report Type
                                            </p>
                                            <p className="text-lg font-bold text-paw-navy">{submittedMode}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-2xl p-6 mb-8 border-2 border-green-200">
                                            <div className="flex items-start gap-4">
                                                <Info size={24} className="text-green-600 shrink-0 mt-1" />
                                                <div className="text-left">
                                                    <p className="font-bold text-green-900 mb-2">What happens next?</p>
                                                    <ul className="text-sm text-green-700 font-bold space-y-2">
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                            <span>Our dispatch team will verify your report within 15 minutes</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                            <span>Nearby volunteers will be notified for immediate response</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                            <span>You'll receive updates via SMS once rescue is complete</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={handleBackToSelection}
                                                className="bg-paw-orange text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3"
                                            >
                                                <Sparkles size={20} />
                                                REPORT ANOTHER RESCUE
                                            </button>
                                            <button
                                                onClick={() => window.location.href = '/'}
                                                className="bg-paw-navy text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-3"
                                            >
                                                <Heart size={20} />
                                                BACK TO HOME
                                            </button>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="mt-8 pt-8 border-t-2 border-gray-200">
                                            <p className="text-sm font-bold text-gray-500 mb-3">Need immediate assistance?</p>
                                            <a
                                                href="tel:+639123456789"
                                                className="inline-flex items-center gap-2 text-red-600 font-black text-lg hover:text-red-700 transition-colors"
                                            >
                                                <Siren size={20} className="animate-bounce" />
                                                Call Emergency Hotline: +63 912 345 6789
                                            </a>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Rescue Process ── */}
                    <div className="mb-24">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-paw-navy mb-4">Our Rescue Process</h2>
                            <p className="text-gray-500 font-bold max-w-2xl mx-auto">
                                From report to recovery, we follow a strict protocol to ensure the safety and health of every stray.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { id: 1, title: 'Report', desc: 'Community members report incidents via the app or SOS hotline.', icon: <MessageSquare /> },
                                { id: 2, title: 'Verify', desc: 'Dispatchers verify the report and assess urgency levels.', icon: <Activity /> },
                                { id: 3, title: 'Respond', desc: 'Nearby volunteers or the rapid response team is deployed.', icon: <Siren /> },
                                { id: 4, title: 'Rehabilitate', desc: 'The animal is taken to a vet partner for medical care.', icon: <Heart /> },
                            ].map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-[40px] shadow-2xl shadow-paw-navy/5 border-2 border-transparent hover:border-paw-orange/10 transition-all text-center group"
                                >
                                    <div className="w-16 h-16 bg-paw-bg rounded-2xl flex items-center justify-center text-paw-orange mx-auto mb-6 group-hover:bg-paw-orange group-hover:text-white transition-all shadow-xl shadow-black/5">
                                        {step.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-paw-orange uppercase tracking-[0.2em] mb-2 block">Step 0{step.id}</span>
                                    <h3 className="text-xl font-black text-paw-navy mb-4">{step.title}</h3>
                                    <p className="text-gray-400 font-bold text-sm leading-relaxed">{step.desc}</p>
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