import { motion, useScroll, useTransform } from 'motion/react';
import React from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

const stories = [
  {
    image: "https://images.unsplash.com/photo-1660088294311-22b48dde998d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwZG9nJTIwaGFwcHklMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ0MDc3Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Max",
    story: "Found injured in Tambo, now thriving with his family",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  },
  {
    image: "https://images.unsplash.com/photo-1725813082953-5041e0fce62e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwY2F0JTIwY2xvc2UtdXB8ZW58MXx8fHwxNzc0NDA3Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Luna",
    story: "Rescued from the streets, now has a loving home",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  },
  {
    image: "https://images.unsplash.com/photo-1569229646060-65d06a76d360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJheSUyMGRvZyUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzQ0MDc3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Buddy",
    story: "Saved from highway danger, recovering well",
    location: "Iligan City, 2024",
    status: "RESCUED"
  },
  {
    image: "https://images.unsplash.com/photo-1594004844613-19d4db632e0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwcHVwcHklMjBzaGVsdGVyfGVufDF8fHx8MTc3NDQwNzc3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Charlie",
    story: "Orphaned puppy now full of life and joy",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  },
  {
    image: "https://images.unsplash.com/photo-1763312180734-cfe8eceebc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJheSUyMGNhdCUyMHJlc2N1ZWR8ZW58MXx8fHwxNzc0NDA3NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Whiskers",
    story: "From abandoned to adored in three months",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  },
  {
    image: "https://images.unsplash.com/photo-1661552066736-935e0cad1782?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjByZXNjdWUlMjB0ZWFtJTIwdm9sdW50ZWVyfGVufDF8fHx8MTc3NDQwNzc4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Rocky",
    story: "Rescued during typhoon, brave survivor",
    location: "Iligan City, 2023",
    status: "RESCUED"
  },
  {
    image: "https://images.unsplash.com/photo-1588977827076-b4db84d29151?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFkb3B0ZWQlMjBkb2clMjBmYW1pbHl8ZW58MXx8fHwxNzc0NDA3NzgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Bella",
    story: "Once homeless, now brings joy to her family",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  },
  {
    image: "https://images.unsplash.com/photo-1740745230774-724be6ce921d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBhZG9wdGlvbiUyMHNoZWx0ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ0MDc3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Mittens",
    story: "Shy shelter cat transformed into loving companion",
    location: "Iligan City, 2024",
    status: "ADOPTED"
  }
];

export function HorizontalPhotoStory() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={ref} className="bg-[#111111] py-24 overflow-hidden relative font-quicksand">
      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">
          Scroll to explore their stories →
        </p>
      </motion.div>

      {/* Horizontal scrolling strip */}
      <motion.div 
        style={{ x }}
        className="flex gap-6 px-6"
      >
        {stories.map((story, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.04,
              boxShadow: "0 0 40px rgba(245,158,11,0.3)"
            }}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="relative w-[300px] h-[420px] rounded-xl overflow-hidden">
              <ImageWithFallback
                src={story.image}
                alt={story.name}
                className="w-full h-full object-cover"
              />
              
              {/* Status badge */}
              <div className="absolute top-4 right-4 bg-paw-orange px-3 py-1 rounded-full">
                <span className="text-[9px] uppercase font-black tracking-widest text-white">
                  {story.status}
                </span>
              </div>

              {/* Location label */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-bold mb-1">
                  {story.location}
                </p>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Name and story */}
            <div className="mt-4 px-2">
              <h3 className="text-xl font-black text-white mb-1">{story.name}</h3>
              <p className="text-xs text-white/60 font-medium leading-relaxed">
                {story.story}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Fade gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-paw-bg pointer-events-none" />
    </section>
  );
}
