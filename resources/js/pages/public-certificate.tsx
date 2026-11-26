import { Head, Link } from '@inertiajs/react';
import { Download, Printer, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import {
    CertificateCanvas,
    type CertificateData,
    downloadCertificatePng,
} from '@/components/certificate-canvas';

interface PublicCertificateProps {
    certificate: CertificateData;
}

export default function PublicCertificate({ certificate }: PublicCertificateProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (isDownloading) {
            return;
        }

        setIsDownloading(true);

        try {
            await downloadCertificatePng(certificate, 'Participant', 'Participant');
        } catch {
            // Keep UI responsive if template fails to load
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#070e1c] text-[#0B2340] dark:text-white flex flex-col justify-between py-6 px-3 sm:px-6">
            <Head title={`Official Certificate — ${certificate.certificate_number}`} />

            {/* Print isolation styles */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #printable-certificate-wrapper,
                    #printable-certificate-wrapper * {
                        visibility: visible !important;
                    }
                    #printable-certificate-wrapper {
                        position: fixed !important;
                        inset: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        z-index: 999999 !important;
                    }
                    #printable-certificate-canvas {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        max-height: 100vh !important;
                        aspect-ratio: 1492 / 1054 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        margin: auto !important;
                    }
                }
            `}</style>

            {/* Top Navigation & Action Bar */}
            <header className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-fredoka text-2xl font-bold tracking-tight text-[#0B2340] dark:text-white">
                        PAW<span className="text-paw-orange">LSE</span>
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified Certificate
                    </span>
                </Link>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleDownloadPng}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-paw-navy hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                        <Download size={14} />
                        {isDownloading ? 'Generating...' : 'Download PNG'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-orange-500/20"
                    >
                        <Printer size={14} />
                        Print / Save PDF
                    </button>
                </div>
            </header>

            {/* Main Certificate View Canvas */}
            <main className="max-w-5xl mx-auto w-full flex flex-col items-center">
                <div id="printable-certificate-wrapper" className="w-full flex items-center justify-center p-0 print:p-0">
                    <CertificateCanvas
                        certificate={certificate}
                        fallbackName="Participant"
                        fallbackRole="Participant"
                        className="max-w-[960px] shadow-2xl rounded-2xl border border-gray-200/60 dark:border-slate-800"
                    />
                </div>

                <div className="mt-6 text-center text-xs text-gray-500 font-semibold print:hidden">
                    <p>Official Verification Reference: <strong className="font-mono text-paw-orange">{certificate.certificate_number}</strong></p>
                    <p className="mt-1 text-[11px] text-gray-400">Issued by Iligan Stray Feeders via the PAWLSE Animal Welfare Platform.</p>
                </div>
            </main>

            <footer className="max-w-5xl mx-auto w-full text-center text-[11px] text-gray-400 font-medium py-4 print:hidden">
                &copy; {new Date().getFullYear()} PAWLSE • Iligan Stray Feeders. All rights reserved.
            </footer>
        </div>
    );
}
