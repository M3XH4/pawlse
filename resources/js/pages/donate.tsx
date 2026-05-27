
import { Heart, CreditCard, Gift, Users, Check, ArrowRight, ShieldCheck, X, Copy, CheckCircle2, Smartphone, Filter, Calendar, Download, FileText, TrendingUp, Plus, Upload, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import gcashQR from '@/assets/gcash-qr.jpg';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SubmissionReceipt } from '@/components/submission-receipt';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export default function Donate() {
    const [activeTab, setActiveTab] = useState<'cash' | 'inkind' | 'sponsor'>('cash');
    const [amount, setAmount] = useState('500');
    const [submitted, setSubmitted] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditFilter, setAuditFilter] = useState<'all' | 'this-month' | 'last-month' | 'this-year'>('all');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [showWishlist, setShowWishlist] = useState(false);
    const [sponsorItem, setSponsorItem] = useState<{ animalName: string; animalPhoto: string; item: string; quantity: string; priority: string } | null>(null);
    const [showSponsorForm, setShowSponsorForm] = useState(false);
    const [sponsorFormData, setSponsorFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        date: '',
        occasion: '',
        message: '',
        anonymous: false
    });

    const [paymentProof, setPaymentProof] = useState({
        screenshot: null as File | null,
        referenceNumber: '',
        paymentDateTime: '',
        paymentMethod: 'Gcash'
    });

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const generateReferenceNumber = () => {
        const prefix = 'DON';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${prefix}-${timestamp}-${random}`;
    };

    // Animal Wishlist Data
    const animalWishlist = [
        {
            id: 'animal-1',
            name: 'Cassey',
            type: 'Senior Dog',
            age: '8 years',
            photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
            needs: [
                { id: 'need-1-1', item: 'Adult Diapers (Medium)', quantity: '2 packs', priority: 'Urgent', icon: <Plus size={16} /> },
                { id: 'need-1-2', item: 'Joint Support Vitamins', quantity: '1 bottle', priority: 'High', icon: <ShieldCheck size={16} /> },
                { id: 'need-1-3', item: 'Soft Senior Dog Food', quantity: '5 kg', priority: 'Medium', icon: <Gift size={16} /> }
            ]
        },
        {
            id: 'animal-2',
            name: 'Bruno',
            type: 'Injured Puppy',
            age: '4 months',
            photo: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
            needs: [
                { id: 'need-2-1', item: 'Antibiotic Cream', quantity: '2 tubes', priority: 'Urgent', icon: <ShieldCheck size={16} /> },
                { id: 'need-2-2', item: 'Puppy Milk Replacer', quantity: '3 cans', priority: 'Urgent', icon: <Gift size={16} /> },
                { id: 'need-2-3', item: 'Small Blankets', quantity: '3 pieces', priority: 'Medium', icon: <Heart size={16} /> }
            ]
        },
        {
            id: 'animal-3',
            name: 'Luna',
            type: 'Nursing Cat',
            age: '2 years',
            photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
            needs: [
                { id: 'need-3-1', item: 'Kitten Formula', quantity: '5 cans', priority: 'High', icon: <Gift size={16} /> },
                { id: 'need-3-2', item: 'Nursing Supplements', quantity: '1 bottle', priority: 'High', icon: <ShieldCheck size={16} /> },
                { id: 'need-3-3', item: 'Cat Litter', quantity: '10 kg', priority: 'Medium', icon: <Plus size={16} /> }
            ]
        },
        {
            id: 'animal-4',
            name: 'Max',
            type: 'Rescued Dog',
            age: '5 years',
            photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
            needs: [
                { id: 'need-4-1', item: 'Deworming Tablets', quantity: '1 pack', priority: 'Urgent', icon: <ShieldCheck size={16} /> },
                { id: 'need-4-2', item: 'Dog Shampoo (Anti-flea)', quantity: '2 bottles', priority: 'High', icon: <Plus size={16} /> },
                { id: 'need-4-3', item: 'Dry Dog Food', quantity: '10 kg', priority: 'Medium', icon: <Gift size={16} /> }
            ]
        }
    ];

    const handleSponsorClick = (animalName: string, animalPhoto: string, need: any) => {
        setSponsorItem({
            animalName,
            animalPhoto,
            item: need.item,
            quantity: need.quantity,
            priority: need.priority
        });
        setShowWishlist(false);
    };

    // Mock audit history data
    const auditHistory = [
        { id: 1, date: '2026-04-25', donor: 'Maria Santos', type: 'Cash', amount: 1000, usage: 'Veterinary medicine for rescued dogs', receipt: 'REC-2026-0425', month: 'April', year: '2026' },
        { id: 2, date: '2026-04-24', donor: 'John Cruz', type: 'In-Kind', description: 'Dog food 10kg', usage: 'Distributed to feeding stations', receipt: 'REC-2026-0424', month: 'April', year: '2026' },
        { id: 3, date: '2026-04-20', donor: 'Anonymous', type: 'Cash', amount: 5000, usage: 'Emergency rescue operations', receipt: 'REC-2026-0420', month: 'April', year: '2026' },
        { id: 4, date: '2026-04-18', donor: 'Sarah Lopez', type: 'Cash', amount: 500, usage: 'Cat food supplies', receipt: 'REC-2026-0418', month: 'April', year: '2026' },
        { id: 5, date: '2026-04-15', donor: 'Iligan Pet Shop', type: 'Cash', amount: 10000, usage: 'Monthly corporate support', receipt: 'REC-2026-0415', month: 'April', year: '2026' },
        { id: 6, date: '2026-03-28', donor: 'Anna Reyes', type: 'In-Kind', description: 'Blankets and towels', usage: 'Shelter bedding', receipt: 'REC-2026-0328', month: 'March', year: '2026' },
        { id: 7, date: '2026-03-25', donor: 'Mike Torres', type: 'Cash', amount: 2000, usage: 'Vaccination program', receipt: 'REC-2026-0325', month: 'March', year: '2026' },
        { id: 8, date: '2026-03-20', donor: 'Linda Garcia', type: 'Cash', amount: 1500, usage: 'Shelter maintenance', receipt: 'REC-2026-0320', month: 'March', year: '2026' },
        { id: 9, date: '2026-03-15', donor: 'Carlos Mendoza', type: 'In-Kind', description: 'Vitamins and supplements', usage: 'Health care program', receipt: 'REC-2026-0315', month: 'March', year: '2026' },
        { id: 10, date: '2026-03-10', donor: 'Anonymous', type: 'Cash', amount: 3000, usage: 'Spay and neuter operations', receipt: 'REC-2026-0310', month: 'March', year: '2026' },
        { id: 11, date: '2026-02-28', donor: 'Emma Ramos', type: 'Cash', amount: 800, usage: 'Feeding operations', receipt: 'REC-2026-0228', month: 'February', year: '2026' },
        { id: 12, date: '2026-02-20', donor: 'David Santos', type: 'Cash', amount: 4000, usage: 'Medical equipment', receipt: 'REC-2026-0220', month: 'February', year: '2026' },
        { id: 13, date: '2026-01-30', donor: 'Grace Kim', type: 'In-Kind', description: 'Leashes and collars', usage: 'Adoption program', receipt: 'REC-2026-0130', month: 'January', year: '2026' },
        { id: 14, date: '2026-01-25', donor: 'Robert Lee', type: 'Cash', amount: 6000, usage: 'Rescue vehicle fuel', receipt: 'REC-2026-0125', month: 'January', year: '2026' },
        { id: 15, date: '2025-12-28', donor: 'Patricia Wong', type: 'Cash', amount: 2500, usage: 'Year-end operations', receipt: 'REC-2025-1228', month: 'December', year: '2025' },
    ];

    // Filter function
    const getFilteredAudit = () => {
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear().toString();

        let filtered = auditHistory;

        // Apply quick filters
        if (auditFilter === 'this-month') {
            filtered = filtered.filter(item => item.month === currentMonth && item.year === currentYear);
        } else if (auditFilter === 'last-month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            const lastMonthName = lastMonth.toLocaleString('default', { month: 'long' });
            filtered = filtered.filter(item => item.month === lastMonthName && item.year === lastMonth.getFullYear().toString());
        } else if (auditFilter === 'this-year') {
            filtered = filtered.filter(item => item.year === currentYear);
        }

        // Apply year filter
        if (selectedYear !== 'All Years') {
            filtered = filtered.filter(item => item.year === selectedYear);
        }

        // Apply month filter
        if (selectedMonth !== 'All Months') {
            filtered = filtered.filter(item => item.month === selectedMonth);
        }

        return filtered;
    };

    const filteredAudit = getFilteredAudit();
    const totalDonations = filteredAudit.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand">
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
                                                className="space-y-8"
                                            >
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Select Amount (PHP)</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {['100', '200', '500', '1000'].map((val) => (
                                                            <button
                                                                key={val}
                                                                onClick={() => setAmount(val)}
                                                                className={`py-4 rounded-2xl font-black text-xl border-2 transition-all ${amount === val ? 'bg-paw-orange text-white border-paw-orange shadow-lg shadow-paw-orange/20' : 'bg-gray-50 text-paw-navy border-transparent hover:border-paw-orange/30'}`}
                                                            >
                                                                ₱{val}
                                                            </button>
                                                        ))}
                                                        <div className="col-span-2 relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₱</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Custom Amount"
                                                                value={amount}
                                                                onChange={(e) => setAmount(e.target.value)}
                                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-black text-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">FULL NAME</label>
                                                        <input type="text" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors" placeholder="Optional for anonymous" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">EMAIL ADDRESS</label>
                                                        <input type="email" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors" placeholder="For receipt" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" id="anon" className="w-5 h-5 accent-paw-orange" />
                                                    <label htmlFor="anon" className="text-sm font-bold text-gray-600">DONATE ANONYMOUSLY</label>
                                                </div>

                                                <button
                                                    onClick={() => setShowPaymentModal(true)}
                                                    className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-paw-orange/20"
                                                >
                                                    PROCEED TO DONATE ₱{amount}
                                                </button>

                                                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm font-bold uppercase tracking-widest pt-4">
                                                    <ShieldCheck size={20} />
                                                    Secure 256-bit SSL Encryption
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'inkind' && (
                                            <motion.div
                                                key="inkind"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
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
                                                        onClick={() => setShowWishlist(true)}
                                                        className="w-full bg-paw-orange text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Heart size={18} />
                                                        VIEW ANIMAL WISHLIST
                                                    </button>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">DESCRIPTION OF DONATION</label>
                                                    <textarea className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors min-h-[120px]" placeholder="Tell us what you'd like to drop off..."></textarea>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">DROP OFF DATE</label>
                                                        <input type="date" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">CONTACT PERSON</label>
                                                        <input type="text" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors" />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSubmitted(true)}
                                                    className="w-full bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl hover:bg-paw-orange transition-all flex items-center justify-center gap-3"
                                                >
                                                    SCHEDULE DROP-OFF <ArrowRight size={20} />
                                                </button>
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
                                                            <p className="text-sm font-bold text-gray-700">You'll receive photos and videos of the feeding</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        // eslint-disable-next-line @stylistic/brace-style
                                                        onClick={() => { setAmount('3500'); setShowSponsorForm(true); }}
                                                        className="w-full bg-paw-navy text-white py-5 rounded-[24px] font-black text-xl hover:bg-paw-yellow hover:text-paw-navy transition-all"
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
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">February Goal</span>
                                            <span className="text-xl font-black text-paw-orange">₱42,500 / ₱50,000</span>
                                        </div>
                                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '85%' }}
                                                className="h-full bg-paw-orange"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-paw-navy text-sm uppercase tracking-widest border-b pb-2">Recent Donations</h4>
                                        {[
                                            { name: 'Anonymous', amount: '₱500', time: '2 hours ago' },
                                            { name: 'Juan Dela Cruz', amount: '₱1,000', time: '5 hours ago' },
                                            { name: 'Maria K.', amount: '₱200', time: '12 hours ago' },
                                        ].map((d, i) => (
                                            <div key={i} className="flex justify-between items-center py-2">
                                                <div>
                                                    <p className="font-black text-paw-navy text-sm">{d.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{d.time}</p>
                                                </div>
                                                <p className="font-black text-paw-orange">{d.amount}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowAuditModal(true)}
                                        className="w-full py-4 rounded-2xl bg-paw-navy text-white font-bold text-sm uppercase tracking-widest hover:bg-paw-orange transition-colors flex items-center justify-center gap-2"
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

            {/* Success Modal */}
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
                            <h2 className="text-4xl font-black text-paw-navy mb-4">You're Amazing!</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-bold">
                                Thank you for your generosity! Your donation will help fill bowls and heal wounds. A receipt has been sent to your email.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl shadow-xl shadow-paw-orange/20"
                            >
                                CLOSE & CONTINUE
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Options Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[24px] md:rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 relative shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white rounded-t-[24px] md:rounded-t-[40px] p-4 md:p-6 border-b border-gray-100 flex items-center justify-between z-20">
                                <div>
                                    <h3 className="text-lg md:text-2xl font-black text-paw-navy">Choose Payment Method</h3>
                                    <p className="text-xs md:text-sm font-bold text-gray-500">Donation Amount: ₱{amount}</p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                                {/* GCash Payment */}
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[20px] md:rounded-[32px] p-5 md:p-8 text-white">
                                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center">
                                            <Smartphone size={20} className="text-blue-600 md:hidden" />
                                            <Smartphone size={24} className="text-blue-600 hidden md:block" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-black">GCash</h4>
                                            <p className="text-[10px] md:text-xs font-bold text-blue-200">Scan QR Code to Pay</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[24px] p-6 mb-6">
                                        <img
                                            src={gcashQR}
                                            alt="GCash QR Code"
                                            className="w-full max-w-md mx-auto rounded-2xl"
                                        />
                                    </div>

                                    <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-100">Account Name:</span>
                                            <span className="font-black">I.S.F.</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-100">Mobile No:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black">093• ••••547</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('09300000547');
                                                        toast.success('Mobile number copied!');
                                                    }}
                                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-100">User ID:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-xs">••••••••••WEVWRBP</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('WEVWRBP');
                                                        toast.success('User ID copied!');
                                                    }}
                                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-blue-200 font-bold text-center mt-4">
                                        * Transfer fees may apply
                                    </p>
                                </div>

                                {/* Bank Transfer */}
                                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-[20px] md:rounded-[32px] p-5 md:p-8 text-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                                            <CreditCard size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black">Bank Transfer</h4>
                                            <p className="text-xs font-bold text-green-200">Direct Bank Deposit</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-green-100">Bank:</span>
                                            <span className="font-black">BDO Unibank</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-green-100">Account Name:</span>
                                            <span className="font-black">Iligan Stray Feeders</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-green-100">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black">0012-3456-7890</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('001234567890');
                                                        toast.success('Account number copied!');
                                                    }}
                                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PayPal */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[20px] md:rounded-[32px] p-5 md:p-8 text-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                                            <span className="text-blue-500 font-black text-2xl">₱</span>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black">PayPal</h4>
                                            <p className="text-xs font-bold text-blue-200">International Donations</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-100">PayPal Email:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black">donate@iliganstrayfeeders.org</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('donate@iliganstrayfeeders.org');
                                                        toast.success('Email copied!');
                                                    }}
                                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-paw-orange/10 border-2 border-paw-orange/20 rounded-[24px] p-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={24} className="text-paw-orange shrink-0 mt-1" />
                                        <div>
                                            <h5 className="font-black text-paw-navy mb-2">Submit Payment Proof</h5>
                                            <p className="text-sm font-bold text-gray-600 leading-relaxed">
                                                After completing your payment, please upload your payment proof below. Your donation will be verified by our admin team within 24-48 hours.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Proof Upload Form */}
                                <div className="space-y-6 bg-gray-50 rounded-[24px] p-6 md:p-8">
                                    <h5 className="font-black text-paw-navy text-xl mb-4">Payment Proof Details</h5>

                                    {/* Screenshot Upload */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-600 uppercase tracking-widest mb-3">
                                            Screenshot of Receipt *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];

                                                    if (file) {
                                                        setPaymentProof({ ...paymentProof, screenshot: file });
                                                        toast.success('Screenshot uploaded!');
                                                    }
                                                }}
                                                className="hidden"
                                                id="screenshot-upload"
                                                required
                                            />
                                            <label
                                                htmlFor="screenshot-upload"
                                                className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-paw-orange hover:bg-white transition-all group"
                                            >
                                                <Upload size={24} className="text-gray-400 group-hover:text-paw-orange transition-colors" />
                                                <div className="text-center">
                                                    <p className="font-bold text-gray-600 group-hover:text-paw-navy">
                                                        {paymentProof.screenshot ? paymentProof.screenshot.name : 'Click to upload screenshot'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, or JPEG (max 5MB)</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Reference Number */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-600 uppercase tracking-widest mb-3">
                                            Reference Number *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter transaction/reference number"
                                            value={paymentProof.referenceNumber}
                                            onChange={(e) => setPaymentProof({ ...paymentProof, referenceNumber: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Date/Time of Payment */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-600 uppercase tracking-widest mb-3">
                                            Date & Time of Payment *
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="datetime-local"
                                                value={paymentProof.paymentDateTime}
                                                onChange={(e) => setPaymentProof({ ...paymentProof, paymentDateTime: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-600 uppercase tracking-widest mb-3">
                                            Payment Method Used *
                                        </label>
                                        <select
                                            value={paymentProof.paymentMethod}
                                            onChange={(e) => setPaymentProof({ ...paymentProof, paymentMethod: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                                            required
                                        >
                                            <option>Gcash</option>
                                            <option>Maya</option>
                                            <option>Bank Transfer</option>
                                            <option>PayPal</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!paymentProof.screenshot) {
                                            toast.error('Please upload a screenshot of your receipt');

                                            return;
                                        }

                                        if (!paymentProof.referenceNumber) {
                                            toast.error('Please enter the reference number');

                                            return;
                                        }

                                        if (!paymentProof.paymentDateTime) {
                                            toast.error('Please enter the date and time of payment');

                                            return;
                                        }

                                        const refNumber = generateReferenceNumber();
                                        setReceiptData({
                                            title: 'Payment Proof Submitted!',
                                            subtitle: 'Your donation is pending verification',
                                            referenceNumber: refNumber,
                                            items: [
                                                { label: 'Donation Amount', value: `₱${amount}`, icon: <Heart size={20} /> },
                                                { label: 'Payment Method', value: paymentProof.paymentMethod, icon: <CreditCard size={20} /> },
                                                { label: 'Reference Number', value: paymentProof.referenceNumber, icon: <FileText size={20} /> },
                                                { label: 'Payment Date & Time', value: new Date(paymentProof.paymentDateTime).toLocaleString(), icon: <Clock size={20} /> },
                                                { label: 'Screenshot', value: paymentProof.screenshot?.name || 'Uploaded', icon: <Upload size={20} /> },
                                                { label: 'Status', value: 'Pending Verification', icon: <AlertCircle size={20} /> }
                                            ],
                                            type: 'warning',
                                            footerMessage: 'Your payment proof has been submitted and is pending admin verification. You will receive a confirmation email within 24-48 hours once your donation is verified. Thank you for your generosity!'
                                        });
                                        setShowPaymentModal(false);
                                        setShowReceipt(true);
                                        toast.success('Payment proof submitted successfully!');
                                    }}
                                    className="w-full bg-paw-orange text-white py-6 rounded-[24px] font-black text-xl hover:bg-paw-navy transition-all shadow-xl flex items-center justify-center gap-3"
                                >
                                    <Upload size={24} />
                                    SUBMIT PAYMENT PROOF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Audit History Modal */}
            <AnimatePresence>
                {showAuditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAuditModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[24px] md:rounded-[40px] max-w-6xl w-full max-h-[90vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-paw-navy to-paw-blue text-white rounded-t-[24px] md:rounded-t-[40px] p-4 md:p-8 z-20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center">
                                            <ShieldCheck size={20} className="md:hidden" />
                                            <ShieldCheck size={28} className="hidden md:block" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-3xl font-black">Transparency Audit History</h3>
                                            <p className="text-xs md:text-sm font-bold text-white/80">100% Accountability & Public Record</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAuditModal(false)}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Stats Summary */}
                                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-4 border border-white/20">
                                        <p className="text-[9px] md:text-xs font-bold text-white/70 mb-1">Total Records</p>
                                        <p className="text-lg md:text-2xl font-black">{filteredAudit.length}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-4 border border-white/20">
                                        <p className="text-[9px] md:text-xs font-bold text-white/70 mb-1">Total Amount</p>
                                        <p className="text-lg md:text-2xl font-black">₱{totalDonations.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-4 border border-white/20">
                                        <p className="text-[9px] md:text-xs font-bold text-white/70 mb-1">Period</p>
                                        <p className="text-xs md:text-sm font-black">{selectedMonth} {selectedYear}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-gray-50 p-3 md:p-6 border-b border-gray-200">
                                <div className="flex flex-wrap gap-2 md:gap-4">
                                    {/* Quick Filters */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setAuditFilter('all');
                                                setSelectedYear('2026');
                                                setSelectedMonth('All Months');
                                            }}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${auditFilter === 'all'
                                                    ? 'bg-paw-orange text-white shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            All Time
                                        </button>
                                        <button
                                            onClick={() => setAuditFilter('this-month')}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${auditFilter === 'this-month'
                                                    ? 'bg-paw-orange text-white shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            This Month
                                        </button>
                                        <button
                                            onClick={() => setAuditFilter('last-month')}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${auditFilter === 'last-month'
                                                    ? 'bg-paw-orange text-white shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            Last Month
                                        </button>
                                        <button
                                            onClick={() => setAuditFilter('this-year')}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${auditFilter === 'this-year'
                                                    ? 'bg-paw-orange text-white shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            This Year
                                        </button>
                                    </div>

                                    {/* Custom Filters */}
                                    <div className="flex gap-3 ml-auto">
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => {
                                                    setSelectedYear(e.target.value);
                                                    setAuditFilter('all');
                                                }}
                                                className="pl-10 pr-8 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange transition-colors appearance-none"
                                            >
                                                <option value="All Years">All Years</option>
                                                <option value="2026">2026</option>
                                                <option value="2025">2025</option>
                                                <option value="2024">2024</option>
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => {
                                                    setSelectedMonth(e.target.value);
                                                    setAuditFilter('all');
                                                }}
                                                className="pl-10 pr-8 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-paw-orange transition-colors appearance-none"
                                            >
                                                <option value="All Months">All Months</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => toast.success('Downloading audit report...')}
                                            className="px-4 py-2 bg-paw-navy text-white rounded-xl font-bold text-sm hover:bg-paw-orange transition-colors flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Records */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-6 relative">
                                {filteredAudit.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-bold">No records found for the selected period</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredAudit.map((record) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-paw-orange/30 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 bg-paw-orange/10 rounded-xl flex items-center justify-center">
                                                                <Heart size={20} className="text-paw-orange" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-paw-navy text-lg">{record.donor}</h4>
                                                                <p className="text-xs font-bold text-gray-400">{record.date}</p>
                                                            </div>
                                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-black ${record.type === 'Cash'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {record.type}
                                                            </span>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Usage / Purpose</p>
                                                            <p className="font-bold text-gray-700">{record.usage}</p>
                                                            {record.description && (
                                                                <p className="text-sm font-bold text-gray-500 mt-2">Item: {record.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <FileText size={14} />
                                                                Receipt: {record.receipt}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 size={14} className="text-green-500" />
                                                                Verified
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {record.amount && (
                                                            <p className="text-3xl font-black text-paw-orange">₱{record.amount.toLocaleString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <TrendingUp size={18} className="text-paw-green" />
                                        Updated in real-time • Last sync: Just now
                                    </div>
                                    <button
                                        onClick={() => setShowAuditModal(false)}
                                        className="px-6 py-3 bg-paw-navy text-white rounded-2xl font-black hover:bg-paw-orange transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                {animalWishlist.map((animal) => (
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
                                                    className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-paw-orange/30 transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${need.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                                                                need.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {need.icon}
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${need.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                                                need.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {need.priority}
                                                        </span>
                                                    </div>
                                                    <h5 className="font-black text-paw-navy text-sm mb-1">{need.item}</h5>
                                                    <p className="text-xs font-bold text-gray-500 mb-4">Quantity: {need.quantity}</p>
                                                    <button
                                                        onClick={() => handleSponsorClick(animal.name, animal.photo, need)}
                                                        className="w-full bg-paw-orange text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all"
                                                    >
                                                        Sponsor This Item
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
                                        setSponsorItem(null);
                                        setActiveTab('cash');
                                        toast.success(`Thank you for choosing to sponsor ${sponsorItem.item} for ${sponsorItem.animalName}!`);
                                    }}
                                    className="w-full bg-paw-orange text-white py-5 rounded-[24px] font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 mb-3"
                                >
                                    PROCEED TO DONATE
                                </button>

                                <p className="text-xs font-bold text-gray-400">
                                    You'll be redirected to the donation page
                                </p>
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
                                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
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

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setShowSponsorForm(false);
                                    setShowPaymentModal(true);
                                    toast.success('Redirecting to payment options...');
                                }}
                                className="p-8 space-y-6"
                            >
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
                                            <span>Full photo and video documentation of the feeding day</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check size={18} className="text-paw-yellow shrink-0 mt-0.5" />
                                            <span>Personalized certificate of appreciation with your name/occasion</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check size={18} className="text-paw-yellow shrink-0 mt-0.5" />
                                            <span>Social media shoutout on our official pages (if not anonymous)</span>
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
                                            value={sponsorFormData.fullName}
                                            onChange={(e) => setSponsorFormData({ ...sponsorFormData, fullName: e.target.value })}
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
                                            value={sponsorFormData.email}
                                            onChange={(e) => setSponsorFormData({ ...sponsorFormData, email: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={sponsorFormData.mobile}
                                        onChange={(e) => setSponsorFormData({ ...sponsorFormData, mobile: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold"
                                        placeholder="09XX XXX XXXX"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                                            Preferred Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={sponsorFormData.date}
                                            onChange={(e) => setSponsorFormData({ ...sponsorFormData, date: e.target.value })}
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
                                            value={sponsorFormData.occasion}
                                            onChange={(e) => setSponsorFormData({ ...sponsorFormData, occasion: e.target.value })}
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
                                        value={sponsorFormData.message}
                                        onChange={(e) => setSponsorFormData({ ...sponsorFormData, message: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-paw-orange transition-colors font-bold min-h-[100px]"
                                        placeholder="Share why you're sponsoring this feeding day..."
                                    />
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="sponsor-anonymous"
                                        checked={sponsorFormData.anonymous}
                                        onChange={(e) => setSponsorFormData({ ...sponsorFormData, anonymous: e.target.checked })}
                                        className="w-5 h-5 accent-paw-orange mt-1"
                                    />
                                    <label htmlFor="sponsor-anonymous" className="text-sm font-bold text-gray-700">
                                        SPONSOR ANONYMOUSLY (Your name won't appear in public posts)
                                    </label>
                                </div>

                                <div className="bg-paw-orange/10 border-2 border-dashed border-paw-orange/30 rounded-2xl p-4 flex items-start gap-3">
                                    <ShieldCheck className="text-paw-orange shrink-0 mt-1" size={20} />
                                    <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                        By submitting this form, you agree to sponsor a feeding day for ₱3,500. You'll receive
                                        confirmation via email and SMS with feeding schedule details and payment instructions.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSponsorForm(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-5 rounded-[24px] font-black text-lg hover:bg-gray-200 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-paw-orange text-white py-5 rounded-[24px] font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-paw-orange/20 flex items-center justify-center gap-2"
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
                        setPaymentProof({
                            screenshot: null,
                            referenceNumber: '',
                            paymentDateTime: '',
                            paymentMethod: 'Gcash'
                        });
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
