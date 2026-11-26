import { Search, X } from 'lucide-react';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { VolunteerFilterBar, type VolunteerFilterSelect } from '@/components/volunteer/volunteer-filter-bar';

export interface CertificateFilters {
    search?: string;
    role?: string;
    year?: string;
    sort?: string;
}

export interface CertificateFilterOptions {
    roles: string[];
    years: string[];
}

export interface CertificateData {
    id: number;
    title: string;
    description: string | null;
    issue_date: string;
    certificate_number: string;
    role?: string | null;
    guest_name?: string | null;
    guest_email?: string | null;
    created_at?: string;
    updated_at?: string;
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

export const parseLocalDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) {
        return null;
    }

    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }

    const d = new Date(dateStr);

    return isNaN(d.getTime()) ? null : d;
};

export const formatEventDate = (dateStr?: string | null, fallbackDateStr?: string | null) => {
    const d = parseLocalDate(dateStr) || parseLocalDate(fallbackDateStr) || new Date();

    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const formatIssueDate = (dateStr?: string | null) => {
    const d = parseLocalDate(dateStr) || new Date();

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatCertificateDateTime = (cert: CertificateData) => {
    if (cert.created_at) {
        const d = new Date(cert.created_at);

        if (!isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            const timeStr = d.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });

            return `${dateStr} • ${timeStr}`;
        }
    }

    if (cert.issue_date) {
        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(cert.issue_date) || /T00:00:00(\.0+)?Z?$/i.test(cert.issue_date);

        if (!isDateOnly) {
            const d = new Date(cert.issue_date);

            if (!isNaN(d.getTime())) {
                const dateStr = d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
                const timeStr = d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

                return `${dateStr} • ${timeStr}`;
            }
        }
    }

    return formatIssueDate(cert.issue_date);
};

interface AutoFitTextProps {
    children: string;
    className?: string;
    minFontSize?: number;
}

function AutoFitText({ children, className = '', minFontSize = 5 }: AutoFitTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const fitText = useCallback(() => {
        const container = containerRef.current;
        const textEl = textRef.current;

        if (!container || !textEl) {
            return;
        }

        // Reset inline font-size so CSS clamp(...) sets the starting size for the current viewport.
        textEl.style.fontSize = '';

        const style = window.getComputedStyle(container);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const availableWidth = container.clientWidth - paddingX;

        if (availableWidth <= 0) {
            return;
        }

        let currentSize = parseFloat(window.getComputedStyle(textEl).fontSize);

        while (textEl.scrollWidth > availableWidth && currentSize > minFontSize) {
            currentSize = Math.max(minFontSize, currentSize - 0.5);
            textEl.style.fontSize = `${currentSize}px`;
        }
    }, [minFontSize]);

    useLayoutEffect(() => {
        fitText();

        let active = true;

        if (document.fonts) {
            document.fonts.ready.then(() => {
                if (active) {
                    fitText();
                }
            });
        }

        const container = containerRef.current;

        if (!container || typeof ResizeObserver === 'undefined') {
            return () => {
                active = false;
            };
        }

        const observer = new ResizeObserver(() => {
            fitText();
        });
        observer.observe(container);

        return () => {
            active = false;
            observer.disconnect();
        };
    }, [children, fitText]);

    return (
        <div ref={containerRef} className="w-full flex items-center justify-center px-1.5">
            <span ref={textRef} className={`whitespace-nowrap ${className}`}>
                {children}
            </span>
        </div>
    );
}

interface CertificateCanvasProps {
    certificate: CertificateData;
    fallbackName?: string;
    fallbackRole?: string;
    className?: string;
}

