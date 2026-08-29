import { Heart, CreditCard, Gift, Users, Check, ArrowRight, ShieldCheck, X, Copy, CheckCircle2, Smartphone, Filter, Calendar, Download, FileText, TrendingUp, Plus, Upload, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import gcashQR from '@/assets/gcash-qr.jpg';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SubmissionReceipt } from '@/components/submission-receipt';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { TransparencyAuditModal, type AuditRecord } from '@/components/transparency-audit-modal';

interface DonateProps {
    wishlist?: Array<{
        id: number;
        name: string;
        type: string;
        age: string;
        photo: string;
        needs: Array<{
            id: number;
            item: string;
            quantity: string;
            priority: string;
            status: string;
        }>;
    }>;
    recentDonations?: Array<{
        name: string;
        amount: string;
        time: string;
        type: string;
        receipt: string;
    }>;
    auditRecords?: AuditRecord[];
    progressStats?: {
        total: number;
        goal: number;
        percentage: number;
    };
    donationSuccess?: boolean;
    successRef?: string;
}

export default function Donate({
    wishlist = [],
    recentDonations = [],
    auditRecords = [],
    progressStats = { total: 0, goal: 50000, percentage: 0 },
    donationSuccess = false,
    successRef = ''
}: DonateProps) {
    const { auth } = usePage<{ auth: { user: any } }>().props;

    const [activeTab, setActiveTab] = useState<'cash' | 'inkind' | 'sponsor'>('cash');
    const [submitted, setSubmitted] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);
    const [sponsorItem, setSponsorItem] = useState<{ id: number; animalName: string; animalPhoto: string; item: string; quantity: string; priority: string } | null>(null);
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
        payment_method: 'gcash'
    });

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
            setReceiptData({
                title: 'Donation Completed!',
                subtitle: 'Thank you for your generous support',
                referenceNumber: successRef,
                items: [
                    { label: 'Status', value: 'Completed', icon: <CheckCircle2 className="text-green-500" size={20} /> },
                    { label: 'Date', value: new Date().toLocaleDateString(), icon: <Calendar size={20} /> }
                ],
                type: 'success',
                footerMessage: 'Your transaction has been processed successfully. A formal receipt and summary of impact will be sent to your email.'
            });
            setShowReceipt(true);
        }
    }, [donationSuccess, successRef]);

    const handleSponsorClick = (animalName: string, animalPhoto: string, need: any) => {
        setSponsorItem({
            id: need.id,
            animalName,
            animalPhoto,
            item: need.item,
            quantity: need.quantity,
            priority: need.priority
        });
        setShowWishlist(false);
    };

    const submitCash = (e: React.FormEvent) => {
        e.preventDefault();
        cashForm.post('/donate/cash', {
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    const submitInKind = (e: React.FormEvent) => {
        e.preventDefault();
        inKindForm.post('/donate/in-kind', {
            onSuccess: () => {
                setSubmitted(true);
                inKindForm.reset();
            },
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    const submitSponsor = (e: React.FormEvent) => {
        e.preventDefault();
        sponsorForm.post('/donate/sponsor', {
            onSuccess: () => {
                setShowSponsorForm(false);
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
                    <div className="text-center mb-16">
                        <span className="bg-paw-orange/10 text-paw-orange px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Support Our Cause</span>
                        <h1 className="text-4xl md:text-6xl font-black text-paw-navy mb-4 leading-tight">Your Support Saves Lives</h1>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            Every cent donated goes directly to feeding, rescuing, and medical care
                            for the stray animals of Iligan City. We believe in 100% transparency.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        {/* Left Column: Donation Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-[40px] shadow-2xl shadow-paw-navy/5 overflow-hidden">
                                {/* Tabs */}
                                <div className="flex bg-gray-50 border-b-2 border-gray-100">
                                    <button
                                        onClick={() => setActiveTab('cash')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-6 font-black text-lg transition-all ${activeTab === 'cash' ? 'bg-white text-paw-orange border-b-4 border-paw-orange' : 'text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <CreditCard size={20} />
                                        CASH DONATION
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('inkind')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-6 font-black text-lg transition-all ${activeTab === 'inkind' ? 'bg-white text-paw-orange border-b-4 border-paw-orange' : 'text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <Gift size={20} />
                                        IN-KIND DONATION
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sponsor')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-6 font-black text-lg transition-all ${activeTab === 'sponsor' ? 'bg-white text-paw-orange border-b-4 border-paw-orange' : 'text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <Users size={20} />
                                        SPONSOR FEEDING
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
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {['100', '200', '500', '1000'].map((val) => (
                                                                <button
                                                                    type="button"
                                                                    key={val}
                                                                    onClick={() => cashForm.setData('amount', val)}
                                                                    className={`py-4 rounded-2xl font-black text-xl border-2 transition-all ${cashForm.data.amount === val ? 'bg-paw-orange text-white border-paw-orange shadow-lg shadow-paw-orange/20' : 'bg-gray-50 text-paw-navy border-transparent hover:border-paw-orange/30'}`}
                                                                >
                                                                    ₱{val}
                                                                </button>
                                                            ))}
                                                            <div className="col-span-2 relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₱</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Custom Amount"
                                                                    value={cashForm.data.amount}
                                                                    onChange={(e) => cashForm.setData('amount', e.target.value)}
                                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-black text-xl"
                                                                />
                                                            </div>
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
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">EMAIL ADDRESS</label>
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

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">MOBILE NUMBER</label>
                                                            <input
                                                                type="tel"
                                                                value={cashForm.data.donor_mobile}
                                                                onChange={(e) => cashForm.setData('donor_mobile', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Optional (09XX XXX XXXX)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">PAYMENT METHOD</label>
                                                            <select
                                                                value={cashForm.data.payment_method}
                                                                onChange={(e) => cashForm.setData('payment_method', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                            >
                                                                <option value="gcash">GCash Wallet</option>
                                                                <option value="maya">Maya Wallet</option>
                                                                <option value="bank_transfer">Debit/Credit Card</option>
                                                                <option value="paypal">PayPal</option>
                                                            </select>
                                                        </div>
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
                                                        disabled={cashForm.processing}
                                                        className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-paw-orange/20 cursor-pointer"
                                                    >
                                                        PROCEED TO DONATE ₱{cashForm.data.amount}
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
                                                            className="w-full bg-paw-orange text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <Heart size={18} />
                                                            VIEW ANIMAL WISHLIST
                                                        </button>
                                                    </div>

                                                    {inKindForm.data.animal_donation_need_id && (
                                                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex justify-between items-center">
                                                            <div className="text-sm text-green-800 font-bold">
                                                                Linked to Shelter Animal Need
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => inKindForm.setData('animal_donation_need_id', '')}
                                                                className="text-red-500 hover:text-red-700 font-black text-xs uppercase"
                                                            >
                                                                Clear Link
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">DESCRIPTION OF DONATION</label>
                                                        <textarea
                                                            required
                                                            value={inKindForm.data.description}
                                                            onChange={(e) => inKindForm.setData('description', e.target.value)}
                                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors min-h-[120px] font-bold"
                                                            placeholder="Tell us what you'd like to drop off... e.g. 5kg Vitality Dog Kibble, 2 boxes vitamins"
                                                        ></textarea>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">QUANTITY / ESTIMATE</label>
                                                            <input
                                                                type="text"
                                                                value={inKindForm.data.quantity}
                                                                onChange={(e) => inKindForm.setData('quantity', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="e.g. 5 packs, 10 bottles"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">DROP OFF DATE</label>
                                                            <input
                                                                type="date"
                                                                required
                                                                value={inKindForm.data.drop_off_date}
                                                                onChange={(e) => inKindForm.setData('drop_off_date', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">CONTACT PERSON</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={inKindForm.data.contact_person}
                                                                onChange={(e) => inKindForm.setData('contact_person', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Who is dropping this off?"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">DONOR NAME (FOR TRANSPARENCY)</label>
                                                            <input
                                                                type="text"
                                                                value={inKindForm.data.donor_name}
                                                                onChange={(e) => inKindForm.setData('donor_name', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Optional (Guest if left blank)"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">EMAIL ADDRESS</label>
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
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">MOBILE NUMBER</label>
                                                            <input
                                                                type="tel"
                                                                value={inKindForm.data.donor_mobile}
                                                                onChange={(e) => inKindForm.setData('donor_mobile', e.target.value)}
                                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                                                placeholder="Optional"
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
                                                        <label htmlFor="inkind-anon" className="text-sm font-bold text-gray-600">DONATE ANONYMOUSLY (Public log shows Anonymous)</label>
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
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Monthly Goal</span>
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
                                        className="w-full py-4 rounded-2xl bg-paw-navy text-white font-bold text-sm uppercase tracking-widest hover:bg-paw-orange transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FileText size={16} />
                                        View Full Audit History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* In-Kind Success Modal */}
            <AnimatePresence>
                {submitted && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-paw-navy/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white w-full max-w-md rounded-[40px] p-10 text-center relative z-10 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-4xl font-black text-paw-navy mb-4">Drop-off Scheduled!</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-bold">
                                Thank you for your generosity! Your scheduled in-kind drop-off has been registered. An administrator will verify the items once they are dropped off.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl shadow-xl shadow-paw-orange/20 cursor-pointer"
                            >
                                CLOSE & CONTINUE
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Transparency Audit History Modal */}
            <TransparencyAuditModal
                isOpen={showAuditModal}
                onClose={() => setShowAuditModal(false)}
                records={auditRecords}
            />

            {/* Animal Wishlist Modal */}
            <AnimatePresence>
                {showWishlist && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowWishlist(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] max-w-5xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white rounded-t-[40px] p-8 border-b border-gray-100 flex items-center justify-between z-20">
                                <div>
                                    <h3 className="text-3xl font-black text-paw-navy">In-Kind Donation Wishlist</h3>
                                    <p className="text-sm font-bold text-gray-500">Sponsor specific items for animals in need</p>
                                </div>
                                <button
                                    onClick={() => setShowWishlist(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                {wishlist.length === 0 ? (
                                    <p className="text-center py-12 text-gray-500 font-bold">No active animal needs listed at this moment.</p>
                                ) : (
                                    wishlist.map((animal) => (
                                        <div key={animal.id} className="bg-gradient-to-br from-paw-bg to-white rounded-3xl p-8 border-2 border-gray-100 shadow-lg">
                                            <div className="flex items-start gap-6 mb-6">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white shrink-0">
                                                    <ImageWithFallback
                                                        src={animal.photo}
                                                        alt={animal.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-2xl font-black text-paw-navy mb-1">{animal.name}</h4>
                                                    <p className="text-sm font-black text-paw-orange uppercase tracking-widest mb-2">{animal.type} • {animal.age}</p>
                                                    <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-3 py-1 rounded-full">
                                                        <Heart size={14} className="text-paw-orange" />
                                                        <span className="text-xs font-black text-paw-orange">{animal.needs.length} Items Needed</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {animal.needs.map((need) => (
                                                    <div
                                                        key={need.id}
                                                        className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-paw-orange/30 transition-all flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-start justify-between mb-3">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${need.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                                                    need.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {need.priority}
                                                                </span>
                                                            </div>
                                                            <h5 className="font-black text-paw-navy text-sm mb-1">{need.item}</h5>
                                                            <p className="text-xs font-bold text-gray-500 mb-4">Quantity: {need.quantity}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSponsorClick(animal.name, animal.photo, need)}
                                                            className="w-full bg-paw-orange text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all cursor-pointer"
                                                        >
                                                            Sponsor This Item
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sponsor Item Modal */}
            <AnimatePresence>
                {sponsorItem && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSponsorItem(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] max-w-lg w-full relative z-10 shadow-2xl p-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSponsorItem(null)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>

                            <div className="text-center">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-paw-orange/20 mx-auto mb-6">
                                    <ImageWithFallback
                                        src={sponsorItem.animalPhoto}
                                        alt={sponsorItem.animalName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-4">
                                    <Heart size={16} className="text-paw-orange" />
                                    <span className="text-xs font-black tracking-widest uppercase text-paw-orange">Sponsoring Item</span>
                                </div>

                                <h3 className="text-3xl font-black text-paw-navy mb-2">Help {sponsorItem.animalName}</h3>
                                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                    <p className="text-sm font-bold text-gray-500 mb-2">You're sponsoring:</p>
                                    <h4 className="text-xl font-black text-paw-navy mb-1">{sponsorItem.item}</h4>
                                    <p className="text-sm font-bold text-gray-600">Quantity: {sponsorItem.quantity}</p>
                                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-black ${sponsorItem.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                        sponsorItem.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                        Priority: {sponsorItem.priority}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        inKindForm.setData(data => ({
                                            ...data,
                                            animal_donation_need_id: sponsorItem.id.toString(),
                                            description: `Sponsoring ${sponsorItem.item} for ${sponsorItem.animalName}`,
                                            quantity: sponsorItem.quantity
                                        }));
                                        setSponsorItem(null);
                                        setActiveTab('inkind');
                                        toast.success(`Please complete the drop-off form to sponsor ${sponsorItem.item} for ${sponsorItem.animalName}!`);
                                    }}
                                    className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 mb-3 cursor-pointer"
                                >
                                    PROCEED TO DROP-OFF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sponsor Feeding Form Modal */}
            <AnimatePresence>
                {showSponsorForm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSponsorForm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-gradient-to-br from-paw-yellow to-paw-orange text-white rounded-t-[40px] p-8 z-20">
                                <button
                                    onClick={() => setShowSponsorForm(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black">Sponsor a Feeding Day</h3>
                                        <p className="text-sm font-bold text-white/90">Fill out the details below</p>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">Total Amount:</span>
                                        <span className="text-3xl font-black">₱3,500</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitSponsor} className="p-8 space-y-6">
                                <div className="bg-paw-yellow/10 border-2 border-paw-yellow/20 rounded-3xl p-6">
                                    <h4 className="font-black text-paw-navy mb-4 flex items-center gap-2">
                                        <Calendar size={20} className="text-paw-yellow" />
                                        WHAT'S INCLUDED
                                    </h4>
                                    <ul className="space-y-3 text-sm font-bold text-gray-700">
                                        <li className="flex items-start gap-3">
                                            <Check size={18} className="text-paw-yellow shrink-0 mt-0.5" />
                                            <span>5kg premium dog food + 5kg cat food distributed to 100+ strays</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check size={18} className="text-paw-yellow shrink-0 mt-0.5" />
                                            <span>Automatically schedules a volunteer feeding day event</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check size={18} className="text-paw-yellow shrink-0 mt-0.5" />
                                            <span>Personalized appreciation on the event details</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={sponsorForm.data.fullName}
                                            onChange={(e) => sponsorForm.setData('fullName', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={sponsorForm.data.email}
                                            onChange={(e) => sponsorForm.setData('email', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Mobile Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={sponsorForm.data.mobile}
                                            onChange={(e) => sponsorForm.setData('mobile', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            placeholder="09XX XXX XXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            PAYMENT METHOD <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={sponsorForm.data.payment_method}
                                            onChange={(e) => sponsorForm.setData('payment_method', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                        >
                                            <option value="gcash">GCash Wallet</option>
                                            <option value="maya">Maya Wallet</option>
                                            <option value="paypal">PayPal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Preferred Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={sponsorForm.data.date}
                                            onChange={(e) => sponsorForm.setData('date', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Occasion (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={sponsorForm.data.occasion}
                                            onChange={(e) => sponsorForm.setData('occasion', e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            placeholder="Birthday, Anniversary, etc."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                        Personal Message (Optional)
                                    </label>
                                    <textarea
                                        value={sponsorForm.data.message}
                                        onChange={(e) => sponsorForm.setData('message', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold min-h-[100px]"
                                        placeholder="Share why you're sponsoring this feeding day..."
                                    />
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="sponsor-anonymous"
                                        checked={sponsorForm.data.anonymous}
                                        onChange={(e) => sponsorForm.setData('anonymous', e.target.checked)}
                                        className="w-5 h-5 accent-paw-orange mt-1"
                                    />
                                    <label htmlFor="sponsor-anonymous" className="text-sm font-bold text-gray-700">
                                        SPONSOR ANONYMOUSLY (Your name won't appear in public event details)
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSponsorForm(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-5 rounded-[24px] font-black text-lg hover:bg-gray-200 transition-all cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sponsorForm.processing}
                                        className="flex-1 bg-paw-orange text-white py-5 rounded-[24px] font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        PROCEED TO PAYMENT
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
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
                />
            )}

            <Footer />
        </div>
    );
}
