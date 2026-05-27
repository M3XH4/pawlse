import { Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

const faqData = [
  {
    question: "How can I become a volunteer for Iligan Stray Feeders?",
    answer: "Becoming a volunteer is easy! You can sign up through our registration page. Once registered, you'll need to attend a short orientation session where we cover our safety protocols, feeding routes, and rescue procedures. You can choose to be a feeder, a rescue rider, or a shelter assistant."
  },
  {
    question: "Do you accept food donations instead of money?",
    answer: "Absolutely! We highly encourage in-kind donations like dry/wet dog or cat food, rice, vitamins, and even old blankets or towels. You can drop them off at our main shelter in Iligan or at any of our partner collection points listed on the 'Donate' page."
  },
  {
    question: "What should I do if I find an injured stray animal?",
    answer: "First, ensure your own safety. If the animal seems approachable, you can report it via our SOS Report tool on the landing page. Upload a photo and the exact location. Our nearest rescue volunteer will be notified immediately. You can also use our 'AI-Assisted Animal Identification' feature to help document the animal's breed, age, and gender before submitting the rescue report."
  },
  {
    question: "Is PAWLSE a government organization?",
    answer: "No, PAWLSE (Iligan Stray Feeders) is a community-driven non-profit organization. We rely entirely on the kindness of donors and the hard work of our volunteers. We do, however, collaborate with local government units for city-wide vaccination and neutering programs."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto overflow-hidden">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-paw-navy/5 px-4 py-2 rounded-full mb-6 border border-paw-navy/10">
          <Info size={18} className="text-paw-navy" />
          <span className="text-xs font-black tracking-widest uppercase text-paw-navy">Common Questions</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-paw-navy italic uppercase tracking-tighter italic mb-4">You Ask, <span className="text-paw-navy not-italic underline decoration-8 decoration-paw-orange/30 underline-offset-4">We Answer</span></h2>
        <p className="text-lg text-gray-500 font-bold italic leading-relaxed">Everything you need to know about our mission and how you can get involved.</p>
      </div>

      <div className="space-y-6">
        {faqData.map((faq, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100"
          >
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-10 flex items-center justify-between text-left group transition-all hover:bg-gray-50"
            >
              <h3 className="text-xl md:text-2xl font-black text-paw-navy uppercase italic tracking-tighter italic group-hover:text-paw-orange transition-colors">{faq.question}</h3>
              <div className={`bg-gray-100 p-3 rounded-2xl text-paw-navy transition-all ${openIndex === i ? 'rotate-180 bg-paw-orange text-white' : ''}`}>
                <ChevronDown size={24} />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-10 pb-10">
                    <div className="w-full h-[1px] bg-gray-100 mb-8"></div>
                    <p className="text-lg text-gray-500 font-bold italic leading-relaxed font-quicksand">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      
    </section>
  );
}