import { Heart, Users, Target, Shield, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import profile_james_bautista from '@/assets/profiles/james_bautista.jpg';
import profile_leamarie_hempesao from '@/assets/profiles/leamarie_hempesao.jpg';
import profile_mildred_nabong from '@/assets/profiles/mildred_nabong.jpg';
import profile_persal_lacasan from '@/assets/profiles/persal_lacasan.jpg';
import profile_trusty_espinosa from '@/assets/profiles/trusty_espinosa.jpg';
import profile_welmar_espinosa from '@/assets/profiles/welmar_espinosa.jpg';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';


const YEARLY_MILESTONES = [
  {
    year: 2020,
    title: 'The Beginning',
    description: 'Started with 5 passionate volunteers and fed 30 strays daily in 2 zones',
    stats: { volunteers: 5, zones: 2, meals: 900 },
    color: 'from-orange-400 to-red-500'
  },
  {
    year: 2021,
    title: 'Growing Impact',
    description: 'Expanded to 10 feeding zones and partnered with 3 local veterinary clinics',
    stats: { volunteers: 45, zones: 10, meals: 3200 },
    color: 'from-yellow-400 to-orange-500'
  },
  {
    year: 2022,
    title: 'Community Building',
    description: 'Launched our first adoption program and rescued 120+ strays',
    stats: { volunteers: 120, zones: 12, meals: 5800 },
    color: 'from-green-400 to-teal-500'
  },
  {
    year: 2023,
    title: 'Digital Revolution',
    description: 'Introduced AI-powered rescue mapping and online volunteer coordination',
    stats: { volunteers: 280, zones: 15, meals: 8500 },
    color: 'from-blue-400 to-indigo-500'
  },
  {
    year: 2024,
    title: 'Recognition & Awards',
    description: 'Received City Excellence Award and expanded to neighboring municipalities',
    stats: { volunteers: 410, zones: 18, meals: 11200 },
    color: 'from-purple-400 to-pink-500'
  },
  {
    year: 2025,
    title: 'Sustainability Focus',
    description: 'Established permanent shelter and launched spay/neuter program',
    stats: { volunteers: 500, zones: 20, meals: 13500 },
    color: 'from-pink-400 to-rose-500'
  },
  {
    year: 2026,
    title: 'Present Day',
    description: 'Operating at full capacity with 24/7 emergency rescue hotline',
    stats: { volunteers: 550, zones: 22, meals: 15000 },
    color: 'from-orange-500 to-amber-600'
  }
];

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Trusty Choice Espinosa',
    role: 'Chancellor / Head Admin / Founder',
    img: profile_trusty_espinosa,
    story: 'As the founder and head admin of Iligan Stray Feeders, Trusty Choice Espinosa has dedicated his life to creating a compassionate community for stray animals in Iligan City. What started as a personal mission to help the voiceless has grown into a movement that touches countless lives. Based in Santiago, Iligan City at 40 years old, Trusty continues to lead with unwavering dedication, proving that every stray deserves a voice.',
    achievements: ['Founded Iligan Stray Feeders', 'Built comprehensive rescue network', 'Community education advocate']
  },
  {
    id: 2,
    name: 'Welmar-Joy Espinosa',
    role: 'Analyst / Co-Founder',
    img: profile_welmar_espinosa,
    story: 'As co-founder and analyst, Welmar-Joy Espinosa brings strategic vision and data-driven decision-making to ISF. His analytical approach has transformed operations by tracking rescue data, monitoring resource allocation, and analyzing community response patterns. At 43 years old from Santiago, Iligan City, he proves that effective rescue work requires both heart and head.',
    achievements: ['Strategic planning leader', 'Data-driven resource allocation', 'Program development architect']
  },
  {
    id: 3,
    name: 'Leamarie Hempesao',
    role: 'Operations Head',
    img: profile_leamarie_hempesao,
    story: 'At just 21 years old from Bagong Silang, Iligan City, Leamarie Hempesao leads ISF operations with remarkable maturity. She orchestrates daily rescues, manages volunteers, and ensures every animal receives proper care. Her hands-on approach and natural leadership abilities make her an invaluable asset to the team.',
    achievements: ['Coordinates daily rescue operations', 'Volunteer management expert', 'Emergency response leader']
  },
  {
    id: 4,
    name: 'James Darrel Bautista',
    role: 'Onboarding / Documentation Head',
    img: profile_james_bautista,
    story: 'James Darrel Bautista, 29, from Sta. Elena brings structure and clarity to ISF operations. He ensures every new volunteer receives comprehensive training and maintains meticulous records of every rescue and adoption. His systems allow ISF to operate efficiently while scaling impact.',
    achievements: ['Comprehensive training programs', 'Complete rescue documentation', 'Volunteer onboarding systems']
  },
  {
    id: 5,
    name: 'Mildred Nabong',
    role: 'Shelter Warden',
    img: profile_mildred_nabong,
    story: 'At 57 years old from Kiwalan, Iligan City, Mildred Nabong brings decades of compassion to her role as Shelter Warden. She oversees daily shelter operations, knows every animal by name, and has turned the shelter into a healing space where traumatized animals learn to trust again.',
    achievements: ['Daily shelter operations manager', 'Animal care specialist', 'Healing environment creator']
  },
  {
    id: 6,
    name: 'Persal Lacasan',
    role: 'Advisor / Operations',
    img: profile_persal_lacasan,
    story: 'Persal Lacasan, 40, from San Francisco serves as both advisor and operations support. His unique position bridges strategic thinking with hands-on execution, providing guidance on difficult decisions while staying actively involved in daily rescue work.',
    achievements: ['Strategic advisor', 'Community liaison', 'Operations support specialist']
  },
];

