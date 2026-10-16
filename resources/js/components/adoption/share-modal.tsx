import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: {
    id: number;
    name: string;
    breed?: string;
    img?: string | null;
  } | null;
}

export function ShareModal({ isOpen, onClose, pet }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pet) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/adopt/${pet.id}` : '';
  const shareText = `Meet ${pet.name}, a wonderful pet looking for a loving home at Iligan Stray Feeders! 🐾`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adopt ${pet.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const sharePlatforms = [
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] text-white hover:bg-[#1565C0]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black text-white hover:bg-neutral-800',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] text-white hover:bg-[#1EBE5D]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] text-white hover:bg-[#1C8CC1]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative z-10 shadow-2xl border-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Share2 size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base leading-tight">Share {pet.name}</h4>
                <p className="text-xs text-slate-400 font-normal">Help find {pet.name} a loving forever home</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            {sharePlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-2xs ${platform.color}`}
              >
                <Share2 size={13} />
                {platform.name}
              </a>
            ))}
          </div>

          {/* Native Web Share button if available */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full mb-3 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl transition-colors border border-slate-200/70 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={13} className="text-orange-500" />
              More sharing options (System Share)
            </button>
          )}

          {/* Direct Link Copy */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Direct Pet Profile Link
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs text-slate-800 font-medium flex-1 px-2 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
