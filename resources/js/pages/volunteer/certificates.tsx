import { Link, router } from '@inertiajs/react';
import { Award, Calendar, Eye, Download, Printer, X } from 'lucide-react';
import React, { useState } from 'react';
import {
    CertificateCanvas,
    type CertificateData as CertificateModel,
    CertificateFilterBar,
    type CertificateFilterOptions,
    type CertificateFilters,
    downloadCertificatePng,
    formatCertificateDateTime,
} from '@/components/certificate-canvas';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface CertificatesProps {
    certificates: {
        data: CertificateModel[];
        links: any[];
        total: number;
    };
    filters?: CertificateFilters;
    filterOptions?: CertificateFilterOptions;
    defaultRole?: string;
    auth?: {
        user?: any;
    };
}

export default function VolunteerCertificates({
    certificates,
    filters,
    filterOptions,
    defaultRole,
    auth,
}: CertificatesProps) {
    const user = auth?.user;
    const certs = certificates?.data || [];
    const [viewingCert, setViewingCert] = useState<CertificateModel | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    const [yearFilter, setYearFilter] = useState(filters?.year || '');
    const [sortOrder, setSortOrder] = useState(filters?.sort || 'latest');

    const applyFilters = (next: Partial<{ search: string; role: string; year: string; sort: string }>) => {
        const params = {
            search: next.search ?? searchQuery,
            role: next.role ?? roleFilter,
            year: next.year ?? yearFilter,
            sort: next.sort ?? sortOrder,
        };

        router.get(
            '/account/volunteer/certificates',
            {
                ...(params.search.trim() ? { search: params.search.trim() } : {}),
                ...(params.role ? { role: params.role } : {}),
                ...(params.year ? { year: params.year } : {}),
                ...(params.sort && params.sort !== 'latest' ? { sort: params.sort } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setRoleFilter('');
        setYearFilter('');
        setSortOrder('latest');
        router.get('/account/volunteer/certificates', {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(filters?.search || filters?.role || filters?.year || (filters?.sort && filters.sort !== 'latest'));

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (!viewingCert || isDownloading) {
            return;
        }

        setIsDownloading(true);

        try {
            await downloadCertificatePng(
                viewingCert,
                user?.name || 'Volunteer',
                defaultRole || 'Volunteer',
            );
        } catch {
            // Keep UI responsive if template fails to load
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <DashboardSectionPage
            title="Certificates & Recognition"
            description="Access and download your official PAWLSE volunteer recognition certificates."
            badge={<DashboardMetricBadge icon={<Award className="h-4 w-4" />} label={`${certificates?.total || 0} Certificates`} />}
        >
            {(certs.length > 0 || hasActiveFilters) && (
                <CertificateFilterBar
                    search={searchQuery}
                    role={roleFilter}
                    year={yearFilter}
                    sort={sortOrder}
                    roles={filterOptions?.roles || []}
                    years={filterOptions?.years || []}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={() => applyFilters({})}
                    onRoleChange={(val) => {
                        setRoleFilter(val);
                        applyFilters({ role: val });
                    }}
                    onYearChange={(val) => {
                        setYearFilter(val);
                        applyFilters({ year: val });
                    }}
                    onSortChange={(val) => {
                        setSortOrder(val);
                        applyFilters({ sort: val });
                    }}
                    onReset={handleResetFilters}
                />
            )}

            {certs.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <Award className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">
                        {hasActiveFilters ? 'No certificates matched your filters.' : 'No certificates have been issued to you yet.'}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">Certificates are issued by administrators after successfully completing scheduled events.</p>
                    )}
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
                            <div className="flex items-center justify-between gap-2 pt-3.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-400 flex items-center gap-1 min-w-0 truncate">
                                    <Calendar size={13} className="shrink-0" />
                                    <span className="truncate">{formatCertificateDateTime(cert)}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setViewingCert(cert)}
                                    className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <Eye size={13} className="shrink-0" />
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
                        if (link.url === null) {
return (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                        );
}

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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-slate-900/80 print:hidden">
                            <div className="flex items-start justify-between gap-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                    <Award className="h-5 w-5 text-paw-orange shrink-0" />
                                    <span className="font-fredoka text-sm sm:text-base font-bold text-[#0B2340] dark:text-white leading-tight">
                                        Official Certificate of Participation
                                    </span>
                                    <span className="text-[11px] sm:text-xs bg-orange-100 dark:bg-orange-950/40 text-paw-orange px-2 py-0.5 rounded-md font-mono font-bold whitespace-nowrap">
                                        {viewingCert.certificate_number}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewingCert(null)}
                                    aria-label="Close certificate modal"
                                    className="sm:hidden p-1.5 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer shrink-0"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleDownloadPng}
                                    disabled={isDownloading}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 bg-paw-navy hover:bg-slate-800 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap"
                                >
                                    <Download size={14} className="shrink-0" />
                                    {isDownloading ? 'Generating...' : 'Download Image'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 bg-paw-orange hover:bg-orange-650 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-orange-500/20 whitespace-nowrap"
                                >
                                    <Printer size={14} className="shrink-0" />
                                    Print / Save PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewingCert(null)}
                                    aria-label="Close certificate modal"
                                    className="hidden sm:inline-flex p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer shrink-0"
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
                            <CertificateCanvas
                                certificate={viewingCert}
                                fallbackName={user?.name || 'Volunteer Name'}
                                fallbackRole={defaultRole || 'Volunteer'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
