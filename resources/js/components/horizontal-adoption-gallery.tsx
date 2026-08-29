
import { Dog, Cat, Heart, ArrowRight, MapPin, Clock, CheckCircle2, X, Sparkles } from 'lucide-react';
import { motion, useAnimationFrame } from 'motion/react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';


const allPets = [
  {
    id: 1,
    name: 'Luna',
    type: 'Dog',
    category: 'Dogs',
    estimatedAge: '2 years',
    gender: 'Female',
    foundLocation: 'Pala-o, Iligan City',
    rescueStory: 'Rescued during feeding operations after being found weak near a drainage area following floods.',
    behavior: 'Friendly, calm, people-oriented',
    healthStatus: 'Vaccinated, recovering well',
    mainImg: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1596797882942-f441d7f56c0e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80'
  },
  {
    id: 2,
    name: 'Max',
    type: 'Dog',
    category: 'Puppies',
    estimatedAge: '6 months',
    gender: 'Male',
    foundLocation: 'Tibanga, Iligan City',
    rescueStory: 'Found abandoned in a box near the highway. He was malnourished but full of spirit.',
    behavior: 'Playful, energetic, loves toys',
    healthStatus: 'Vaccinated, healthy',
    mainImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80'
  },
  {
    id: 3,
    name: 'Whiskers',
    type: 'Cat',
    category: 'Cats',
    estimatedAge: '1 year',
    gender: 'Male',
    foundLocation: 'Downtown Market, Iligan City',
    rescueStory: 'Rescued from under a parked car during heavy rain. He was scared but unharmed.',
    behavior: 'Independent, curious, lap cat',
    healthStatus: 'Vaccinated, neutered',
    mainImg: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80'
  },
  {
    id: 4,
    name: 'Bella',
    type: 'Dog',
    category: 'Dogs',
    estimatedAge: '3 years',
    gender: 'Female',
    foundLocation: 'Buhanginan, Iligan City',
    rescueStory: 'Found chained without food or water. Severely dehydrated when rescued.',
    behavior: 'Gentle, protective, loves children',
    healthStatus: 'Fully recovered, vaccinated',
    mainImg: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'
  },
  {
    id: 5,
    name: 'Shadow',
    type: 'Cat',
    category: 'Cats',
    estimatedAge: '2 years',
    gender: 'Male',
    foundLocation: 'Tambacan, Iligan City',
    rescueStory: 'Rescued from a collapsed building. Had minor injuries but made full recovery.',
    behavior: 'Quiet, observant, affectionate',
    healthStatus: 'Vaccinated, healthy',
    mainImg: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&q=80'
  },
  {
    id: 6,
    name: 'Rocky',
    type: 'Dog',
    category: 'Special Care',
    estimatedAge: '5 years',
    gender: 'Male',
    foundLocation: 'Kiwalan, Iligan City',
    rescueStory: 'Hit by a vehicle. Underwent surgery and physiotherapy. Now mobile with slight limp.',
    behavior: 'Brave, loyal, resilient',
    healthStatus: 'Special needs, vaccinated',
    mainImg: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80'
  },
  {
    id: 7,
    name: 'Mittens',
    type: 'Cat',
    category: 'Cats',
    estimatedAge: '4 months',
    gender: 'Female',
    foundLocation: 'Saray, Iligan City',
    rescueStory: 'Found orphaned after mother cat was killed. Bottle-fed by volunteers.',
    behavior: 'Playful, social, loves attention',
    healthStatus: 'Vaccinated, growing well',
    mainImg: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=80'
  },
  {
    id: 8,
    name: 'Buddy',
    type: 'Dog',
    category: 'Puppies',
    estimatedAge: '8 months',
    gender: 'Male',
    foundLocation: 'Santiago, Iligan City',
    rescueStory: 'Abandoned at the shelter gate in a cardboard box. Now thriving with care.',
    behavior: 'Friendly, obedient, quick learner',
    healthStatus: 'Vaccinated, healthy',
    mainImg: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&q=80'
  },
  {
    id: 9,
    name: 'Coco',
    type: 'Cat',
    category: 'Cats',
    estimatedAge: '3 years',
    gender: 'Female',
    foundLocation: 'Mahayahay, Iligan City',
    rescueStory: 'Found injured after being attacked by dogs. Recovered with medical care and lots of love.',
    behavior: 'Sweet, gentle, loves cuddles',
    healthStatus: 'Fully healed, vaccinated',
    mainImg: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&q=80'
  },
  {
    id: 10,
    name: 'Duke',
    type: 'Dog',
    category: 'Dogs',
    estimatedAge: '4 years',
    gender: 'Male',
    foundLocation: 'Poblacion, Iligan City',
    rescueStory: 'Rescued from the streets where he wandered for months. Very grateful for shelter.',
    behavior: 'Loyal, calm, well-behaved',
    healthStatus: 'Vaccinated, neutered',
    mainImg: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80'
  },
  {
    id: 11,
    name: 'Ginger',
    type: 'Cat',
    category: 'Cats',
    estimatedAge: '6 months',
    gender: 'Female',
    foundLocation: 'Tubod, Iligan City',
    rescueStory: 'Found trapped in a drain during heavy rain. Rescued just in time before flooding.',
    behavior: 'Playful, adventurous, curious',
    healthStatus: 'Vaccinated, healthy',
    mainImg: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80'
  },
  {
    id: 12,
    name: 'Charlie',
    type: 'Dog',
    category: 'Puppies',
    estimatedAge: '5 months',
    gender: 'Male',
    foundLocation: 'Ditucalan, Iligan City',
    rescueStory: 'Found alone near the highway, scared and hungry. Now a happy, playful pup.',
    behavior: 'Energetic, loving, social',
    healthStatus: 'Vaccinated, dewormed',
    mainImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80'
  },
  {
    id: 13,
    name: 'Princess',
    type: 'Cat',
    category: 'Special Care',
    estimatedAge: '2 years',
    gender: 'Female',
    foundLocation: 'Mandulog, Iligan City',
    rescueStory: 'Born with a leg deformity but doesn\'t let it slow her down. Loves to climb and play.',
    behavior: 'Spirited, determined, affectionate',
    healthStatus: 'Special needs, vaccinated',
    mainImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1573865526739-10c1dd85fd2d?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
  }
];

