import { Link, Head, router } from '@inertiajs/react';
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
import { DashboardPagination } from '@/components/dashboard/pagination';
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

export default function UserCertificates({
    certificates,
    filters,
    filterOptions,
    defaultRole = 'Participant',
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
            '/account/user/certificates',
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
        router.get('/account/user/certificates', {}, { preserveState: true, preserveScroll: true });
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
                user?.name || 'Participant',
                defaultRole || 'Participant',
            );
        } catch {
            // Keep UI responsive if template fails to load
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <DashboardSectionPage
            title="My Certificates"
            description="View and download your official certificates of participation for PAWLSE community events."
            badge={<DashboardMetricBadge icon={<Award className="h-4 w-4" />} label={`${certificates?.total || 0} Certificates`} />}
        >
            <Head title="My Certificates" />

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
                <DashboardCard className="p-10 text-center text-gray-500 font-bold">
                    <Award className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={54} />
                    <p className="text-base font-fredoka font-bold text-[#0B2340] dark:text-white">
                        {hasActiveFilters ? 'No matching certificates found' : 'No certificates issued yet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                        {hasActiveFilters
                            ? 'No certificates matched your current search or filter selection.'
                            : 'Join our upcoming community feeding routes, adoption drives, and awareness campaigns. After attending an event, our shelter administrators will verify your participation and issue your official Certificate of Participation.'}
                    </p>
                    <div className="mt-5">
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        ) : (
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-paw-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                                Browse Community Events
                            </Link>
                        )}
                    </div>
                </DashboardCard>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {certs.map((cert) => (
                        <DashboardCard key={cert.id} className="p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-paw-orange">
                                        <Award className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <h3 className="font-fredoka text-base font-bold text-[#0B2340] dark:text-white">
                                            {cert.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400 font-bold">Ref: {cert.certificate_number}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-paw-orange text-[10px] font-black uppercase">
                                                {cert.role || 'Participant'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4 line-clamp-2">
                                    {cert.description || `In recognition of dedicated community participation at ${cert.event?.title || 'ISF Activities'}.`}
                                </p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatCertificateDateTime(cert)}
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

            <DashboardPagination
                links={certificates?.links}
                total={certificates?.total}
                count={certificates?.data?.length}
                itemName="certificates"
                className="mt-6 rounded-2xl border border-gray-100 dark:border-slate-800"
            />

            {/* Certificate Print/View Modal Overlay */}
            {viewingCert && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md print:fixed print:inset-0 print:p-0 print:bg-white print:z-[9999]">
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[96vh]">
                        {/* Header bar - hidden in print */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-slate-900/80 print:hidden">
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
                            <CertificateCanvas
                                certificate={viewingCert}
                                fallbackName={user?.name || 'Participant Name'}
                                fallbackRole={defaultRole || 'Participant'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
