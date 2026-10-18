import { Award, Calendar, Eye, Download, Printer, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface CertificateModel {
    id: number;
    title: string;
    description: string | null;
    issue_date: string;
    certificate_number: string;
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

interface CertificatesProps {
    certificates: {
        data: CertificateModel[];
        links: any[];
        total: number;
    };
    defaultRole?: string;
    auth?: {
        user?: any;
    };
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

export default function VolunteerCertificates({ certificates, defaultRole, auth }: CertificatesProps) {
    const user = auth?.user;
    const certs = certificates?.data || [];
    const [viewingCert, setViewingCert] = useState<CertificateModel | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (!viewingCert || isDownloading) return;
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

                // Draw base template
                ctx.drawImage(img, 0, 0, 1492, 1054);

                // 1. Recipient Full Name (auto-scale font for long names)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#0B2340';
                const recipientName = (viewingCert.user?.name || user?.name || 'Volunteer').toUpperCase();
                let nameFontSize = 36;
                ctx.font = `bold ${nameFontSize}px "Fredoka", "Playfair Display", Georgia, serif`;
                while (ctx.measureText(recipientName).width > 720 && nameFontSize > 18) {
                    nameFontSize -= 2;
                    ctx.font = `bold ${nameFontSize}px "Fredoka", "Playfair Display", Georgia, serif`;
                }
                ctx.fillText(recipientName, 1492 * 0.545, 1054 * 0.575);

                // 2. Role Slot
                ctx.fillStyle = '#FF750F';
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
                ctx.fillText((defaultRole || 'Volunteer').toUpperCase(), 1492 * 0.38, 1054 * 0.63);

                // 3. Event / Activity Title (auto-scale font for long titles)
                const eventTitle = viewingCert.event?.title || viewingCert.title || 'Community Stray Feeding Outreach';
                let eventFontSize = 14;
                ctx.font = `bold ${eventFontSize}px system-ui, -apple-system, sans-serif`;
                while (ctx.measureText(eventTitle).width > 440 && eventFontSize > 10) {
                    eventFontSize -= 1;
                    ctx.font = `bold ${eventFontSize}px system-ui, -apple-system, sans-serif`;
                }
                ctx.fillText(eventTitle, 1492 * 0.64, 1054 * 0.63);

                // 4. Event Date
                ctx.fillStyle = '#0B2340';
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
                const eventDate = formatEventDate(viewingCert.event?.date, viewingCert.issue_date);
                ctx.fillText(eventDate, 1492 * 0.418, 1054 * 0.785);

                // 5. Event Location (auto-scale font)
                const eventLoc = viewingCert.event?.location || 'Iligan City, Philippines';
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
                ctx.fillText(formatIssueDate(viewingCert.issue_date), 1492 * 0.895, 1054 * 0.855);

                // 9. Certificate ID
                ctx.font = 'bold 12px ui-monospace, monospace';
                ctx.fillText(viewingCert.certificate_number, 1492 * 0.895, 1054 * 0.925);

                // Trigger file download
                const link = document.createElement('a');
                link.download = `${viewingCert.certificate_number || 'Certificate'}.png`;
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
        <DashboardSectionPage
            title="Certificates & Recognition"
            description="Access and download your official PAWLSE volunteer recognition certificates."
            badge={<DashboardMetricBadge icon={<Award className="h-4 w-4" />} label={`${certificates?.total || 0} Certificates`} />}
        >
            {certs.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <Award className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">No certificates have been issued to you yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Certificates are issued by administrators after successfully completing scheduled events.</p>
                </DashboardCard>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {certs.map((cert) => (
                        <DashboardCard key={cert.id} className="p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-paw-orange">
                                        <Award className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <h3 className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                            {cert.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-bold">Ref: {cert.certificate_number}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 font-bold mb-4 line-clamp-2">
                                    {cert.description || `In recognition of dedicated volunteer service at ${cert.event?.title || 'ISF Activities'}.`}
                                </p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {cert.issue_date}
                                </span>
                                <button
                                    onClick={() => setViewingCert(cert)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                                >
                                    <Eye size={14} />
                                    View Certificate
                                </button>
                            </div>
                        </DashboardCard>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {certificates?.links && certificates.links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {certificates.links.map((link, idx) => {
                        if (link.url === null) return (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                        );
                        return (
                            <Link
                                key={idx}
                                href={link.url}
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    link.active ? 'bg-paw-orange text-white' : 'bg-white text-paw-navy hover:bg-paw-orange/10 border'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Certificate Print/View Modal Overlay */}
            {viewingCert && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md print:fixed print:inset-0 print:p-0 print:bg-white print:z-[9999]">
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[96vh]">
                        {/* Header bar - hidden in print */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-slate-850/80 print:hidden">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-paw-orange" />
                                <span className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                    Official Certificate of Participation
                                </span>
                                <span className="text-xs bg-orange-100 dark:bg-orange-950/40 text-paw-orange px-2 py-0.5 rounded-md font-mono font-bold">
                                    {viewingCert.certificate_number}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPng}
                                    disabled={isDownloading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-navy hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    <Download size={15} />
                                    {isDownloading ? 'Generating...' : 'Download Image'}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange hover:bg-orange-650 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-orange-500/20"
                                >
                                    <Printer size={15} />
                                    Print / Save PDF
                                </button>
                                <button
                                    onClick={() => setViewingCert(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

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

                        {/* Scrollable area for certificate canvas */}
                        <div id="printable-certificate-wrapper" className="p-3 sm:p-6 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-slate-950/50 print:p-0 print:bg-white">
                            {/* Certificate Canvas: 1492x1054 aspect ratio */}
                            <div id="printable-certificate-canvas" className="relative w-full aspect-[1492/1054] max-w-[1000px] bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:rounded-none select-none">
                                {/* Base Certificate Template Image */}
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
                                        {viewingCert.user?.name || user?.name || 'Volunteer Name'}
                                    </span>
                                </div>

                                {/* 2. Role Slot in middle paragraph (after 'as a') */}
                                <div
                                    className="absolute flex items-center justify-center pointer-events-none text-center"
                                    style={{
                                        top: '60.5%',
                                        left: '32.6%',
                                        width: '10.5%',
                                        height: '3.3%',
                                    }}
                                >
                                    <span className="font-sans font-black text-paw-orange text-[clamp(8px,1.05vw,14px)] uppercase tracking-tight truncate">
                                        {defaultRole || 'Volunteer'}
                                    </span>
                                </div>

                                {/* 3. Event / Program Title in middle paragraph (after 'in the') */}
                                <div
                                    className="absolute flex items-center justify-center pointer-events-none text-center px-1"
                                    style={{
                                        top: '60.5%',
                                        left: '48.6%',
                                        width: '30.5%',
                                        height: '3.3%',
                                    }}
                                >
                                    <span className="font-sans font-black text-paw-orange text-[clamp(8px,1.05vw,14px)] tracking-tight truncate">
                                        {viewingCert.event?.title || viewingCert.title || 'Community Stray Feeding Outreach'}
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
                                        {formatEventDate(viewingCert.event?.date || viewingCert.issue_date)}
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
                                        {viewingCert.event?.location || 'Iligan City, Philippines'}
                                    </span>
                                </div>

                                {/* 6. Signatory 1 (Founder / President) */}
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

                                {/* 7. Signatory 2 (Coordinator) */}
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

                                {/* 8. Date Issued (Bottom Right Capsule 1) */}
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
                                        {formatIssueDate(viewingCert.issue_date)}
                                    </span>
                                </div>

                                {/* 9. Certificate ID (Bottom Right Capsule 2) */}
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
                                        {viewingCert.certificate_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
