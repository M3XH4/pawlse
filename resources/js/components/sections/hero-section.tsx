import { router } from '@inertiajs/react';
import { PawPrint, Heart } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import React from 'react';
import heroImage from '@/assets/hero-image.png';
import overlayImage from '@/assets/overlay-image.jpg';

export function Hero() {
  const navigate = router.visit;
  
  // Apple-style scroll zoom effect - more dramatic
  const { scrollYProgress } = useScroll();

  // Background parallax (shapes move slower)
  const bgY = useTransform(scrollYProgress, [0, 0.3], [0, 30]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 0.08]);

  // Hero image - sticky overlap effect (like the knife)
  const imageScale = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.6], [1, 1.35, 1.25, 0.85]);
  const imageY = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.8], [0, -100, -350, -700]);
  // const imageX = useTransform(scrollYProgress, [0, 0.2, 0.5], [0, -40, -70]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.25, 0.6], [0, -5, -12]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.6, 0.85], [1, 1, 0]);

  // Radial glow behind animals
  const glowScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.4]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0.1, 0.25, 0]);

  // Text subtle micro-movement
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -5]);

  return (
    <section className="relative overflow-visible bg-[#F59E0B] h-[90vh] max-h-screen font-quicksand flex flex-col">
      {/* Subtle Background Overlay Image */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url(${overlayImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Abstract Background Shapes - Behind Content */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: bgY, opacity: bgOpacity }}
      >
        {/* Large circle top-left */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl opacity-30"></div>
        
        {/* Medium circle bottom-right */}
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#FBBF24] rounded-full blur-3xl opacity-40"></div>
        
        {/* Small accent circle center */}
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white rounded-full blur-2xl opacity-25"></div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-white rounded-full blur-2xl opacity-20"></div>
        <div className="absolute bottom-40 left-1/4 w-56 h-56 bg-[#FBBF24] rounded-full blur-3xl opacity-30"></div>
        
        {/* Organic blob shapes */}
        <svg className="absolute top-0 right-0 w-1/2 h-full opacity-30" viewBox="0 0 500 800" fill="none">
          <path d="M400,100 Q450,200 400,300 T400,500 Q350,600 300,650" stroke="white" strokeWidth="60" fill="none" opacity="0.5"/>
          <path d="M200,150 Q250,250 200,350 T200,550" stroke="#FBBF24" strokeWidth="40" fill="none" opacity="0.4"/>
        </svg>
        
        {/* Curved wave shapes */}
        <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
          <path d="M0,160 Q360,100 720,160 T1440,160 L1440,320 L0,320 Z" fill="white" opacity="0.1"/>
          <path d="M0,200 Q360,140 720,200 T1440,200 L1440,320 L0,320 Z" fill="#FBBF24" opacity="0.15"/>
        </svg>
        
        {/* Abstract geometric shapes */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-white/20 rounded-3xl rotate-45 blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-white/25 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center px-4 sm:px-8 lg:px-[85px] py-20 lg:py-0 lg:justify-between">
        <motion.div
          className="lg:w-1/2 text-white mb-4 lg:mb-0 relative z-[60] text-center lg:text-left order-1 max-w-[600px] lg:self-center"
          style={{ y: textY }}
        >
          <motion.div className="mx-auto flex flex-col items-center lg:items-start pl-[0px] pr-[60px] pt-[0px] pb-[100px] ml-[50px] mr-[0px] mt-[-150px] mb-[0px] lg:mb-[-200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/30">
              <PawPrint size={18} className="text-white" />
              <span className="text-xs font-black tracking-widest uppercase">Since 2020 • Iligan City</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-[1.1]"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #e0e0e0 50%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            >
              In Service to the Hungry and Weak
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/85 mb-6 max-w-xl font-medium">
              Iligan Stray Feeders is a non-profit organization dedicated to feeding, rescuing, and protecting stray animals in Iligan City.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                onClick={() => navigate('/donate')}
                className="bg-paw-navy text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart size={20} fill="white" />
                <span className="whitespace-nowrap">DONATE</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/adopt')}
                className="bg-white text-paw-navy px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-transparent"
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <PawPrint size={20} className="text-paw-orange" />
                <span className="whitespace-nowrap">ADOPT NOW</span>
              </motion.button>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 md:gap-6 text-white/80">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white">12k+</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest uppercase leading-none">Meals Served</span>
              </div>
              <div className="w-[1px] h-6 md:h-8 bg-white/30"></div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white">450+</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest uppercase leading-none">Rescues Done</span>
              </div>
              <div className="w-[1px] h-6 md:h-8 bg-white/30"></div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white">500+</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest uppercase leading-none">Volunteers</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:w-1/2 relative flex justify-center lg:justify-end items-end order-2 lg:self-end pointer-events-none">
          {/* Floating Paw Decorations */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="hidden lg:block absolute -top-10 -right-10 bg-paw-yellow p-4 rounded-3xl shadow-2xl rotate-12 z-20 pointer-events-auto"
          >
            <PawPrint size={40} className="text-white" fill="white" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="hidden lg:block absolute bottom-20 -left-10 bg-paw-blue p-3 rounded-2xl shadow-2xl -rotate-12 z-20 pointer-events-auto"
          >
            <Heart size={30} className="text-white" fill="white" />
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 text-white/60">
        <span className="text-[10px] font-black tracking-widest">SCROLL TO DISCOVER</span>
        <motion.div
          className="w-[2px] h-10 bg-gradient-to-b from-white/60 to-transparent rounded-full"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Overlapping Hero Image - Desktop */}
      <div className="hidden lg:block absolute bottom-0 right-[-8%] xl:right-[-5%] 2xl:right-[0%] z-[100] pointer-events-none"
        style={{
          transform: 'translateY(32%)'
        }}
      >
        {/* Radial Glow Behind Animals */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
          style={{
            scale: glowScale,
            opacity: glowOpacity,
            background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(245,158,11,0) 70%)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            scale: imageScale,
            y: imageY,
            rotate: imageRotate,
            opacity: imageOpacity
          }}
          className="relative w-[60vw] max-w-[950px] min-w-[650px]"
        >
          <img
            src={heroImage}
            alt="Happy Cat and Dog"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Overlapping Hero Image - Mobile */}
      <div className="lg:hidden absolute bottom-0 left-1/2 z-[100] pointer-events-none"
        style={{
          transform: 'translateX(-50%) translateY(28%)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-[100vw] max-w-[500px]">
            <img
              src={heroImage}
              alt="Happy Cat and Dog"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}