export function CertificateCanvas({
    certificate,
    fallbackName = 'Participant',
    fallbackRole = 'Participant',
    className = 'max-w-[1000px] shadow-xl rounded-xl',
}: CertificateCanvasProps) {
    const recipientName = (certificate.user?.name || certificate.guest_name || fallbackName).toUpperCase();
    const roleLabel = certificate.role || fallbackRole;
    const eventTitle = certificate.event?.title || certificate.title || 'Community Stray Feeding Outreach';
    const eventDate = formatEventDate(certificate.event?.date, certificate.issue_date);
    const eventLocation = certificate.event?.location || 'Iligan City, Philippines';
    const issueDate = formatIssueDate(certificate.issue_date);

    return (
        <div
            id="printable-certificate-canvas"
            className={`relative w-full aspect-[1492/1054] bg-white overflow-hidden print:shadow-none print:rounded-none select-none ${className}`}
        >
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
                    left: '31.1%',
                    width: '48.9%',
                    height: '5.8%',
                }}
            >
                <AutoFitText
                    minFontSize={10}
                    className="font-serif font-black tracking-wide text-[#0B2340] text-[clamp(12px,2vw,28px)] uppercase leading-none drop-shadow-sm"
                >
                    {recipientName}
                </AutoFitText>
            </div>

            {/* 2. Role Slot (inside first tan pill) */}
            <div
                className="absolute flex items-center justify-center pointer-events-none text-center"
                style={{
                    top: '64.0%',
                    left: '25.9%',
                    width: '17.9%',
                    height: '3.1%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-sans font-black text-black text-[clamp(7px,0.9vw,13px)] uppercase tracking-tight leading-none"
                >
                    {roleLabel}
                </AutoFitText>
            </div>

            {/* 3. Event / Program Title (inside second tan pill) */}
            <div
                className="absolute flex items-center justify-center pointer-events-none text-center"
                style={{
                    top: '64.0%',
                    left: '48.9%',
                    width: '32.0%',
                    height: '3.1%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-sans font-black text-black text-[clamp(7px,0.9vw,13px)] tracking-tight leading-none"
                >
                    {eventTitle}
                </AutoFitText>
            </div>

            {/* 4. Event Date */}
            <div
                className="absolute flex items-end justify-center pointer-events-none text-center"
                style={{
                    top: '76.0%',
                    left: '34.4%',
                    width: '14.9%',
                    height: '4.0%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-sans font-bold text-[#0B2340] text-[clamp(6px,0.8vw,11px)] tracking-wide"
                >
                    {eventDate}
                </AutoFitText>
            </div>

            {/* 5. Event Location */}
            <div
                className="absolute flex items-end justify-center pointer-events-none text-center"
                style={{
                    top: '76.0%',
                    left: '59.6%',
                    width: '16.8%',
                    height: '4.0%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-sans font-bold text-[#0B2340] text-[clamp(6px,0.8vw,11px)] tracking-wide"
                >
                    {eventLocation}
                </AutoFitText>
            </div>

            {/* 6. Signatory 1 */}
            <div
                className="absolute flex items-end justify-center pointer-events-none text-center"
                style={{
                    top: '80.5%',
                    left: '31.0%',
                    width: '15.9%',
                    height: '4.3%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-serif italic font-bold text-[#0B2340]/90 text-[clamp(7px,0.9vw,13px)] tracking-wide"
                >
                    Trusty Espinosa
                </AutoFitText>
            </div>

            {/* 7. Signatory 2 */}
            <div
                className="absolute flex items-end justify-center pointer-events-none text-center"
                style={{
                    top: '80.5%',
                    left: '58.7%',
                    width: '16.4%',
                    height: '4.3%',
                }}
            >
                <AutoFitText
                    minFontSize={5}
                    className="font-serif italic font-bold text-[#0B2340]/90 text-[clamp(7px,0.9vw,13px)] tracking-wide"
                >
                    ISF Operations
                </AutoFitText>
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
                <AutoFitText
                    minFontSize={5}
                    className="font-mono font-black text-[#633306] text-[clamp(7px,0.9vw,12px)] tracking-wide"
                >
                    {issueDate}
                </AutoFitText>
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
                <AutoFitText
                    minFontSize={5}
                    className="font-mono font-black text-[#633306] text-[clamp(6px,0.8vw,11px)] tracking-wider"
                >
                    {certificate.certificate_number}
                </AutoFitText>
            </div>
        </div>
    );
}

const fitCanvasFont = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    startSize: number,
    minSize: number,
    buildFont: (size: number) => string,
) => {
    let size = startSize;
    ctx.font = buildFont(size);

    while (ctx.measureText(text).width > maxWidth && size > minSize) {
        size -= 0.5;
        ctx.font = buildFont(size);
    }
};

export async function downloadCertificatePng(
    certificate: CertificateData,
    fallbackName = 'Participant',
    fallbackRole = 'Participant',
): Promise<void> {
    if (document.fonts) {
        await document.fonts.ready;
    }

    await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = '/images/resources/certificate_template.jpg';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1492;
            canvas.height = 1054;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve();

                return;
            }

            ctx.drawImage(img, 0, 0, 1492, 1054);

            // 1. Recipient Full Name
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#0B2340';
            const recipientName = (certificate.user?.name || certificate.guest_name || fallbackName).toUpperCase();
            fitCanvasFont(
                ctx,
                recipientName,
                710,
                36,
                14,
                (s) => `bold ${s}px "Fredoka", "Playfair Display", Georgia, serif`,
            );
            ctx.fillText(recipientName, 1492 * 0.555, 1054 * 0.575);

            // 2. Role Slot (centered in first tan pill)
            ctx.fillStyle = '#FF750F';
            ctx.textBaseline = 'middle';
            const roleText = (certificate.role || fallbackRole).toUpperCase();
            fitCanvasFont(
                ctx,
                roleText,
                245,
                14,
                6,
                (s) => `bold ${s}px system-ui, -apple-system, sans-serif`,
            );
            ctx.fillText(roleText, 1492 * 0.348, 1054 * 0.656);

            // 3. Event / Activity Title (centered in second tan pill)
            const eventTitle = certificate.event?.title || certificate.title || 'Community Stray Feeding Outreach';
            fitCanvasFont(
                ctx,
                eventTitle,
                450,
                14,
                6,
                (s) => `bold ${s}px system-ui, -apple-system, sans-serif`,
            );
            ctx.fillText(eventTitle, 1492 * 0.649, 1054 * 0.656);

            // 4. Event Date
            ctx.fillStyle = '#0B2340';
            ctx.textBaseline = 'alphabetic';
            const eventDate = formatEventDate(certificate.event?.date, certificate.issue_date);
            fitCanvasFont(
                ctx,
                eventDate,
                210,
                15,
                7,
                (s) => `bold ${s}px system-ui, -apple-system, sans-serif`,
            );
            ctx.fillText(eventDate, 1492 * 0.419, 1054 * 0.785);

            // 5. Event Location
            const eventLoc = certificate.event?.location || 'Iligan City, Philippines';
            fitCanvasFont(
                ctx,
                eventLoc,
                235,
                14,
                6,
                (s) => `bold ${s}px system-ui, -apple-system, sans-serif`,
            );
            ctx.fillText(eventLoc, 1492 * 0.68, 1054 * 0.785);

            // 6. Signatory 1
            ctx.font = 'italic bold 20px Georgia, serif';
            ctx.fillStyle = '#0B2340';
            ctx.fillText('M. Santos', 1492 * 0.39, 1054 * 0.842);

            // 7. Signatory 2
            ctx.fillText('ISF Operations', 1492 * 0.669, 1054 * 0.842);

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
            resolve();
        };
        img.onerror = () => {
            reject(new Error('Failed to load certificate template image.'));
        };
    });
}

interface CertificateFilterBarProps {
    search: string;
    role: string;
    year: string;
    sort: string;
    roles: string[];
    years: string[];
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    onRoleChange: (value: string) => void;
    onYearChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onReset: () => void;
}

export function CertificateFilterBar({
    search,
    role,
    year,
    sort,
    roles,
    years,
    onSearchChange,
    onSearchSubmit,
    onRoleChange,
    onYearChange,
    onSortChange,
    onReset,
}: CertificateFilterBarProps) {
    const hasActiveFilters = Boolean(search.trim() || role || year || sort === 'oldest');

    const selects: VolunteerFilterSelect[] = [];

    if (roles.length > 0) {
        selects.push({
            value: role,
            onChange: onRoleChange,
            ariaLabel: 'Filter by role',
            defaultLabel: 'All Roles',
            options: roles.map((r) => ({ value: r, label: r })),
        });
    }

    if (years.length > 0) {
        selects.push({
            value: year,
            onChange: onYearChange,
            ariaLabel: 'Filter by year',
            defaultLabel: 'All Years',
            options: years.map((y) => ({ value: y, label: y })),
        });
    }

    return (
        <VolunteerFilterBar
            search={search}
            searchPlaceholder="Search by title, certificate ID, role, or event..."
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
            selects={selects}
            sort={sort}
            onSortChange={onSortChange}
            hasActiveFilters={hasActiveFilters}
            onReset={onReset}
        />
    );
}
