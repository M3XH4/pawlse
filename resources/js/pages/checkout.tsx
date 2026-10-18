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
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface OfficialAccount {
    account_name: string;
    account_number: string;
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
        maya?: OfficialAccount;
        bank_transfer?: OfficialAccount;
    };
}

export default function Checkout({ donation, simulation_enabled = false, official_accounts }: CheckoutProps) {
    const [selectedSimMethod, setSelectedSimMethod] = useState<string>(donation.payment?.method || 'gcash');
    const [isSimulating, setIsSimulating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activePayTab, setActivePayTab] = useState<'gcash' | 'maya' | 'bank_transfer'>('gcash');

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

    const handleUploadProof = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.proof) {
            toast.error('Please upload a screenshot or photo of your receipt.');
            return;
        }

        if (!data.payment_reference.trim()) {
            toast.error('Please provide the transaction reference number.');
            return;
        }

        post(`/checkout/${donation.public_reference}/proof`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Proof of payment submitted! An administrator will review and verify it.');
                reset('proof', 'payment_reference');
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

        router.post(
            `/checkout/${donation.public_reference}/pay`,
            {
                action: action,
                method: selectedSimMethod,
            },
            {
                onFinish: () => {
                    setIsSimulating(false);
                },
            }
        );
    };

    const accounts = official_accounts || {
        gcash: {
            account_name: 'PAWLSE Stray Care Initiative',
            account_number: '0917-888-PAWL',
            qr_image: null,
        },
        maya: {
            account_name: 'PAWLSE Stray Care Initiative',
            account_number: '0918-999-PAWL',
            qr_image: null,
        },
        bank_transfer: {
            account_name: 'PAWLSE Community Pet Care',
            bank_name: 'Bank of the Philippine Islands (BPI)',
            account_number: '1234-5678-90',
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

                            {/* Payment channel tabs */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePayTab('gcash');
                                        setData('payment_channel', 'gcash');
                                    }}
                                    className={`py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                                        activePayTab === 'gcash'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                            : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-blue-200'
                                    }`}
                                >
                                    <Smartphone size={16} />
                                    GCash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePayTab('maya');
                                        setData('payment_channel', 'maya');
                                    }}
                                    className={`py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                                        activePayTab === 'maya'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                                            : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-emerald-200'
                                    }`}
                                >
                                    <Wallet size={16} />
                                    Maya
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePayTab('bank_transfer');
                                        setData('payment_channel', 'bank_transfer');
                                    }}
                                    className={`py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                                        activePayTab === 'bank_transfer'
                                            ? 'bg-paw-navy text-white border-paw-navy shadow-md shadow-paw-navy/20'
                                            : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-paw-navy/20'
                                    }`}
                                >
                                    <Building2 size={16} />
                                    Bank Transfer
                                </button>
                            </div>

                            {/* Active Tab Details */}
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-6">
                                {activePayTab === 'gcash' && accounts.gcash && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                                Official GCash Details
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">InstaPay / GCash App</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">Account Name</div>
                                                <div className="text-sm font-black text-paw-navy mt-0.5">{accounts.gcash.account_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">GCash Mobile Number</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-base font-black text-blue-600 font-mono">{accounts.gcash.account_number}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(accounts.gcash!.account_number, 'gcash')}
                                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                        title="Copy number"
                                                    >
                                                        {copiedKey === 'gcash' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activePayTab === 'maya' && accounts.maya && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                                                Official Maya Details
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">InstaPay / Maya App</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">Account Name</div>
                                                <div className="text-sm font-black text-paw-navy mt-0.5">{accounts.maya.account_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">Maya Mobile Number</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-base font-black text-emerald-600 font-mono">{accounts.maya.account_number}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(accounts.maya!.account_number, 'maya')}
                                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                                                        title="Copy number"
                                                    >
                                                        {copiedKey === 'maya' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activePayTab === 'bank_transfer' && accounts.bank_transfer && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-paw-navy bg-paw-navy/10 px-3 py-1 rounded-full">
                                                Official Bank Details
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{accounts.bank_transfer.bank_name || 'Direct Deposit'}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">Account Name</div>
                                                <div className="text-sm font-black text-paw-navy mt-0.5">{accounts.bank_transfer.account_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold">Account Number</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-base font-black text-paw-navy font-mono">{accounts.bank_transfer.account_number}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(accounts.bank_transfer!.account_number, 'bank')}
                                                        className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                                                        title="Copy account number"
                                                    >
                                                        {copiedKey === 'bank' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                            Transaction Reference / Reference No. <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.payment_reference}
                                            onChange={(e) => setData('payment_reference', e.target.value)}
                                            placeholder="e.g. 1002 9384 1029 or MP-8839210"
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-paw-orange focus:ring-0 font-bold text-sm text-paw-navy placeholder-gray-400"
                                            required
                                        />
                                        {errors.payment_reference && (
                                            <p className="text-xs text-red-500 font-bold mt-1">{errors.payment_reference}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                            Receipt Screenshot or Photo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 hover:border-paw-orange rounded-3xl p-6 text-center transition-colors">
                                            <input
                                                type="file"
                                                id="proof_upload"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setData('proof', e.target.files[0]);
                                                    }
                                                }}
                                                className="hidden"
                                                required={!isProofSubmitted}
                                            />
                                            <label htmlFor="proof_upload" className="cursor-pointer block space-y-2">
                                                <UploadCloud size={36} className="mx-auto text-gray-400" />
                                                <div className="text-sm font-black text-paw-navy">
                                                    {data.proof ? (
                                                        <span className="text-paw-orange">{data.proof.name}</span>
                                                    ) : (
                                                        <span>Click to browse or drop receipt image here</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold">
                                                    Supported formats: JPEG, PNG, WEBP (Max 5MB)
                                                </p>
                                            </label>
                                        </div>
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
                                        {processing ? 'Submitting Receipt...' : isProofSubmitted ? 'Replace Proof of Payment' : 'Submit Proof of Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Developer Sandbox / Simulation Section (Option 2) */}
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
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: 'gcash', name: 'GCash', icon: <Wallet size={16} /> },
                                            { id: 'maya', name: 'Maya', icon: <Wallet size={16} /> },
                                            { id: 'bank_transfer', name: 'Card', icon: <CreditCard size={16} /> },
                                            { id: 'paypal', name: 'PayPal', icon: <CreditCard size={16} /> },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectedSimMethod(m.id)}
                                                disabled={isSimulating}
                                                className={`flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-xl text-xs font-black transition-all ${
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
        </div>
    );
}
