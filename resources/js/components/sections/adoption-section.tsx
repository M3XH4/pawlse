import { router, usePage } from '@inertiajs/react';
import { Heart, Info, ArrowRight, CheckCircle2, User, Clock, Sparkles, Dog, Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AdoptionWizard } from '@/components/adoption-wizard';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/BookmarkContext';

const pets = [
  {
    id: 1,
    name: 'Luna',
    type: 'Dog',
    breed: 'Golden Retriever Mix',
    age: '2 Years',
    gender: 'Female',
    behavior: 'Sweet, Energetic, Loves Kids',
    story: 'Luna was found tied to a post near the market. She was malnourished and scared, but with lots of love and food, she is now the happiest dog in the shelter.',
    mainImg: 'https://www.foundanimals.org/wp-content/uploads/2023/02/twenty20_b4e89a76-af70-4567-b92a-9c3bbf335cb3.jpg',
    beforeImg: 'https://assets-api.kathmandupost.com/thumb.php?src=https://assets-cdn.kathmandupost.com/uploads/source/news/2020/lifestyle/0729E827-1164-4D78-84F2-EDB6AF46A7DC.jpg&w=900&height=601',
    afterImg: 'https://paws.org.ph/wp-content/uploads/2022/08/Shelter-Feeding-JCE.jpg'
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
    mainImg: 'https://www.pd.com.au/wp-content/uploads/2021/08/Ginger-cat-peeks-at-the-camera-scaled.jpg',
    beforeImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR95kkIPYWZcUS9wI6ixVviOOmKWRV2E5Lkt6D9RQjZ5TzU6kBnkqNSOkdO&s=10',
    afterImg: 'https://www.gccfcats.org/wp-content/uploads/2021/11/getting-started.jpg'
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
    mainImg: 'https://paws.org.ph/wp-content/uploads/2023/05/IMG_20230515_110226-scaled-e1684202693703-1024x1024.jpg',
    beforeImg: 'https://animalfoundation.com/wp-content/uploads/2025/07/Vaccine_Photo.jpg',
    afterImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJySAm2UEZapxk2-ofEGZ8c2hqNVMHe7A7ZCIYcijpVzfogcsLuK9iw8&s=10'
  },
  {
    id: 4,
    name: 'Daisy',
    type: 'Dog',
    breed: 'Labrador Mix',
    age: '3 Years',
    gender: 'Female',
    behavior: 'Playful, Friendly, Great with Kids',
    story: 'Daisy was abandoned when her family moved away. She waited by their old house for weeks before volunteers brought her to safety. She deserves a family who will never leave her.',
    mainImg: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80'
  },
  {
    id: 5,
    name: 'Simba',
    type: 'Cat',
    breed: 'Orange Tabby',
    age: '2 Years',
    gender: 'Male',
    behavior: 'Confident, Vocal, Loves Cuddles',
    story: 'Simba was found as a tiny kitten in a storm drain. He has grown into a confident and vocal cat who loves attention and will chat with you all day.',
    mainImg: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80'
  },
  {
    id: 6,
    name: 'Pepper',
    type: 'Cat',
    breed: 'Tuxedo Cat',
    age: '1.5 Years',
    gender: 'Female',
    behavior: 'Independent, Smart, Playful',
    story: 'Pepper was rescued from the streets where she was fending for herself. She is smart and independent but loves interactive play sessions.',
    mainImg: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&q=80',
    beforeImg: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=80',
    afterImg: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&q=80'
  }
];

export function AdoptionSection() {
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
                    {pets.slice(0, 9).map((pet) => (
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
                                <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] p-6 rotate-y-180 overflow-y-auto text-paw-navy shadow-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-paw-orange">{pet.name}'s Story</h3>
                                        <div className="bg-paw-orange/10 p-2 rounded-xl text-paw-orange">
                                            {pet.type === 'Dog' ? <Dog size={18} /> : <Cat size={18} />}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 font-bold leading-relaxed mb-4 italic text-xs">\"{pet.story}\"</p>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Behavior</span>
                                            <span className="text-xs font-black text-paw-navy">{pet.behavior}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Vaccinated</span>
                                            <span className="text-xs font-black text-paw-green flex items-center gap-1">
                                                <CheckCircle2 size={12} /> YES
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">When Rescued</span>
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-50">
                                                <ImageWithFallback src={pet.beforeImg} alt="Before" className="w-full h-full object-cover grayscale opacity-50" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Healthy Now</span>
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-paw-green/20">
                                                <ImageWithFallback src={pet.afterImg} alt="After" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApply(pet);
                                        }}
                                        className="w-full bg-paw-navy text-white py-3 rounded-xl font-black text-sm tracking-widest uppercase hover:bg-paw-orange transition-all shadow-xl flex items-center justify-center gap-2 group"
                                    >
                                        APPLY FOR ADOPTION
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
                <div className="mt-20 flex justify-center">
                    <button 
                        onClick={() => navigate('/adopt')}
                        className="flex items-center gap-3 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest text-xs group"
                    >
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                        LOAD MORE RESCUES
                        <ArrowRight size={18} />
                    </button>
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