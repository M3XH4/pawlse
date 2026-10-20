import { CheckCircle2, X, Printer, Mail, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface SubmissionReceiptProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    referenceNumber?: string;
    items: {
        label: string;
        value: string;
        icon?: React.ReactNode;
    }[];
    type?: 'success' | 'info' | 'warning';
    footerMessage?: string;
    highlightLabel?: string;
    highlightValue?: string;
    donorName?: string;
    donorEmail?: string;
    paymentMethod?: string;
    purpose?: string;
    issuedAt?: string;
}

export function SubmissionReceipt({
    isOpen,
    onClose,
    title,
    subtitle,
    referenceNumber,
    items,
    type = 'success',
    footerMessage,
    highlightLabel,
    highlightValue,
    donorName,
    donorEmail,
    paymentMethod,
    purpose,
    issuedAt,
}: SubmissionReceiptProps) {
    // eslint-disable-next-line curly
    if (!isOpen) return null;

    const cleanItems = items.map((item) => {
        let val = item.value;
        if (React.isValidElement(item.value)) {
            val = item.label === 'Status' ? 'Completed & Verified' : 'Verified';
        }
        return {
            label: item.label,
            value: String(val),
            icon: item.icon,
        };
    });

    const findItemValue = (keywords: string[]) => {
        const match = cleanItems.find((i) =>
            keywords.some((k) => i.label.toLowerCase().includes(k.toLowerCase())),
        );
        return match?.value;
    };

    const resolvedHighlightValue =
        highlightValue ||
        findItemValue(['amount', 'value', 'total', 'contribution', 'role']) ||
        'VERIFIED';
    const resolvedHighlightLabel =
        highlightLabel ||
        (findItemValue(['amount', 'value', 'total'])
            ? 'Total Contributed'
            : findItemValue(['role'])
              ? 'Registered Role'
              : 'Receipt Status');

    const resolvedSupporter =
        donorName ||
        findItemValue(['donor', 'applicant', 'name', 'supporter', 'received from']) ||
        'Valued Supporter';
    const resolvedEmail = donorEmail || findItemValue(['email']);
    const resolvedMethod =
        paymentMethod || findItemValue(['method', 'channel', 'type']) || 'PAWLSE Official Portal';
    const resolvedPurpose =
        purpose ||
        findItemValue(['purpose', 'supplies', 'description']) ||
        'Veterinary care, rescue operations, and stray feeding support in Iligan City.';
    const resolvedStatus = findItemValue(['status']) || 'CONFIRMED & COMPLETED';

    const now = new Date();
    const formattedDate =
        issuedAt ||
        now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const bannerStyles = {
        success: {
            gradient: 'from-emerald-600 via-green-600 to-teal-500',
            accentBorder: 'border-emerald-500',
            badgeText: 'text-emerald-700',
            badgeBg: 'bg-emerald-50 border-emerald-200',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
            printHeaderGradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #22c55e 100%)',
            printAccent: '#16a34a',
        },
        info: {
            gradient: 'from-sky-600 via-sky-500 to-blue-500',
            accentBorder: 'border-sky-500',
            badgeText: 'text-sky-700',
            badgeBg: 'bg-sky-50 border-sky-200',
            buttonBg: 'bg-sky-600 hover:bg-sky-700',
            printHeaderGradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%)',
            printAccent: '#0284c7',
        },
        warning: {
            gradient: 'from-amber-500 via-orange-500 to-orange-600',
            accentBorder: 'border-paw-orange',
            badgeText: 'text-amber-700',
            badgeBg: 'bg-amber-50 border-amber-200',
            buttonBg: 'bg-paw-orange hover:bg-orange-600',
            printHeaderGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 60%, #fbbf24 100%)',
            printAccent: '#f59e0b',
        },
    };

    const theme = bannerStyles[type];
    const logoUrl = `${window.location.origin}/images/logo.png`;

    const handlePrintPdf = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up blocker is enabled. Please allow pop-ups to print the receipt.');
            return;
        }

        const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAWLSE Official E-Receipt - ${referenceNumber || 'Receipt'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: #f1f5f9;
              margin: 0;
              padding: 32px 16px;
              color: #1f2937;
            }
            .receipt-shell {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 26px;
              overflow: hidden;
              border: 1px solid #e2e8f0;
              box-shadow: 0 22px 48px -12px rgba(15, 23, 42, 0.14);
            }
            .hero {
              background: ${theme.printHeaderGradient};
              padding: 28px 32px;
              color: #ffffff;
            }
            .hero-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 18px;
            }
            .hero-pill {
              background: rgba(255, 255, 255, 0.22);
              border: 1px solid rgba(255, 255, 255, 0.38);
              border-radius: 9999px;
              padding: 4px 12px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .brand-box {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .brand-box img {
              width: 44px;
              height: 44px;
              border-radius: 9999px;
              border: 2px solid #ffffff;
              object-fit: cover;
            }
            .hero-main {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
            }
            .hero-title {
              font-family: 'Fredoka', sans-serif;
              font-size: 26px;
              font-weight: 700;
              margin: 0 0 8px 0;
              line-height: 1.2;
            }
            .hero-meta {
              font-size: 12px;
              font-weight: 700;
              opacity: 0.92;
            }
            .hero-emblem {
              width: 72px;
              height: 72px;
              border-radius: 9999px;
              border: 3px solid #ffffff;
              object-fit: cover;
              box-shadow: 0 8px 20px rgba(0,0,0,0.18);
            }
            .highlight-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px 32px;
              background: #fffbeb;
              border-bottom: 3px solid ${theme.printAccent};
            }
            .org-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 32px;
              border-bottom: 1px solid #f1f5f9;
            }
            .org-left {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .org-left img {
              width: 42px;
              height: 42px;
              border-radius: 9999px;
              border: 2px solid #fbbf24;
              object-fit: cover;
            }
            .section {
              padding: 20px 32px;
              border-bottom: 1px solid #f1f5f9;
            }
            .section-title {
              font-family: 'Fredoka', sans-serif;
              font-size: 16px;
              font-weight: 700;
              margin: 0 0 12px 0;
              color: #1f2937;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 9px 0;
              border-bottom: 1px dashed #e2e8f0;
              font-size: 13px;
            }
            .row:last-child { border-bottom: none; }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .route-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 16px;
            }
            .footer-dark {
              background: #1f2937;
              color: #cbd5e1;
              padding: 22px 32px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            @media print {
              body { background: #ffffff; padding: 0; }
              .receipt-shell { box-shadow: none; border: 1.5px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-shell">
            <div class="hero">
              <div class="hero-top">
                <span class="hero-pill">${subtitle || 'PAWLSE Official E-Receipt'}</span>
                <div class="brand-box">
                  <div style="text-align: right;">
                    <div style="font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; line-height: 1;">PAWLSE</div>
                    <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">Iligan Stray Feeders</div>
                  </div>
                  <img src="${logoUrl}" alt="Iligan Stray Feeders Logo" />
                </div>
              </div>
              <div class="hero-main">
                <div>
                  <h1 class="hero-title">${title}</h1>
                  <div class="hero-meta">${formattedDate}<br/>Receipt ID: ${referenceNumber || 'PAWLSE-OR'}</div>
                </div>
                <img class="hero-emblem" src="${logoUrl}" alt="ISF Emblem" />
              </div>
            </div>

            <div class="highlight-bar">
              <div>
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;">${resolvedHighlightLabel}</div>
                <div style="font-size: 12px; font-weight: 700; color: #475569; margin-top: 2px;">Status: ${resolvedStatus}</div>
              </div>
              <div style="font-family: 'Fredoka', sans-serif; font-size: 26px; font-weight: 700; color: #1f2937;">
                ${resolvedHighlightValue}
              </div>
            </div>

            <div class="org-row">
              <div class="org-left">
                <img src="${logoUrl}" alt="ISF Logo" />
                <div>
                  <div style="font-size: 13.5px; font-weight: 800; color: #1f2937;">Iligan Stray Feeders Shelter</div>
                  <div style="font-size: 11.5px; font-weight: 700; color: #f59e0b;">5.0 &#9733;&#9733;&#9733;&#9733;&#9733; &bull; Verified Welfare Impact</div>
                </div>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #15803d; background: #dcfce7; padding: 5px 12px; border-radius: 9999px;">
                ${resolvedStatus}
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Breakdown</h3>
              ${cleanItems
                  .map(
                      (item) => `
                <div class="row">
                  <span style="font-weight: 600; color: #475569;">${item.label}</span>
                  <span style="font-weight: 800; color: #1f2937;">${item.value}</span>
                </div>
              `,
                  )
                  .join('')}
            </div>

            <div class="section">
              <div class="grid-2">
                <div>
                  <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Supporter / Applicant</div>
                  <div style="font-size: 14px; font-weight: 800; color: #1f2937; margin-top: 4px;">${resolvedSupporter}</div>
                  ${resolvedEmail ? `<div style="font-size: 11.5px; font-weight: 600; color: #64748b; margin-top: 2px;">${resolvedEmail}</div>` : ''}
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Processed Via</div>
                  <div style="font-size: 14px; font-weight: 800; color: #1f2937; margin-top: 4px;">${resolvedMethod}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #16a34a; margin-top: 2px;">PAWLSE Transparency Ledger</div>
                </div>
              </div>
            </div>

            ${
                footerMessage
                    ? `<div class="section"><div style="padding: 12px 14px; background: #fffbeb; border: 1px dashed #fcd34d; border-radius: 12px; font-size: 12px; font-weight: 700; color: #92400e; text-align: center;">${footerMessage}</div></div>`
                    : ''
            }

            <div class="footer-dark">
              <div>
                <div style="font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; color: #ffffff;">PAWLSE &bull; Iligan Stray Feeders</div>
                <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-top: 2px;">Zone 5, Barangay Tambo, Iligan City, 9200 &bull; Official Computer-Generated Receipt</div>
              </div>
              <img src="${logoUrl}" alt="ISF Logo" style="width: 38px; height: 38px; border-radius: 9999px; border: 1.5px solid #f59e0b;" />
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.94, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 20 }}
                className="scrollbar-thin max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hero Banner (Grab E-Receipt Reference Style) */}
                <div className={`relative bg-gradient-to-br ${theme.gradient} px-7 py-6 text-white`}>
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/20 px-3.5 py-1 text-[11px] font-black tracking-widest text-white uppercase">
                            <ShieldCheck size={13} />
                            {subtitle || 'PAWLSE Official E-Receipt'}
                        </span>

                        <div className="flex items-center gap-2.5">
                            <div className="text-right">
                                <p className="text-base leading-none font-black tracking-wide text-white">
                                    PAWLSE
                                </p>
                                <p className="text-[9px] font-extrabold tracking-widest text-white/90 uppercase">
                                    Iligan Stray Feeders
                                </p>
                            </div>
                            <img
                                src="/images/logo.png"
                                alt="Iligan Stray Feeders Logo"
                                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md"
                            />
                            <button
                                onClick={onClose}
                                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/35 cursor-pointer"
                                aria-label="Close receipt"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-2xl leading-tight font-black tracking-tight text-white md:text-3xl">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-xs font-bold text-white/90">
                                {formattedDate}
                            </p>
                            {referenceNumber && (
                                <p className="mt-0.5 font-mono text-xs font-black tracking-wider text-white/95">
                                    Receipt ID: {referenceNumber}
                                </p>
                            )}
                        </div>
                        <div className="shrink-0">
                            <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-md">
                                <img
                                    src="/images/logo.png"
                                    alt="Iligan Stray Feeders Emblem"
                                    className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prominent Highlight Bar */}
                <div
                    className={`flex items-center justify-between border-b-4 ${theme.accentBorder} bg-amber-50/70 px-7 py-4`}
                >
                    <div>
                        <p className="text-[11px] font-black tracking-widest text-slate-500 uppercase">
                            {resolvedHighlightLabel}
                        </p>
                        <p className="text-xs font-bold text-slate-600">
                            Official PAWLSE Acknowledgment
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black tracking-tight text-paw-navy">
                            {resolvedHighlightValue}
                        </p>
                    </div>
                </div>

                {/* Organization Acknowledgment Row */}
                <div className="flex items-center justify-between border-b border-slate-100 px-7 py-3.5">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Iligan Stray Feeders"
                            className="h-10 w-10 rounded-full border-2 border-amber-400 object-cover"
                        />
                        <div>
                            <p className="text-xs font-black text-paw-navy">
                                Iligan Stray Feeders Shelter
                            </p>
                            <p className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                                <span>5.0</span>
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span className="text-slate-400">&bull; Verified Welfare Partner</span>
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black tracking-wider uppercase ${theme.badgeBg} ${theme.badgeText}`}
                    >
                        <CheckCircle2 size={12} />
                        {resolvedStatus}
                    </span>
                </div>

                {/* Breakdown Section */}
                <div className="border-b border-slate-100 px-7 py-5">
                    <h4 className="mb-3 text-xs font-black tracking-widest text-slate-400 uppercase">
                        Breakdown
                    </h4>
                    <div className="divide-y divide-dashed divide-slate-200">
                        {cleanItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-4 py-2.5 text-sm"
                            >
                                <span className="flex items-center gap-2 font-bold text-slate-500">
                                    {item.icon && (
                                        <span className="text-paw-navy/70">{item.icon}</span>
                                    )}
                                    {item.label}
                                </span>
                                <span className="text-right font-black text-paw-navy">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2-Column Metadata (Supporter & Channel) */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-slate-50/60 px-7 py-4">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Supporter / Applicant
                        </p>
                        <p className="mt-0.5 text-sm font-black text-paw-navy">
                            {resolvedSupporter}
                        </p>
                        {resolvedEmail && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Mail size={11} className="text-paw-orange" />
                                <span className="truncate">{resolvedEmail}</span>
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Processed Via
                        </p>
                        <p className="mt-0.5 text-sm font-black text-paw-navy">
                            {resolvedMethod}
                        </p>
                        <p className="mt-0.5 text-[11px] font-extrabold text-emerald-600">
                            PAWLSE Transparency Ledger
                        </p>
                    </div>
                </div>

                {/* Notice / Footer Message */}
                {footerMessage && (
                    <div className="px-7 py-5">
                        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-3.5 text-center">
                            <p className="text-xs font-bold text-amber-900">{footerMessage}</p>
                        </div>
                    </div>
                )}

                {/* Dark Paw-Navy Footer & Action Buttons */}
                <div className="bg-paw-navy px-7 py-5 text-white">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-700 pb-3.5">
                        <div>
                            <p className="text-xs font-black text-white">
                                PAWLSE &bull; Iligan Stray Feeders
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400">
                                Zone 5, Barangay Tambo, Iligan City, 9200 &bull; Feed Furr A Cause
                            </p>
                        </div>
                        <img
                            src="/images/logo.png"
                            alt="ISF Logo"
                            className="h-9 w-9 rounded-full border border-paw-orange object-cover"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePrintPdf}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-xs font-black tracking-widest text-white uppercase transition-colors hover:bg-slate-700"
                        >
                            <Printer size={16} />
                            Print / Save PDF
                        </button>
                        <button
                            onClick={onClose}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl ${theme.buttonBg} py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all`}
                        >
                            <CheckCircle2 size={16} />
                            Done
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