export default function About() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [showVolunteers, setShowVolunteers] = useState(false);

  const currentMilestone = selectedYear ? YEARLY_MILESTONES.find(m => m.year === selectedYear) : null;

  return (
    <div className="min-h-screen bg-paw-bg font-quicksand overflow-hidden">
      <Header />

      <main className="pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="relative mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-paw-orange rounded-[40px] p-8 md:p-16 text-white relative overflow-hidden"
            >
              <div className="relative z-10 max-w-2xl">
                <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-6 inline-block">
                  Our Journey
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Feeding Tails, <br />Saving Lives in Iligan
                </h1>
                <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-8">
                  Iligan Stray Feeders (ISF) is a non-profit, non-government organization focused on feeding stray animals in and around Iligan City. It also serves as a community of volunteers dedicated to animal welfare.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white text-paw-orange px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                    <Heart fill="currentColor" size={20} />
                    Established 2020
                  </div>
                  <button
                    onClick={() => setShowVolunteers(true)}
                    className="bg-paw-yellow text-paw-navy px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Users size={20} />
                    500+ Volunteers
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-[-10%] bottom-[-10%] w-[50%] opacity-20 pointer-events-none">
                 <ImageWithFallback
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
                  alt="Dog"
                  className="rounded-full aspect-square object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Yearly Timeline - Lando Norris Style Animation */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-paw-navy mb-4">Our Evolution</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">From humble beginnings to a thriving community</p>
            </div>

            {/* Year Selector */}
            <div className="mb-12 overflow-x-auto scrollbar-hide px-4 py-8">
              <div className="flex items-center justify-center md:justify-center gap-3 md:gap-4 min-w-max md:min-w-0 mx-auto w-fit">
                {YEARLY_MILESTONES.map((milestone) => (
                  <motion.button
                    key={milestone.year}
                    onClick={() => setSelectedYear(milestone.year)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-black text-sm md:text-base transition-all flex-shrink-0 ${
                      selectedYear === milestone.year
                        ? 'bg-paw-orange text-white scale-105 md:scale-110'
                        : 'bg-white text-gray-400 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {milestone.year}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Animated Content */}
            <AnimatePresence mode="wait">
              {currentMilestone && (
                <motion.div
                  key={selectedYear}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className={`bg-gradient-to-br ${currentMilestone.color} rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden max-w-2xl mx-auto`}
                >
                  <div className="relative z-10 text-center">
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-6xl md:text-8xl font-black mb-4"
                    >
                      {currentMilestone.year}
                    </motion.h3>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-bold mb-6"
                    >
                      {currentMilestone.title}
                    </motion.p>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-base md:text-lg mb-8 mx-auto max-w-xl opacity-90"
                    >
                      {currentMilestone.description}
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center"
                      >
                        <p className="text-4xl font-black mb-2">{currentMilestone.stats.volunteers}</p>
                        <p className="text-sm font-bold opacity-80">Volunteers</p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                        className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center"
                      >
                        <p className="text-4xl font-black mb-2">{currentMilestone.stats.zones}</p>
                        <p className="text-sm font-bold opacity-80">Feeding Zones</p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring' }}
                        className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center"
                      >
                        <p className="text-4xl font-black mb-2">{currentMilestone.stats.meals}</p>
                        <p className="text-sm font-bold opacity-80">Monthly Meals</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Decorative Year in Background */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] md:text-[300px] font-black opacity-5 pointer-events-none">
                    {currentMilestone.year}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-[40px] shadow-xl shadow-paw-navy/5 border-2 border-paw-orange/10"
            >
              <div className="bg-paw-orange/10 w-16 h-16 rounded-2xl flex items-center justify-center text-paw-orange mb-6">
                <Target size={32} />
              </div>
              <h2 className="text-3xl font-black text-paw-navy mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                To help stray animals through feeding, sheltering, rehabilitation, and adoption while building a compassionate community.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-[40px] shadow-xl shadow-paw-navy/5 border-2 border-paw-yellow/10"
            >
              <div className="bg-paw-yellow/10 w-16 h-16 rounded-2xl flex items-center justify-center text-paw-yellow mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-black text-paw-navy mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                To see a society where stray animals can live peacefully without fear of neglect, injury, and harm.
              </p>
            </motion.div>
          </div>

          {/* Our Team Section - Clickable */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-paw-navy mb-4">The Paws Behind the Cause</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Click on a team member to read their inspiring story</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {TEAM_MEMBERS.map((member) => (
                <motion.button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-[32px] text-center shadow-lg shadow-paw-navy/5 hover:shadow-xl hover:border-2 hover:border-paw-orange/30 transition-all cursor-pointer"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-paw-orange/20">
                    <ImageWithFallback src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-black text-paw-navy leading-tight text-sm">{member.name}</h3>
                  <p className="text-xs text-paw-orange font-bold uppercase tracking-wider">{member.role}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Impact Stats */}
          <div className="bg-paw-navy rounded-[40px] p-10 md:p-16 text-white grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-paw-orange mb-2">12k+</h3>
              <p className="text-sm md:text-base font-bold text-white/60">Meals Served</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-paw-yellow mb-2">450+</h3>
              <p className="text-sm md:text-base font-bold text-white/60">Pets Rescued</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-paw-orange mb-2">85+</h3>
              <p className="text-sm md:text-base font-bold text-white/60">Adoptions</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-black text-paw-yellow mb-2">15</h3>
              <p className="text-sm md:text-base font-bold text-white/60">Active Zones</p>
            </div>
          </div>
        </div>
      </main>

      {/* Team Member Story Modal */}
      <AnimatePresence>
        {selectedMember !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[40px] max-w-2xl w-full p-8 md:p-12 max-h-[90vh] overflow-y-auto scrollbar-thin relative"
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-paw-orange hover:text-white rounded-full flex items-center justify-center transition-all"
              >
                <X size={24} />
              </button>

              {TEAM_MEMBERS.filter(m => m.id === selectedMember).map(member => (
                <div key={member.id}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-paw-orange/20 shrink-0">
                      <ImageWithFallback src={member.img} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-paw-navy mb-2">{member.name}</h3>
                      <p className="text-paw-orange font-bold uppercase tracking-wider mb-4">{member.role}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xl font-black text-paw-navy mb-4">Their Story</h4>
                    <p className="text-gray-600 leading-relaxed text-lg">{member.story}</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-paw-navy mb-4">Key Achievements</h4>
                    <div className="space-y-3">
                      {member.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-paw-bg p-4 rounded-2xl">
                          <div className="w-6 h-6 bg-paw-orange rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                            <Award size={14} />
                          </div>
                          <p className="text-gray-700 font-bold">{achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volunteers History Modal */}
      <AnimatePresence>
        {showVolunteers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowVolunteers(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[40px] max-w-4xl w-full p-8 md:p-12 max-h-[90vh] overflow-y-auto scrollbar-thin relative"
            >
              <button
                onClick={() => setShowVolunteers(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-paw-orange hover:text-white rounded-full flex items-center justify-center transition-all"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-4xl font-black text-paw-navy mb-4">Volunteer History</h2>
                <p className="text-gray-500 text-lg">Honoring our amazing volunteers since 2020</p>
              </div>

              <div className="space-y-6">
                {[
                  { year: '2026', count: 50, names: ['Alex Johnson', 'Emma Davis', 'Liam Brown', 'Olivia Wilson', 'Noah Martinez'] },
                  { year: '2025', count: 90, names: ['Sophia Anderson', 'James Taylor', 'Isabella Thomas', 'Mason Garcia', 'Ava Rodriguez'] },
                  { year: '2024', count: 130, names: ['Charlotte Lee', 'Ethan White', 'Amelia Harris', 'Lucas Clark', 'Mia Lewis'] },
                  { year: '2023', count: 160, names: ['Harper Walker', 'Benjamin Hall', 'Evelyn Allen', 'Henry Young', 'Abigail King'] },
                  { year: '2022', count: 75, names: ['Emily Wright', 'Alexander Lopez', 'Sofia Hill', 'Daniel Scott', 'Avery Green'] },
                  { year: '2021', count: 40, names: ['Ella Adams', 'Michael Baker', 'Scarlett Nelson', 'David Carter', 'Grace Mitchell'] },
                  { year: '2020', count: 6, names: ['Trusty Choice Espinosa', 'Welmar-Joy Espinosa', 'Leamarie Hempesao', 'James Darrel Bautista', 'Mildred Nabong', 'Persal Lacasan'] },
                ].map((yearData, idx) => (
                  <motion.div
                    key={yearData.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-r from-paw-orange/10 to-paw-yellow/10 p-6 rounded-3xl border-2 border-paw-orange/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-paw-orange text-white rounded-2xl flex items-center justify-center">
                          <p className="text-xl font-black">{yearData.year}</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-paw-navy">{yearData.count} New Volunteers</p>
                          <p className="text-sm text-gray-500 font-bold">Joined the ISF family</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {yearData.names.map((name, nameIdx) => (
                        <span
                          key={nameIdx}
                          className="bg-white px-4 py-2 rounded-full text-sm font-bold text-gray-700 shadow-sm"
                        >
                          {name}
                        </span>
                      ))}
                      {yearData.count > 5 && (
                        <span className="bg-paw-navy text-white px-4 py-2 rounded-full text-sm font-bold">
                          +{yearData.count - 5} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
