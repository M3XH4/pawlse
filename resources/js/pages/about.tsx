import { Link } from '@inertiajs/react';
import { 
  Heart, 
  Users, 
  Target, 
  Shield, 
  Award, 
  X, 
  Stethoscope, 
  Package, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ArrowRight, 
  Star, 
  Gift, 
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Quote,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { ContactSection } from '@/components/contact/contact-section';
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
    shortRole: 'Founder & Head Admin',
    location: 'Santiago, Iligan City',
    since: 2020,
    quote: 'Every stray animal deserves a compassionate voice, safe shelter, and a genuine chance to thrive.',
    img: '/images/profiles/trusty_espinosa.jpg',
    story: 'As the founder and head admin of Iligan Stray Feeders, Trusty Choice Espinosa has dedicated his life to creating a compassionate community for stray animals in Iligan City. What started as a personal mission to help the voiceless has grown into a movement that touches countless lives. Based in Santiago, Iligan City at 40 years old, Trusty continues to lead with unwavering dedication, proving that every stray deserves a voice.',
    achievements: ['Founded Iligan Stray Feeders in 2020', 'Built comprehensive citywide rescue network', 'Pioneered community education & animal welfare advocacy']
  },
  {
    id: 2,
    name: 'Welmar-Joy Espinosa',
    role: 'Analyst / Co-Founder',
    shortRole: 'Co-Founder & Analyst',
    location: 'Santiago, Iligan City',
    since: 2020,
    quote: 'Effective rescue work requires combining compassionate hearts with data-driven strategy.',
    img: '/images/profiles/welmar_espinosa.jpg',
    story: 'As co-founder and analyst, Welmar-Joy Espinosa brings strategic vision and data-driven decision-making to ISF. His analytical approach has transformed operations by tracking rescue data, monitoring resource allocation, and analyzing community response patterns. At 43 years old from Santiago, Iligan City, he proves that effective rescue work requires both heart and head.',
    achievements: ['Strategic planning & data-driven resource allocation', 'Spearheaded feeding zone analytics & metrics', 'Program development & operational architect']
  },
  {
    id: 3,
    name: 'Leamarie Hempesao',
    role: 'Operations Head',
    shortRole: 'Operations Head',
    location: 'Bagong Silang, Iligan City',
    since: 2020,
    quote: 'On-the-ground action speaks loudest—every prompt rescue saves a precious innocent life.',
    img: '/images/profiles/leamarie_hempesao.jpg',
    story: 'At just 21 years old from Bagong Silang, Iligan City, Leamarie Hempesao leads ISF operations with remarkable maturity. She orchestrates daily rescues, manages volunteers, and ensures every animal receives proper care. Her hands-on approach and natural leadership abilities make her an invaluable asset to the team.',
    achievements: ['Coordinates daily field rescue operations', 'Lead volunteer coordinator & field dispatcher', 'Emergency rapid response coordinator']
  },
  {
    id: 4,
    name: 'James Darrel Bautista',
    role: 'Onboarding / Documentation Head',
    shortRole: 'Documentation & Onboarding Head',
    location: 'Sta. Elena, Iligan City',
    since: 2020,
    quote: 'Empowering volunteers with structure and clear documentation scales our community impact.',
    img: '/images/profiles/james_bautista.jpg',
    story: 'James Darrel Bautista, 29, from Sta. Elena brings structure and clarity to ISF operations. He ensures every new volunteer receives comprehensive training and maintains meticulous records of every rescue and adoption. His systems allow ISF to operate efficiently while scaling impact.',
    achievements: ['Comprehensive volunteer onboarding & training programs', 'Complete rescue, medical, and adoption logs', 'Volunteer community engagement systems']
  },
  {
    id: 5,
    name: 'Mildred Nabong',
    role: 'Shelter Warden',
    shortRole: 'Shelter Warden',
    location: 'Kiwalan, Iligan City',
    since: 2020,
    quote: 'With gentle daily care and patient love, even the most traumatized animals learn to trust again.',
    img: '/images/profiles/mildred_nabong.jpg',
    story: 'At 57 years old from Kiwalan, Iligan City, Mildred Nabong brings decades of compassion to her role as Shelter Warden. She oversees daily shelter operations, knows every animal by name, and has turned the shelter into a healing space where traumatized animals learn to trust again.',
    achievements: ['Daily shelter care & sanctuary operations manager', 'Specialized trauma rehabilitation & nursing', 'Created a loving haven for recovered rescues']
  },
  {
    id: 6,
    name: 'Persal Lacasan',
    role: 'Advisor / Operations',
    shortRole: 'Advisor & Operations',
    location: 'San Francisco, Iligan City',
    since: 2020,
    quote: 'Bridging strategic insight with grassroots rescue action ensures our mission endures.',
    img: '/images/profiles/persal_lacasan.jpg',
    story: 'Persal Lacasan, 40, from San Francisco serves as both advisor and operations support. His unique position bridges strategic thinking with hands-on execution, providing guidance on difficult decisions while staying actively involved in daily rescue work.',
    achievements: ['Strategic advisor for NGO growth & compliance', 'Community liaison & local government coordination', 'Hands-on emergency rescue support specialist']
  },
];

interface VolunteerYearInfo {
  year: string;
  count: number;
  highlight: string;
  isFoundingYear?: boolean;
  featuredNames: string[];
  additionalNames: string[];
}

