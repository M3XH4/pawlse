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
        title: string;
    } | null;
}

interface CertificatesProps {
    certificates: {
        data: CertificateModel[];
        links: any[];
        total: number;
    };
    auth?: {
        user?: any;
    };
}

export default function VolunteerCertificates({ certificates, auth }: CertificatesProps) {
    const user = auth?.user;
    const certs = certificates?.data || [];
    const [viewingCert, setViewingCert] = useState<CertificateModel | null>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardSectionPage
            title="Certificates & Recognition"
            description="Access your PAWLSE volunteer certificates"
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
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:bg-white print:p-0">
                    <div className="relative bg-white dark:bg-slate-900 border-8 border-double border-orange-200 dark:border-orange-900 w-full max-w-4xl p-12 text-center rounded-[32px] shadow-2xl overflow-y-auto print:border-none print:shadow-none print:p-0 max-h-[90vh]">
                        {/* Close button - hidden in print */}
                        <button
                            onClick={() => setViewingCert(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full cursor-pointer print:hidden"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center justify-center">
                            <Award size={64} className="text-paw-orange mb-4" />
                            <h1 className="text-4xl font-fredoka font-black text-paw-navy dark:text-orange-100 uppercase tracking-widest mb-2">Certificate of Recognition</h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">Iligan Stray Feeders (ISF) Organization</p>

                            <p className="text-sm font-semibold italic text-gray-400 mb-2">This certificate is proudly presented to</p>
                            <h2 className="text-3xl font-fredoka font-black text-paw-orange mb-6 underline decoration-double decoration-paw-yellow">{user?.name}</h2>

                            <p className="text-base font-bold text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-8">
                                {viewingCert.description || `For exemplary and invaluable support as a volunteer. Your dedication and effort during our operations have contributed greatly to feeding, treating, and saving the stray animals in Iligan City.`}
                            </p>

                            <p className="text-sm font-bold text-paw-navy dark:text-orange-200 mb-10">
                                Activity: <span className="text-paw-orange font-black">{viewingCert.event?.title || viewingCert.title}</span>
                            </p>

                            <div className="w-full grid grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-800 pt-8 mt-4 text-left">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Certificate Number</p>
                                    <p className="font-bold text-sm text-[#0B2340] dark:text-white">{viewingCert.certificate_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Issue Date</p>
                                    <p className="font-bold text-sm text-[#0B2340] dark:text-white">{viewingCert.issue_date}</p>
                                </div>
                            </div>

                            {/* Action Buttons - hidden in print */}
                            <div className="flex justify-end gap-3 w-full mt-10 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-5 py-3 bg-paw-navy text-white hover:bg-slate-800 rounded-xl text-sm font-black uppercase tracking-widest cursor-pointer"
                                >
                                    <Printer size={16} />
                                    Print Certificate
                                </button>
                                <button
                                    onClick={() => setViewingCert(null)}
                                    className="px-5 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
