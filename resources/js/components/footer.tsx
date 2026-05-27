import { Link } from '@inertiajs/react';
import { Mail, Phone, MapPin, Facebook, Instagram, ArrowRight, X, FileText, Shield, AlertTriangle, HelpCircle, MessageCircle, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import logo from '@/assets/logo.png';

export function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'safety' | 'faq' | null>(null);

  return (
    <>
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-4 border border-paw-orange/20">
                    {activeModal === 'privacy' && <Shield size={18} className="text-paw-orange" />}
                    {activeModal === 'terms' && <FileText size={18} className="text-paw-orange" />}
                    {activeModal === 'safety' && <AlertTriangle size={18} className="text-paw-orange" />}
                    {activeModal === 'faq' && <HelpCircle size={18} className="text-paw-orange" />}
                    <span className="text-xs font-black tracking-widest uppercase text-paw-orange">Legal Information</span>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-paw-navy">
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'terms' && 'Terms of Service'}
                    {activeModal === 'safety' && 'Safety Guidelines'}
                    {activeModal === 'faq' && 'Volunteer FAQ'}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 mt-2">Last updated: April 28, 2026</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="prose prose-sm max-w-none">
                {activeModal === 'privacy' && (
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Information We Collect</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        At PAWLSE Iligan Stray Feeders, we collect information that you voluntarily provide when you:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Submit adoption applications</li>
                        <li>Report rescue cases or missing pets</li>
                        <li>Make donations or purchase merchandise</li>
                        <li>Register for volunteer programs or events</li>
                        <li>Contact us through our website or social media</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">How We Use Your Information</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        We use the information collected to process adoptions, coordinate rescue operations, send donation receipts, manage volunteer schedules, and communicate updates about our programs. We will never sell your personal information to third parties.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Data Security</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        We implement industry-standard security measures to protect your personal information. All sensitive data is encrypted and stored securely. Access to personal information is restricted to authorized personnel only.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Your Rights</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        You have the right to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Request access to your personal data</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your data</li>
                        <li>Opt-out of marketing communications</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Contact Us</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        For privacy-related concerns, contact us at privacy@pawlse.org or call (063) 221-5432.
                      </p>
                    </section>
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Acceptance of Terms</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        By accessing and using the PAWLSE Iligan Stray Feeders website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Adoption Terms</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        All adoption applications are subject to approval. We reserve the right to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Conduct home visits before finalizing adoptions</li>
                        <li>Deny applications that don't meet our adoption criteria</li>
                        <li>Require follow-up check-ins after adoption</li>
                        <li>Reclaim animals if adoption terms are violated</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Volunteer Responsibilities</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        Volunteers must follow all safety protocols, respect animal welfare guidelines, and represent PAWLSE professionally. Volunteers agree to undergo orientation and training before participating in rescue operations.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Donations</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        All donations are final and non-refundable. Donations are used exclusively for animal care, rescue operations, shelter maintenance, and related charitable activities. Official receipts will be provided for tax purposes.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Limitation of Liability</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        PAWLSE Iligan Stray Feeders is not liable for injuries, damages, or losses incurred during volunteer activities, rescue operations, or adoption processes. Participants engage at their own risk and are encouraged to maintain appropriate insurance coverage.
                      </p>
                    </section>
                  </div>
                )}

                {activeModal === 'safety' && (
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Rescue Safety Protocol</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        When participating in rescue operations:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Always work in pairs or groups - never attempt rescues alone</li>
                        <li>Wear protective gear: gloves, closed-toe shoes, and long sleeves</li>
                        <li>Approach injured or scared animals slowly and calmly</li>
                        <li>Use appropriate equipment: catch poles, carriers, and nets</li>
                        <li>Never corner or trap an animal without an escape route</li>
                        <li>Contact team leaders before attempting difficult rescues</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Handling Aggressive Animals</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        If an animal shows signs of aggression:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Do not make direct eye contact or sudden movements</li>
                        <li>Give the animal space and time to calm down</li>
                        <li>Use barriers (blankets, boards) to safely contain the animal</li>
                        <li>Call for experienced handlers immediately</li>
                        <li>Document behavior for veterinary assessment</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Health & Hygiene</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        Protect yourself and the animals:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Wash hands thoroughly before and after animal contact</li>
                        <li>Seek immediate medical attention for bites or scratches</li>
                        <li>Keep tetanus and rabies vaccinations up to date</li>
                        <li>Report any injuries to team leaders immediately</li>
                        <li>Disinfect equipment after each rescue operation</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Emergency Contacts</h4>
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                        <p className="text-gray-700 font-bold leading-relaxed mb-3">
                          In case of emergency during rescue operations:
                        </p>
                        <ul className="space-y-2 text-gray-700 font-black">
                          <li>Emergency Hotline: 0912 345 6789</li>
                          <li>Veterinary Emergency: (063) 221-5432</li>
                          <li>Medical Emergency: 911</li>
                          <li>Team Leader: Miguel Reyes - 0920 456 7890</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                )}

                {activeModal === 'faq' && (
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">How do I become a volunteer?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        Visit our Volunteer page and fill out the registration form. You'll be invited to attend a mandatory orientation session where you'll learn about our mission, safety protocols, and available volunteer opportunities. After orientation, you can choose which programs match your interests and availability.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Do I need experience with animals?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        No prior experience is required! We provide comprehensive training for all volunteers. Whether you want to work directly with animals or help with administrative tasks, social media, fundraising, or events, there's a role for everyone.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">What time commitment is required?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        We appreciate any time you can give! Some volunteers come weekly, others monthly, and some help only during special events. Most volunteer shifts are 3-4 hours. We ask for at least one shift per month to stay active in our system.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">What volunteer roles are available?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        Current volunteer opportunities include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li><strong>Rescue Operations:</strong> Respond to rescue calls and transport animals</li>
                        <li><strong>Shelter Care:</strong> Feed, clean, and socialize shelter animals</li>
                        <li><strong>Foster Care:</strong> Temporarily house animals in your home</li>
                        <li><strong>Adoption Counseling:</strong> Help match animals with families</li>
                        <li><strong>Event Support:</strong> Assist with feeding drives and adoption fairs</li>
                        <li><strong>Administrative:</strong> Data entry, phone support, and office tasks</li>
                        <li><strong>Social Media:</strong> Content creation and community engagement</li>
                        <li><strong>Fundraising:</strong> Plan and execute fundraising campaigns</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Can students volunteer for community service hours?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        Yes! We're approved for community service hours. Students must bring a form from their school, and we'll provide documentation of completed hours. Minors (under 18) need parental consent and must be accompanied by a guardian during rescue operations.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">What should I bring to my first volunteer shift?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed mb-4">
                        Please bring:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-bold">
                        <li>Valid ID</li>
                        <li>Completed volunteer waiver (provided at orientation)</li>
                        <li>Closed-toe shoes and comfortable clothes you can get dirty</li>
                        <li>Water bottle and snacks</li>
                        <li>Sunscreen and hat for outdoor activities</li>
                        <li>Positive attitude and willingness to learn!</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">Will I receive a certificate?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        Yes! Volunteers receive official certificates after completing 20 hours of service. These certificates include your name, total hours, and can be used for school requirements, job applications, or personal recognition.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xl font-black text-paw-navy uppercase mb-3">How do I stay updated on volunteer opportunities?</h4>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        After registration, you'll receive our weekly volunteer newsletter via email. You can also follow us on Facebook and Instagram for urgent rescue calls and last-minute opportunities. Our Volunteer Manager, Kevin Tan, maintains an active WhatsApp group for real-time coordination.
                      </p>
                    </section>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-paw-navy text-white overflow-hidden relative">
      {/* Decorative Wave */}
      {/* <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-20 text-paw-bg fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div> */}

      {/* Closing Statement Block */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="pt-32 pb-24 relative z-10"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Large statement text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-[5vw] font-black leading-tight">
              In Service to the{' '}
              <span className="text-[#F59E0B]">Hungry and Weak.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-bold mt-4">
              Advocacy over self-interest
            </p>
          </motion.div>

          {/* Orange line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-[1px] bg-[#F59E0B] mx-auto mb-6"
          />

          {/* Attribution */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold"
          >
            Iligan Stray Feeders — Iligan City, Philippines
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-4 mb-8 group">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl shadow-paw-orange/20 group-hover:rotate-12 transition-transform bg-white">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white leading-none uppercase">ILIGAN</h1>
                <p className="text-xs font-black text-paw-orange tracking-[0.2em] leading-none uppercase">STRAY FEEDERS</p>
              </div>
            </Link>
            <p className="text-xl text-white/60 font-bold max-w-xl font-quicksand leading-relaxed italic mb-10">
              A non-profit organization committed to animal welfare through feeding, rescue, and adoption.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-black uppercase tracking-widest text-white/40">Follow Us</span>
              <div className="flex items-center gap-3">
                <a href="https://www.facebook.com/IliganStrayFosterandAdoptionCenter" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 group" aria-label="Facebook">
                  <Facebook size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </a>
                <a href="https://www.instagram.com/iliganstrayfeeders?igsh=MTg2OWpqZGJ5MWdudw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 group" aria-label="Instagram">
                  <Instagram size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </a>
                <a href="https://www.tiktok.com/@iliganstrayfeeders?_r=1&_t=ZS-95wPLd3kxMo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 group" aria-label="TikTok">
                  <Video size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </a>
                <a href="https://m.me/IliganStrayFosterandAdoptionCenter" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-paw-orange border border-white/10 flex items-center justify-center transition-all hover:scale-110 group" aria-label="Messenger">
                  <MessageCircle size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <div className="w-8 h-1 bg-paw-orange"></div>
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Adoption', path: '/adopt' },
                { name: 'Rescue', path: '/rescue' },
                { name: 'Donate', path: '/donate' },
                { name: 'Volunteer', path: '/volunteer' },
                { name: 'Events', path: '/events' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-white/60 font-bold hover:text-paw-orange transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-paw-orange" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <div className="w-8 h-1 bg-paw-blue"></div>
              Contact Us
            </h3>
            <div className="space-y-8">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Zone+5+Barangay+Tambo+Iligan+City+Lanao+del+Norte+9200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="bg-white/5 p-3 rounded-xl text-paw-blue group-hover:bg-paw-blue group-hover:text-white transition-all shadow-lg border border-white/10">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Our Shelter</span>
                  <p className="text-sm font-bold italic">Zone 5, Barangay Tambo, Iligan City, Lanao del Norte, 9200</p>
                  <span className="text-xs font-black text-paw-blue uppercase tracking-widest mt-1 block group-hover:text-white">View on Maps →</span>
                </div>
              </a>
              <a
                href="tel:09123456789"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="bg-white/5 p-3 rounded-xl text-paw-orange group-hover:bg-paw-orange group-hover:text-white transition-all shadow-lg border border-white/10">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Emergency Call</span>
                  <p className="text-sm font-bold italic">0912 345 6789 / (063) 221-5432</p>
                  <span className="text-xs font-black text-paw-orange uppercase tracking-widest mt-1 block group-hover:text-white">Tap to Call →</span>
                </div>
              </a>
              <a
                href="mailto:hello@pawlse.org"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="bg-white/5 p-3 rounded-xl text-paw-green group-hover:bg-paw-green group-hover:text-white transition-all shadow-lg border border-white/10">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Send Email</span>
                  <p className="text-sm font-bold italic">hello@pawlse.org / rescue@pawlse.org</p>
                  <span className="text-xs font-black text-paw-green uppercase tracking-widest mt-1 block group-hover:text-white">Send Message →</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest italic">© 2026 PAWLSE Iligan Stray Feeders. All Rights Reserved.</p>
            <p className="text-[10px] font-bold text-white/20 italic italic leading-snug">Registered Non-Profit Organization in Iligan City. <br /> Developed with ❤️ for the animals of Lanao del Norte.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => setActiveModal('privacy')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => setActiveModal('safety')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Safety Guidelines</button>
            <button onClick={() => setActiveModal('faq')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Volunteer FAQ</button>
          </div>
        </div>
      </div>
      
      {/* Scroll to Top */}
      
    </footer>
    </>
  );
}