const VOLUNTEER_HISTORY: VolunteerYearInfo[] = [
  {
    year: '2026',
    count: 50,
    highlight: 'Active Feeding & Rescue across 22 ISF Zones in Iligan',
    featuredNames: ['Alex Johnson', 'Emma Davis', 'Liam Brown', 'Olivia Wilson', 'Noah Martinez'],
    additionalNames: [
      'Jacob Sanchez', 'Maya Patel', 'Lucas Hernandez', 'Aubrey Bell', 'Ethan Diaz',
      'Chloe Vance', 'Christian Cruz', 'Alyssa Ramos', 'Dominic Santos', 'Vanessa Reyes',
      'Kyle Tan', 'Andrea Mendoza', 'Julian Gomez', 'Samantha Yu', 'Joshua Rivera',
      'Kimberly Flores', 'Adrian Bautista', 'Bianca Castro', 'Gabriel Ocampo', 'Patricia Lim',
      'Matthew Mercado', 'Angela Aquino', 'Sean Villanueva', 'Camille Soriano', 'Patrick Navarro',
      'Erika Salazar', 'Mark Del Rosario', 'Roxanne Castillo', 'Justin Valenzuela', 'Denise Roxas',
      'Nathaniel Pascual', 'Janelle Corpuz', 'Carl Dizon', 'Bea Manalo', 'Francis Tolentino',
      'Gwen Pineda', 'Enzo Aguilar', 'Kyla Serrano', 'Timothy Miranda', 'Nicole Estrada',
      'Aaron Salvador', 'Marianne Lozano', 'Vincent Cordero', 'Christine Beltran', 'Jerome Fajardo'
    ]
  },
  {
    year: '2025',
    count: 90,
    highlight: 'Permanent Shelter Establishment & City Spay/Neuter Drive',
    featuredNames: ['Sophia Anderson', 'James Taylor', 'Isabella Thomas', 'Mason Garcia', 'Ava Rodriguez'],
    additionalNames: [
      'Oliver Smith', 'Madison Ross', 'Dylan Rivera', 'Elena Gomez', 'Leo Morales',
      'Hannah Cooper', 'Gabriel Martin', 'Zoe Richardson', 'Ryan Cox', 'Lily Howard',
      'Samuel Ward', 'Aria Torres', 'Daniel Flores', 'Victoria Price', 'Henry Brooks',
      'Chloe Sanders', 'Owen Bennett', 'Grace Gray', 'Wyatt Wood', 'Penelope Barnes',
      'Caleb Ross', 'Layla Henderson', 'Nathan Coleman', 'Riley Jenkins', 'Andrew Perry',
      'Hazel Powell', 'Eli Long', 'Nora Patterson', 'Julian Hughes', 'Zoey Flores',
      'Aaron Washington', 'Lillian Butler', 'Christopher Foster', 'Addison Simmons', 'Charles Gonzalez',
      'Aubrey Bryant', 'Thomas Alexander', 'Ellie Russell', 'Hudson Griffin', 'Stella Diaz',
      'Connor Hayes', 'Paisley Myers', 'Asher Ford', 'Skylar Hamilton', 'Leo Graham',
      'Bella Sullivan', 'Ian Wallace', 'Clara Woods', 'Jack Cole', 'Violet West',
      'Luke Jordan', 'Everly Owens', 'Levi Reynolds', 'Nova Ellis', 'Isaac Fisher',
      'Emilia Harrison', 'Lincoln Gibson', 'Genesis McDonald', 'Mateo Cruz', 'Kennedy Marshall',
      'Anthony Ortiz', 'Madelyn Gomez', 'Jaxon Murray', 'Kinsley Freeman', 'Christian Wells',
      'Hailey Webb', 'Hunter Simpson', 'Eva Stevens', 'Jonathan Tucker', 'Sarah Porter',
      'Axel Hunter', 'Allison Hicks', 'Robert Crawford', 'Autumn Henry', 'David Boyd',
      'Quinn Mason', 'Josiah Morales', 'Ruby Kennedy', 'Colton Warren', 'Serenity Dixon',
      'Roman Ramos', 'Willow Reyes', 'Landon Burns', 'Piper Gordon', 'Leonardo Shaw'
    ]
  },
  {
    year: '2024',
    count: 130,
    highlight: 'City Excellence Award & Regional Rescuer Network',
    featuredNames: ['Charlotte Lee', 'Ethan White', 'Amelia Harris', 'Lucas Clark', 'Mia Lewis'],
    additionalNames: [
      'Elijah Turner', 'Riley Cooper', 'Julian Ward', 'Nora Butler', 'Caleb Flores',
      'Abigail Brooks', 'Daniel Diaz', 'Harper Nelson', 'Jack Peterson', 'Ella Morales',
      'Matthew Sanchez', 'Avery Ramirez', 'Samuel Coleman', 'Scarlett Powell', 'David Price',
      'Grace Stewart', 'Joseph Long', 'Chloe Barnes', 'Jackson Fisher', 'Zoey Ross',
      'Gabriel Ortiz', 'Lily Simmons', 'Carter Jenkins', 'Hannah Henderson', 'Luke Foster',
      'Aria Russell', 'Isaac Patterson', 'Layla Hughes', 'Anthony Washington', 'Aubrey Butler',
      'Dylan Simmons', 'Ellie Alexander', 'Lincoln Griffin', 'Stella Hayes', 'Jaxon Myers',
      'Paisley Ford', 'Christopher Hamilton', 'Skylar Graham', 'Andrew Sullivan', 'Bella Wallace',
      'Thomas Woods', 'Clara Cole', 'Hudson West', 'Violet Jordan', 'Connor Owens',
      'Everly Reynolds', 'Asher Ellis', 'Nova Fisher', 'Leo Harrison', 'Emilia Gibson',
      'Ian McDonald', 'Genesis Cruz', 'Jack Marshall', 'Kennedy Ortiz', 'Luke Gomez',
      'Madelyn Murray', 'Levi Freeman', 'Kinsley Wells', 'Isaac Webb', 'Hailey Simpson',
      'Lincoln Stevens', 'Eva Tucker', 'Mateo Porter', 'Sarah Hunter', 'Anthony Hicks',
      'Allison Crawford', 'Jaxon Henry', 'Autumn Boyd', 'Christian Mason', 'Quinn Morales',
      'Hailey Kennedy', 'Ruby Warren', 'Hunter Dixon', 'Serenity Ramos', 'Jonathan Reyes',
      'Willow Burns', 'Sarah Gordon', 'Piper Shaw', 'Axel Holmes', 'Elena Rice',
      'Robert Robertson', 'Claire Hunt', 'David Black', 'Melanie Daniels', 'Quinn Palmer',
      'Reagan Mills', 'Josiah Nichols', 'Mackenzie Grant', 'Colton Knight', 'Adeline Ferguson',
      'Roman Rose', 'Delilah Stone', 'Landon Hawkins', 'Faith Dunn', 'Leonardo Perkins',
      'Rose Hudson', 'Easton Spencer', 'Kylie Gardner', 'Miles Stephens', 'Norah Payne',
      'Declan Pierce', 'Eliana Berry', 'Micah Matthews', 'Athena Arnold', 'Vincent Wagner',
      'Andrea Willis', 'Silas Ray', 'Peyton Watkins', 'Weston Olson', 'Malia Carroll',
      'Cole Duncan', 'Brielle Snyder', 'Braxton Hart', 'Journee Cunningham', 'Damian Bradley',
      'Lydia Lane', 'Ryder Andrews', 'Lucia Ruiz', 'Carlos Harper', 'Brooke Fox',
      'Sawyer Riley', 'Mckenzie Armstrong', 'Kingston Carpenter', 'Genevieve Weaver', 'Calvin Greene'
    ]
  },
  {
    year: '2023',
    count: 160,
    highlight: 'AI-Assisted Rescue Mapping & Online Coordination Launch',
    featuredNames: ['Harper Walker', 'Benjamin Hall', 'Evelyn Allen', 'Henry Young', 'Abigail King'],
    additionalNames: [
      'Lucas Wright', 'Samantha Perez', 'Dominic Ramos', 'Victoria Chen', 'Mateo Gomez',
      'Camila Torres', 'Sebastian Ward', 'Aaliyah Reed', 'Julian Bailey', 'Chloe Rivera',
      'Theodore Richardson', 'Penelope Cox', 'Ezekiel Howard', 'Layla Ward', 'Josiah Torres',
      'Riley Flores', 'Christian Price', 'Zoey Brooks', 'Landon Sanders', 'Nora Bennett',
      'Jonathan Gray', 'Lily Wood', 'Isaiah Barnes', 'Eleanor Ross', 'Charles Henderson',
      'Hannah Coleman', 'Thomas Jenkins', 'Lillian Perry', 'Caleb Powell', 'Addison Long',
      'Christopher Patterson', 'Aubrey Hughes', 'Miles Flores', 'Ellie Washington', 'Nathaniel Butler',
      'Stella Foster', 'Adrian Simmons', 'Paisley Alexander', 'Eli Russell', 'Skylar Griffin',
      'Nolan Hayes', 'Bella Myers', 'Easton Ford', 'Clara Hamilton', 'Colton Graham',
      'Violet Sullivan', 'Luca Wallace', 'Everly Woods', 'Landon Cole', 'Nova West',
      'Axel Jordan', 'Emilia Owens', 'Brooks Reynolds', 'Genesis Ellis', 'Bennett Fisher',
      'Kennedy Harrison', 'Weston Gibson', 'Madelyn McDonald', 'Silas Cruz', 'Kinsley Marshall',
      'Waylon Ortiz', 'Hailey Gomez', 'Declan Murray', 'Eva Freeman', 'Micah Wells',
      'Sarah Webb', 'Kingston Simpson', 'Allison Stevens', 'Damian Tucker', 'Autumn Porter',
      'Harrison Hunter', 'Quinn Hicks', 'August Crawford', 'Ruby Henry', 'Bryson Boyd',
      'Serenity Mason', 'Leonardo Morales', 'Willow Kennedy', 'Amir Warren', 'Piper Dixon',
      'Gael Ramos', 'Elena Reyes', 'Carlos Burns', 'Claire Gordon', 'Ryker Shaw',
      'Melanie Holmes', 'Arthur Rice', 'Reagan Robertson', 'Emiliano Hunt', 'Mackenzie Black',
      'Myles Daniels', 'Adeline Palmer', 'George Mills', 'Delilah Nichols', 'Diego Grant',
      'Faith Knight', 'Jonah Ferguson', 'Rose Rose', 'Kaiden Stone', 'Kylie Hawkins',
      'Jasper Dunn', 'Norah Perkins', 'Preston Hudson', 'Eliana Spencer', 'Archer Gardner',
      'Athena Stephens', 'Maddox Payne', 'Andrea Pierce', 'King Berry', 'Peyton Matthews',
      'Iker Arnold', 'Malia Wagner', 'Rowan Willis', 'Brielle Ray', 'Jude Watkins',
      'Journee Olson', 'Graham Carroll', 'Lydia Duncan', 'Finn Snyder', 'Lucia Hart',
      'Elliot Cunningham', 'Brooke Bradley', 'Emerson Lane', 'Mckenzie Andrews', 'Elliott Ruiz',
      'Genevieve Harper', 'Alan Fox', 'Margaret Riley', 'Emilio Armstrong', 'Valerie Carpenter',
      'Dawson Weaver', 'Katelyn Greene', 'Beckham Lawrence', 'Lyla Elliott', 'Messiah Chavez',
      'Catalina Sims', 'Zion Austin', 'Ruth Peters', 'Barrett Kelley', 'Aubree Franklin',
      'Matteo Lawson', 'Raegan Fields', 'Tucker Gutierrez', 'Angelina Ryan', 'Peter Schmidt',
      'Selena Carr', 'Grant Vasquez', 'Khloe Castillo', 'Richard Wheeler', 'Kenzie Chapman',
      'Calum Oliver', 'Alana Montgomery', 'Kenneth Richards', 'Callie Williamson', 'Victor Johnston'
    ]
  },
  {
    year: '2022',
    count: 75,
    highlight: 'Adoption Drives & Expanded Stray Vaccination Initiative',
    featuredNames: ['Emily Wright', 'Alexander Lopez', 'Sofia Hill', 'Daniel Scott', 'Avery Green'],
    additionalNames: [
      'Gabriel Martin', 'Chloe Reyes', 'Marcus Santos', 'Hannah Diaz', 'Logan Cruz',
      'Aria Mendoza', 'Liam Mendoza', 'Zoe Villanueva', 'Mason Delos Reyes', 'Grace Bautista',
      'Lucas Mercado', 'Nora Castro', 'Ethan Soriano', 'Lily Navarro', 'Oliver Aquino',
      'Ella Corpuz', 'Noah Dizon', 'Mia Tolentino', 'Aiden Pineda', 'Charlotte Aguilar',
      'Elijah Serrano', 'Amelia Miranda', 'James Estrada', 'Harper Salvador', 'Benjamin Lozano',
      'Evelyn Cordero', 'Henry Beltran', 'Abigail Fajardo', 'Alexander Tan', 'Emily Lim',
      'Sebastian Sy', 'Sofia Go', 'Jack Co', 'Avery Uy', 'Daniel Chua',
      'Scarlett Ang', 'Matthew Ong', 'Victoria Ty', 'Samuel Dy', 'Madison Yu',
      'David Tee', 'Chloe Lao', 'Joseph Yap', 'Grace Kho', 'Carter Siy',
      'Zoey Chan', 'Owen Po', 'Penelope Cua', 'Wyatt Lee', 'Riley Wong',
      'John Ho', 'Lily Sun', 'Luke Tan', 'Nora Lim', 'Dylan Sy',
      'Hannah Go', 'Isaac Co', 'Lillian Uy', 'Gabriel Chua', 'Addison Ang',
      'Anthony Ong', 'Aubrey Ty', 'Julian Dy', 'Stella Yu', 'Connor Tee',
      'Paisley Lao', 'Christopher Yap', 'Skylar Kho', 'Jaxon Siy', 'Bella Chan'
    ]
  },
  {
    year: '2021',
    count: 40,
    highlight: 'First Clinic Partnerships & Expanding to 10 Feeding Zones',
    featuredNames: ['Ella Adams', 'Michael Baker', 'Scarlett Nelson', 'David Carter', 'Grace Mitchell'],
    additionalNames: [
      'Jason Miller', 'Chloe Wilson', 'Nathan Evans', 'Zoe Brooks', 'Benjamin Torres',
      'Lily Stewart', 'Samuel Sanchez', 'Nora Morris', 'Christopher Rogers', 'Hannah Reed',
      'Andrew Cook', 'Addison Morgan', 'Joshua Bell', 'Aubrey Murphy', 'Matthew Bailey',
      'Stella Rivera', 'Luke Cooper', 'Paisley Richardson', 'Anthony Cox', 'Skylar Howard',
      'Dylan Ward', 'Bella Torres', 'Isaac Peterson', 'Clara Gray', 'Lincoln Ramirez',
      'Violet James', 'Connor Watson', 'Everly Brooks', 'Jaxon Kelly', 'Nova Sanders',
      'Julian Price', 'Emilia Bennett', 'Aaron Wood', 'Genesis Barnes', 'Caleb Ross'
    ]
  },
  {
    year: '2020',
    count: 6,
    isFoundingYear: true,
    highlight: 'The Founding Cohort — 5 Volunteers Feeding 30 Strays in 2 Zones',
    featuredNames: ['Trusty Choice Espinosa', 'Welmar-Joy Espinosa', 'Leamarie Hempesao', 'James Darrel Bautista', 'Mildred Nabong', 'Persal Lacasan'],
    additionalNames: []
  }
];

