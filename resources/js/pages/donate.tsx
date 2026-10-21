import { Heart, CreditCard, Gift, Users, Check, ArrowRight, ShieldCheck, X, Copy, CheckCircle2, Smartphone, Filter, Calendar, Download, FileText, TrendingUp, Plus, Upload, Clock, AlertCircle, Sparkles, ExternalLink, FileCheck, Info, MapPin, Star, Maximize2, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SubmissionReceipt } from '@/components/donation/submission-receipt';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { TransparencyAuditModal, type AuditRecord } from '@/components/donation/transparency-audit-modal';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';
import { CareTimerBanner } from '@/components/care-sustainability/care-timer-banner';
import type { CareSustainabilityData } from '@/types/care-sustainability';
import { HonorWallTab, type CommunityHonoree, type PartnerShowcaseItem, type RecognitionMetricsData } from '@/components/donation/honor-wall-tab';
import { ModernDatePicker } from '@/components/donation/modern-date-picker';
import { InKindWishlistModal, type WishlistAnimal, type WishlistNeed } from '@/components/donation/in-kind-wishlist-modal';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';

export interface AuditPartner {
    id: number;
    name: string;
    slug?: string;
    category?: string;
    badge_title?: string | null;
    badges?: string[];
    short_description?: string | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    website_url?: string | null;
    social_url?: string | null;
    image_url?: string | null;
    logo_url?: string | null;
    is_active?: boolean;
}

export interface SupportingDocument {
    id: number;
    title: string;
    slug?: string;
    category?: string;
    badge?: string | null;
    description?: string | null;
    file_name?: string | null;
    file_size?: string | null;
    file_type?: string | null;
    download_count?: number;
    external_url?: string | null;
}

interface DonateProps {
    wishlist?: WishlistAnimal[];
    recentDonations?: Array<{
        name: string;
        amount: string;
        time: string;
        type: string;
        receipt: string;
    }>;
    auditRecords?: AuditRecord[];
    auditPartner?: AuditPartner | null;
    supportingDocuments?: SupportingDocument[];
    communityHonors?: CommunityHonoree[];
    partners?: PartnerShowcaseItem[];
    recognitionMetrics?: RecognitionMetricsData;
    defaultTab?: 'cash' | 'inkind' | 'sponsor' | 'honor';
    progressStats?: {
        total: number;
        goal: number;
        percentage: number;
    };
    careSustainability?: CareSustainabilityData;
    donationSuccess?: boolean;
    successRef?: string;
    successDonation?: {
        public_reference: string;
        donor_name: string;
        donor_email: string;
        anonymous: boolean;
        type: string;
        type_label: string;
        amount: string;
        status: string;
        purpose: string;
        method: string;
        issued_at?: string;
    } | null;
}

