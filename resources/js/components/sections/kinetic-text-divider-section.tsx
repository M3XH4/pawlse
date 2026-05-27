import { motion } from 'motion/react';

import React from 'react';

export function KineticTextDivider() {
  return (
    <section className="w-full bg-[#0f0f0f] py-32 overflow-hidden font-quicksand">
      <div className="w-full px-4">
        {/* Line 1 - Stroke text sliding from LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="overflow-hidden text-center"
        >
          <h2 
            className="text-[64px] lg:text-[185px] font-black uppercase leading-none tracking-[-0.02em] text-transparent"
            style={{
              WebkitTextStroke: '2px white',
            }}
          >
            RESCUE.
          </h2>
        </motion.div>

        {/* Line 2 - Filled text sliding from RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="overflow-hidden text-center"
        >
          <h2 className="text-[48px] lg:text-[160px] font-black uppercase leading-none tracking-[-0.02em] text-[#F59E0B] text-center">
            REHABILITATE.
          </h2>
        </motion.div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.3,
            delay: 0.7
          }}
          className="text-center mt-8"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 font-bold">
            Iligan Stray Feeders — Since 2020
          </p>
        </motion.div>
      </div>
    </section>
  );
}