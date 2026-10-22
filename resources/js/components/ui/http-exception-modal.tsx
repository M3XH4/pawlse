import React, { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    X,
    ExternalLink,
    RefreshCw,
    Terminal,
    Copy,
    Check,
    ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface HttpExceptionDetails {
    status: number;
    statusText?: string;
    data?: unknown;
    url?: string;
    timestamp: string;
}

/**
 * Extract a friendly brief title from HTML response (like Ignition's <title> or exception name)
 */
function extractBriefErrorMessage(data: unknown): string | null {
    if (typeof data !== 'string') return null;

    // Check for title tag (e.g. <title>Illuminate\Database\QueryException...</title>)
    const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        const clean = titleMatch[1].replace(/PAWLSE\s*[-|]\s*/i, '').trim();
        if (clean.length > 0 && clean.length < 120) {
            return clean;
        }
    }

    // Check for first h1 or h2
    const headingMatch = data.match(/<(?:h1|h2)[^>]*>([^<]+)<\/(?:h1|h2)>/i);
    if (headingMatch && headingMatch[1]) {
        const clean = headingMatch[1].trim();
        if (clean.length > 0 && clean.length < 120) {
            return clean;
        }
    }

    return null;
}

export function HttpExceptionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [errorInfo, setErrorInfo] = useState<HttpExceptionDetails | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Intercept Inertia's default development error modal
        const removeHttpExceptionListener = router.on('httpException', (event) => {
            // Prevent Inertia from rendering its full-screen raw iframe dialog
            event.preventDefault();

            const response = (event as unknown as { detail?: { response?: { status?: number; data?: unknown; statusText?: string; url?: string } } })
                ?.detail?.response;

            const status = response?.status || 500;
            const data = response?.data;
            const statusText = response?.statusText || (status === 500 ? 'Internal Server Error' : `HTTP ${status}`);
            const url = response?.url || (typeof window !== 'undefined' ? window.location.href : '');

            setErrorInfo({
                status,
                statusText,
                data,
                url,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            });
            setIsOpen(true);
        });

        // Also allow manual dispatch for custom API errors or test triggers
        const handleCustomError = (e: Event) => {
            const customEvent = e as CustomEvent<HttpExceptionDetails>;
            if (customEvent.detail) {
                setErrorInfo(customEvent.detail);
                setIsOpen(true);
            }
        };

        window.addEventListener('pawlse:http-exception', handleCustomError);

        return () => {
            removeHttpExceptionListener();
            window.removeEventListener('pawlse:http-exception', handleCustomError);
        };
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleOpenLogsInNewPage = useCallback(() => {
        if (!errorInfo?.data) return;

        let content = '';
        if (typeof errorInfo.data === 'string') {
            content = errorInfo.data;
        } else if (typeof errorInfo.data === 'object') {
            try {
                content = JSON.stringify(errorInfo.data, null, 2);
            } catch {
                content = String(errorInfo.data);
            }
        } else {
            content = String(errorInfo.data);
        }

        const trimmed = content.trim();
        const isHtml = trimmed.toLowerCase().startsWith('<!doctype html') || trimmed.toLowerCase().startsWith('<html');

        const escapeHtml = (str: string) =>
            str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m] || m);

        // If the server provided complete HTML (like Laravel Ignition), render it directly.
        // Otherwise, wrap JSON/text in a clean dark-mode log viewer.
        const htmlToRender = isHtml
            ? content
            : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PAWLSE Technical Error Log (${errorInfo.status})</title>
  <style>
    :root { color-scheme: dark; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      padding: 2.5rem;
      margin: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: #e11d48;
      color: #ffffff;
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.025em;
    }
    .meta {
      color: #94a3b8;
      font-size: 0.875rem;
    }
    pre {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      color: #fca5a5;
      font-size: 0.875rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">HTTP ${errorInfo.status} &bull; ${escapeHtml(errorInfo.statusText || 'Internal Server Error')}</span>
      <h1>PAWLSE Technical Error Log</h1>
      <div class="meta">Captured at ${new Date().toLocaleString()} &bull; URL: ${escapeHtml(errorInfo.url || window.location.href)}</div>
    </div>
    <pre>${escapeHtml(content)}</pre>
  </div>
</body>
</html>`;

        const blob = new Blob([htmlToRender], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        if (win) {
            win.focus();
        }
    }, [errorInfo]);

    const handleCopySummary = useCallback(() => {
        if (!errorInfo) return;
        const summary = `PAWLSE Error: HTTP ${errorInfo.status} (${errorInfo.statusText || 'Internal Error'})
URL: ${errorInfo.url || window.location.href}
Time: ${errorInfo.timestamp}
Message: ${extractBriefErrorMessage(errorInfo.data) || 'Unexpected server exception'}`;

        navigator.clipboard.writeText(summary).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [errorInfo]);

    if (!isOpen || !errorInfo) return null;

    const briefMessage = extractBriefErrorMessage(errorInfo.data);

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleClose();
                    }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="http-exception-title"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-6"
                >
                    {/* Top Close Button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>

                    {/* Header with warm glowing badge */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                            <AlertTriangle size={24} className="stroke-[2.2]" />
                        </div>
                        <div className="space-y-1.5 flex-1 pr-6">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                Problem Detected &bull; Code {errorInfo.status}
                            </div>
                            <h2
                                id="http-exception-title"
                                className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
                            >
                                There Was a Problem
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                We ran into an unexpected server glitch while processing your request. Don&apos;t worry—your entered information has not been lost.
                            </p>
                        </div>
                    </div>

                    {/* Subtle, non-overwhelming details box */}
                    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/80 p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">What happened</span>
                            <span className="font-mono text-[11px]">{errorInfo.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                            {briefMessage ? (
                                <span className="line-clamp-2">{briefMessage}</span>
                            ) : (
                                'The server experienced an unhandled issue. Please try submitting again or review the full technical logs.'
                            )}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        {/* Open logs in new page button requested by user */}
                        <button
                            type="button"
                            onClick={handleOpenLogsInNewPage}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 border border-neutral-300/80 dark:border-neutral-700 transition-all shadow-xs cursor-pointer"
                        >
                            <Terminal size={15} className="text-neutral-500 dark:text-neutral-400" />
                            <span>View Error Logs</span>
                            <ExternalLink size={14} className="opacity-70" />
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopySummary}
                                title="Copy error info"
                                className="inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-paw-orange hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/25 cursor-pointer"
                            >
                                Dismiss &amp; Keep Editing
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
