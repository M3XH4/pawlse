
import { Link } from '@inertiajs/react';
import { Dog, Cat, Heart, ArrowRight, MapPin, Clock, CheckCircle2, X, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Images } from 'lucide-react';
import { motion, useAnimationFrame, AnimatePresence } from 'motion/react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AdoptionWizard } from '@/components/adoption/adoption-wizard';
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
  const displayPets = (propsPets && propsPets.length > 0) ? propsPets.map((p, idx) => {
    const primaryImg = p.mainImg || p.img || p.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80';
    const rawPhotos = Array.isArray(p.photos) && p.photos.length > 0
      ? p.photos
      : [primaryImg, ...(Array.isArray(p.gallery_photos) ? p.gallery_photos : [])];
    const photos = Array.from(new Set(rawPhotos.filter(Boolean)));
    const beforeImg = p.beforeImg ?? p.before_photo_url ?? p.before_img ?? null;
    const afterImg = p.afterImg ?? p.after_photo_url ?? p.after_img ?? null;

    return {
      id: p.id || idx,
      name: p.name,
      type: p.type,
      category: p.type === 'Cat' ? 'Cats' : (p.ageCategory === 'Puppy' ? 'Puppies' : 'Dogs'),
      estimatedAge: p.age,
      gender: p.gender,
      foundLocation: p.rescueLocation || p.rescue_location || 'Iligan City Shelter',
      rescueStory: p.rescueStory || p.rescue_story || p.story || 'Rescued and ready for adoption.',
      behavior: p.behavior || 'Friendly & Loving',
      healthStatus: p.healthStatus || (p.vaccinated ? 'Vaccinated, healthy' : 'Under medical care'),
      mainImg: primaryImg,
      photos: photos.length > 0 ? photos : [primaryImg],
      beforeImg,
      afterImg,
      isRescued: p.is_rescued ?? true,
      rescuedTag: p.rescued_tag || 'Rescued • In Shelter Care',
    };
  }) : allPets.map(p => ({
    ...p,
    photos: [p.mainImg],
    isRescued: true,
    rescuedTag: 'Rescued • In Shelter Care',
  }));

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [applyingPet, setApplyingPet] = useState<any | null>(null);
  const [activePhotoIndexByPet, setActivePhotoIndexByPet] = useState<Record<number, number>>({});
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
    if (pet.has_applied) {
      toast.info(`You have already submitted an adoption application for ${pet.name}.`);
      return;
    }
    setApplyingPet(pet);
    setFlippedCard(null);
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
                  <div className="relative h-[70%] group/img">
                    {(() => {
                      const photos: string[] = pet.photos && pet.photos.length > 0 ? pet.photos : [pet.mainImg];
                      const currentIdx = (activePhotoIndexByPet[pet.id] ?? 0) % photos.length;
                      const currentPhoto = photos[currentIdx] || pet.mainImg;

                      return (
                        <>
                          <ImageWithFallback
                            src={currentPhoto}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Rescued & In Shelter Tag or Applied Badge */}
                          {pet.has_applied ? (
                            <div className="absolute top-4 left-4 bg-emerald-600/95 text-white backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-400/40">
                              <CheckCircle2 size={14} className="shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Applied
                              </span>
                            </div>
                          ) : pet.isRescued !== false && (
                            <div className="absolute top-4 left-4 bg-emerald-600/95 text-white backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-400/40">
                              <ShieldCheck size={14} className="shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                {pet.rescuedTag || 'Rescued • In Shelter'}
                              </span>
                            </div>
                          )}

                          {/* Species Pill */}
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <span className="text-xs font-black uppercase tracking-widest text-paw-navy">
                              {pet.type === 'Dog' ? <Dog size={16} className="inline mr-1" /> : <Cat size={16} className="inline mr-1" />}
                              {pet.type}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                          {/* Multi-photo navigation controls */}
                          {photos.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePhotoIndexByPet(prev => ({
                                    ...prev,
                                    [pet.id]: (currentIdx - 1 + photos.length) % photos.length,
                                  }));
                                }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity z-20"
                                aria-label="Previous photo"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePhotoIndexByPet(prev => ({
                                    ...prev,
                                    [pet.id]: (currentIdx + 1) % photos.length,
                                  }));
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity z-20"
                                aria-label="Next photo"
                              >
                                <ChevronRight size={16} />
                              </button>
                              <div
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-full z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Images size={11} className="text-white/90 mr-0.5" />
                                {photos.map((_, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePhotoIndexByPet(prev => ({ ...prev, [pet.id]: pIdx }));
                                    }}
                                    className={`h-1.5 rounded-full transition-all ${
                                      pIdx === currentIdx ? 'w-4 bg-paw-orange' : 'w-1.5 bg-white/60 hover:bg-white'
                                    }`}
                                    aria-label={`View photo ${pIdx + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Rescue Story</h4>
                        {pet.isRescued !== false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                            <ShieldCheck size={11} /> Rescued & Sheltered
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-bold">{pet.rescueStory}</p>
                    </div>

                    {/* Conditional Before & After Transformation Photos */}
                    {(pet.beforeImg || pet.afterImg) && (
                      <div className={`grid ${pet.beforeImg && pet.afterImg ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        {pet.beforeImg && (
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
                        )}
                        {pet.afterImg && (
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
                        )}
                      </div>
                    )}

                    {/* Multi-photo gallery strip on card back when multiple photos exist */}
                    {pet.photos && pet.photos.length > 1 && (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">
                          Photo Gallery ({pet.photos.length})
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {pet.photos.slice(0, 4).map((photoUrl: string, pIdx: number) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                setActivePhotoIndexByPet(prev => ({ ...prev, [pet.id]: pIdx }));
                                setFlippedCard(null);
                              }}
                              className="aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-paw-orange transition-all"
                            >
                              <ImageWithFallback src={photoUrl} alt={`${pet.name} ${pIdx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                      {pet.has_applied ? (
                        <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Application Submitted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(pet)}
                          className="w-full bg-paw-green text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Heart size={18} fill="white" />
                          APPLY TO ADOPT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA to view all Rescued & In Shelter Care animals */}
      <div className="relative z-20 mt-10 flex justify-center px-4">
        <Link
          href="/animals?status=rescued_shelter"
          className="inline-flex items-center gap-3 bg-white hover:bg-paw-orange text-paw-navy hover:text-white border-2 border-paw-orange/20 hover:border-paw-orange px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase shadow-lg transition-all group"
        >
          <ShieldCheck size={18} className="text-emerald-600 group-hover:text-white transition-colors" />
          <span>Load More Rescued & In Shelter Animals</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Real Modern Adoption Wizard */}
      <AnimatePresence>
        {applyingPet && (
          <AdoptionWizard
            pet={applyingPet}
            onClose={() => setApplyingPet(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}