export default function Donate({
    wishlist = [],
    recentDonations = [],
    auditRecords = [],
    auditPartner = null,
    supportingDocuments = [],
    communityHonors = [],
    partners = [],
    recognitionMetrics,
    defaultTab = 'cash',
    progressStats = { total: 0, goal: 50000, percentage: 0 },
    careSustainability,
    donationSuccess = false,
    successRef = '',
    successDonation = null,
}: DonateProps) {
    const { auth } = usePage<{ auth: { user: any } }>().props;

    const [activeTab, setActiveTab] = useState<'cash' | 'inkind' | 'sponsor' | 'honor'>(defaultTab || 'cash');

    // Sync tab and amount from URL if provided (e.g. /donate?tab=honor or /donate?amount=1000)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'honor' || tabParam === 'cash' || tabParam === 'inkind' || tabParam === 'sponsor') {
            setActiveTab(tabParam as any);
        }
        const amountParam = params.get('amount');
        if (amountParam && !isNaN(Number(amountParam))) {
            cashForm.setData('amount', amountParam);
        }
    }, []);
    const [submitted, setSubmitted] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);
    const [showSponsorForm, setShowSponsorForm] = useState(false);

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Form Hooks
    const cashForm = useForm({
        amount: '500',
        donor_name: '',
        donor_email: '',
        donor_mobile: '',
        anonymous: false,
        payment_method: 'gcash'
    });

    const inKindForm = useForm({
        description: '',
        drop_off_date: '',
        contact_person: '',
        quantity: '',
        animal_donation_need_id: '' as string | number,
        donor_name: '',
        donor_email: '',
        donor_mobile: '',
        anonymous: false
    });

    const sponsorForm = useForm({
        fullName: '',
        email: '',
        mobile: '',
        date: '',
        occasion: '',
        message: '',
        anonymous: false,
        payment_method: 'gcash',
        poster: null as File | null,
    });

    const isFormDirty = Boolean(
        // Cash tab dirty checks (ignore prefilled auth user data)
        (cashForm.data.amount !== '500') ||
        (cashForm.data.donor_name.trim() !== (auth?.user?.name || '') && cashForm.data.donor_name.trim() !== '') ||
        (cashForm.data.donor_email.trim() !== (auth?.user?.email || '') && cashForm.data.donor_email.trim() !== '') ||
        (cashForm.data.donor_mobile.trim() !== (auth?.user?.mobile || '') && cashForm.data.donor_mobile.trim() !== '') ||
        cashForm.data.anonymous ||
        // In-kind tab dirty checks
        inKindForm.data.description.trim() !== '' ||
        inKindForm.data.drop_off_date !== '' ||
        Boolean(inKindForm.data.animal_donation_need_id) ||
        (inKindForm.data.contact_person.trim() !== (auth?.user?.name || '') && inKindForm.data.contact_person.trim() !== '') ||
        (inKindForm.data.donor_name.trim() !== (auth?.user?.name || '') && inKindForm.data.donor_name.trim() !== '') ||
        inKindForm.data.anonymous ||
        // Sponsor tab dirty checks
        sponsorForm.data.date !== '' ||
        sponsorForm.data.occasion.trim() !== '' ||
        sponsorForm.data.message.trim() !== '' ||
        Boolean(sponsorForm.data.poster) ||
        (sponsorForm.data.fullName.trim() !== (auth?.user?.name || '') && sponsorForm.data.fullName.trim() !== '') ||
        sponsorForm.data.anonymous
    );

    const {
        showDialog: showLeaveModal,
        handleContinueEditing,
        handleLeaveAnyway,
    } = useUnsavedChanges({
        isDirty: isFormDirty && !showReceipt,
        disabled: showReceipt || cashForm.processing || inKindForm.processing || sponsorForm.processing,
    });

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [showPosterZoom, setShowPosterZoom] = useState(false);
    const [isDraggingPoster, setIsDraggingPoster] = useState(false);
    const posterInputRef = React.useRef<HTMLInputElement>(null);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, or WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Poster image must be smaller than 5MB.');
            return;
        }

        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setPosterPreview(previewUrl);
        sponsorForm.setData('poster', file);
        toast.success('Custom event poster selected! You can preview it below.');
    };

    const handlePosterDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPoster(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, or WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Poster image must be smaller than 5MB.');
            return;
        }

        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setPosterPreview(previewUrl);
        sponsorForm.setData('poster', file);
        toast.success('Custom event poster selected! You can preview it below.');
    };

    const handleRemovePoster = () => {
        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
        }
        setPosterPreview(null);
        sponsorForm.setData('poster', null);
        if (posterInputRef.current) {
            posterInputRef.current.value = '';
        }
    };

    // Prefill Authenticated User Information
    useEffect(() => {
        if (auth?.user) {
            cashForm.setData(data => ({
                ...data,
                donor_name: auth.user.name || '',
                donor_email: auth.user.email || '',
                donor_mobile: auth.user.mobile || ''
            }));
            inKindForm.setData(data => ({
                ...data,
                donor_name: auth.user.name || '',
                donor_email: auth.user.email || '',
                donor_mobile: auth.user.mobile || '',
                contact_person: auth.user.name || ''
            }));
            sponsorForm.setData(data => ({
                ...data,
                fullName: auth.user.name || '',
                email: auth.user.email || '',
                mobile: auth.user.mobile || ''
            }));
        }
    }, [auth?.user]);

    // Handle donation status from backend redirection
    useEffect(() => {
        if (donationSuccess && successRef) {
            const items = successDonation
                ? [
                      { label: 'Contribution Type', value: successDonation.type_label },
                      { label: 'Amount / Supplies', value: successDonation.amount },
                      { label: 'Donor', value: successDonation.anonymous ? `${successDonation.donor_name} (Anonymous)` : successDonation.donor_name },
                      { label: 'Email (E-Receipt Sent)', value: successDonation.donor_email },
                      { label: 'Payment / Channel', value: successDonation.method },
                      { label: 'Purpose', value: successDonation.purpose },
                      { label: 'Status', value: successDonation.status === 'completed' ? 'Completed & Verified' : 'Scheduled / Pending Verification' },
                  ]
                : [
                      { label: 'Status', value: 'Completed', icon: <CheckCircle2 className="text-green-500" size={20} /> },
                      { label: 'Date', value: new Date().toLocaleDateString(), icon: <Calendar size={20} /> },
                  ];

            setReceiptData({
                title: 'Hope you know you saved a life today!',
                subtitle: successDonation ? `${successDonation.type_label} E-Receipt` : 'Official Donation E-Receipt',
                referenceNumber: successRef,
                items,
                type: 'success',
                highlightLabel: successDonation?.type === 'in_kind' ? 'Pledged Supplies' : 'Total Contributed',
                highlightValue: successDonation?.amount || 'VERIFIED',
                donorName: successDonation?.donor_name,
                donorEmail: successDonation?.donor_email,
                paymentMethod: successDonation?.method,
                purpose: successDonation?.purpose,
                issuedAt: successDonation?.issued_at,
                footerMessage: successDonation?.donor_email
                    ? `An official E-Receipt has been sent to ${successDonation.donor_email} and recorded in the PAWLSE Transparency Ledger.`
                    : 'Your transaction has been processed successfully. A formal receipt and summary of impact has been sent to your email.',
            });
            setShowReceipt(true);
        }
    }, [donationSuccess, successRef, successDonation]);

    const handleSelectWishlistNeed = (animal: WishlistAnimal, need: WishlistNeed) => {
        inKindForm.setData(data => ({
            ...data,
            animal_donation_need_id: need.id.toString(),
            description: `Pledging ${need.quantity} of ${need.item} for ${animal.name}`,
            quantity: need.quantity
        }));
        setShowWishlist(false);
        setActiveTab('inkind');
        toast.success(`Pledged ${need.item} for ${animal.name}! Complete your drop-off details below.`);
    };

    const linkedNeedInfo = React.useMemo(() => {
        if (!inKindForm.data.animal_donation_need_id) return null;
        for (const animal of wishlist) {
            const need = animal.needs?.find(n => String(n.id) === String(inKindForm.data.animal_donation_need_id));
            if (need) {
                return { animal, need };
            }
        }
        return null;
    }, [inKindForm.data.animal_donation_need_id, wishlist]);

    const totalWishlistNeedsCount = React.useMemo(() => {
        return wishlist.reduce((acc, animal) => acc + (animal.needs?.length || 0), 0);
    }, [wishlist]);

    const submitCash = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(cashForm.data.amount);
        if (!cashForm.data.amount || isNaN(amt) || amt < 1 || !Number.isInteger(amt)) {
            toast.error('Please enter a valid whole amount of at least ₱1.');
            return;
        }
        if (amt > 10000000) {
            toast.error('Maximum donation amount per transaction is ₱10,000,000.');
            return;
        }
        if (!cashForm.data.donor_email.trim()) {
            toast.error('Please provide a valid email address for your receipt.');
            return;
        }
        if (cashForm.data.donor_mobile && !isValidPhoneNumber(cashForm.data.donor_mobile)) {
            toast.error('Please provide a valid 10-digit mobile number (+63 9XX XXX XXXX).');
            return;
        }
        cashForm.post('/donate/cash', {
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    const submitInKind = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inKindForm.data.drop_off_date) {
            toast.error('Please select a drop-off date.');
            return;
        }
        if (!isValidPhoneNumber(inKindForm.data.donor_mobile)) {
            toast.error('Please provide a valid 10-digit mobile number (+63 9XX XXX XXXX).');
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        inKindForm.post('/donate/in-kind', {
            onSuccess: () => {
                inKindForm.setData(data => ({
                    ...data,
                    description: '',
                    drop_off_date: '',
                    quantity: '',
                    animal_donation_need_id: '',
                    anonymous: false,
                    donor_name: auth?.user?.name || '',
                    donor_email: auth?.user?.email || '',
                    donor_mobile: auth?.user?.mobile || '',
                    contact_person: auth?.user?.name || ''
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    // Close Sponsor Form on Escape key and lock body scroll
    useEffect(() => {
        if (!showSponsorForm) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowSponsorForm(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [showSponsorForm]);

    const submitSponsor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sponsorForm.data.date) {
            toast.error('Please select a preferred feeding date.');
            return;
        }
        if (!isValidPhoneNumber(sponsorForm.data.mobile)) {
            toast.error('Please provide a valid 10-digit mobile number (+63 9XX XXX XXXX).');
            return;
        }
        sponsorForm.post('/donate/sponsor', {
            forceFormData: true,
            onSuccess: () => {
                setShowSponsorForm(false);
                if (posterPreview) {
                    URL.revokeObjectURL(posterPreview);
                }
                setPosterPreview(null);
            },
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
            <Head title="Donate and Support" />
            <Header />

            <main className="py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <span className="bg-paw-orange/10 text-paw-orange px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Support Our Cause</span>
                        <h1 className="text-4xl md:text-6xl font-black text-paw-navy mb-4 leading-tight">Your Support Saves Lives</h1>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            Every cent donated goes directly to feeding, rescuing, and medical care
                            for the stray animals of Iligan City. We believe in 100% transparency.
                        </p>
                    </div>

                    {/* Care Sustainability Live Countdown Banner */}
                    <CareTimerBanner sustainability={careSustainability} />

                    <div className="grid lg:grid-cols-3 gap-12 items-start" id="donation-form">
                        {/* Left Column: Donation Form & Honor Wall Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-[40px] shadow-2xl shadow-paw-navy/5 overflow-hidden">
                                {/* 4 Tabs */}
                                <div className="flex bg-gray-50 border-b-2 border-gray-100 overflow-x-auto scrollbar-none">
                                    <button
                                        onClick={() => setActiveTab('cash')}
                                        className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-6 font-black text-base md:text-lg transition-all cursor-pointer ${
                                            activeTab === 'cash' 
                                                ? 'bg-white text-paw-orange border-b-4 border-paw-orange' 
                                                : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        <CreditCard size={20} />
                                        <span>CASH DONATION</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('inkind')}
                                        className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-6 font-black text-base md:text-lg transition-all cursor-pointer ${
                                            activeTab === 'inkind' 
                                                ? 'bg-white text-paw-orange border-b-4 border-paw-orange' 
                                                : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Gift size={20} />
                                        <span>IN-KIND</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sponsor')}
                                        className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-6 font-black text-base md:text-lg transition-all cursor-pointer ${
                                            activeTab === 'sponsor' 
                                                ? 'bg-white text-paw-orange border-b-4 border-paw-orange' 
                                                : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Users size={20} />
                                        <span>SPONSOR</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('honor')}
                                        className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-6 font-black text-base md:text-lg transition-all cursor-pointer ${
                                            activeTab === 'honor' 
                                                ? 'bg-white text-amber-500 border-b-4 border-amber-500' 
                                                : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Star size={20} className={activeTab === 'honor' ? 'text-amber-500 fill-amber-400' : 'text-gray-400'} />
                                        <span>HONOR WALL</span>
                                    </button>
                                </div>

                                <div className="p-8 md:p-12">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'cash' && (
                                            <motion.div
                                                key="cash"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                            >
                                                <form onSubmit={submitCash} className="space-y-8">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Select Amount (PHP)</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            {['100', '200', '500', '1000'].map((val) => (
                                                                <button
                                                                    type="button"
                                                                    key={val}
                                                                    onClick={() => cashForm.setData('amount', val)}
                                                                    className={`py-4 rounded-2xl font-black text-xl border-2 transition-all cursor-pointer ${cashForm.data.amount === val ? 'bg-paw-orange text-white border-paw-orange shadow-lg shadow-paw-orange/20' : 'bg-gray-50 text-paw-navy border-transparent hover:border-paw-orange/30'}`}
                                                                >
                                                                    ₱{val}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="relative w-full">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₱</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="10000000"
                                                                step="1"
                                                                placeholder="Custom Amount"
                                                                value={cashForm.data.amount}
                                                                onChange={(e) => cashForm.setData('amount', e.target.value)}
                                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-black text-xl"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">FULL NAME</label>
                                                            <input
                                                                type="text"
                                                                value={cashForm.data.donor_name}
                                                                onChange={(e) => cashForm.setData('donor_name', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Optional for anonymous"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                                EMAIL ADDRESS <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                required
                                                                value={cashForm.data.donor_email}
                                                                onChange={(e) => cashForm.setData('donor_email', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="For receipt"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-gray-700">MOBILE NUMBER</label>
                                                            <span className="text-xs text-gray-400 font-bold">Optional (for GCash / SMS updates)</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={cashForm.data.donor_mobile}
                                                            onChange={(e) => cashForm.setData('donor_mobile', formatPhoneNumber(e.target.value))}
                                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                            placeholder="+63 912 124 1241"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id="anon"
                                                            checked={cashForm.data.anonymous}
                                                            onChange={(e) => cashForm.setData('anonymous', e.target.checked)}
                                                            className="w-5 h-5 accent-paw-orange"
                                                        />
                                                        <label htmlFor="anon" className="text-sm font-bold text-gray-600">DONATE ANONYMOUSLY</label>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={cashForm.processing || !cashForm.data.amount || Number(cashForm.data.amount) < 1}
                                                        className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-paw-orange/20 cursor-pointer disabled:opacity-50"
                                                    >
                                                        PROCEED TO DONATE {cashForm.data.amount && Number(cashForm.data.amount) > 0 ? `₱${Number(cashForm.data.amount).toLocaleString()}` : ''}
                                                    </button>

                                                    <div className="flex items-center justify-center gap-4 text-gray-400 text-sm font-bold uppercase tracking-widest pt-4">
                                                        <ShieldCheck size={20} />
                                                        Secure 256-bit SSL Encryption
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}

                                        {activeTab === 'inkind' && (
                                            <motion.div
                                                key="inkind"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                            >
                                                <form onSubmit={submitInKind} className="space-y-6">
                                                    <div className="bg-paw-blue/10 p-6 rounded-3xl border-2 border-paw-blue/20">
                                                        <h4 className="font-black text-paw-blue mb-2 flex items-center gap-2">
                                                            <Gift size={20} />
                                                            WHAT WE CURRENTLY NEED
                                                        </h4>
                                                        <ul className="grid grid-cols-2 gap-3 text-sm font-bold text-gray-700 mb-4">
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Dog/Cat Kibble</li>
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Canned Food</li>
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Vitamins</li>
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Leashes & Collars</li>
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Bowls</li>
                                                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Towels/Bedding</li>
                                                        </ul>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowWishlist(true)}
                                                            className="w-full bg-paw-orange text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-paw-orange/20 cursor-pointer group"
                                                        >
                                                            <Heart size={18} className="group-hover:scale-110 transition-transform" />
                                                            <span>VIEW ANIMAL WISHLIST {totalWishlistNeedsCount > 0 && `(${totalWishlistNeedsCount} ITEMS NEEDED)`}</span>
                                                        </button>
                                                    </div>

                                                    {inKindForm.data.animal_donation_need_id && (
                                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {linkedNeedInfo?.animal?.photo ? (
                                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-sm shrink-0">
                                                                        <ImageWithFallback
                                                                            src={linkedNeedInfo.animal.photo}
                                                                            alt={linkedNeedInfo.animal.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                                        <Gift size={20} />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                                                            Shelter Wishlist Match
                                                                        </span>
                                                                        {linkedNeedInfo?.need?.priority && (
                                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                                linkedNeedInfo.need.priority.toLowerCase() === 'urgent'
                                                                                    ? 'bg-red-100 text-red-700'
                                                                                    : 'bg-amber-100 text-amber-700'
                                                                            }`}>
                                                                                {linkedNeedInfo.need.priority}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h5 className="font-black text-paw-navy text-sm sm:text-base truncate mt-0.5">
                                                                        {linkedNeedInfo 
                                                                            ? `${linkedNeedInfo.animal.name} — ${linkedNeedInfo.need.item} (${linkedNeedInfo.need.quantity})`
                                                                            : 'Linked to Shelter Animal Need'}
                                                                    </h5>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowWishlist(true)}
                                                                    className="text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 hover:bg-emerald-100 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                                                >
                                                                    Change Item
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        inKindForm.setData(data => ({
                                                                            ...data,
                                                                            animal_donation_need_id: '',
                                                                            quantity: ''
                                                                        }));
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                                                >
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                                            DESCRIPTION OF DONATION <span className="text-red-500">*</span>
                                                        </label>
                                                        <textarea
                                                            required
                                                            value={inKindForm.data.description}
                                                            onChange={(e) => inKindForm.setData('description', e.target.value)}
                                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors min-h-[120px] font-bold"
                                                            placeholder="Tell us what you'd like to drop off... e.g. 5kg Vitality Dog Kibble, 2 boxes vitamins"
                                                        ></textarea>
                                                    </div>

                                                    <div>
                                                        <ModernDatePicker
                                                            value={inKindForm.data.drop_off_date}
                                                            onChange={(date) => inKindForm.setData('drop_off_date', date)}
                                                            minDate={new Date().toISOString().split('T')[0]}
                                                            label="DROP OFF DATE"
                                                            required
                                                            helperText="Shelter drop-off hours: 9:00 AM – 5:00 PM"
                                                        />
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">FULL NAME</label>
                                                            <input
                                                                type="text"
                                                                value={inKindForm.data.donor_name}
                                                                onChange={(e) => inKindForm.setData('donor_name', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Optional for anonymous"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="block text-sm font-bold text-gray-700">CONTACT PERSON</label>
                                                                <span className="text-xs text-gray-400 font-bold">Leave blank if same as donor</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={inKindForm.data.contact_person}
                                                                onChange={(e) => inKindForm.setData('contact_person', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="e.g. Courier or driver (optional)"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                                EMAIL ADDRESS <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                required
                                                                value={inKindForm.data.donor_email}
                                                                onChange={(e) => inKindForm.setData('donor_email', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="For receipts/notifications"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                                MOBILE NUMBER <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                required
                                                                value={inKindForm.data.donor_mobile}
                                                                onChange={(e) => inKindForm.setData('donor_mobile', formatPhoneNumber(e.target.value))}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="+63 912 124 1241"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id="inkind-anon"
                                                            checked={inKindForm.data.anonymous}
                                                            onChange={(e) => inKindForm.setData('anonymous', e.target.checked)}
                                                            className="w-5 h-5 accent-paw-orange"
                                                        />
                                                        <label htmlFor="inkind-anon" className="text-sm font-bold text-gray-600">DONATE ANONYMOUSLY</label>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={inKindForm.processing}
                                                        className="w-full bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl hover:bg-paw-orange transition-all flex items-center justify-center gap-3 cursor-pointer"
                                                    >
                                                        SCHEDULE DROP-OFF <ArrowRight size={20} />
                                                    </button>
                                                </form>
                                            </motion.div>
                                        )}

                                        {activeTab === 'sponsor' && (
                                            <motion.div
                                                key="sponsor"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="bg-paw-yellow/10 p-8 rounded-[32px] border-2 border-paw-yellow/20 text-center">
                                                    <Users size={48} className="text-paw-yellow mx-auto mb-4" />
                                                    <h3 className="text-2xl font-black text-paw-navy mb-2">Sponsor a Feeding Day</h3>
                                                    <p className="text-gray-600 font-bold mb-6">Support a full route feeding of 100+ strays for only ₱3,500.</p>
                                                    <div className="text-4xl font-black text-paw-yellow mb-8">₱3,500 <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">/ Event</span></div>

                                                    <div className="text-left space-y-4 mb-8">
                                                        <div className="flex gap-3">
                                                            <div className="w-6 h-6 bg-paw-yellow rounded-full flex items-center justify-center text-white shrink-0"><Check size={14} /></div>
                                                            <p className="text-sm font-bold text-gray-700">Choose a specific date (Birthday, Anniversary, etc.)</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="w-6 h-6 bg-paw-yellow rounded-full flex items-center justify-center text-white shrink-0"><Check size={14} /></div>
                                                            <p className="text-sm font-bold text-gray-700">Includes 5kg of premium dog food and 5kg of cat food</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="w-6 h-6 bg-paw-yellow rounded-full flex items-center justify-center text-white shrink-0"><Check size={14} /></div>
                                                            <p className="text-sm font-bold text-gray-700">Will automatically schedule a volunteer feeding event</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setShowSponsorForm(true)}
                                                        className="w-full bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl hover:bg-paw-yellow hover:text-paw-navy transition-all cursor-pointer"
                                                    >
                                                        SPONSOR NOW
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'honor' && (
                                            <motion.div
                                                key="honor"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                            >
                                                <HonorWallTab
                                                    honors={communityHonors}
                                                    partners={partners}
                                                    recognitionMetrics={recognitionMetrics}
                                                    onOpenAuditModal={() => setShowAuditModal(true)}
                                                    onSelectDonationTab={(tab) => setActiveTab(tab)}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Transparency Dashboard */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10">
                                <h3 className="text-2xl font-black text-paw-navy mb-6">Transparency Report</h3>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()} GOAL</span>
                                            <span className="text-lg font-black text-paw-orange">₱{progressStats.total.toLocaleString()} / ₱{progressStats.goal.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressStats.percentage}%` }}
                                                className="h-full bg-paw-orange"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-paw-navy text-sm uppercase tracking-widest border-b pb-2">Recent Donations</h4>
                                        {recentDonations.length === 0 ? (
                                            <p className="text-xs text-gray-400 font-bold text-center py-4">No recent donations. Be the first!</p>
                                        ) : (
                                            recentDonations.map((d, i) => (
                                                <div key={i} className="flex justify-between items-center py-2">
                                                    <div>
                                                        <p className="font-black text-paw-navy text-sm">{d.name}</p>
                                                        <p className="text-xs text-gray-400 font-bold">{d.time} • <span className="text-paw-blue">{d.type}</span></p>
                                                    </div>
                                                    <p className="font-black text-paw-orange">{d.amount}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowAuditModal(true)}
                                        className="w-full py-4 rounded-2xl bg-paw-navy text-white font-bold text-sm uppercase tracking-widest hover:bg-paw-orange transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                    >
                                        <FileText size={16} />
                                        VIEW FULL AUDIT HISTORY
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Transparency & Accountability */}
                    <section className="mt-20 pt-16 border-t-2 border-paw-orange/10">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-paw-orange/10 text-paw-orange text-[11px] font-black tracking-widest uppercase mb-3">
                                ACCOUNTABILITY
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-paw-navy tracking-tight mb-4">
                                Transparency & Accountability
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                                See how PAWLSE helps ISF present donation records, resource information, and accountability details clearly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {/* Card 1: Audit / Accounting Partner */}
                            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10 flex flex-col justify-between hover:shadow-2xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                            TRANSPARENCY
                                        </span>
                                        {auditPartner ? (
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 size={12} />
                                                VERIFIED PARTNER
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={12} />
                                                INFORMATION PENDING
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black text-paw-navy mb-3">
                                        Audit / Accounting Partner
                                    </h3>

                                    {auditPartner ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-gray-200 shrink-0">
                                                    <ImageWithFallback
                                                        src={auditPartner.image_url || '/images/partners/audit-partner.jpg'}
                                                        alt={auditPartner.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="font-black text-paw-navy text-base truncate">{auditPartner.name}</h4>
                                                        {auditPartner.badge_title && (
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-paw-blue text-[10px] font-bold uppercase">
                                                                {auditPartner.badge_title}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {auditPartner.city && (
                                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                                                            <MapPin size={12} className="shrink-0 text-gray-400" />
                                                            {auditPartner.city}
                                                        </p>
                                                    )}
                                                    {auditPartner.short_description && (
                                                        <p className="text-xs text-gray-600 line-clamp-2">{auditPartner.short_description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 leading-relaxed font-medium">
                                                Verified independent partner helping review and authenticate ISF's donation reporting and transparency records.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                Accountant / auditor information is currently being finalized. Verified partner information will appear here once provided.
                                            </p>

                                            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
                                                ISF is committed to finding an NGO, accountant, or auditor partner to strengthen financial transparency. ISF will not claim independent audit status until actual audit information is confirmed.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {auditPartner?.website_url && (
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <a
                                            href={auditPartner.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-paw-orange hover:text-paw-navy transition-colors"
                                        >
                                            <span>Visit Partner Website</span>
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Card 2: Donation Transparency */}
                            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10 flex flex-col justify-between hover:shadow-2xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-paw-blue text-[10px] font-black uppercase tracking-wider">
                                            RECORDS
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                            <ShieldCheck size={12} />
                                            PUBLIC LOGS
                                        </span>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black text-paw-navy mb-3">
                                        Donation Transparency
                                    </h3>

                                    <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                                        View verified contribution records and donation history. PAWLSE logs verified donations to maintain an honest accountability trail.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Verified Donors</p>
                                            <p className="text-lg font-black text-paw-navy">{auditRecords.length}+ Records</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Current Progress</p>
                                            <p className="text-lg font-black text-paw-orange">{progressStats.percentage}% Reached</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAuditModal(true)}
                                    className="w-full py-4 rounded-2xl bg-paw-navy hover:bg-paw-orange text-white font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-paw-navy/10 active:scale-[0.99]"
                                >
                                    <FileText size={16} />
                                    VIEW CONTRIBUTION RECORDS
                                </button>
                            </div>

                            {/* Card 3: Transaction & Fee Information */}
                            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10 flex flex-col justify-between hover:shadow-2xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-orange-50 text-paw-orange text-[10px] font-black uppercase tracking-wider">
                                            FEES
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                            <Info size={12} />
                                            POLICY GUIDE
                                        </span>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black text-paw-navy mb-4">
                                        Transaction & Fee Information
                                    </h3>

                                    <ul className="space-y-3.5 text-xs sm:text-sm text-gray-600 font-medium">
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                                ✓
                                            </div>
                                            <span className="leading-relaxed">
                                                GCash peer-to-peer transfers within the Philippines are free of charge.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-paw-blue flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                                ✓
                                            </div>
                                            <span className="leading-relaxed">
                                                International transfers may incur provider fees. ISF receives the net amount after deductions.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                                ✓
                                            </div>
                                            <span className="leading-relaxed">
                                                Platform and processing fees vary by payment method and provider.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                                    <span>100% of net donations directly support rescued animals</span>
                                    <ShieldCheck size={16} className="text-paw-orange" />
                                </div>
                            </div>

                            {/* Card 4: Supporting Documents */}
                            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10 flex flex-col justify-between hover:shadow-2xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                                            DOCUMENTS
                                        </span>
                                        {supportingDocuments && supportingDocuments.length > 0 ? (
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <FileCheck size={12} />
                                                {supportingDocuments.length} AVAILABLE
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={12} />
                                                NO DOCUMENTS ON FILE
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black text-paw-navy mb-3">
                                        Supporting Documents
                                    </h3>

                                    {supportingDocuments && supportingDocuments.length > 0 ? (
                                        <div className="space-y-3">
                                            {supportingDocuments.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-paw-orange/30 transition-colors"
                                                >
                                                    <div className="min-w-0 pr-3">
                                                        <h4 className="font-bold text-paw-navy text-xs sm:text-sm truncate">{doc.title}</h4>
                                                        <p className="text-[11px] text-gray-500 font-medium">
                                                            {doc.file_type?.toUpperCase() || 'PDF'} • {doc.file_size || 'N/A'} • {doc.download_count ?? 0} downloads
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`/resources/${doc.slug || doc.id}/download`}
                                                        className="px-3 py-1.5 rounded-xl bg-paw-navy hover:bg-paw-orange text-white text-xs font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5"
                                                    >
                                                        <Download size={13} />
                                                        <span>Download</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                Official reports, audit documents, and financial summaries will be posted here as they become available. ISF is committed to making verified documentation accessible once finalized.
                                            </p>

                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 leading-relaxed font-medium">
                                                Audited balance sheets, expenditure breakdowns, and NGO verification forms are currently being cataloged.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                                    <span>Verified documentation & public records</span>
                                    <FileText size={16} className="text-paw-blue" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Transparency Audit History Modal */}
            <TransparencyAuditModal
                isOpen={showAuditModal}
                onClose={() => setShowAuditModal(false)}
                records={auditRecords}
            />

            {/* Enhanced In-Kind Animal Wishlist Modal */}
            <InKindWishlistModal
                isOpen={showWishlist}
                onClose={() => setShowWishlist(false)}
                wishlist={wishlist}
                selectedNeedId={inKindForm.data.animal_donation_need_id}
                onSelectNeed={handleSelectWishlistNeed}
            />

            {/* Sponsor Feeding Form Modal */}
            <AnimatePresence>
                {showSponsorForm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSponsorForm(false)}
                            className="absolute inset-0 bg-paw-navy/75 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col z-10 relative shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header (Golden Yellow to Orange with translucent amount pill & full stray run details) */}
                            <div className="bg-gradient-to-br from-paw-yellow via-amber-400 to-paw-orange text-white p-6 sm:p-7 shrink-0 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowSponsorForm(false)}
                                    className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                                    title="Close (Esc)"
                                >
                                    <X size={22} />
                                </button>

                                <div className="flex items-center gap-3.5 sm:gap-4 mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <Users size={28} />
                                    </div>
                                    <div className="min-w-0 pr-8">
                                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                            Sponsor a Feeding Day
                                        </h3>
                                        <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                                            Funds a 100+ stray feeding run with 10kg premium pet food
                                        </p>
                                    </div>
                                </div>

                                {/* Translucent Glass Amount Pill */}
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">
                                    <span className="text-sm sm:text-base font-bold text-white">Total Amount:</span>
                                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">₱3,500</span>
                                </div>
                            </div>

                            {/* Scrollable Form Body (Scrollbar contained inside form, not cutting through header) */}
                            <form onSubmit={submitSponsor} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                                {/* What's Included Card (Clean borderless background) */}
                                <div className="bg-amber-50/80 rounded-2xl p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-paw-navy uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={14} className="text-amber-600" />
                                            WHAT'S INCLUDED IN THIS SPONSORSHIP
                                        </h4>
                                        <span className="text-[11px] font-bold text-amber-800">Fixed: ₱3,500</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs font-bold text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                            <span>5kg premium dog food + 5kg cat food distributed to 100+ strays</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                            <span>Automatically schedules a community volunteer feeding day event</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                            <span>Personalized appreciation/dedication featured on the public event details</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Full Name & Email */}
                                <div className="grid sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">
                                            FULL NAME <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={sponsorForm.data.fullName}
                                            onChange={(e) => sponsorForm.setData('fullName', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-paw-orange focus:bg-white transition-all font-bold text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">
                                            EMAIL ADDRESS <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={sponsorForm.data.email}
                                            onChange={(e) => sponsorForm.setData('email', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-paw-orange focus:bg-white transition-all font-bold text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number & Occasion */}
                                <div className="grid sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">
                                            MOBILE NUMBER <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={sponsorForm.data.mobile}
                                            onChange={(e) => sponsorForm.setData('mobile', formatPhoneNumber(e.target.value))}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-paw-orange focus:bg-white transition-all font-bold text-sm"
                                            placeholder="+63 912 124 1241"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">
                                            OCCASION <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sponsorForm.data.occasion}
                                            onChange={(e) => sponsorForm.setData('occasion', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-paw-orange focus:bg-white transition-all font-bold text-sm"
                                            placeholder="Birthday, Memorial, Anniversary..."
                                        />
                                    </div>
                                </div>

                                {/* Preferred Feeding Date (Single Line Full Width) */}
                                <div className="w-full">
                                    <ModernDatePicker
                                        value={sponsorForm.data.date}
                                        onChange={(date) => sponsorForm.setData('date', date)}
                                        minDate={new Date().toISOString().split('T')[0]}
                                        label="PREFERRED FEEDING DATE"
                                        required
                                        helperText="Feeding runs occur between 9:00 AM – 5:00 PM"
                                    />
                                </div>

                                {/* Message / Dedication */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase tracking-wider">
                                        DEDICATION MESSAGE <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={sponsorForm.data.message}
                                        onChange={(e) => sponsorForm.setData('message', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-paw-orange focus:bg-white transition-all font-bold text-sm min-h-[75px]"
                                        placeholder="Share why you're sponsoring this feeding run..."
                                    />
                                </div>

                                {/* Custom Event Poster Upload with Live Image Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                                            CUSTOM EVENT POSTER / PHOTO <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            Featured on Event
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Upload your own event poster or pet picture to be featured on the public volunteer feeding schedule.
                                    </p>

                                    <input
                                        ref={posterInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={handlePosterChange}
                                    />

                                    {posterPreview ? (
                                        <div className="relative rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-4">
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                {/* Poster Thumbnail */}
                                                <div 
                                                    className="relative group cursor-pointer shrink-0 rounded-xl overflow-hidden border border-amber-200 shadow-sm w-full sm:w-28 h-28 bg-gray-100"
                                                    onClick={() => setShowPosterZoom(true)}
                                                    title="Click to enlarge poster"
                                                >
                                                    <img 
                                                        src={posterPreview} 
                                                        alt="Custom Event Poster Preview" 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    />
                                                    <div className="absolute inset-0 bg-paw-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black gap-1 backdrop-blur-[1px]">
                                                        <Maximize2 size={16} /> Enlarge
                                                    </div>
                                                </div>

                                                {/* File Details & Actions */}
                                                <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 text-[11px] font-black">
                                                        <CheckCircle2 size={12} className="text-amber-700" />
                                                        Custom Poster Attached
                                                    </div>
                                                    <p className="text-sm font-black text-paw-navy truncate">
                                                        {sponsorForm.data.poster?.name || 'custom-event-poster.png'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-bold">
                                                        {sponsorForm.data.poster ? `${(sponsorForm.data.poster.size / 1024 / 1024).toFixed(2)} MB` : ''} • Ready for public scheduling
                                                    </p>

                                                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPosterZoom(true)}
                                                            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-paw-navy text-paw-navy font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                        >
                                                            <Maximize2 size={13} /> Preview Poster
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => posterInputRef.current?.click()}
                                                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <Upload size={13} /> Change Image
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleRemovePoster}
                                                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                                            title="Remove poster"
                                                        >
                                                            <Trash2 size={13} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => posterInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setIsDraggingPoster(true); }}
                                            onDragLeave={(e) => { e.preventDefault(); setIsDraggingPoster(false); }}
                                            onDrop={handlePosterDrop}
                                            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
                                                isDraggingPoster 
                                                    ? 'border-paw-orange bg-paw-orange/5' 
                                                    : 'border-gray-250 hover:border-paw-orange hover:bg-amber-50/40 bg-gray-50/70'
                                            }`}
                                        >
                                            <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                                <Upload size={20} />
                                            </div>
                                            <p className="text-xs font-black text-paw-navy">
                                                Click to upload your event poster <span className="text-paw-orange">or drag and drop</span>
                                            </p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1">
                                                PNG, JPG, or WEBP (Max 5MB) • Landscape or square recommended
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Anonymous Checkbox */}
                                <div className="flex items-center gap-2.5 bg-gray-50/80 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="sponsor-anonymous"
                                        checked={sponsorForm.data.anonymous}
                                        onChange={(e) => sponsorForm.setData('anonymous', e.target.checked)}
                                        className="w-4 h-4 accent-paw-orange cursor-pointer"
                                    />
                                    <label htmlFor="sponsor-anonymous" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                                        SPONSOR ANONYMOUSLY (Public event logs will show Anonymous)
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSponsorForm(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sponsorForm.processing}
                                        className="flex-[2] bg-paw-orange text-white py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md shadow-paw-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Proceed to Payment (₱3,500)</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Poster Full Size Lightbox Modal */}
                {showPosterZoom && posterPreview && (
                    <div
                        className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowPosterZoom(false)}
                    >
                        <div
                            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-paw-navy text-sm sm:text-base">Custom Event Poster Preview</h4>
                                        <p className="text-[11px] text-gray-500 font-bold">This is how your banner will appear on the feeding event</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPosterZoom(false)}
                                    className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-gray-900 p-2">
                                <img
                                    src={posterPreview}
                                    alt="Poster Preview"
                                    className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg"
                                />
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-bold truncate max-w-xs">
                                    {sponsorForm.data.poster?.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowPosterZoom(false)}
                                    className="px-5 py-2 bg-paw-navy text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-paw-orange transition-colors cursor-pointer"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {receiptData && (
                <SubmissionReceipt
                    isOpen={showReceipt}
                    onClose={() => {
                        setShowReceipt(false);
                        setReceiptData(null);
                        setSubmitted(false);
                    }}
                    title={receiptData.title}
                    subtitle={receiptData.subtitle}
                    referenceNumber={receiptData.referenceNumber}
                    items={receiptData.items}
                    type={receiptData.type}
                    footerMessage={receiptData.footerMessage}
                    highlightLabel={receiptData.highlightLabel}
                    highlightValue={receiptData.highlightValue}
                    donorName={receiptData.donorName}
                    donorEmail={receiptData.donorEmail}
                    paymentMethod={receiptData.paymentMethod}
                    purpose={receiptData.purpose}
                    issuedAt={receiptData.issuedAt}
                />
            )}

            <UnsavedChangesDialog
                isOpen={showLeaveModal}
                onContinueEditing={handleContinueEditing}
                onLeaveAnyway={handleLeaveAnyway}
            />

            <Footer />
        </div>
    );
}
