/* eslint-disable curly */
import { Users, ArrowRight, User, MapPin, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence, useAnimationFrame } from 'motion/react';
import React, { useState, useRef } from 'react';
import profile_james_bautista from '@/assets/profiles/james_bautista.jpg';
import profile_leamarie_hempesao from '@/assets/profiles/leamarie_hempesao.jpg';
import profile_mildred_nabong from '@/assets/profiles/mildred_nabong.jpg';
import profile_persal_lacasan from '@/assets/profiles/persal_lacasan.jpg';
import profile_trusty_espinosa from '@/assets/profiles/trusty_espinosa.jpg';
import profile_welmar_espinosa from '@/assets/profiles/welmar_espinosa.jpg';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

const teamMembers = [
  // Founders & Leadership
  {
    name: 'Trusty Choice Espinosa',
    role: 'Chancellor / Head Admin / Founder',
    img: profile_trusty_espinosa,
    yearsActive: '40 years old',
    rescues: 'Santiago, Iligan City',
    story: `As the founder and head admin of Iligan Stray Feeders, Trusty Choice Espinosa has dedicated his life to creating a compassionate community for stray animals in Iligan City. What started as a personal mission to help the voiceless has grown into a movement that touches countless lives - both human and animal.

From the very beginning, Trusty understood that saving animals isn't just about providing food and shelter. It's about changing hearts, building systems, and creating lasting change in how communities treat their most vulnerable members.

Under his leadership, ISF has grown from a small feeding program to a comprehensive rescue, rehabilitation, and adoption network. His vision extends beyond emergency response - he's focused on education, community engagement, and sustainable solutions that will benefit generations of animals to come.

Trusty's approach combines practical action with strategic thinking. He doesn't just rescue animals in crisis; he works to prevent those crises from happening in the first place through vaccination programs, spay/neuter initiatives, and community education.

At 40 years old and based in Santiago, Iligan City, Trusty continues to lead with unwavering dedication. His door is always open to volunteers, donors, and anyone who shares the vision of a more compassionate Iligan. Every animal saved, every volunteer trained, and every life changed is a testament to his founding vision: that every stray deserves a voice.`,
    quote: 'Building a movement, one rescued life at a time.'
  },
  {
    name: 'Welmar-Joy Espinosa',
    role: 'Analyst / Co-Founder',
    img: profile_welmar_espinosa,
    yearsActive: '43 years old',
    rescues: 'Santiago, Iligan City',
    story: `As co-founder and analyst of Iligan Stray Feeders, Welmar-Joy Espinosa brings strategic vision and data-driven decision-making to the organization's mission. While others see individual animals in need, Welmar-Joy sees patterns, systems, and opportunities for systematic change.

His analytical approach has transformed how ISF operates. By tracking rescue data, monitoring resource allocation, and analyzing community response patterns, he helps the organization make smarter decisions about where to focus efforts and how to maximize impact with limited resources.

But Welmar-Joy's role goes far beyond numbers. He understands that behind every statistic is a living, breathing animal with a story. His analysis helps ISF identify high-risk areas, predict seasonal trends in abandonment, and allocate resources where they'll save the most lives.

Working alongside the founder, Welmar-Joy has been instrumental in scaling ISF's operations from a grassroots feeding program to a comprehensive animal welfare organization. His insights guide strategic planning, fundraising priorities, and program development.

At 43 years old and based in Santiago, Iligan City, Welmar-Joy continues to blend compassion with strategy. He proves that saving animals requires both heart and head - that the most effective rescue work is built on solid data, clear analysis, and unwavering commitment to continuous improvement.`,
    quote: 'Data tells us where to act. Compassion tells us why we must.'
  },
  // Department Heads
  {
    name: 'Leamarie Hempesao',
    role: 'Operations Head',
    img: profile_leamarie_hempesao,
    yearsActive: '21 years old',
    rescues: 'Bagong Silang, Iligan City',
    story: `At just 21 years old, Leamarie Hempesao leads ISF's operations with remarkable maturity and dedication. As Operations Head, she orchestrates the daily heartbeat of the organization - coordinating rescues, managing volunteers, and ensuring every animal receives the care they need.

Leamarie's journey with ISF started as a young volunteer, but her natural leadership abilities and tireless work ethic quickly became evident. She has an extraordinary ability to stay calm under pressure, make quick decisions in emergencies, and keep multiple rescue operations running smoothly simultaneously.

What sets Leamarie apart is her hands-on approach. She doesn't lead from behind a desk - she's out in the field, responding to rescue calls, training new volunteers, and personally ensuring every operation runs efficiently. Her youth brings fresh energy and innovative ideas to ISF's operations.

Based in Bagong Silang, Iligan City, Leamarie has built strong relationships throughout the community. She knows the areas where strays congregate, the people who call in reports, and the fastest routes to reach animals in distress. Her local knowledge makes her an invaluable asset to the team.

Despite her young age, Leamarie has earned the respect of volunteers twice her age. She leads by example, never asking others to do what she wouldn't do herself. Her commitment proves that passion and dedication know no age limit.`,
    quote: "Age doesn't define leadership. Action does."
  },
  {
    name: 'James Darrel Bautista',
    role: 'Onboarding / Documentation Head',
    img: profile_james_bautista,
    yearsActive: '29 years old',
    rescues: 'Sta. Elena, Iligan City',
    story: `James Darrel Bautista brings structure and clarity to ISF's growing operations as the Onboarding and Documentation Head. At 29 years old, he understands that effective rescue work requires more than just good intentions - it needs systems, records, and proper training.

As Onboarding Head, James ensures every new volunteer receives comprehensive training before entering the field. He's developed orientation programs that cover everything from safe animal handling to understanding ISF's mission and values. His approach ensures volunteers feel prepared and confident from day one.

But James's role extends far beyond training. As Documentation Head, he maintains meticulous records of every rescue, adoption, and medical treatment. These records aren't just paperwork - they're the evidence of ISF's impact, the data that drives better decisions, and the stories that inspire continued support.

From Sta. Elena, Iligan City, James has created systems that allow ISF to operate efficiently even as it scales. He's built databases, created standardized forms, and established protocols that ensure nothing falls through the cracks. Every animal's journey is documented, every volunteer's contribution is recorded.

James believes that good documentation honors both the animals served and the people who serve them. His work ensures that years from now, people can look back and see exactly what ISF accomplished - not just in numbers, but in individual lives changed forever.`,
    quote: 'Every record tells a story. Every story deserves to be told.'
  },
  {
    name: 'Mildred Nabong',
    role: 'Shelter Warden',
    img: profile_mildred_nabong,
    yearsActive: '57 years old',
    rescues: 'Kiwalan, Iligan City',
    story: `At 57 years old, Mildred Nabong brings decades of life experience and boundless compassion to her role as Shelter Warden. The animals at ISF's shelter don't just have a caretaker - they have a guardian, an advocate, and in many ways, a second mother.

Mildred's day starts before dawn and often ends long after sunset. She's the first to feed the animals each morning and the last to check on them each night. She knows every animal by name, understands their individual quirks, and notices immediately when something isn't quite right.

As Shelter Warden, Mildred oversees daily operations at the shelter, manages feeding schedules, coordinates medical care, and ensures every animal receives the attention they deserve. But her role goes far beyond logistics. She's the one who comforts scared animals, celebrates small victories, and mourns the losses.

From Kiwalan, Iligan City, Mildred has turned the shelter into more than just a temporary holding facility. She's created a healing space where traumatized animals can learn to trust again, where injured animals can recover in peace, and where every resident feels valued.

Mildred often says she's learned more from the animals than she's taught them. They've shown her resilience in the face of abandonment, trust despite betrayal, and the power of unconditional love. At 57, she's found her life's calling in caring for those who cannot speak for themselves.`,
    quote: "They may be here temporarily, but they're loved forever."
  },
  {
    name: 'Persal Lacasan',
    role: 'Advisor / Operations',
    img: profile_persal_lacasan,
    yearsActive: '40 years old',
    rescues: 'San Francisco, Iligan City',
    story: `Persal Lacasan serves as both advisor and operations support, bringing 40 years of life wisdom and practical experience to ISF. His unique position allows him to bridge strategic thinking with hands-on execution, making him an invaluable resource for the entire team.

As an advisor, Persal provides guidance on everything from difficult operational decisions to long-term strategic planning. His perspective helps leadership see challenges from different angles and consider solutions they might have missed. He's the voice of experience when the team faces unfamiliar territory.

But Persal doesn't just advise from the sidelines. As part of operations, he's actively involved in daily rescue work, problem-solving in real-time, and supporting the team on the ground. This dual role gives him credibility - he doesn't suggest solutions he wouldn't implement himself.

From San Francisco, Iligan City, Persal has built extensive networks throughout the community. His relationships open doors, facilitate partnerships, and help ISF navigate complex situations that require diplomatic skill and trusted connections.

At 40, Persal represents the perfect balance of energy and experience. He's young enough to adapt to new approaches and old enough to remember lessons learned the hard way. His presence provides stability and wisdom to an organization that's constantly evolving and growing.`,
    quote: 'Experience teaches. Action proves. Together, they transform.'
  },
  // Operations Staff & Officers
  {
    name: 'Llen Marshie Marabut',
    role: 'Documentation Staff / Operations',
    img: 'https://i.pravatar.cc/300?u=marshie',
    yearsActive: '20 years old',
    rescues: 'San Miguel, Iligan City',
    story: `Llen Marshie Marabut brings youthful energy and meticulous attention to detail to ISF's documentation team. At just 20 years old, she represents the next generation of animal welfare advocates - tech-savvy, passionate, and committed to creating lasting change.`,
    quote: 'Every detail matters when lives are at stake.'
  },
  {
    name: 'Jasmine Engnan',
    role: 'Adoption Officer / Operations',
    img: 'https://i.pravatar.cc/300?u=jasmine',
    yearsActive: '25 years old',
    rescues: 'Bagong Silang, Iligan City',
    story: `Jasmine Engnan specializes in the most rewarding part of rescue work - matching animals with their forever families. As Adoption Officer, she ensures every adoption is a perfect fit, setting both animals and families up for lifelong success.`,
    quote: 'Finding the right match means a lifetime of love.'
  },
  {
    name: 'Rosa Fatimah Dimanda',
    role: 'Chamberlain / Operations',
    img: 'https://i.pravatar.cc/300?u=rosa',
    yearsActive: '25 years old',
    rescues: 'San Miguel, Iligan City',
    story: `Rosa Fatimah Dimanda manages the behind-the-scenes operations that keep ISF running smoothly. As Chamberlain, she ensures resources are managed efficiently and the team has what they need to succeed.`,
    quote: 'Good logistics save lives just as surely as good medicine.'
  },
  {
    name: 'Michelle Antimano',
    role: 'Operations Staff',
    img: 'https://i.pravatar.cc/300?u=michelle',
    yearsActive: '40 years old',
    rescues: 'Luinab, Iligan City',
    story: `Michelle Antimano brings decades of life experience and unwavering dedication to ISF's operations team. Her steady presence and reliable work ethic make her an anchor for the organization's daily activities.`,
    quote: 'Consistency and compassion - the foundation of effective rescue work.'
  },
  {
    name: 'Chel Diane Falceso',
    role: 'Operations Coordinator',
    img: 'https://i.pravatar.cc/300?u=chel',
    yearsActive: '25 years old',
    rescues: 'Tubod, Iligan City',
    story: `Chel Diane Falceso coordinates the complex web of operations that make ISF's rescue efforts possible. She ensures teams work in harmony, resources reach where they're needed, and no animal falls through the cracks.`,
    quote: 'Coordination turns individual efforts into collective impact.'
  },
  {
    name: 'Febler Mark Bation',
    role: 'Rescue Officer / Operations',
    img: 'https://i.pravatar.cc/300?u=febler',
    yearsActive: '25 years old',
    rescues: 'San Miguel, Iligan City',
    story: `Febler Mark Bation serves on the front lines as a Rescue Officer, responding to calls for help and bringing endangered animals to safety. His quick thinking and compassionate approach save lives every day.`,
    quote: 'Every rescue call is a chance to make a difference.'
  },
  {
    name: 'Denver Ygay',
    role: 'Transport / Operations Staff',
    img: 'https://i.pravatar.cc/300?u=denver',
    yearsActive: '25 years old',
    rescues: 'Santa Elena, Iligan City',
    story: `Denver Ygay ensures animals reach safety through his crucial transport role. Whether it's an emergency rescue or a trip to the vet, Denver's reliable transportation keeps ISF's operations moving.`,
    quote: 'The journey to safety starts with someone willing to drive.'
  },
  {
    name: 'Mia Renee Sumalinog',
    role: 'Operations Staff',
    img: 'https://i.pravatar.cc/300?u=mia',
    yearsActive: '25 years old',
    rescues: 'Del Carmen, Iligan City',
    story: `Mia Renee Sumalinog supports ISF's operations with dedication and attention to detail. Her contributions ensure the organization runs efficiently and every animal receives the care they deserve.`,
    quote: 'Small actions, multiplied by many hands, create miracles.'
  },
  {
    name: 'Christian Miguel Quidlat',
    role: 'Liaison Officer',
    img: 'https://i.pravatar.cc/300?u=christian',
    yearsActive: '25 years old',
    rescues: 'Del Carmen, Iligan City',
    story: `Christian Miguel Quidlat serves as ISF's bridge to the community, managing relationships with partners, supporters, and other organizations. His communication skills help expand ISF's reach and impact.`,
    quote: 'Connection and collaboration amplify our mission.'
  },
  {
    name: 'Allan Restauro',
    role: 'Operations Staff',
    img: 'https://i.pravatar.cc/300?u=allan',
    yearsActive: '27 years old',
    rescues: 'Tubod, Iligan City',
    story: `Allan Restauro contributes to ISF's daily operations with reliability and commitment. His steady work ensures animals receive consistent care and the organization functions smoothly.`,
    quote: "Dedication doesn't require recognition - only commitment."
  },
  {
    name: 'Jade Dresser',
    role: 'Operations Staff',
    img: 'https://i.pravatar.cc/300?u=jade',
    yearsActive: '21 years old',
    rescues: 'Santiago, Iligan City',
    story: `Jade Dresser represents the passionate young generation committed to animal welfare. At 21, she brings fresh energy and unwavering commitment to ISF's operations.`,
    quote: 'Youth and passion fuel the future of animal rescue.'
  },
  {
    name: 'Marie Clapano',
    role: 'Operations Staff',
    img: 'https://i.pravatar.cc/300?u=marie',
    yearsActive: '25 years old',
    rescues: 'Del Carmen, Iligan City',
    story: `Marie Clapano supports ISF's mission through dedicated operations work. Her contributions help ensure every animal receives the attention and care they need.`,
    quote: 'Every task completed is another animal helped.'
  }
];

