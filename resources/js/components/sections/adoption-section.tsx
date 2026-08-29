import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Info, ArrowRight, CheckCircle2, User, Clock, Sparkles, Dog, Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AdoptionWizard } from '@/components/adoption-wizard';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/BookmarkContext';

const defaultPets = [
  {
    id: 1,
    name: 'Luna',
    type: 'Dog',
    breed: 'Golden Retriever Mix',
    age: '2 Years',
    gender: 'Female',
    behavior: 'Sweet, Energetic, Loves Kids',
    story: 'Luna was found tied to a post near the market. She was malnourished and scared, but with lots of love and food, she is now the happiest dog in the shelter.',
    mainImg: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1596797882942-f441d7f56c0e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80'
  },
  {
    id: 2,
    name: 'Oliver',
    type: 'Cat',
    breed: 'Domestic Shorthair',
    age: '1 Year',
    gender: 'Male',
    behavior: 'Calm, Observant, Lap Cat',
    story: 'Oliver was a survivor of a house fire. Despite his rough start, he is extremely affectionate and looking for a quiet home to relax in.',
    mainImg: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80'
  },
  {
    id: 3,
    name: 'Cooper',
    type: 'Dog',
    breed: 'Askal Mix',
    age: '4 Years',
    gender: 'Male',
    behavior: 'Protective, Loyal, Intelligent',
    story: 'Cooper was the leader of a small pack in Tibanga. After a car accident, he was rescued by our volunteers. He is now fully recovered and ready for a leader of his own.',
    mainImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80'
  }
];

export function AdoptionSection({ pets: propsPets }: { pets?: any[] }) {
    const displayPets = (propsPets && propsPets.length > 0) ? propsPets.map((p, idx) => ({
        id: p.id || idx,
        name: p.name,
        type: p.type || 'Dog',
        breed: p.breed || 'Mixed Breed',
        age: p.age || '1 year',
        gender: p.gender || 'Unknown',
        behavior: p.behavior || 'Friendly & Loving',
        story: p.story || 'Rescued and looking for a forever home.',
        mainImg: p.mainImg || p.img || p.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
        beforeImg: p.beforeImg || p.before_img || 'https://images.unsplash.com/photo-1596797882942-f441d7f56c0e?w=400&q=80',
        afterImg: p.afterImg || p.after_img || p.mainImg || p.img || p.photo_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80',
    })) : defaultPets;
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const [applyingPet, setApplyingPet] = useState<any | null>(null);
    const navigate = router.visit;
    const auth = usePage().props.auth as { user?: any } | undefined;
    const user = auth?.user;          
    const isAuthenticated = !!user;
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();



    const handleApply = (pet: any) => {
        setApplyingPet(pet);
        toast.info(`Opening application for ${pet.name}...`);
    };

    const handleBookmark = (e: React.MouseEvent, pet: any) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please log in to bookmark pets', {
                description: 'Create an account or log in to save your favorite pets and access them anytime.',
                action: {
                    label: 'Log In',
                    onClick: () => navigate('/login')
                }
            });

            return;
        }   

        if (isBookmarked(pet.id, 'pet')) {
            removeBookmark(pet.id, 'pet');
        } else {
            addBookmark({
                id: pet.id,
                type: 'pet',
                title: pet.name,
                image: pet.mainImg,
                data: pet
            });
        }
    };

    return (
        <section className="bg-paw-navy text-white relative overflow-hidden py-20">
            {/* Wave Divider */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/20">
                        <Heart size={18} className="text-paw-coral" fill="#FB7185" />
                        <span className="text-xs font-black tracking-widest uppercase">Find Your Forever Friend</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight italic uppercase tracking-tighter">
                        Adopt, Don't <span className="text-paw-yellow not-italic">Shop!</span>
                    </h2>
                    <p className="text-xl text-white/60 font-bold max-w-2xl font-quicksand text-sm">
                        Give a second chance to these beautiful souls. Every adoption saves two lives: the one you take home, and the one we can rescue next.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
                    {displayPets.slice(0, 9).map((pet) => (
                        <div key={pet.id} className="h-[400px] perspective-1000">
                            <motion.div
                                className="relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer"
                                animate={{ rotateY: flippedCard === pet.id ? 180 : 0 }}
                                onClick={() => setFlippedCard(flippedCard === pet.id ? null : pet.id)}
                            >
                                {/* Front Side */}
                                <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border-4 border-white/10">
                                    <div className="relative h-full">
                                        <ImageWithFallback src={pet.mainImg} alt={pet.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-paw-orange text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full italic shadow-lg">{pet.type}</span>
                                                    <span className="bg-paw-blue text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full italic shadow-lg">{pet.breed}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">{pet.name}</h3>
                                                <div className="flex items-center gap-3 text-white/80 font-bold text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} className="text-paw-yellow" />
                                                        {pet.age}
                                                    </div>
                                                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                                    <div className="flex items-center gap-1">
                                                        <User size={12} className="text-paw-blue" />
                                                        {pet.gender}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30 hover:bg-white/30 transition-all group/bookmark"
                                                onClick={(e) => handleBookmark(e, pet)}
                                            >
                                                <Heart
                                                    size={18}
                                                    className={`transition-all ${isBookmarked(pet.id, 'pet') ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/bookmark:scale-110'}`}
                                                />
                                            </div>
                                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30 animate-pulse">
                                                <Info size={18} />
                                            </div>
                                        </div>
                                    </div>
                                {/* Back Side */}
                                <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] overflow-hidden rotate-y-180 text-paw-navy shadow-2xl flex flex-col p-1.5">
                                    <div className="h-full overflow-y-auto overflow-x-hidden p-5 scrollbar-snapped rounded-[2rem] flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-2.5">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-paw-orange pt-1">{pet.name}'s Story</h3>
                                                <div className="bg-paw-orange/10 p-2 rounded-xl text-paw-orange">
                                                    {pet.type === 'Dog' ? <Dog size={18} /> : <Cat size={18} />}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 font-bold leading-relaxed mb-3 italic text-xs">"{pet.story}"</p>
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Behavior</span>
                                                    <span className="text-xs font-black text-paw-navy">{pet.behavior}</span>
                                                </div>
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Vaccinated</span>
                                                    <span className="text-xs font-black text-paw-green flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> YES
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">When Rescued</span>
                                                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-50 bg-gray-100">
                                                        <ImageWithFallback src={pet.beforeImg} alt="Before" className="w-full h-full object-cover grayscale opacity-60" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Healthy Now</span>
                                                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-paw-green/20 bg-gray-100">
                                                        <ImageWithFallback src={pet.afterImg} alt="After" className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApply(pet);
                                            }}
                                            className="w-full bg-paw-navy text-white py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-paw-orange active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 group mt-1"
                                        >
                                            APPLY FOR ADOPTION
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
                <div className="mt-20 flex justify-center">
                    <Link 
                        href="/adopt"
                        className="flex items-center gap-3 text-white/60 hover:text-white transition-all font-black uppercase tracking-widest text-xs group py-3 px-6 rounded-full hover:bg-white/10"
                    >
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform text-paw-yellow" />
                        LOAD MORE RESCUES
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
            {/* Application Wizard */}
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