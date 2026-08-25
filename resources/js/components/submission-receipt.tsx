import { CheckCircle2, X, Download, Printer } from 'lucide-react';
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

  const handlePrintPdf = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is enabled. Please allow pop-ups to print the receipt.');
      return;
    }

    // Strip React components/icons from items values for clean text display in print
    const cleanItems = items.map(item => {
      let val = item.value;
      if (React.isValidElement(item.value)) {
        // If the value is a React component, let's use the label or try to get string value
        val = item.label === 'Status' ? 'Completed' : 'Verified';
      }
      return {
        label: item.label,
        value: val
      };
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAWLSE Receipt - ${referenceNumber || 'Receipt'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;900&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Quicksand', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: #F8FAFC;
            }
            .receipt-card {
              border-radius: 2rem;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            }
            @media print {
              body {
                background-color: white;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              .receipt-card {
                border: 2px solid #E2E8F0;
                box-shadow: none;
                margin-top: 1cm;
              }
            }
          </style>
        </head>
        <body class="p-6 md:p-12 min-h-screen flex items-center justify-center">
          <div class="max-w-xl w-full bg-white receipt-card border border-gray-100 p-8 md:p-10 relative overflow-hidden">
            <!-- Decorative corner badge -->
            <div class="absolute -right-16 -top-16 w-36 h-36 bg-green-100 rounded-full flex items-center justify-center transform rotate-45 pointer-events-none">
              <span class="text-[9px] font-black text-green-700 tracking-widest uppercase mt-12 mr-2">VERIFIED</span>
            </div>

            <!-- Header logo & Shelter info -->
            <div class="flex justify-between items-start border-b-2 border-gray-150 pb-6 mb-6">
              <div>
                <h1 class="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-2">
                  🐾 PAWLSE
                </h1>
                <p class="text-xs text-gray-500 font-bold uppercase mt-1 tracking-wider">Iligan Stray Friends Shelter</p>
                <p class="text-[10px] text-gray-400 font-bold">Zone 5, Barangay Tambo, Iligan City, 9200</p>
                <p class="text-[10px] text-gray-400 font-bold">info@pawlse.org | +63 912 345 6789</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Official Receipt</span>
                <p class="text-lg font-black text-blue-950 font-mono tracking-tight mt-1">${referenceNumber || 'N/A'}</p>
              </div>
            </div>

            <!-- Receipt title -->
            <div class="mb-6">
              <h3 class="text-xl font-black text-blue-950 uppercase tracking-tight">${title}</h3>
              ${subtitle ? `<p class="text-xs text-gray-500 font-bold mt-1">${subtitle}</p>` : ''}
            </div>

            <!-- Date and Status block -->
            <div class="grid grid-cols-2 gap-4 text-xs mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p class="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Receipt Date</p>
                <p class="font-black text-gray-700 mt-1">${dateStr} @ ${timeStr}</p>
              </div>
              <div class="text-right">
                <p class="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Status</p>
                <p class="font-black text-green-600 uppercase text-xs mt-1">CONFIRMED & COMPLETED</p>
              </div>
            </div>

            <!-- Details list -->
            <div class="space-y-3 mb-8">
              <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Receipt Details</h4>
              ${cleanItems.map(item => `
                <div class="flex justify-between items-center py-3.5 px-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">${item.label}</span>
                  <span class="text-sm font-black text-blue-950">${item.value}</span>
                </div>
              `).join('')}
            </div>

            <!-- Important notice -->
            ${footerMessage ? `
              <div class="bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl p-4 mb-8">
                <p class="text-xs font-bold text-blue-900 leading-relaxed text-center">${footerMessage}</p>
              </div>
            ` : ''}

            <!-- Receipt footer note -->
            <div class="text-center pt-6 border-t-2 border-gray-100">
              <p class="text-sm font-black text-blue-900">Thank you for your life-saving contribution!</p>
              <p class="text-[10px] font-bold text-gray-400 mt-1">🐾 Saving Lives, One Paw at a Time 🐾</p>
              <p class="text-[8px] text-gray-300 font-medium mt-4 uppercase">This is a computer-generated receipt. No signature is required.</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              // Auto close tab after print prompt finishes
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
            onClick={handlePrintPdf}
            className="flex-1 bg-gray-100 text-paw-navy py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-200 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={20} />
            Print / Save PDF
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
