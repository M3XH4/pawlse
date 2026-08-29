import { Link, router, usePage } from '@inertiajs/react';
import { Phone, Mail, Search, Menu, User, ChevronDown, Facebook, ChevronRight, X, Settings, LogOut, MessageCircle, Video, UserCircle, Siren, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';


// Nav link preview images
const navPreviews: Record<string, { image: string; label: string }> = {
  '/adopt': {
    image: 'https://images.unsplash.com/photo-1594004844613-19d4db632e0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNjdWVkJTIwcHVwcHklMjBzaGVsdGVyfGVufDF8fHx8MTc3NDQwNzc3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Adopt a Friend'
  },
  '/volunteer': {
    image: 'https://images.unsplash.com/photo-1774279922369-755504a8b495?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYWwlMjBzaGVsdGVyJTIwdm9sdW50ZWVyJTIwY2F0fGVufDF8fHx8MTc3NDQwNzc4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Volunteer'
  },
  '/donate': {
    image: 'https://images.unsplash.com/photo-1741192194704-91b686b5d223?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBkb25hdGlvbiUyMGZvb2QlMjBzdXBwbGllc3xlbnwxfHx8fDE3NzQ0MDc3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Donate'
  },
  '/missing': {
    image: 'https://images.unsplash.com/photo-1769013649322-b267c25be35c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGV0JTIwcG9zdGVyJTIwbWlzc2luZ3xlbnwxfHx8fDE3NzQ0MDc3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Missing Pets'
  },
  '/sos': {
    image: 'https://images.unsplash.com/photo-1661552066736-935e0cad1782?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjByZXNjdWUlMjB0ZWFtJTIwdm9sdW50ZWVyfGVufDF8fHx8MTc3NDQwNzc4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'SOS Report'
  },
  '/rescue': {
    image: 'https://images.unsplash.com/photo-1661552066736-935e0cad1782?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjByZXNjdWUlMjB0ZWFtJTIwdm9sdW50ZWVyfGVufDF8fHx8MTc3NDQwNzc4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'AI Rescue'
  }
};

export function Header() {
  const navigate = router.visit;
  const auth = usePage().props.auth as { user?: any } | undefined;
  const user = auth?.user;          
  const logout = () => router.post('/logout');
  const isAuthenticated = !!user;
//   const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (profileMenuOpen && !target.closest('[data-profile-menu]')) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [profileMenuOpen]);

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle('dark');
//   };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getAccountPath = () => {
    if (!user) {
      return '/account/user';
    }

    if (user.role === 'super-admin') {
      return '/account/super-admin/dashboard';
    }

    if (user.role === 'admin') {
      return '/account/admin/dashboard';
    }

    if (user.role === 'volunteer') {
      return '/account/volunteer';
    }

    return '/account/user';
  };

  const getAccountSettingsPath = () => {
    if (!user) {
      return '/settings/profile';
    }

    if (user.role === 'super-admin') {
      return '/account/super-admin/account-settings';
    }

    if (user.role === 'admin') {
      return '/account/admin/account-settings';
    }

    if (user.role === 'volunteer') {
      return '/account/volunteer/account-settings';
    }

    return '/account/user/account-settings';
  };

  return (
    <header className="w-full relative z-[100] font-quicksand">
      {/* Top Info Bar */}
      <div className="bg-paw-navy text-white text-[10px] md:text-xs py-2 px-4 flex flex-col md:flex-row justify-between items-center gap-2 border-b border-white/5">
        <div className="flex items-center gap-6">
          
          <div className="hidden sm:flex items-center gap-2">
            <Phone size={12} className="text-paw-yellow" />
            <span className="font-bold">0912 345 6789</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Mail size={12} className="text-paw-yellow" />
            <span className="font-bold uppercase tracking-widest">help@iliganstrayfeeders.org</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Social Media Links */}
          <div className="flex items-center gap-2">
            <a href="https://www.facebook.com/IliganStrayFosterandAdoptionCenter" target="_blank" rel="noopener noreferrer" className="hover:text-paw-yellow transition-colors" aria-label="Facebook">
              <Facebook size={14} />
            </a>
            <a href="https://www.instagram.com/iliganstrayfeeders?igsh=MTg2OWpqZGJ5MWdudw==" target="_blank" rel="noopener noreferrer" className="hover:text-paw-yellow transition-colors" aria-label="Instagram">
              <Instagram size={14} />
            </a>
            <a href="https://www.tiktok.com/@iliganstrayfeeders?_r=1&_t=ZS-95wPLd3kxMo" target="_blank" rel="noopener noreferrer" className="hover:text-paw-yellow transition-colors" aria-label="TikTok">
              <Video size={14} />
            </a>
            <a href="https://m.me/IliganStrayFosterandAdoptionCenter" target="_blank" rel="noopener noreferrer" className="hover:text-paw-yellow transition-colors" aria-label="Messenger">
              <MessageCircle size={14} />
            </a>
          </div>
          
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white/95 backdrop-blur-md shadow-xl shadow-paw-navy/5 px-4 md:px-6 lg:px-8 py-4 dark:bg-gray-900/95 dark:text-white transition-colors ${scrolled ? 'bg-white/95 dark:bg-gray-900/95' : ''}`}>
        <div className="w-full max-w-full mx-auto flex flex-nowrap items-center justify-between gap-2 lg:gap-4">
          <Link href="/" className="flex flex-nowrap items-center gap-3 group shrink-0" style={{ whiteSpace: 'nowrap' }}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-paw-orange/20 group-hover:scale-110 transition-transform bg-transparent shrink-0">
              <img src={logo} alt="Iligan Stray Feeders Logo" className="w-full h-full object-contain" />
            </div>
            <div className="shrink-0" style={{ whiteSpace: 'nowrap' }}>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-paw-navy dark:text-white leading-none" style={{ whiteSpace: 'nowrap' }}>ILIGAN</h1>
              <p className="text-[10px] font-black text-paw-orange tracking-[0.2em] leading-none uppercase" style={{ whiteSpace: 'nowrap' }}>Stray Feeders</p>
            </div>
          </Link>

          <div className="hidden xl:flex flex-nowrap items-center gap-2 lg:gap-3 xl:gap-4 2xl:gap-6 text-xs xl:text-xs 2xl:text-sm font-black text-paw-navy/80 dark:text-white/80 uppercase tracking-wider shrink-0" style={{ whiteSpace: 'nowrap' }}>
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-paw-orange transition-colors shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              Home
            </Link>
            <Link href="/about" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>About</Link>
            <div className="relative shrink-0" style={{ whiteSpace: 'nowrap' }} onMouseEnter={() => setHoveredNav('/adopt')} onMouseLeave={() => setHoveredNav(null)}>
              <Link href="/adopt" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>Adopt</Link>
              <AnimatePresence>
                {hoveredNav === '/adopt' && navPreviews['/adopt'] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
                  >
                    <div className="w-[180px] h-[240px] rounded-[10px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10">
                      <div className="relative w-full h-full">
                        <ImageWithFallback src={navPreviews['/adopt'].image} alt={navPreviews['/adopt'].label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-bold">{navPreviews['/adopt'].label}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative shrink-0" style={{ whiteSpace: 'nowrap' }} onMouseEnter={() => setHoveredNav('/donate')} onMouseLeave={() => setHoveredNav(null)}>
              <Link href="/donate" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>Donate</Link>
              <AnimatePresence>
                {hoveredNav === '/donate' && navPreviews['/donate'] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
                  >
                    <div className="w-[180px] h-[240px] rounded-[10px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10">
                      <div className="relative w-full h-full">
                        <ImageWithFallback src={navPreviews['/donate'].image} alt={navPreviews['/donate'].label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-bold">{navPreviews['/donate'].label}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative shrink-0" style={{ whiteSpace: 'nowrap' }} onMouseEnter={() => setHoveredNav('/volunteer')} onMouseLeave={() => setHoveredNav(null)}>
              <Link href="/volunteer" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>Volunteer</Link>
              <AnimatePresence>
                {hoveredNav === '/volunteer' && navPreviews['/volunteer'] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
                  >
                    <div className="w-[180px] h-[240px] rounded-[10px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10">
                      <div className="relative w-full h-full">
                        <ImageWithFallback src={navPreviews['/volunteer'].image} alt={navPreviews['/volunteer'].label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-bold">{navPreviews['/volunteer'].label}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative shrink-0" style={{ whiteSpace: 'nowrap' }} onMouseEnter={() => setHoveredNav('/rescue')} onMouseLeave={() => setHoveredNav(null)}>
              <Link href="/rescue" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>
                <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>AI Rescue</span>
              </Link>
              <AnimatePresence>
                {hoveredNav === '/rescue' && navPreviews['/rescue'] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
                  >
                    <div className="w-[180px] h-[240px] rounded-[10px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10">
                      <div className="relative w-full h-full">
                        <ImageWithFallback src={navPreviews['/rescue'].image} alt={navPreviews['/rescue'].label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-bold">{navPreviews['/rescue'].label}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/events" className="hover:text-paw-orange transition-colors shrink-0" style={{ whiteSpace: 'nowrap' }}>Events</Link>
            <Link href="/missing" className="hover:text-paw-orange transition-colors text-red-500 flex flex-nowrap items-center gap-1.5 shrink-0" style={{ whiteSpace: 'nowrap' }}>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
              <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>Missing</span>
            </Link>
            <Link href="/sos" className="bg-red-600 text-white px-3.5 xl:px-4 py-2 rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex flex-nowrap items-center gap-1.5 shrink-0 text-xs" style={{ whiteSpace: 'nowrap' }}>
               <Siren size={14} className="animate-bounce shrink-0" />
               <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>SOS REPORT</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative flex items-center shrink-0" data-profile-menu>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 font-black text-paw-navy dark:text-white hover:text-paw-orange transition-all bg-paw-bg dark:bg-gray-800 px-3 py-2 rounded-xl border-2 border-transparent hover:border-paw-orange/20 cursor-pointer group whitespace-nowrap shrink-0"
                  title="Open user menu"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-paw-orange to-paw-yellow overflow-hidden border border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF750F&color=fff&bold=true`}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF750F&color=fff&bold=true`;
                      }}
                    />
                  </div>
                  <span className="hidden sm:inline text-xs uppercase tracking-widest truncate max-w-[80px] whitespace-nowrap">
                    {user.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform text-paw-navy dark:text-white shrink-0 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[110]"
                    >
                      <Link
                        href={getAccountPath()}
                        onClick={() => setProfileMenuOpen(false)}
                        className="block p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-paw-orange/10 to-paw-yellow/10 hover:from-paw-orange/20 hover:to-paw-yellow/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-paw-orange to-paw-yellow overflow-hidden border-2 border-white shadow-md">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF750F&color=fff&bold=true`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF750F&color=fff&bold=true`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm text-paw-navy dark:text-white truncate">{user.name}</h4>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </Link>

                      <div className="p-2">
                        <Link
                          href={getAccountSettingsPath()}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-paw-bg dark:hover:bg-gray-700 transition-colors text-paw-navy dark:text-white group"
                        >
                          <Settings size={18} className="text-gray-400 group-hover:text-paw-orange transition-colors" />
                          <span className="font-bold text-sm">Account Settings</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 group cursor-pointer"
                        >
                          <LogOut size={18} className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors" />
                          <span className="font-bold text-sm">Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 font-black text-paw-navy dark:text-white hover:text-paw-orange transition-all bg-paw-bg dark:bg-gray-800 px-4 py-2.5 rounded-xl border-2 border-transparent hover:border-paw-orange/20">
                <User size={20} />
                <span className="hidden sm:inline uppercase tracking-widest text-xs">Login</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 rounded-xl"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-paw-navy dark:text-white">Search</h3>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for pets, events, articles..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-paw-orange outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-paw-orange text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-[201] shadow-2xl overflow-y-auto xl:hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-paw-navy dark:text-white">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <X size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <nav className="space-y-2">
                  <Link
                    href="/"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    About
                  </Link>
                  <Link
                    href="/adopt"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    Adopt
                  </Link>
                  <Link
                    href="/donate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    Donate
                  </Link>
                  <Link
                    href="/volunteer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    Volunteer
                  </Link>
                  <Link
                    href="/rescue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    AI Rescue
                  </Link>
                  <Link
                    href="/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-paw-navy dark:text-white hover:bg-paw-bg dark:hover:bg-gray-800 transition-colors uppercase text-sm tracking-widest"
                  >
                    Events
                  </Link>

                  <Link
                    href="/missing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase text-sm tracking-widest flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Missing Pets
                  </Link>

                  <Link
                    href="/sos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 transition-colors uppercase text-sm tracking-widest flex items-center gap-2 justify-center mt-4"
                  >
                    <Siren size={16} className="animate-bounce" />
                    SOS REPORT
                  </Link>
                </nav>

                {!isAuthenticated && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-black text-white bg-paw-orange hover:bg-orange-600 transition-colors uppercase text-sm tracking-widest"
                    >
                      <User size={18} />
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
