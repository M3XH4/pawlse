import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Heart, 
    CreditCard, 
    ShieldAlert, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Wallet, 
    UploadCloud, 
    Copy, 
    Check, 
    Clock, 
    Building2, 
    Smartphone, 
    FileText, 
    AlertCircle,
    ExternalLink,
    QrCode,
    Sparkles,
    Maximize2,
    X,
    ClipboardPaste,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface OfficialAccount {
    account_name: string;
    account_number: string;
    user_id?: string | null;
    qr_image?: string | null;
    bank_name?: string;
}

interface CheckoutProps {
    donation: {
        public_reference: string;
        donor_name: string;
        donor_email: string;
        amount: number;
        type: string;
        status: string;
        payment: {
            method: string;
            provider: string;
            payment_reference: string;
            status: string;
        } | null;
        sponsorship: {
            preferred_date: string;
            occasion: string | null;
            poster_url?: string | null;
        } | null;
        latest_proof?: {
            original_filename: string;
            uploaded_at: string | null;
            url: string;
        } | null;
    };
    simulation_enabled?: boolean;
    official_accounts?: {
        gcash?: OfficialAccount;
        bank_transfer?: OfficialAccount;
    };
}

export default function Checkout({ donation, simulation_enabled = false, official_accounts }: CheckoutProps) {
    const [selectedSimMethod, setSelectedSimMethod] = useState<string>(donation.payment?.method || 'gcash');
    const [isSimulating, setIsSimulating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activePayTab, setActivePayTab] = useState<'gcash' | 'bank_transfer'>('gcash');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showReceiptZoom, setShowReceiptZoom] = useState(false);

    const isProofSubmitted = donation.status === 'payment_proof_submitted';
    const isCompleted = donation.status === 'completed';

    const { data, setData, post, processing, errors, reset } = useForm<{
        payment_reference: string;
        payment_channel: string;
        proof: File | null;
    }>({
        payment_reference: '',
        payment_channel: donation.payment?.method || 'gcash',
        proof: null,
    });

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success(`Copied ${text} to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const extractReferenceFromString = (input: string): string | null => {
        // Matches GCash 13-digit, standard 10-12 digit ref, formatted 4-4-4, or alphanumeric transaction IDs
        const patterns = [
            /\b(100\d{10})\b/,                                // GCash 13-digit starting with 100
            /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4,5})\b/,            // Grouped 12-13 digits
            /\b(MP-?\d{6,12})\b/i,                            // Maya/Merchant payment ID
            /\b(DON-[A-Z0-9-]+)\b/i,                          // Donation ref
            /\b(PAY-[A-Z0-9]+)\b/i,                           // Payment ref
            /\b(TXN-[A-Z0-9]+)\b/i,                           // Txn ref
            /\b([0-9]{9,16})\b/,                              // Raw numeric 9-16 digits
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                return match[1].replace(/-/g, ' ').trim();
            }
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        setData('proof', file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Auto-detect transaction reference from file name if present
        const detectedFromFilename = extractReferenceFromString(file.name);
        if (detectedFromFilename && !data.payment_reference.trim()) {
            setData((prev) => ({ ...prev, payment_reference: detectedFromFilename }));
            toast.success(`Auto-detected reference #${detectedFromFilename} from receipt image!`, {
                icon: <Sparkles className="text-amber-500" size={16} />,
            });
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                const detected = extractReferenceFromString(text) || text.trim();
                setData('payment_reference', detected);
                toast.success(`Pasted reference: ${detected}`);
            } else {
                toast.info('Clipboard is empty. Copy your reference number and try again.');
            }
        } catch {
            toast.error('Unable to access clipboard. Please paste your reference manually.');
        }
    };

    const handleUploadProof = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.proof && !isProofSubmitted) {
            toast.error('Please upload a screenshot or photo of your receipt.');
            return;
        }

        if (!data.payment_reference.trim()) {
            toast.error('Please provide the transaction reference number.');
            return;
        }

        // Always scroll to top upon submission
        window.scrollTo({ top: 0, behavior: 'smooth' });

        post(`/checkout/${donation.public_reference}/proof`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Proof of payment submitted! An administrator will review and verify it.');
                reset('proof', 'payment_reference');
                setPreviewUrl(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Submission failed. Please check inputs.');
            },
        });
    };

    const handleSimulatePayment = (action: 'success' | 'fail') => {
        setIsSimulating(true);
        toast.info(action === 'success' ? 'Simulating successful gateway payment...' : 'Simulating failed gateway payment...');

        // Always scroll to top upon action
        window.scrollTo({ top: 0, behavior: 'smooth' });

        router.post(
            `/checkout/${donation.public_reference}/pay`,
            {
                action: action,
                method: selectedSimMethod,
            },
            {
                onFinish: () => {
                    setIsSimulating(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
            }
        );
    };

    const accounts = official_accounts || {
        gcash: {
            account_name: 'I.S.F',
            account_number: '093* ****547',
            user_id: '***********WEWRBP',
            qr_image: '/images/gcash-qr.jpg',
        },
        bank_transfer: {
            bank_name: 'BDO Unibank',
            account_name: 'Iligan Stray Feeders',
            account_number: '0012-3456-7890',
        },
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Checkout & Payment - ${donation.public_reference}`} />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Back Link */}
                <div>
                    <button
                        onClick={() => router.get('/donate')}
                        className="inline-flex items-center gap-2 text-sm font-black text-gray-500 hover:text-paw-orange transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Back to Donations & Giving
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[40px] shadow-2xl shadow-paw-navy/5 border border-gray-100 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto h-16 w-16 bg-paw-orange/10 rounded-full flex items-center justify-center text-paw-orange mb-3">
                            <CreditCard size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-paw-navy">Complete Your Donation</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Reference: <span className="text-paw-orange">{donation.public_reference}</span>
                        </p>
                    </div>

                    {/* Status Alert Banner */}
                    {isCompleted ? (
                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
                            <CheckCircle2 size={32} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-black text-emerald-900 text-base">Payment Completed & Verified</h4>
                                <p className="text-xs text-emerald-700 font-bold leading-relaxed mt-1">
                                    Thank you so much! Your donation has been fully recorded and sustainability impact has been updated.
                                </p>
                            </div>
                        </div>
                    ) : isProofSubmitted ? (
                        <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-6 flex items-start gap-4">
                            <Clock size={32} className="text-sky-600 shrink-0 mt-0.5 animate-pulse" />
                            <div className="space-y-1">
                                <h4 className="font-black text-sky-900 text-base">Payment Proof Submitted (Under Verification)</h4>
                                <p className="text-xs text-sky-700 font-bold leading-relaxed">
                                    Your receipt is currently being reviewed by shelter administrators. Once verified, your donation will be credited immediately.
                                </p>
                                {donation.latest_proof && (
                                    <div className="pt-2 flex items-center gap-2 text-xs text-sky-800 font-black">
                                        <FileText size={16} />
                                        <span>Uploaded: {donation.latest_proof.original_filename}</span>
                                        {donation.latest_proof.url && (
                                            <a
                                                href={donation.latest_proof.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 underline text-sky-600 hover:text-sky-800 ml-2"
                                            >
                                                View Receipt <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-start gap-4">
                            <AlertCircle size={28} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-black text-amber-900 text-sm">Payment Awaiting Verification</h4>
                                <p className="text-xs text-amber-700 font-bold leading-relaxed mt-1">
                                    Please transfer <strong>₱{Number(donation.amount).toLocaleString()}</strong> to one of our official shelter accounts below, then upload your receipt screenshot to confirm your pledge.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Donation Summary */}
                    <div className="bg-paw-bg/60 border-2 border-dashed border-gray-200 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <h3 className="font-black text-paw-navy text-lg">Pledge Summary</h3>
                            <span className="px-3 py-1 bg-paw-orange/10 text-paw-orange rounded-full text-xs font-black uppercase tracking-wider">
                                {donation.type.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-gray-400 font-bold">Donor:</span>
                            <span className="font-black text-paw-navy text-right">
                                {donation.donor_name} ({donation.donor_email})
                            </span>

                            {donation.sponsorship && (
                                <>
                                    <span className="text-gray-400 font-bold">Sponsored Date:</span>
                                    <span className="font-black text-paw-navy text-right">
                                        {donation.sponsorship.preferred_date}
                                    </span>

                                    {donation.sponsorship.occasion && (
                                        <>
                                            <span className="text-gray-400 font-bold">Occasion:</span>
                                            <span className="font-black text-paw-navy text-right">
                                                {donation.sponsorship.occasion}
                                            </span>
                                        </>
                                    )}

                                    {donation.sponsorship.poster_url && (
                                        <>
                                            <span className="text-gray-400 font-bold">Custom Poster:</span>
                                            <span className="font-black text-amber-700 text-right flex items-center justify-end gap-1">
                                                <CheckCircle2 size={13} className="text-amber-600" /> Attached
                                            </span>
                                        </>
                                    )}
                                </>
                            )}

                            <span className="text-lg font-black text-paw-navy mt-2">Total Amount:</span>
                            <span className="text-2xl font-black text-paw-orange text-right mt-1">
                                ₱{Number(donation.amount).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Official Payment Accounts Section */}
                    {!isCompleted && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-paw-navy flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-full bg-paw-navy text-white text-xs flex items-center justify-center">1</span>
                                    Transfer to Official Account
                                </h3>
                                <p className="text-xs text-gray-500 font-bold mt-1">
                                    Choose your preferred payment method and send the exact pledge amount:
                                </p>
                            </div>

                            {/* Payment channel tabs (Cash-Only: GCash and Bank Transfer only) */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePayTab('gcash');
                                        setData('payment_channel', 'gcash');
                                    }}
                                    className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 border-2 transition-all cursor-pointer ${
                                        activePayTab === 'gcash'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                                            : 'bg-gray-50 text-gray-700 border-gray-150 hover:border-blue-300'
                                    }`}
                                >
                                    <Smartphone size={18} />
                                    <span>GCash (QR & Transfer)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePayTab('bank_transfer');
                                        setData('payment_channel', 'bank_transfer');
                                    }}
                                    className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 border-2 transition-all cursor-pointer ${
                                        activePayTab === 'bank_transfer'
                                            ? 'bg-paw-navy text-white border-paw-navy shadow-lg shadow-paw-navy/25'
                                            : 'bg-gray-50 text-gray-700 border-gray-150 hover:border-paw-navy/30'
                                    }`}
                                >
                                    <Building2 size={18} />
                                    <span>Bank Transfer (BDO)</span>
                                </button>
                            </div>

                            {/* Active Tab Details */}
                            <div className="bg-gray-50/80 border-2 border-gray-200 rounded-3xl p-6 sm:p-7">
                                {activePayTab === 'gcash' && accounts.gcash && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-blue-700 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <Smartphone size={13} />
                                                Official GCash Payment Details
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">InstaPay / GCash App</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                            {/* QR Code Container */}
                                            <div className="md:col-span-5 flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                                <div className="relative group cursor-pointer" onClick={() => setShowQrModal(true)}>
                                                    <img
                                                        src={accounts.gcash.qr_image || '/images/gcash-qr.jpg'}
                                                        alt="Official GCash QR Code"
                                                        className="w-44 h-44 object-contain rounded-xl border border-gray-200 p-1.5 transition-transform group-hover:scale-[1.02]"
                                                    />
                                                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-black text-xs gap-1.5 backdrop-blur-[2px]">
                                                        <Maximize2 size={16} /> Click to Enlarge
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowQrModal(true)}
                                                    className="mt-2.5 text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <QrCode size={14} /> Tap to expand QR code
                                                </button>
                                                <span className="text-[11px] text-gray-400 font-bold mt-1">
                                                    Scan via GCash &gt; QR &gt; Scan QR Code
                                                </span>
                                            </div>

                                            {/* Account Info Details */}
                                            <div className="md:col-span-7 space-y-4">
                                                <div className="p-3.5 bg-white rounded-2xl border border-gray-150">
                                                    <div className="text-[11px] font-black uppercase text-gray-400">Account Name</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-base font-black text-paw-navy font-mono">
                                                            {accounts.gcash.account_name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(accounts.gcash!.account_name, 'gcash_name')}
                                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                            title="Copy account name"
                                                        >
                                                            {copiedKey === 'gcash_name' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 bg-white rounded-2xl border border-gray-150">
                                                    <div className="text-[11px] font-black uppercase text-gray-400">GCash Mobile No</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-base font-black text-blue-600 font-mono">
                                                            {accounts.gcash.account_number}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(accounts.gcash!.account_number, 'gcash_mobile')}
                                                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                            title="Copy mobile number"
                                                        >
                                                            {copiedKey === 'gcash_mobile' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 bg-white rounded-2xl border border-gray-150">
                                                    <div className="text-[11px] font-black uppercase text-gray-400">GCash User ID</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-sm font-black text-paw-navy font-mono tracking-wider">
                                                            {accounts.gcash.user_id || '***********WEWRBP'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(accounts.gcash?.user_id || '***********WEWRBP', 'gcash_userid')}
                                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                            title="Copy user ID"
                                                        >
                                                            {copiedKey === 'gcash_userid' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activePayTab === 'bank_transfer' && accounts.bank_transfer && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-paw-navy bg-paw-navy/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <Building2 size={13} />
                                                Official Bank Details
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{accounts.bank_transfer.bank_name || 'BDO Unibank'}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                            <div className="p-4 bg-white rounded-2xl border border-gray-150">
                                                <div className="text-[11px] font-black uppercase text-gray-400">Bank</div>
                                                <div className="text-sm font-black text-paw-navy mt-1">
                                                    {accounts.bank_transfer.bank_name || 'BDO Unibank'}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white rounded-2xl border border-gray-150">
                                                <div className="text-[11px] font-black uppercase text-gray-400">Account Name</div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-black text-paw-navy">
                                                        {accounts.bank_transfer.account_name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(accounts.bank_transfer!.account_name, 'bank_name')}
                                                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                        title="Copy account name"
                                                    >
                                                        {copiedKey === 'bank_name' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white rounded-2xl border border-gray-150">
                                                <div className="text-[11px] font-black uppercase text-gray-400">Account Number</div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-black text-paw-navy font-mono">
                                                        {accounts.bank_transfer.account_number}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(accounts.bank_transfer!.account_number, 'bank_acc')}
                                                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                        title="Copy account number"
                                                    >
                                                        {copiedKey === 'bank_acc' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 font-bold pt-1">
                                            Online banking &amp; Over-the-counter deposits to BDO Unibank are accepted. Please keep your transaction slip or screenshot.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Proof Upload Form */}
                            <form onSubmit={handleUploadProof} className="space-y-6 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="text-lg font-black text-paw-navy flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-paw-navy text-white text-xs flex items-center justify-center">2</span>
                                        {isProofSubmitted ? 'Update / Resubmit Proof of Payment' : 'Upload Proof of Payment'}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1">
                                        Submit your transaction reference number and receipt screenshot for administrator review:
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Transaction Reference with Auto-detect & Paste button */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                                                Transaction Reference / Reference No. <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handlePasteFromClipboard}
                                                className="inline-flex items-center gap-1 text-xs font-black text-paw-orange hover:text-orange-600 transition-colors cursor-pointer"
                                            >
                                                <ClipboardPaste size={13} /> Paste &amp; Auto-Detect
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.payment_reference}
                                                onChange={(e) => setData('payment_reference', e.target.value)}
                                                placeholder="e.g. 1002 9384 1029 or MP-8839210"
                                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-paw-orange focus:ring-0 font-bold text-sm text-paw-navy placeholder-gray-400 pr-10"
                                                required
                                            />
                                            {data.payment_reference && (
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_reference', '')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                                            <Sparkles size={12} className="text-amber-500" />
                                            Reference is automatically detected when you select your receipt screenshot!
                                        </p>
                                        {errors.payment_reference && (
                                            <p className="text-xs text-red-500 font-bold mt-1">{errors.payment_reference}</p>
                                        )}
                                    </div>

                                    {/* Receipt Screenshot with Instant Preview */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                            Receipt Screenshot or Photo <span className="text-red-500">*</span>
                                        </label>

                                        {previewUrl ? (
                                            /* Image Preview Card */
                                            <div className="border-2 border-paw-orange/40 bg-orange-50/20 rounded-3xl p-5 space-y-4">
                                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                                    <div
                                                        className="relative group cursor-pointer shrink-0"
                                                        onClick={() => setShowReceiptZoom(true)}
                                                    >
                                                        <img
                                                            src={previewUrl}
                                                            alt="Receipt preview"
                                                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl border-2 border-paw-orange shadow-md"
                                                        />
                                                        <div className="absolute inset-0 bg-paw-navy/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-black gap-1 backdrop-blur-[2px]">
                                                            <Maximize2 size={16} /> View
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 min-w-0 flex-1 text-center sm:text-left">
                                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                                                            <CheckCircle2 size={12} /> Receipt Attached
                                                        </div>
                                                        <p className="font-black text-paw-navy text-sm truncate">
                                                            {data.proof?.name || 'receipt-proof.jpg'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-bold">
                                                            {data.proof ? `${(data.proof.size / 1024).toFixed(1)} KB` : 'Ready to submit'}
                                                        </p>
                                                        <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowReceiptZoom(true)}
                                                                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-paw-navy hover:border-paw-orange transition-colors flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <Maximize2 size={12} /> Preview Receipt
                                                            </button>
                                                            <label
                                                                htmlFor="proof_upload_change"
                                                                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-black text-gray-700 transition-colors cursor-pointer flex items-center gap-1"
                                                            >
                                                                <ImageIcon size={12} /> Change Image
                                                            </label>
                                                            <input
                                                                type="file"
                                                                id="proof_upload_change"
                                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        handleFileSelect(e.target.files[0]);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Standard Upload Dropzone */
                                            <div className="border-2 border-dashed border-gray-300 hover:border-paw-orange rounded-3xl p-6 text-center transition-colors bg-white">
                                                <input
                                                    type="file"
                                                    id="proof_upload"
                                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleFileSelect(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    required={!isProofSubmitted}
                                                />
                                                <label htmlFor="proof_upload" className="cursor-pointer block space-y-2">
                                                    <UploadCloud size={38} className="mx-auto text-paw-orange" />
                                                    <div className="text-sm font-black text-paw-navy">
                                                        <span>{isProofSubmitted ? 'Click to browse a new receipt screenshot (optional if keeping existing image)' : 'Click to browse or drop your payment receipt screenshot here'}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold">
                                                        Supported formats: JPEG, PNG, WEBP (Max 5MB)
                                                    </p>
                                                </label>
                                            </div>
                                        )}

                                        {errors.proof && (
                                            <p className="text-xs text-red-500 font-bold mt-1">{errors.proof}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 px-6 rounded-2xl bg-paw-orange hover:bg-orange-600 text-white font-black text-base shadow-xl shadow-paw-orange/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <UploadCloud size={20} />
                                        {processing ? 'Submitting Receipt...' : isProofSubmitted ? (data.proof ? 'Replace Proof of Payment' : 'Update Reference Number') : 'Submit Proof of Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Developer Sandbox / Simulation Section */}
                    {simulation_enabled && !isCompleted && (
                        <div className="mt-8 pt-8 border-t-2 border-dashed border-amber-200 space-y-6">
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={26} className="text-amber-600 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-amber-950 text-sm">Developer Sandbox / Payment Simulation</h4>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-800">
                                                Sandbox Enabled
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-800 font-bold leading-relaxed mt-1">
                                            Payment simulation is currently enabled in System Settings. You can test instant gateway responses without making a real money transfer.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-amber-900 uppercase tracking-wider">
                                        Select Simulated Channel
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'gcash', name: 'GCash', icon: <Smartphone size={16} /> },
                                            { id: 'bank_transfer', name: 'BDO Bank Transfer', icon: <Building2 size={16} /> },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectedSimMethod(m.id)}
                                                disabled={isSimulating}
                                                className={`flex items-center justify-center gap-2 py-2.5 px-3 border-2 rounded-xl text-xs font-black transition-all ${
                                                    selectedSimMethod === m.id
                                                        ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                                                        : 'bg-white text-amber-900 border-amber-200 hover:border-amber-400'
                                                }`}
                                            >
                                                {m.icon}
                                                {m.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSimulatePayment('fail')}
                                            disabled={isSimulating}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 py-3 px-4 rounded-xl font-black text-sm border border-red-300 transition-colors cursor-pointer"
                                        >
                                            <XCircle size={18} />
                                            Simulate Failure
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSimulatePayment('success')}
                                            disabled={isSimulating}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                                        >
                                            <CheckCircle2 size={18} />
                                            Simulate Success
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Integration Notice */}
                <div className="text-center text-xs text-gray-400 font-bold">
                    PAWLSE Secure Stray Care System &bull; Production Gateway Webhook endpoint ready at{' '}
                    <code className="text-paw-navy bg-white px-2 py-0.5 rounded border border-gray-200">/webhooks/payment</code>
                </div>
            </div>

            {/* QR Code Lightbox Modal */}
            {showQrModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-full transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="pt-2">
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                                Official GCash QR
                            </span>
                            <h3 className="text-lg font-black text-paw-navy mt-2">Scan with GCash App</h3>
                            <p className="text-xs text-gray-500 font-bold">
                                Point camera or upload QR in GCash to transfer directly.
                            </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 inline-block mx-auto">
                            <img
                                src={accounts.gcash?.qr_image || '/images/gcash-qr.jpg'}
                                alt="Official GCash QR Code"
                                className="w-64 h-64 object-contain mx-auto rounded-xl"
                            />
                        </div>

                        <div className="text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1">
                            <div>Account: <strong className="text-paw-navy">{accounts.gcash?.account_name}</strong></div>
                            <div>Mobile: <strong className="text-blue-600 font-mono">{accounts.gcash?.account_number}</strong></div>
                            <div>User ID: <strong className="text-gray-800 font-mono">{accounts.gcash?.user_id || '***********WEWRBP'}</strong></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowQrModal(false)}
                            className="w-full py-3 bg-paw-navy text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-paw-orange transition-colors cursor-pointer"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Receipt Preview Lightbox Modal */}
            {showReceiptZoom && (previewUrl || donation.latest_proof?.url) && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-white rounded-3xl p-6 max-w-xl w-full text-center space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                            <div className="text-left">
                                <h3 className="text-base font-black text-paw-navy">Receipt Screenshot Preview</h3>
                                <p className="text-xs text-gray-500 font-bold">
                                    {data.proof?.name || donation.latest_proof?.original_filename || 'Uploaded Proof'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReceiptZoom(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-900 flex items-center justify-center p-2">
                            <img
                                src={previewUrl || donation.latest_proof?.url}
                                alt="Receipt full preview"
                                className="max-h-[60vh] max-w-full object-contain rounded-xl"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-mono font-bold text-gray-500">
                                Ref: {data.payment_reference || 'Not provided yet'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowReceiptZoom(false)}
                                className="px-5 py-2.5 bg-paw-navy text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-paw-orange transition-colors cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