interface AboutProps {
  veterinaryPartners?: any[];
  foodSupplyPartners?: any[];
  collaboratorPartners?: any[];
  sponsorPartners?: any[];
  featuredSupporters?: any[];
  networkStats?: {
    meals_served_display?: string;
    pets_rescued_display?: string;
    adoptions_display?: string;
    active_zones_display?: string;
  };
}

export default function About({
  veterinaryPartners = [],
  foodSupplyPartners = [],
  collaboratorPartners = [],
  sponsorPartners = [],
  featuredSupporters = [],
  networkStats = {
    meals_served_display: '12k+',
    pets_rescued_display: '450+',
    adoptions_display: '85+',
    active_zones_display: '15',
  }
}: AboutProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [partnerTab, setPartnerTab] = useState<'vet' | 'food' | 'collab' | 'sponsor'>('vet');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [volunteerYearFilter, setVolunteerYearFilter] = useState<'all' | string>('all');
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const isModalOpen = selectedMember !== null || showVolunteers;
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedMember, showVolunteers]);

  // Keyboard navigation (Escape to close, Left/Right arrows to cycle team members)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMember !== null) {
          setSelectedMember(null);
        }
        if (showVolunteers) {
          setShowVolunteers(false);
        }
      } else if (selectedMember !== null) {
        const currentIndex = TEAM_MEMBERS.findIndex(m => m.id === selectedMember);
        if (currentIndex === -1) {
          return;
        }
        if (e.key === 'ArrowLeft') {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : TEAM_MEMBERS.length - 1;
          setSelectedMember(TEAM_MEMBERS[prevIndex].id);
        } else if (e.key === 'ArrowRight') {
          const nextIndex = currentIndex < TEAM_MEMBERS.length - 1 ? currentIndex + 1 : 0;
          setSelectedMember(TEAM_MEMBERS[nextIndex].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember, showVolunteers]);

  // Team member navigation helpers
  const currentMemberIndex = selectedMember !== null ? TEAM_MEMBERS.findIndex(m => m.id === selectedMember) : -1;
  const currentMember = currentMemberIndex !== -1 ? TEAM_MEMBERS[currentMemberIndex] : null;

  const navigateMember = (direction: 'prev' | 'next') => {
    if (currentMemberIndex === -1) {
      return;
    }
    if (direction === 'prev') {
      const prevIdx = currentMemberIndex > 0 ? currentMemberIndex - 1 : TEAM_MEMBERS.length - 1;
      setSelectedMember(TEAM_MEMBERS[prevIdx].id);
    } else {
      const nextIdx = currentMemberIndex < TEAM_MEMBERS.length - 1 ? currentMemberIndex + 1 : 0;
      setSelectedMember(TEAM_MEMBERS[nextIdx].id);
    }
  };

  const toggleYearExpanded = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Filter volunteer records based on filter tab and search query
  const filteredVolunteers = useMemo(() => {
    const query = volunteerSearch.trim().toLowerCase();
    return VOLUNTEER_HISTORY.filter(item => {
      // Year filter match
      if (volunteerYearFilter !== 'all' && item.year !== volunteerYearFilter) {
        return false;
      }
      // Search query match
      if (!query) {
        return true;
      }

      // Check year or highlight
      if (item.year.includes(query) || item.highlight.toLowerCase().includes(query)) {
        return true;
      }
      // Check names
      const allNames = [...item.featuredNames, ...item.additionalNames];
      return allNames.some(name => name.toLowerCase().includes(query));
    });
  }, [volunteerYearFilter, volunteerSearch]);

  const totalVolunteersCount = useMemo(() => {
    return VOLUNTEER_HISTORY.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

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
        {currentMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-[28px] sm:rounded-[36px] max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-paw-orange/20 dark:border-gray-800 overflow-hidden relative"
              role="dialog"
              aria-modal="true"
              aria-label={`${currentMember.name}'s Story`}
            >
              {/* Sticky Header Bar */}
              <div className="shrink-0 px-6 sm:px-8 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                    <Heart size={13} className="text-paw-orange fill-paw-orange" />
                    ISF Leadership
                  </span>
                  <span className="hidden sm:inline-block text-xs font-bold text-gray-400 dark:text-gray-500">
                    • Member {currentMemberIndex + 1} of {TEAM_MEMBERS.length}
                  </span>
                </div>

                {/* Center / Right controls */}
                <div className="flex items-center gap-2">
                  {/* Prev / Next buttons */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200/50 dark:border-gray-700">
                    <button
                      onClick={() => navigateMember('prev')}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-paw-orange hover:shadow-sm transition-all cursor-pointer"
                      title="Previous member (Left Arrow)"
                      aria-label="Previous member"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-500 dark:text-gray-400 sm:hidden">
                      {currentMemberIndex + 1}/{TEAM_MEMBERS.length}
                    </span>
                    <button
                      onClick={() => navigateMember('next')}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-paw-orange hover:shadow-sm transition-all cursor-pointer"
                      title="Next member (Right Arrow)"
                      aria-label="Next member"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 hover:bg-paw-orange hover:text-white dark:hover:bg-paw-orange text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="Close modal (Esc)"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto modal-scroll-area p-6 sm:p-8 md:p-10 space-y-7 overscroll-contain">
                {/* Hero Profile Block */}
                <div className="relative bg-gradient-to-br from-amber-500/10 via-paw-orange/5 to-transparent dark:from-amber-950/30 dark:via-gray-800/40 dark:to-transparent rounded-3xl p-6 sm:p-7 border border-amber-200/50 dark:border-amber-900/30">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl shadow-paw-orange/15 ring-4 ring-paw-orange/30">
                        <ImageWithFallback
                          src={currentMember.img}
                          alt={currentMember.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-paw-orange text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-gray-800" title="Founding Member">
                        <Star size={14} fill="currentColor" />
                      </div>
                    </div>

                    {/* Member Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paw-orange/15 dark:bg-paw-orange/20 text-amber-800 dark:text-amber-300 border border-paw-orange/30 text-xs font-black uppercase tracking-wider mb-2">
                        {currentMember.shortRole || currentMember.role}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white leading-tight mb-2">
                        {currentMember.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wide">
                        {currentMember.role}
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {currentMember.location && (
                          <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full border border-gray-200/60 dark:border-gray-700 shadow-xs">
                            <MapPin size={13} className="text-paw-orange" />
                            {currentMember.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full border border-gray-200/60 dark:border-gray-700 shadow-xs">
                          <Calendar size={13} className="text-paw-orange" />
                          ISF Pioneer (Since {currentMember.since || 2020})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspiring Motto / Quote */}
                {currentMember.quote && (
                  <div className="relative bg-amber-500/5 dark:bg-gray-800/50 rounded-2xl p-5 border-l-4 border-paw-orange flex items-start gap-3.5">
                    <Quote size={24} className="text-paw-orange shrink-0 mt-0.5 opacity-80" />
                    <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 italic leading-relaxed">
                      "{currentMember.quote}"
                    </p>
                  </div>
                )}

                {/* Their Story Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-paw-orange" />
                    <h4 className="text-xl font-black text-paw-navy dark:text-white tracking-tight">Their Story</h4>
                  </div>
                  <div className="bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                      {currentMember.story}
                    </p>
                  </div>
                </div>

                {/* Key Achievements */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={20} className="text-paw-orange" />
                    <h4 className="text-xl font-black text-paw-navy dark:text-white tracking-tight">Key Achievements & Impact</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentMember.achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800/70 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between hover:border-paw-orange/40 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                            0{idx + 1}
                          </span>
                          <CheckCircle2 size={16} className="text-paw-orange/60 group-hover:text-paw-orange transition-colors" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 font-bold text-sm leading-snug">
                          {achievement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Footer / Quick Switcher */}
              <div className="shrink-0 px-6 sm:px-10 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-850/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Switch Member:
                  </span>
                  <span className="hidden sm:inline-block text-xs font-bold text-paw-navy dark:text-gray-300">
                    {currentMember.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 rounded-full shadow-xs">
                  {TEAM_MEMBERS.map((m) => {
                    const isActive = m.id === currentMember.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMember(m.id)}
                        className={`relative p-0.5 rounded-full transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'ring-2 ring-paw-orange ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105'
                            : 'opacity-55 hover:opacity-100 hover:scale-105'
                        }`}
                        title={m.name}
                        aria-label={`View ${m.name}`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          <ImageWithFallback src={m.img} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden"
            onClick={() => setShowVolunteers(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-[28px] sm:rounded-[36px] max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-paw-orange/20 dark:border-gray-800 overflow-hidden relative"
              role="dialog"
              aria-modal="true"
              aria-label="Volunteer History & Roll of Honor"
            >
              {/* Sticky Header */}
              <div className="shrink-0 px-6 sm:px-8 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10 space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-1.5">
                      <Users size={13} className="text-paw-orange" />
                      ISF Community Archive
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-paw-navy dark:text-white tracking-tight">
                      Volunteer History & Roll of Honor
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                      Honoring over 550+ incredible hearts who power stray rescue across Iligan City since 2020
                    </p>
                  </div>

                  <button
                    onClick={() => setShowVolunteers(false)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-paw-orange hover:text-white dark:hover:bg-paw-orange text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
                    title="Close modal (Esc)"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={volunteerSearch}
                      onChange={(e) => setVolunteerSearch(e.target.value)}
                      placeholder="Search volunteer by name (e.g. Alex, Emma, Trusty)..."
                      className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 rounded-xl text-xs sm:text-sm font-semibold border border-transparent focus:border-paw-orange focus:bg-white dark:focus:bg-gray-900 focus:outline-hidden transition-all"
                    />
                    {volunteerSearch && (
                      <button
                        onClick={() => setVolunteerSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Year Quick Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
                    <button
                      onClick={() => setVolunteerYearFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        volunteerYearFilter === 'all'
                          ? 'bg-paw-orange text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Years
                    </button>
                    {VOLUNTEER_HISTORY.map((item) => (
                      <button
                        key={item.year}
                        onClick={() => setVolunteerYearFilter(item.year)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          volunteerYearFilter === item.year
                            ? 'bg-paw-orange text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrollable Timeline Body */}
              <div className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-7 md:p-8 space-y-5 overscroll-contain">
                {filteredVolunteers.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-paw-orange flex items-center justify-center mb-3">
                      <Search size={24} />
                    </div>
                    <h3 className="text-lg font-black text-paw-navy dark:text-white mb-1">
                      No volunteers found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                      No volunteer names match "{volunteerSearch}". Try searching for another name or clearing the filter.
                    </p>
                    <button
                      onClick={() => {
                        setVolunteerSearch('');
                        setVolunteerYearFilter('all');
                      }}
                      className="px-4 py-2 rounded-xl bg-paw-orange text-white font-bold text-xs hover:bg-amber-600 transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredVolunteers.map((yearData, idx) => {
                    const isExpanded = !!expandedYears[yearData.year] || volunteerSearch.trim().length > 0;
                    const displayedNames = isExpanded
                      ? [...yearData.featuredNames, ...yearData.additionalNames]
                      : yearData.featuredNames;
                    const remainingCount = yearData.additionalNames.length;
                    const isFounding = yearData.isFoundingYear;

                    return (
                      <motion.div
                        key={yearData.year}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                          isFounding
                            ? 'bg-gradient-to-r from-amber-500/15 via-paw-yellow/15 to-transparent dark:from-amber-950/40 dark:via-gray-800/60 dark:to-transparent border-amber-300 dark:border-amber-800/60 shadow-xs'
                            : 'bg-gradient-to-r from-paw-orange/8 via-paw-yellow/8 to-transparent dark:from-gray-800/60 dark:via-gray-800/30 dark:to-transparent border-paw-orange/15 dark:border-gray-800'
                        }`}
                      >
                        {/* Year Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-md shrink-0 ${
                              isFounding
                                ? 'bg-gradient-to-br from-amber-500 to-amber-600 ring-2 ring-amber-300/60'
                                : 'bg-gradient-to-br from-paw-orange to-amber-500'
                            }`}>
                              <span className="text-base font-black leading-none">{yearData.year}</span>
                              <span className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5">Batch</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white">
                                  {yearData.count} New Volunteers
                                </h3>
                                {isFounding && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                                    <Sparkles size={11} fill="currentColor" />
                                    Founders
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                                {yearData.highlight}
                              </p>
                            </div>
                          </div>

                          {/* Quick expand indicator */}
                          {remainingCount > 0 && !volunteerSearch && (
                            <button
                              onClick={() => toggleYearExpanded(yearData.year)}
                              className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-paw-orange border border-gray-200/70 dark:border-gray-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={14} /> Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={14} /> View All {yearData.count}
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Volunteer Name Tags Cloud */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {displayedNames.map((name, nameIdx) => {
                            const isMatch = volunteerSearch && name.toLowerCase().includes(volunteerSearch.trim().toLowerCase());
                            const initials = name
                              .split(' ')
                              .map(n => n[0])
                              .slice(0, 2)
                              .join('');

                            return (
                              <span
                                key={nameIdx}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                                  isMatch
                                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105'
                                    : isFounding
                                    ? 'bg-white dark:bg-gray-800 text-paw-navy dark:text-amber-200 border border-amber-300/80 dark:border-amber-700'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[9px] font-black flex items-center justify-center shrink-0">
                                  {initials}
                                </span>
                                {name}
                              </span>
                            );
                          })}

                          {/* Collapsed +More button */}
                          {!isExpanded && remainingCount > 0 && !volunteerSearch && (
                            <button
                              onClick={() => toggleYearExpanded(yearData.year)}
                              className="inline-flex items-center gap-1 bg-paw-navy hover:bg-paw-orange text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs transition-colors cursor-pointer"
                            >
                              +{remainingCount} more volunteers
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 px-6 sm:px-10 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-850/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-paw-orange" />
                    <strong>{totalVolunteersCount}+</strong> Registered Volunteers
                  </span>
                  <span>•</span>
                  <span><strong>7</strong> Active Years</span>
                  <span>•</span>
                  <span><strong>22</strong> Feeding Zones</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/volunteer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-paw-orange hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Join As Volunteer</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Our Partners & Support Network Section (Images 2 & 3) */}
      <section id="partners-network" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-[#FFAE33] text-xs font-black uppercase tracking-wider mb-2">
            Partners & Support Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-paw-navy dark:text-white">
            Our Partners & Support Network
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Meet the trusted people, veterinary resources, businesses, and community partners helping Iligan Stray Feeders support rescued animals.
          </p>

          {/* Partner Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            <button
              onClick={() => setPartnerTab('vet')}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                partnerTab === 'vet'
                  ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/25'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:border-paw-orange/40'
              }`}
            >
              <Stethoscope size={14} />
              <span>Veterinary Partners</span>
            </button>

            <button
              onClick={() => setPartnerTab('food')}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                partnerTab === 'food'
                  ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/25'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:border-paw-orange/40'
              }`}
            >
              <Package size={14} />
              <span>Food & Supply Partners</span>
            </button>

            <button
              onClick={() => setPartnerTab('collab')}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                partnerTab === 'collab'
                  ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/25'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:border-paw-orange/40'
              }`}
            >
              <Users size={14} />
              <span>Collaborators & Organizations</span>
            </button>

            <button
              onClick={() => setPartnerTab('sponsor')}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                partnerTab === 'sponsor'
                  ? 'bg-paw-orange text-white shadow-lg shadow-paw-orange/25'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:border-paw-orange/40'
              }`}
            >
              <Heart size={14} />
              <span>Sponsors & Supporters</span>
            </button>
          </div>
        </div>

        {/* Tab Content Container Box */}
        <div className="bg-white dark:bg-slate-900 rounded-[36px] border border-gray-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none space-y-6">
          {/* TAB 1: Veterinary Partners */}
          {partnerTab === 'vet' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white flex items-center gap-2">
                    <Stethoscope size={22} className="text-paw-orange" />
                    <span>Veterinary Partners</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Veterinary clinics and animal care professionals regularly contacted by Iligan Stray Feeders for rescued animals, medical assistance, and emergency cases.
                  </p>
                </div>

                <Link
                  href="/vet"
                  className="px-5 py-2.5 rounded-full bg-paw-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-all shadow-md shadow-paw-orange/20 shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Alert Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle size={16} className="text-amber-600 dark:text-[#FFAE33] shrink-0" />
                <span>Some clinic details are still being collected from ISF and will be updated as information becomes available.</span>
              </div>

              {/* Clinic Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {veterinaryPartners.slice(0, 3).map((clinic, idx) => (
                  <div 
                    key={clinic.id || idx}
                    className="p-6 rounded-3xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:border-paw-orange/40 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
                          {clinic.logo_url || clinic.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-paw-navy dark:text-white">{clinic.name}</h4>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <MapPin size={11} className="text-[#FFAE33]" />
                            <span>{clinic.city || 'Iligan City'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {clinic.badge_title && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                            {clinic.badge_title}
                          </span>
                        )}
                        {clinic.is_emergency && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 text-[10px] font-black uppercase tracking-wider">
                            Emergency Option
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {clinic.short_description || clinic.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 text-center">
                <Link
                  href="/vet"
                  className="text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>View Veterinary Partners</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: Food & Supply Partners */}
          {partnerTab === 'food' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-paw-navy dark:text-white flex items-center gap-2">
                    <Package size={22} className="text-paw-orange" />
                    <span>Food & Supply Partners</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Businesses and community supporters helping provide food and essential supplies for animals under the care of Iligan Stray Feeders.
                  </p>
                </div>

                <Link
                  href="/vet"
                  className="px-5 py-2.5 rounded-full bg-paw-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-all shadow-md shadow-paw-orange/20 shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Food & Supply Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {foodSupplyPartners.slice(0, 3).map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="p-6 rounded-3xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:border-paw-orange/40 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {item.logo_url || (item.name ? item.name.substring(0, 2).toUpperCase() : 'FS')}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-paw-navy dark:text-white">{item.name}</h4>
                          {item.operating_hours && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock size={11} className="text-amber-500" />
                              <span>{item.operating_hours}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.badge_title && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                            {item.badge_title}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.short_description || item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 text-center">
                <Link
                  href="/vet"
                  className="text-xs font-black text-paw-orange hover:text-orange-600 uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>View Food & Supply Partners</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3 & 4: Collaborators & Sponsors */}
          {(partnerTab === 'collab' || partnerTab === 'sponsor') && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Award size={22} />
              </div>
              <h4 className="font-black text-lg text-paw-navy dark:text-white">
                {partnerTab === 'collab' ? 'Collaborators & Community Organizations' : 'Sponsors & Benefactors'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Organizations, local government units, and sponsors collaborating with ISF to improve animal welfare in Northern Mindanao.
              </p>
              <div className="pt-2">
                <Link 
                  href="/honor" 
                  className="px-5 py-2.5 rounded-full bg-paw-navy text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Community of Honor</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Together for Every Paw - Community Support Banner (Image 2) */}
        <div className="mt-12 rounded-[36px] bg-gradient-to-br from-[#1E2235] via-[#1A1D30] to-[#121526] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider">
              Community of Support
            </span>

            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Together for Every Paw
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Recognizing the people, volunteers, donors, and supporters who help Iligan Stray Feeders continue its work for stray and rescued animals.
            </p>

            {/* Supporter Chips Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#FFAE33] text-slate-900 font-black text-[10px] flex items-center justify-center">
                  MB
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-[11px] leading-tight">Miguel Burton</p>
                  <p className="text-[9px] text-[#FFAE33]">Feeding Supporter</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white font-black text-[10px] flex items-center justify-center">
                  CD
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-[11px] leading-tight">Councilor Derreck Siao</p>
                  <p className="text-[9px] text-purple-300">Recurring Supporter</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-[10px] flex items-center justify-center">
                  LF
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-[11px] leading-tight">Leilani Fernandez</p>
                  <p className="text-[9px] text-blue-300">ISF Supporter</p>
                </div>
              </div>

              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 text-[11px] text-slate-400">
                &amp; more supporters
              </div>
            </div>

            {/* View Community of Support Button */}
            <div className="pt-4">
              <Link
                href="/honor"
                className="px-8 py-3.5 rounded-full bg-[#FFAE33] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 transition-all"
              >
                <Star size={14} className="fill-current text-slate-950" />
                <span>View Our Community of Support</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Impact Stats Strip (Bottom of Image 2) */}
        <div className="mt-8 rounded-3xl bg-[#151E28] text-white p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-2 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-[#FFAE33] block">
                {networkStats?.meals_served_display || '12k+'}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Meals Served</p>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-[#FFAE33] block">
                {networkStats?.pets_rescued_display || '450+'}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Pets Rescued</p>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-[#FFAE33] block">
                {networkStats?.adoptions_display || '85+'}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Adoptions</p>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-[#FFAE33] block">
                {networkStats?.active_zones_display || '15'}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Zones</p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
}
