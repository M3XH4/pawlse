import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Heart, CreditCard, ShieldAlert, ArrowLeft, CheckCircle2, XCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';

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
    };
}

export default function Checkout({ donation }: CheckoutProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>(donation.payment?.method || 'gcash');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSimulatePayment = (action: 'success' | 'fail') => {
        setIsProcessing(true);
        toast.info(action === 'success' ? 'Simulating successful payment...' : 'Simulating failed payment...');

        router.post(`/checkout/${donation.public_reference}/pay`, {
            action: action,
            method: selectedMethod
        }, {
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-paw-bg font-quicksand flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Secure Payment Gateway Simulator" />

            <div className="max-w-2xl w-full space-y-8 bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-paw-navy/5 border border-gray-100">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-paw-orange/10 rounded-full flex items-center justify-center text-paw-orange mb-4">
                        <CreditCard size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-paw-navy">Simulated Payment Gateway</h2>
                    <p className="mt-2 text-sm text-gray-500 font-bold uppercase tracking-wider">
                        PAWLSE Secure Sandbox Environment
                    </p>
                </div>

                {/* Sandbox Alert */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-start gap-4">
                    <ShieldAlert size={28} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-black text-amber-900 text-sm">Demo Sandbox Mode</h4>
                        <p className="text-xs text-amber-700 font-bold leading-relaxed mt-1">
                            This checkout simulates a real-time gateway callback. No actual money will be charged.
                            Choose a payment channel below and simulate the result.
                        </p>
                    </div>
                </div>

                {/* Donation details */}
                <div className="bg-paw-bg/50 border-2 border-dashed border-gray-200 rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-paw-navy text-lg border-b pb-2">Donation Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-gray-400 font-bold">Reference:</span>
                        <span className="font-black text-paw-navy text-right">{donation.public_reference}</span>

                        <span className="text-gray-400 font-bold">Donor:</span>
                        <span className="font-black text-paw-navy text-right">{donation.donor_name} ({donation.donor_email})</span>

                        <span className="text-gray-400 font-bold">Type:</span>
                        <span className="font-black text-paw-orange text-right capitalize">
                            {donation.type.replace('_', ' ')}
                        </span>

                        {donation.sponsorship && (
                            <>
                                <span className="text-gray-400 font-bold">Sponsor Date:</span>
                                <span className="font-black text-paw-navy text-right">{donation.sponsorship.preferred_date}</span>
                            </>
                        )}

                        <span className="text-lg font-black text-paw-navy mt-2">Amount to Pay:</span>
                        <span className="text-2xl font-black text-paw-orange text-right mt-1">
                            ₱{Number(donation.amount).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Method selector */}
                <div className="space-y-4">
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">
                        Select Simulated Channel
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'gcash', name: 'GCash', icon: <Wallet size={20} /> },
                            { id: 'maya', name: 'Maya', icon: <Wallet size={20} /> },
                            { id: 'bank_transfer', name: 'Card', icon: <CreditCard size={20} /> },
                            { id: 'paypal', name: 'PayPal', icon: <CreditCard size={20} /> }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMethod(m.id)}
                                disabled={isProcessing}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all gap-2 font-black text-xs ${
                                    selectedMethod === m.id
                                        ? 'bg-paw-navy text-white border-paw-navy shadow-lg shadow-paw-navy/20'
                                        : 'bg-gray-50 text-gray-600 border-transparent hover:border-paw-navy/20'
                                }`}
                            >
                                {m.icon}
                                {m.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={() => handleSimulatePayment('fail')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-3 bg-red-50 text-red-700 hover:bg-red-100 py-4 px-6 rounded-2xl font-black text-lg border-2 border-red-200 transition-colors cursor-pointer"
                    >
                        <XCircle size={22} />
                        Simulate Failure
                    </button>
                    <button
                        onClick={() => handleSimulatePayment('success')}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-3 bg-green-500 text-white hover:bg-green-600 py-4 px-6 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all cursor-pointer"
                    >
                        <CheckCircle2 size={22} />
                        Simulate Success
                    </button>
                </div>

                <div className="text-center pt-2">
                    <button
                        onClick={() => router.get('/donate')}
                        className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-paw-orange transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Cancel & Return
                    </button>
                </div>
            </div>
        </div>
    );
}