export function AboutSections() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useAnimationFrame((t) => {
    if (!scrollContainerRef.current || isPaused) return;

    const scrollSpeed = 0.5; // pixels per frame
    const container = scrollContainerRef.current;

    container.scrollLeft += scrollSpeed;

    // Reset scroll when reaching the end (infinite loop)
    if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
      container.scrollLeft = 0;
    }
  });

  return (
    <>
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6 items-start">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-paw-green/20 shrink-0">
                    <ImageWithFallback
                      src={selectedMember.img}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 bg-paw-green/10 px-3 py-1.5 rounded-full mb-2 border border-paw-green/20">
                      <Users size={14} className="text-paw-green" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-paw-green">Team Member</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-paw-navy mb-1">{selectedMember.name}</h3>
                    <p className="text-sm font-black text-paw-orange uppercase tracking-widest mb-2">{selectedMember.role}</p>
                    <div className="flex gap-4 text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-paw-blue" />
                        {selectedMember.yearsActive}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-paw-orange" />
                        {selectedMember.rescues}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-paw-green/5 to-paw-blue/5 rounded-2xl p-6 border-2 border-paw-green/10">
                  <h4 className="text-lg font-black text-paw-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-paw-green" />
                    My Journey to Iligan Stray Feeders
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    {selectedMember.story.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-700 font-bold leading-relaxed mb-4 text-justify">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-paw-navy text-white rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-6xl text-paw-yellow opacity-50">"</div>
                    <div>
                      <p className="text-lg font-bold italic mb-2">{selectedMember.quote}</p>
                      <p className="text-sm font-black text-paw-yellow uppercase tracking-widest">— {selectedMember.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto overflow-hidden px-4 py-16">
      {/* Founder Story */}


      {/* Team Section */}
      <section className="py-12 -mx-4">
        <div className="text-center max-w-3xl mx-auto mb-12 px-4">
          <div className="inline-flex items-center gap-2 bg-paw-green/10 px-4 py-2 rounded-full mb-6 border border-paw-green/20">
            <Users size={18} className="text-paw-green" />
            <span className="text-xs font-black tracking-widest uppercase text-paw-green">Meet Our Team</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-paw-navy italic uppercase tracking-tighter italic mb-4">The <span className="text-paw-green not-italic">ISF Family</span></h2>
          <p className="text-lg text-gray-500 font-bold italic leading-relaxed">From founders to volunteers, each member brings unique skills and unwavering dedication to Iligan's stray animals. Together, we're building a compassionate community.</p>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-8 overflow-x-auto pb-8 px-4 hide-scrollbar"
          >
            {/* Duplicate team members for seamless infinite scroll */}
            {[...teamMembers.slice(0, 6), ...teamMembers.slice(0, 6)].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 6) * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedMember(member)}
                className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-gray-50 group text-center cursor-pointer flex-shrink-0 w-[320px]"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-8 border-gray-50 group-hover:border-paw-green transition-all shadow-xl">
                  <ImageWithFallback src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <h3 className="text-xl font-black text-paw-navy italic uppercase tracking-tighter mb-1 leading-tight">{member.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">{member.role}</p>
                <div className="flex justify-center gap-3 text-xs font-bold text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-paw-blue" />
                    {member.yearsActive}
                  </div>
                </div>
                <div className="flex items-center gap-1 justify-center text-[10px] font-bold text-gray-400 mb-6">
                  <MapPin size={12} className="text-paw-orange" />
                  <span className="line-clamp-1">{member.rescues}</span>
                </div>
                <button className="w-full bg-gray-50 text-paw-navy py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-paw-green hover:text-white transition-all group-hover:bg-paw-green group-hover:text-white flex items-center justify-center gap-2">
                  READ STORY
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Section */}
      
    </div>
    </>
  );
}
