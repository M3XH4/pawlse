import { CheckCircle2, X, Download } from 'lucide-react';
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
}

export function SubmissionReceipt({
  isOpen,
  onClose,
  title,
  subtitle,
  referenceNumber,
  items,
  type = 'success',
  footerMessage
}: SubmissionReceiptProps) {
    
  // eslint-disable-next-line curly
  if (!isOpen) return null;

  const colors = {
    success: {
      bg: 'bg-paw-green',
      light: 'bg-paw-green/10',
      border: 'border-paw-green/20',
      text: 'text-paw-green'
    },
    info: {
      bg: 'bg-paw-blue',
      light: 'bg-paw-blue/10',
      border: 'border-paw-blue/20',
      text: 'text-paw-blue'
    },
    warning: {
      bg: 'bg-paw-orange',
      light: 'bg-paw-orange/10',
      border: 'border-paw-orange/20',
      text: 'text-paw-orange'
    }
  };

  const currentColor = colors[type];

  const handleDownload = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const border = '═'.repeat(60);
    const divider = '─'.repeat(60);
    const space = ' ';

    const centerText = (text: string, width: number = 60) => {
      const padding = Math.max(0, Math.floor((width - text.length) / 2));

      return space.repeat(padding) + text;
    };

    const formatItem = (label: string, value: string, width: number = 60) => {
      const colonIndex = width - value.length - 2;
      const dots = '.'.repeat(Math.max(1, colonIndex - label.length - 1));

      return `  ${label} ${dots} ${value}`;
    };

    const receiptContent = `
╔${border}╗
║${centerText('🐾 ILIGAN STRAY FRIENDS 🐾')}║
║${centerText('Official Receipt')}║
╚${border}╝

${divider}
  SUBMISSION CONFIRMED
${divider}

  ${title.toUpperCase()}
${subtitle ? `  ${subtitle}\n` : ''}
${referenceNumber ? `\n  Reference Number: ${referenceNumber}\n${divider}\n` : ''}
  Date: ${dateStr}
  Time: ${timeStr}

${divider}
  SUBMISSION DETAILS
${divider}

${items.map(item => formatItem(item.label, item.value)).join('\n')}

${divider}
${footerMessage ? `\n${centerText('⚠️ IMPORTANT NOTICE ⚠️')}\n${divider}\n\n  ${footerMessage}\n` : ''}
${divider}
${centerText('Thank you for your submission!')}
${centerText('Please keep this receipt for your records.')}
${divider}

╔${border}╗
║${centerText('Iligan Stray Friends (ISF)')}║
║${centerText('Serving the community since 2020')}║
║${centerText('Contact: info@iligansf.org | +63 917 123 4567')}║
╚${border}╝

${centerText('🐾 Saving Lives, One Paw at a Time 🐾')}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISF-Receipt-${referenceNumber || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 ${currentColor.light} px-4 py-2 rounded-full mb-4 border ${currentColor.border}`}>
              <CheckCircle2 size={18} className={currentColor.text} />
              <span className={`text-xs font-black tracking-widest uppercase ${currentColor.text}`}>
                Submission Confirmed
              </span>
            </div>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-paw-navy mb-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-gray-500 font-bold">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Reference Number */}
        {referenceNumber && (
          <div className={`${currentColor.light} rounded-2xl p-6 mb-8 border-2 ${currentColor.border}`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Reference Number
            </p>
            <p className="text-2xl font-black text-paw-navy font-mono tracking-tight">
              {referenceNumber}
            </p>
            <p className="text-xs font-bold text-gray-500 mt-2 italic">
              Save this for your records
            </p>
          </div>
        )}

        {/* Submission Details */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-8 border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${currentColor.bg} text-white`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Submission Summary
              </p>
              <p className="text-sm font-bold text-gray-600">
                {new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100"
              >
                {item.icon && (
                  <div className="w-10 h-10 rounded-lg bg-paw-navy/5 text-paw-navy flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-paw-navy break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        {footerMessage && (
          <div className={`${currentColor.light} rounded-2xl p-6 mb-8 border-2 border-dashed ${currentColor.border}`}>
            <p className="text-sm font-bold text-gray-600 leading-relaxed text-center">
              {footerMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gray-100 text-paw-navy py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-200 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className={`flex-1 ${currentColor.bg} text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2`}
          >
            <CheckCircle2 size={20} />
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