const filterOptions = ['All', 'Dogs', 'Cats', 'Puppies', 'Special Care'];

export function HorizontalAdoptionGallery({ pets: propsPets }: { pets?: any[] }) {
  const displayPets = (propsPets && propsPets.length > 0) ? propsPets.map((p, idx) => ({
    id: p.id || idx,
    name: p.name,
    type: p.type,
    category: p.type === 'Cat' ? 'Cats' : 'Dogs',
    estimatedAge: p.age,
    gender: p.gender,
    foundLocation: 'Iligan City Shelter',
    rescueStory: p.story || 'Rescued and ready for adoption.',
    behavior: p.behavior || 'Friendly & Loving',
    healthStatus: p.vaccinated ? 'Vaccinated' : 'In Care',
    mainImg: p.mainImg || p.img,
    beforeImg: p.mainImg || p.img,
    afterImg: p.mainImg || p.img
  })) : allPets;

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [applyingPet, setApplyingPet] = useState<any | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [xPos, setXPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter pets
  const filteredPets = selectedFilter === 'All'
    ? displayPets
    : displayPets.filter(pet => pet.category === selectedFilter);

  // Duplicate pets array for seamless infinite loop
  const loopPets = [...filteredPets, ...filteredPets];

  // Auto-scroll animation
  useAnimationFrame((t, delta) => {
    if (!isPaused && !flippedCard && !applyingPet) {
      const speed = 0.3; // pixels per frame
      setXPos(prev => {
        const cardWidth = 400;
        const gap = 32;
        const singleSetWidth = filteredPets.length * (cardWidth + gap);
        const newPos = prev - speed;

        // Reset position when first set completely scrolls off
        if (Math.abs(newPos) >= singleSetWidth) {
          return 0;
        }

        return newPos;
      });
    }
  });

  const handleApply = (pet: any) => {
    setApplyingPet(pet);
    setFlippedCard(null);
  };

  const submitApplication = () => {
    toast.success(`Application submitted for ${applyingPet?.name}! We'll contact you soon.`);
    setApplyingPet(null);
  };

  return (
    <section ref={containerRef} className="relative bg-gradient-to-br from-paw-bg via-white to-paw-yellow/10 overflow-hidden py-24">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-paw-orange/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-paw-blue/10 rounded-full blur-3xl"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative"
        >
          <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-6 border border-paw-orange/20">
            <Sparkles size={18} className="text-paw-orange" />
            <span className="text-xs font-black tracking-widest uppercase text-paw-orange">Adoption Gallery</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-paw-navy leading-tight mb-6">
            Meet Your Future <span className="text-paw-orange italic">Furry Friend</span>
          </h2>
          <p className="text-lg text-gray-500 font-bold max-w-2xl mx-auto mb-8">
            Each pet has been rescued, rehabilitated, and is ready for a loving home. Hover to pause and click to learn more.
          </p>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setXPos(0); // Reset position on filter change
                }}
                className={`px-6 py-3 rounded-full font-black text-xs tracking-widest uppercase transition-all shadow-lg ${
                  selectedFilter === filter
                    ? 'bg-paw-orange text-white scale-105'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Horizontal Scroll Container - Infinite Loop */}
      <div className="relative h-[650px] flex items-center overflow-hidden">
        <motion.div
          animate={{ x: xPos }}
          className="flex gap-8 px-4 py-8 will-change-transform"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loopPets.map((pet, index) => (
            <motion.div
              key={`${pet.id}-${index}`}
              whileHover={{ scale: 1.03, y: -8 }}
              className="relative shrink-0 w-[400px] h-[600px] perspective-1000"
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: flippedCard === pet.id ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 backface-hidden rounded-[3rem] overflow-hidden shadow-2xl bg-white cursor-pointer hover:shadow-[0_20px_60px_rgba(245,158,11,0.3)] transition-shadow duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                  onClick={() => setFlippedCard(pet.id)}
                >
                  <div className="relative h-[70%]">
                    <ImageWithFallback
                      src={pet.mainImg}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-xs font-black uppercase tracking-widest text-paw-navy">
                        {pet.type === 'Dog' ? <Dog size={16} className="inline mr-1" /> : <Cat size={16} className="inline mr-1" />}
                        {pet.type}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="p-6 h-[30%] flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-paw-navy mb-2 italic">{pet.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span className="font-bold">{pet.estimatedAge}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span className="font-bold">{pet.gender}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCard(pet.id);
                      }}
                      className="w-full bg-paw-orange text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                    >
                      VIEW STORY <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 backface-hidden rounded-[3rem] overflow-hidden shadow-2xl bg-white p-2 flex flex-col"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <button
                    onClick={() => setFlippedCard(null)}
                    className="absolute top-6 right-6 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>

                  <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-snapped p-6 md:p-7 space-y-4 pb-2 pt-3 rounded-[2.5rem]">
                    <div className="pr-10 pt-1">
                      <h3 className="text-3xl font-black text-paw-navy mb-1 italic leading-normal pt-1">{pet.name}'s Story</h3>
                      <div className="flex items-center gap-2 text-paw-orange">
                        <MapPin size={16} />
                        <span className="text-sm font-bold">{pet.foundLocation}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Rescue Story</h4>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-bold">{pet.rescueStory}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Before</h4>
                        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                          <ImageWithFallback 
                            src={pet.beforeImg} 
                            alt="Before" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">After</h4>
                        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                          <ImageWithFallback 
                            src={pet.afterImg} 
                            alt="After" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Behavior</h4>
                      <p className="text-xs md:text-sm text-gray-600 font-bold">{pet.behavior}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Health Status</h4>
                      <div className="flex items-center gap-2 text-paw-green">
                        <CheckCircle2 size={16} />
                        <span className="text-xs md:text-sm font-bold">{pet.healthStatus}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleApply(pet)}
                        className="w-full bg-paw-green text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Heart size={18} fill="white" />
                        APPLY TO ADOPT
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Application Modal */}
      {applyingPet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setApplyingPet(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col p-2 md:p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto overflow-x-hidden p-6 md:p-8 scrollbar-snapped flex-1 rounded-[2.5rem]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-4xl font-black text-paw-navy mb-2 italic">Adopt {applyingPet.name}</h3>
                  <p className="text-gray-500 font-bold">Complete this form to begin the adoption process</p>
                </div>
                <button
                  onClick={() => setApplyingPet(null)}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitApplication();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none transition-colors"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none transition-colors"
                    placeholder="0912-345-6789"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none transition-colors"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Home Address</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none transition-colors resize-none"
                  placeholder="Complete address in Iligan City"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Why do you want to adopt {applyingPet.name}?</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-paw-orange outline-none transition-colors resize-none"
                  placeholder="Tell us about your experience with pets and why you'd be a great match..."
                />
              </div>

              <div className="bg-paw-bg rounded-2xl p-6">
                <h4 className="font-black text-paw-navy mb-3 uppercase text-sm">Adoption Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-paw-green shrink-0 mt-0.5" />
                    <span>Must be 21 years old or above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-paw-green shrink-0 mt-0.5" />
                    <span>Valid ID and proof of residence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-paw-green shrink-0 mt-0.5" />
                    <span>Home visit will be scheduled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-paw-green shrink-0 mt-0.5" />
                    <span>Adoption fee: ₱500 (covers vaccination & neutering)</span>
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-paw-green text-white py-5 rounded-2xl font-black text-lg tracking-widest uppercase hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <Heart size={20} fill="white" />
                SUBMIT APPLICATION
              </button>
            </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}