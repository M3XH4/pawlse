import { Mail, Phone, MapPin, Clock, MessageSquare, Facebook, Instagram, Video, MessageCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { ContactForm } from './contact-form';

interface ContactSectionProps {
  className?: string;
  badgeText?: string;
  title?: string;
  subtitle?: string;
}

export function ContactSection({
  className = '',
  badgeText = 'Get in Touch',
  title = 'Send Us a Message',
  subtitle = "Whether you have questions about adoption, want to coordinate a donation, or wish to collaborate, we'd love to hear from you."
}: ContactSectionProps) {
  return (
    <section id="contact" className={`py-20 px-4 max-w-7xl mx-auto overflow-hidden ${className}`}>
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-6 border border-paw-orange/20">
          <Mail size={18} className="text-paw-orange" />
          <span className="text-xs font-black tracking-widest uppercase text-paw-orange">{badgeText}</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-paw-navy italic uppercase tracking-tighter mb-4">
          Connect With <span className="text-paw-orange not-italic">PAWLSE</span>
        </h2>
        <p className="text-base md:text-lg text-gray-500 font-bold italic leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Information Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 bg-gradient-to-br from-paw-navy to-[#1a233a] text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-between h-full"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-paw-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-paw-orange block mb-2">Direct Reach</span>
              <h3 className="text-3xl font-black italic uppercase tracking-tight">Iligan Stray Feeders</h3>
              <p className="text-sm text-white/70 font-bold mt-2 leading-relaxed">
                We are actively on the ground feeding strays and caring for rescued animals. Reach out to our volunteer coordinators directly.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Zone+5+Barangay+Tambo+Iligan+City+Lanao+del+Norte+9200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="p-3 rounded-xl bg-paw-orange/20 text-paw-orange group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Shelter Location</span>
                  <p className="text-sm font-bold text-white mt-0.5">Zone 5, Brgy. Tambo, Iligan City</p>
                  <span className="text-xs font-bold text-paw-orange flex items-center gap-1 mt-1">
                    Open in Maps <ArrowUpRight size={13} />
                  </span>
                </div>
              </a>

              <a
                href="tel:09123456789"
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="p-3 rounded-xl bg-paw-green/20 text-paw-green group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Phone & Emergency Hotline</span>
                  <p className="text-sm font-bold text-white mt-0.5">0912 345 6789 / (063) 221-5432</p>
                  <span className="text-xs font-bold text-paw-green flex items-center gap-1 mt-1">
                    Tap to Call
                  </span>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-3 rounded-xl bg-paw-blue/20 text-paw-blue">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Shelter & Visiting Hours</span>
                  <p className="text-sm font-bold text-white mt-0.5">Mon – Sat: 9:00 AM – 5:00 PM</p>
                  <p className="text-xs text-white/60 font-medium mt-0.5">Sundays: Feeding Routes & Scheduled Volunteer Shifts</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-white/60 block mb-3">Follow & Message Us</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/IliganStrayFosterandAdoptionCenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-white/70 hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.instagram.com/iliganstrayfeeders?igsh=MTg2OWpqZGJ5MWdudw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-white/70 hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@iliganstrayfeeders?_r=1&_t=ZS-95wPLd3kxMo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-white/70 hover:text-white"
                  aria-label="TikTok"
                >
                  <Video size={18} />
                </a>
                <a
                  href="https://m.me/IliganStrayFosterandAdoptionCenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 text-white/70 hover:text-white"
                  aria-label="Messenger"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 relative flex flex-col justify-between h-full"
        >
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-paw-navy/60 block mb-1">Email Inquiries</span>
            <h3 className="text-2xl sm:text-3xl font-black text-paw-navy uppercase italic tracking-tight">
              Leave a Message
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1">
              Fill out the form below and our team will receive an email directly with your request.
            </p>
          </div>

          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
