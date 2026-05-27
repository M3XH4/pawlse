import { motion } from 'motion/react';
import React from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export function MissionQuote() {
  return (
    <section className="w-full min-h-screen flex flex-col lg:flex-row font-quicksand">
      {/* Left Half - Quote */}
      <motion.div 
        className="w-full lg:w-1/2 bg-[#0f0f0f] flex items-center justify-center p-12 lg:p-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-xl">
          {/* Quote text with staggered words */}
          <div className="mb-8">
            {["Every", "stray", "deserves", "a", "voice."].map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.08,
                  duration: 0.6
                }}
                className={`text-[4.5vw] lg:text-6xl font-black leading-[1.1] ${
                  word === "voice." ? "text-[#F59E0B]" : "text-white"
                } inline-block mr-3`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="h-[1px] bg-[#F59E0B] mb-6"
          />

          {/* Attribution */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold"
          >
            — Iligan Stray Feeders, Iligan City
          </motion.p>
        </div>
      </motion.div>

      {/* Right Half - Image */}
      <motion.div 
        className="w-full lg:w-1/2 relative overflow-hidden min-h-[50vh] lg:min-h-screen"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true }}
        transition={{ 
          duration: 1.2,
          ease: "easeOut"
        }}
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1584638873079-f2735447239e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwYW5pbWFsJTIwZW1vdGlvbmFsJTIwc3Rvcnl8ZW58MXx8fHwxNzc0NDA3NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Rescued animal"
          className="w-full h-full object-cover"
        />
        
        {/* Vignette overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)"
          }}
        />
      </motion.div>
    </section>
  );
}
