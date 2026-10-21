import { Award, Calendar, Download, Printer, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

interface CertificateModel {
    id: number;
    title: string;
    description: string | null;
    issue_date: string;
    certificate_number: string;
    role?: string | null;
    guest_name?: string | null;
    guest_email?: string | null;
    user?: {
        name: string;
    } | null;
    event?: {
        id: number;
        title: string;
        date?: string;
        location?: string;
    } | null;
}

interface PublicCertificateProps {
    certificate: CertificateModel;
}

const parseLocalDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const formatEventDate = (dateStr?: string | null, fallbackDateStr?: string | null) => {
    const d = parseLocalDate(dateStr) || parseLocalDate(fallbackDateStr) || new Date();
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatIssueDate = (dateStr?: string | null) => {
    const d = parseLocalDate(dateStr) || new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function PublicCertificate({ certificate }: PublicCertificateProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const recipientName = (certificate.user?.name || certificate.guest_name || 'Participant').toUpperCase();
    const roleLabel = certificate.role || 'Participant';

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (isDownloading) return;
        setIsDownloading(true);

        try {
            if (document.fonts) {
                await document.fonts.ready;
            }

            const img = new Image();
            img.src = '/images/resources/certificate_template.jpg';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1492;
                canvas.height = 1054;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsDownloading(false);
                    return;
                }

                ctx.drawImage(img, 0, 0, 1492, 1054);

                // 1. Recipient Full Name
                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#0B2340';
                let nameFontSize = 36;
                ctx.font = `bold ${nameFontSize}px "Fredoka", "Playfair Display", Georgia, serif`;
                while (ctx.measureText(recipientName).width > 720 && nameFontSize > 18) {
                    nameFontSize -= 2;
                    ctx.font = `bold ${nameFontSize}px "Fredoka", "Playfair Display", Georgia, serif`;
                }
                ctx.fillText(recipientName, 1492 * 0.545, 1054 * 0.575);

                // 2. Role Slot
                ctx.fillStyle = '#FF750F';
                const roleText = roleLabel.toUpperCase();
                let roleFontSize = 14;
                ctx.font = `bold ${roleFontSize}px system-ui, -apple-system, sans-serif`;
                while (ctx.measureText(roleText).width > 185 && roleFontSize > 9) {
                    roleFontSize -= 1;
                    ctx.font = `bold ${roleFontSize}px system-ui, -apple-system, sans-serif`;
                }
                ctx.fillText(roleText, 1492 * 0.37, 1054 * 0.655);

                // 3. Event / Activity Title
                const eventTitle = certificate.event?.title || certificate.title || 'Community Stray Feeding Outreach';
                let eventFontSize = 14;
                ctx.font = `bold ${eventFontSize}px system-ui, -apple-system, sans-serif`;
                while (ctx.measureText(eventTitle).width > 460 && eventFontSize > 10) {
                    eventFontSize -= 1;
                    ctx.font = `bold ${eventFontSize}px system-ui, -apple-system, sans-serif`;
                }
                ctx.fillText(eventTitle, 1492 * 0.649, 1054 * 0.655);

                // 4. Event Date
                ctx.fillStyle = '#0B2340';
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
                const eventDate = formatEventDate(certificate.event?.date, certificate.issue_date);
                ctx.fillText(eventDate, 1492 * 0.418, 1054 * 0.785);

                // 5. Event Location
                const eventLoc = certificate.event?.location || 'Iligan City, Philippines';
                let locFontSize = 14;
                ctx.font = `bold ${locFontSize}px system-ui, -apple-system, sans-serif`;
                while (ctx.measureText(eventLoc).width > 240 && locFontSize > 9) {
                    locFontSize -= 1;
                    ctx.font = `bold ${locFontSize}px system-ui, -apple-system, sans-serif`;
                }
                ctx.fillText(eventLoc, 1492 * 0.68, 1054 * 0.785);

                // 6. Signatory 1
                ctx.font = 'italic bold 20px Georgia, serif';
                ctx.fillStyle = '#0B2340';
                ctx.fillText('M. Santos', 1492 * 0.39, 1054 * 0.842);

                // 7. Signatory 2
                ctx.fillText('ISF Operations', 1492 * 0.675, 1054 * 0.842);

                // 8. Date Issued
                ctx.font = 'bold 13px ui-monospace, monospace';
                ctx.fillStyle = '#633306';
                ctx.fillText(formatIssueDate(certificate.issue_date), 1492 * 0.895, 1054 * 0.855);

                // 9. Certificate ID
                ctx.font = 'bold 12px ui-monospace, monospace';
                ctx.fillText(certificate.certificate_number, 1492 * 0.895, 1054 * 0.925);

                const link = document.createElement('a');
                link.download = `${certificate.certificate_number || 'Certificate'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsDownloading(false);
            };
            img.onerror = () => {
                setIsDownloading(false);
            };
        } catch {
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
                    <div id="printable-certificate-canvas" className="relative w-full aspect-[1492/1054] max-w-[960px] bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none select-none border border-gray-200/60 dark:border-slate-800">
                        <img
                            src="/images/resources/certificate_template.jpg"
                            alt="Certificate of Participation Template"
                            className="w-full h-full block object-cover pointer-events-none"
                        />

                        {/* 1. Recipient Full Name */}
                        <div
                            className="absolute flex items-end justify-center pointer-events-none text-center"
                            style={{
                                top: '52.5%',
                                left: '30%',
                                width: '49%',
                                height: '5.8%',
                            }}
                        >
                            <span className="font-serif font-black tracking-wide text-[#0B2340] text-[clamp(12px,2vw,28px)] uppercase leading-none drop-shadow-sm truncate max-w-full px-2">
                                {recipientName}
                            </span>
                        </div>

                        {/* 2. Role Slot */}
                        <div
                            className="absolute flex items-center justify-center pointer-events-none text-center px-1"
                            style={{
                                top: '62.6%',
                                left: '30.2%',
                                width: '13.8%',
                                height: '4.7%',
                            }}
                        >
                            <span className="font-sans font-black text-paw-orange text-[clamp(8px,1.05vw,14px)] uppercase tracking-tight truncate">
                                {roleLabel}
                            </span>
                        </div>

                        {/* 3. Event / Program Title */}
                        <div
                            className="absolute flex items-center justify-center pointer-events-none text-center px-2"
                            style={{
                                top: '62.6%',
                                left: '48.7%',
                                width: '32.4%',
                                height: '4.7%',
                            }}
                        >
                            <span className="font-sans font-black text-paw-orange text-[clamp(8px,1.05vw,14px)] tracking-tight truncate">
                                {certificate.event?.title || certificate.title || 'Community Stray Feeding Outreach'}
                            </span>
                        </div>

                        {/* 4. Event Date */}
                        <div
                            className="absolute flex items-end justify-center pointer-events-none text-center"
                            style={{
                                top: '75.2%',
                                left: '34.2%',
                                width: '15.2%',
                                height: '4.0%',
                            }}
                        >
                            <span className="font-sans font-bold text-[#0B2340] text-[clamp(7px,0.95vw,13px)] tracking-wide">
                                {formatEventDate(certificate.event?.date || certificate.issue_date)}
                            </span>
                        </div>

                        {/* 5. Event Location */}
                        <div
                            className="absolute flex items-end justify-center pointer-events-none text-center px-1"
                            style={{
                                top: '75.2%',
                                left: '59.6%',
                                width: '17.2%',
                                height: '4.0%',
                            }}
                        >
                            <span className="font-sans font-bold text-[#0B2340] text-[clamp(7px,0.95vw,13px)] tracking-wide truncate">
                                {certificate.event?.location || 'Iligan City, Philippines'}
                            </span>
                        </div>

                        {/* 6. Signatory 1 */}
                        <div
                            className="absolute flex items-end justify-center pointer-events-none text-center"
                            style={{
                                top: '80.5%',
                                left: '30.8%',
                                width: '16.5%',
                                height: '4.3%',
                            }}
                        >
                            <span className="font-serif italic font-bold text-[#0B2340]/90 text-[clamp(9px,1.15vw,16px)] tracking-wider">
                                M. Santos
                            </span>
                        </div>

                        {/* 7. Signatory 2 */}
                        <div
                            className="absolute flex items-end justify-center pointer-events-none text-center"
                            style={{
                                top: '80.5%',
                                left: '58.3%',
                                width: '18.5%',
                                height: '4.3%',
                            }}
                        >
                            <span className="font-serif italic font-bold text-[#0B2340]/90 text-[clamp(9px,1.15vw,16px)] tracking-wider">
                                ISF Operations
                            </span>
                        </div>

                        {/* 8. Date Issued */}
                        <div
                            className="absolute flex items-center justify-center pointer-events-none text-center"
                            style={{
                                top: '83.2%',
                                left: '82.8%',
                                width: '13.5%',
                                height: '3.6%',
                            }}
                        >
                            <span className="font-mono font-black text-[#633306] text-[clamp(7px,0.9vw,12px)] tracking-wide">
                                {formatIssueDate(certificate.issue_date)}
                            </span>
                        </div>

                        {/* 9. Certificate ID */}
                        <div
                            className="absolute flex items-center justify-center pointer-events-none text-center"
                            style={{
                                top: '90.2%',
                                left: '82.8%',
                                width: '13.5%',
                                height: '3.6%',
                            }}
                        >
                            <span className="font-mono font-black text-[#633306] text-[clamp(6px,0.8vw,11px)] tracking-wider">
                                {certificate.certificate_number}
                            </span>
                        </div>
                    </div>
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
