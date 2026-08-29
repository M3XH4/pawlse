import { Heart, Users, Utensils, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';


export function ImpactStats({ stats: propsStats }: { stats?: { rescued: number; adopted: number; volunteers: number; feedings: number } }) {
  const stats = [
    { label: 'Meals Served', val: `${(propsStats?.feedings || 320) * 15}+`, icon: <Utensils size={24} />, color: 'bg-paw-orange', number: (propsStats?.feedings || 320) * 15 },
    { label: 'Pets Rescued', val: `${propsStats?.rescued || 150}`, icon: <Heart size={24} />, color: 'bg-red-500', number: propsStats?.rescued || 150 },
    { label: 'Volunteers', val: `${propsStats?.volunteers || 42}`, icon: <Users size={24} />, color: 'bg-paw-blue', number: propsStats?.volunteers || 42 },
    { label: 'Adoptions Completed', val: `${propsStats?.adopted || 85}`, icon: <ShieldCheck size={24} />, color: 'bg-green-500', number: propsStats?.adopted || 85 },
  ];

  const [counts, setCounts] = React.useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const animateCounter = (index: number, target: number) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setCounts(prev => {
        const newCounts = [...prev];
        newCounts[index] = Math.floor(current);
        
        return newCounts;
      });
    }, duration / steps);
  };

  return (
    <section className="w-full bg-[#111111] overflow-hidden font-quicksand relative z-10 pt-[220px] md:pt-[260px] lg:pt-[350px] pb-[50px] px-4 md:px-[70px]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onViewportEnter={() => {
          if (!hasAnimated) {
            setHasAnimated(true);
            stats.forEach((stat, i) => {
              setTimeout(() => animateCounter(i, stat.number), i * 100);
            });
          }
        }}
        className="max-w-7xl mx-auto py-[50px] px-[16px] py-[30px] mx-[0px] my-[-100px]"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0 p-[0px] mx-[0px] mt-[-50px] mb-[0px] mt-[-60px]">
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
                whileHover={{
                  scale: 1.02
                }}
                className="text-center group cursor-pointer"
              >
                <motion.h3 
                  className="text-6xl md:text-8xl lg:text-[96px] font-black text-white mb-2 transition-colors duration-200"
                  whileHover={{ color: "#F59E0B" }}
                >
                  {i === 3 ? `${counts[i]}%` : 
                   i === 0 ? `${counts[i].toLocaleString()}+` : 
                   counts[i].toLocaleString()}
                </motion.h3>
                <motion.p 
                  className="text-[11px] uppercase tracking-[0.25em] text-white/45 font-bold transition-opacity duration-200 group-hover:opacity-80"
                >
                  {stat.label}
                </motion.p>
              </motion.div>
              
              {i < stats.length - 1 && (
                <div className="hidden md:block w-[1px] h-24 bg-white/15" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
}