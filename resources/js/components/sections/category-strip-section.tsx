import { Link } from '@inertiajs/react';
import { Heart, ShieldAlert, Gift, AlertTriangle, Dog, Search } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
const categories = [
  {
    title: 'Adoption',
    icon: <Dog className="w-16 h-16" />,
    color: 'bg-paw-orange',
    hoverColor: 'hover:bg-orange-600',
    path: '/adopt'
  },
  {
    title: 'Rescue',
    icon: <ShieldAlert className="w-16 h-16" />,
    color: 'bg-paw-yellow',
    hoverColor: 'hover:bg-yellow-500',
    path: '/rescue'
  },
  {
    title: 'Missing',
    icon: <Search className="w-16 h-16" />,
    color: 'bg-paw-blue',
    hoverColor: 'hover:bg-sky-500',
    path: '/missing'
  },
  {
    title: 'Donate',
    icon: <Gift className="w-16 h-16" />,
    color: 'bg-paw-green',
    hoverColor: 'hover:bg-green-600',
    path: '/donate'
  },
  {
    title: 'Volunteer',
    icon: <Heart className="w-16 h-16" />,
    color: 'bg-paw-coral',
    hoverColor: 'hover:bg-rose-500',
    path: '/volunteer'
  },
  {
    title: 'SOS Report',
    icon: <AlertTriangle className="w-16 h-16" />,
    color: 'bg-paw-navy',
    hoverColor: 'hover:bg-black',
    path: '/sos'
  }
];

export function CategoryStrip() {
  return (
    <section className="relative -mt-24 z-30 px-4 max-w-[1600px] mx-auto overflow-hidden">
      <div className="flex flex-wrap lg:flex-nowrap justify-center items-stretch rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex-1 min-w-[200px] relative"
          >
            <Link 
              href={cat.path}
              className={`flex flex-col items-center justify-center p-10 h-full transition-all duration-300 group ${cat.color} ${cat.hoverColor} text-white text-center border-r border-white/10 last:border-0`}
            >
              <div className="mb-6 group-hover:scale-125 group-hover:rotate-[5deg] transition-all duration-300 drop-shadow-lg icon-hover">
                {cat.icon}
              </div>
              <span className="text-xl font-black uppercase tracking-widest">{cat.title}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}