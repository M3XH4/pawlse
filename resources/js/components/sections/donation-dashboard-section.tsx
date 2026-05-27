import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Wallet, TrendingUp, History, Info, Filter, ArrowRight, ShieldCheck, User, Clock, Heart, Plus, Camera, FileText, Phone, Mail } from 'lucide-react';
import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SubmissionReceipt } from '@/components/submission-receipt';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useMounted } from '@/hooks/use-mounted';

const chartData = [
  { id: 'month-jan', name: 'Jan', amount: 35000 },
  { id: 'month-feb', name: 'Feb', amount: 48000 },
  { id: 'month-mar', name: 'Mar', amount: 53000 },
  { id: 'month-apr', name: 'Apr', amount: 62000 },
  { id: 'month-may', name: 'May', amount: 75000 },
  { id: 'month-jun', name: 'Jun', amount: 82000 },
  { id: 'month-jul', name: 'Jul', amount: 53000 }, // Current
];

const history = [
  { id: 1, user: 'Maria Santos', amount: '₱1,000', type: 'Gcash', date: '2 Hours Ago', msg: 'For the senior dogs at the shelter.' },
  { id: 2, user: 'Anonymous Donor', amount: '₱5,000', type: 'PayPal', date: '5 Hours Ago', msg: 'God bless the strays!' },
  { id: 3, user: 'John Doe', amount: '₱500', type: 'Maya', date: '1 Day Ago', msg: 'Every little bit helps.' },
  { id: 4, user: 'Iligan Pet Shop', amount: '₱10,000', type: 'Bank Transfer', date: '2 Days Ago', msg: 'Monthly corporate support.' }
];

const proofs = [
  'https://akns-images.eonline.com/eol_images/Entire_Site/2014419/rs_600x400-140519133912-1024.happy-animals-club1.jpg?fit=around%7C600:400&output-quality=90&crop=600:400;center,top',
  'https://b1237137.smushcdn.com/1237137/wp-content/uploads/2023/03/dog-eating-events-header.jpg?lossy=1&strip=1&webp=1',
  'https://thumbs.dreamstime.com/b/feeding-homeless-dog-street-generative-ai-hungry-stray-mongrel-bowl-feed-blurred-background-329997782.jpg?w=992',
  'https://herald.uohyd.ac.in/wp-content/uploads/2020/04/Screenshot_7-1091x640.jpg',
  'https://cdn.i-scmp.com/sites/default/files/styles/1200x800/public/d8/images/methode/2021/01/01/25a8b5b0-4c1f-11eb-9c55-93e83087d811_image_hires_193758.jpg?itok=ngh5l1TK&v=1609501091',
  'https://bcspune.org/wp-content/uploads/2025/04/what-to-feed-stray-cats-768x427.jpg',
  'https://cdn.shopify.com/s/files/1/1633/9019/files/pexels-sims1217-16465626.jpg?v=1757333777',
  'https://cdn.shopify.com/s/files/1/1633/9019/files/istockphoto-1426475748-612x612.jpg?v=1757333775',
  'https://static.mothership.sg/1/2021/05/CAT-FEEDER-20-YEAR.jpg'
];

const animalWishlist = [
  {
    id: 'animal-1',
    name: 'Cassey',
    type: 'Senior Dog',
    age: '8 years',
    photo: 'https://www.foundanimals.org/wp-content/uploads/2023/02/twenty20_b4e89a76-af70-4567-b92a-9c3bbf335cb3.jpg',
    needs: [
      { id: 'need-1-1', item: 'Adult Diapers (Medium)', quantity: '2 packs', priority: 'Urgent', icon: <Plus size={16} /> },
      { id: 'need-1-2', item: 'Joint Support Vitamins', quantity: '1 bottle', priority: 'High', icon: <ShieldCheck size={16} /> },
      { id: 'need-1-3', item: 'Soft Senior Dog Food', quantity: '5 kg', priority: 'Medium', icon: <Gift size={16} /> }
    ]
  },
  {
    id: 'animal-2',
    name: 'Bruno',
    type: 'Injured Puppy',
    age: '4 months',
    photo: 'https://paws.org.ph/wp-content/uploads/2023/05/IMG_20230515_110226-scaled-e1684202693703-1024x1024.jpg',
    needs: [
      { id: 'need-2-1', item: 'Antibiotic Cream', quantity: '2 tubes', priority: 'Urgent', icon: <ShieldCheck size={16} /> },
      { id: 'need-2-2', item: 'Puppy Milk Replacer', quantity: '3 cans', priority: 'Urgent', icon: <Gift size={16} /> },
      { id: 'need-2-3', item: 'Small Blankets', quantity: '3 pieces', priority: 'Medium', icon: <Heart size={16} /> }
    ]
  },
  {
    id: 'animal-3',
    name: 'Luna',
    type: 'Nursing Cat',
    age: '2 years',
    photo: 'https://www.pd.com.au/wp-content/uploads/2021/08/Ginger-cat-peeks-at-the-camera-scaled.jpg',
    needs: [
      { id: 'need-3-1', item: 'Kitten Formula', quantity: '5 cans', priority: 'High', icon: <Gift size={16} /> },
      { id: 'need-3-2', item: 'Nursing Supplements', quantity: '1 bottle', priority: 'High', icon: <ShieldCheck size={16} /> },
      { id: 'need-3-3', item: 'Cat Litter', quantity: '10 kg', priority: 'Medium', icon: <Plus size={16} /> }
    ]
  },
  {
    id: 'animal-4',
    name: 'Max',
    type: 'Rescued Dog',
    age: '5 years',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
    needs: [
      { id: 'need-4-1', item: 'Deworming Tablets', quantity: '1 pack', priority: 'Urgent', icon: <ShieldCheck size={16} /> },
      { id: 'need-4-2', item: 'Dog Shampoo (Anti-flea)', quantity: '2 bottles', priority: 'High', icon: <Plus size={16} /> },
      { id: 'need-4-3', item: 'Dry Dog Food', quantity: '10 kg', priority: 'Medium', icon: <Gift size={16} /> }
    ]
  }
];

export function DonationDashboard() {
  const navigate = (url: string) => router.visit(url);
  const [activeTab, setActiveTab] = useState<'TRANS' | 'NEEDS' | 'HISTORY'>('TRANS');
  const [donationAmount, setDonationAmount] = useState('100');
  const [showWishlist, setShowWishlist] = useState(false);
  const [sponsorItem, setSponsorItem] = useState<{ animalName: string; animalPhoto: string; item: string; quantity: string; priority: string } | null>(null);
  const [sponsorMonthlyNeed, setSponsorMonthlyNeed] = useState<{ label: string; cost: string; category: string } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Gcash' | 'PayPal' | 'Maya' | 'Bank Transfer'>('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const isMounted = useMounted();
  const gradientId = "main-chart";
  

  const generateReferenceNumber = (prefix: string) => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${prefix}-${timestamp}-${random}`;
  };

  // Form state for wishlist sponsorship
  const [wishlistForm, setWishlistForm] = useState({
    name: '',
    phone: '',
    email: '',
    delivery: 'I will drop off at the shelter',
    message: ''
  });

  // Form state for monthly need sponsorship
  const [monthlyNeedForm, setMonthlyNeedForm] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '',
    payment: 'Gcash',
    message: ''
  });

  const handleSponsorClick = (animalName: string, animalPhoto: string, need: any) => {
    setSponsorItem({
      animalName,
      animalPhoto,
      item: need.item,
      quantity: need.quantity,
      priority: need.priority
    });
  };

  const handleSponsorMonthlyNeed = (label: string, cost: string, category: string) => {
    setSponsorMonthlyNeed({ label, cost, category });
    setMonthlyNeedForm({ ...monthlyNeedForm, amount: cost.replace('₱', '').replace(',', '') });
  };

  const filteredHistory = filterType === 'All'
    ? history
    : history.filter(h => h.type === filterType);

  return (
    <>
      <AnimatePresence>
        {sponsorItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSponsorItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-paw-orange/20 shrink-0">
                    <ImageWithFallback
                      src={sponsorItem.animalPhoto}
                      alt={sponsorItem.animalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 bg-paw-green/10 px-3 py-1.5 rounded-full mb-2 border border-paw-green/20">
                      <Heart size={14} className="text-paw-green" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-paw-green">Sponsor This Item</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-paw-navy">For {sponsorItem.animalName}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSponsorItem(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-paw-orange/5 to-paw-blue/5 rounded-[2rem] p-6 mb-8 border-2 border-paw-orange/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-black text-paw-navy uppercase italic">{sponsorItem.item}</h4>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                    sponsorItem.priority === 'Urgent' ? 'bg-red-500 text-white' :
                    sponsorItem.priority === 'High' ? 'bg-paw-orange text-white' :
                    'bg-paw-blue/20 text-paw-blue'
                  }`}>
                    {sponsorItem.priority}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600">Quantity Needed: <span className="text-paw-navy">{sponsorItem.quantity}</span></p>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const refNumber = generateReferenceNumber('SPO');
                setReceiptData({
                  title: 'In-Kind Sponsorship Confirmed!',
                  subtitle: `Supporting ${sponsorItem.animalName}`,
                  referenceNumber: refNumber,
                  items: [
                    { label: 'Animal', value: sponsorItem.animalName, icon: <Heart size={20} /> },
                    { label: 'Item', value: sponsorItem.item, icon: <Gift size={20} /> },
                    { label: 'Quantity', value: sponsorItem.quantity, icon: <Plus size={20} /> },
                    { label: 'Priority', value: sponsorItem.priority, icon: <ShieldCheck size={20} /> },
                    { label: 'Your Name', value: wishlistForm.name, icon: <User size={20} /> },
                    { label: 'Contact Number', value: wishlistForm.phone, icon: <Phone size={20} /> },
                    { label: 'Email', value: wishlistForm.email, icon: <Mail size={20} /> },
                    { label: 'Delivery Method', value: wishlistForm.delivery, icon: <Info size={20} /> },
                    ...(wishlistForm.message ? [{ label: 'Message', value: wishlistForm.message, icon: <Heart size={20} /> }] : [])
                  ],
                  type: 'success',
                  footerMessage: 'Thank you for your generous donation! We will contact you shortly to coordinate the delivery. Your kindness makes a real difference in this animal\'s life.'
                });
                setSponsorItem(null);
                setShowWishlist(false);
                setShowReceipt(true);
              }}>
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={wishlistForm.name}
                    onChange={(e) => setWishlistForm({ ...wishlistForm, name: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="0917-XXX-XXXX"
                    value={wishlistForm.phone}
                    onChange={(e) => setWishlistForm({ ...wishlistForm, phone: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={wishlistForm.email}
                    onChange={(e) => setWishlistForm({ ...wishlistForm, email: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Delivery Method</label>
                  <select
                    value={wishlistForm.delivery}
                    onChange={(e) => setWishlistForm({ ...wishlistForm, delivery: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  >
                    <option>I will drop off at the shelter</option>
                    <option>Please arrange pickup</option>
                    <option>I will ship directly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Message (Optional)</label>
                  <textarea
                    placeholder="Add a message of hope for this animal..."
                    rows={4}
                    value={wishlistForm.message}
                    onChange={(e) => setWishlistForm({ ...wishlistForm, message: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-paw-orange text-white py-5 rounded-[2rem] font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Heart size={24} fill="white" />
                  CONFIRM SPONSORSHIP
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {sponsorMonthlyNeed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSponsorMonthlyNeed(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-3 py-1.5 rounded-full mb-2 border border-paw-orange/20">
                    <Wallet size={14} className="text-paw-orange" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-paw-orange">Sponsor Monthly Need</span>
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-paw-navy">{sponsorMonthlyNeed.label}</h3>
                </div>
                <button
                  onClick={() => setSponsorMonthlyNeed(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-paw-orange/5 to-paw-blue/5 rounded-[2rem] p-6 mb-8 border-2 border-paw-orange/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount Needed</p>
                    <h4 className="text-3xl font-black text-paw-navy italic">{sponsorMonthlyNeed.cost}</h4>
                  </div>
                  <div className="p-4 bg-paw-orange rounded-2xl text-white">
                    <Wallet size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-bold mt-4 italic">Category: {sponsorMonthlyNeed.category}</p>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const refNumber = generateReferenceNumber('DON');
                setReceiptData({
                  title: 'Monthly Need Sponsorship Confirmed!',
                  subtitle: `Supporting ${sponsorMonthlyNeed.label}`,
                  referenceNumber: refNumber,
                  items: [
                    { label: 'Budget Category', value: sponsorMonthlyNeed.label, icon: <Wallet size={20} /> },
                    { label: 'Category Type', value: sponsorMonthlyNeed.category, icon: <Info size={20} /> },
                    { label: 'Suggested Amount', value: sponsorMonthlyNeed.cost, icon: <TrendingUp size={20} /> },
                    { label: 'Your Donation', value: `₱${monthlyNeedForm.amount}`, icon: <Heart size={20} /> },
                    { label: 'Your Name', value: monthlyNeedForm.name, icon: <User size={20} /> },
                    { label: 'Contact Number', value: monthlyNeedForm.phone, icon: <Phone size={20} /> },
                    { label: 'Email', value: monthlyNeedForm.email, icon: <Mail size={20} /> },
                    { label: 'Payment Method', value: monthlyNeedForm.payment, icon: <Wallet size={20} /> },
                    ...(monthlyNeedForm.message ? [{ label: 'Message', value: monthlyNeedForm.message, icon: <Heart size={20} /> }] : [])
                  ],
                  type: 'success',
                  footerMessage: 'Thank you for your generous donation! We will contact you shortly with payment details and instructions. Your support directly helps us care for stray animals in Iligan City.'
                });
                setSponsorMonthlyNeed(null);
                setShowReceipt(true);
              }}>
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={monthlyNeedForm.name}
                    onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, name: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="0917-XXX-XXXX"
                    value={monthlyNeedForm.phone}
                    onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, phone: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={monthlyNeedForm.email}
                    onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, email: e.target.value })}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Donation Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-paw-navy font-black text-xl">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={monthlyNeedForm.amount}
                      onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, amount: e.target.value })}
                      defaultValue={sponsorMonthlyNeed.cost.replace('₱', '').replace(',', '')}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 italic">You can sponsor the full amount or contribute partially</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Payment Method</label>
                  <select
                    value={monthlyNeedForm.payment}
                    onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, payment: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors"
                  >
                    <option>Gcash</option>
                    <option>PayPal</option>
                    <option>Maya</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Message (Optional)</label>
                  <textarea
                    placeholder="Add a message of support..."
                    rows={4}
                    value={monthlyNeedForm.message}
                    onChange={(e) => setMonthlyNeedForm({ ...monthlyNeedForm, message: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-paw-orange outline-none font-bold transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-paw-orange text-white py-5 rounded-[2rem] font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Heart size={24} fill="white" />
                  CONFIRM SPONSORSHIP
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showWishlist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWishlist(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-12 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 bg-paw-orange/10 px-4 py-2 rounded-full mb-4 border border-paw-orange/20">
                    <Gift size={18} className="text-paw-orange" />
                    <span className="text-xs font-black tracking-widest uppercase text-paw-orange">Animal-Specific Needs</span>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-paw-navy">In-Kind Donation Wishlist</h3>
                  <p className="text-gray-500 font-bold mt-2 font-quicksand">These animals need your help. Each item makes a real difference.</p>
                </div>
                <button
                  onClick={() => setShowWishlist(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-paw-navy transition-colors shrink-0"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {animalWishlist.map((animal) => (
                  <motion.div
                    key={animal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-8 border-2 border-gray-100 hover:border-paw-orange/30 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-6 mb-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg shrink-0 border-4 border-white">
                        <ImageWithFallback
                          src={animal.photo}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-black text-paw-navy uppercase italic mb-1">{animal.name}</h4>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                          <User size={14} />
                          <span>{animal.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                          <Clock size={14} />
                          <span>{animal.age}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Urgent Needs:</span>
                      {animal.needs.map((need) => (
                        <div
                          key={need.id}
                          onClick={() => handleSponsorClick(animal.name, animal.photo, need)}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-white border-2 border-transparent hover:border-paw-green/30 transition-all group cursor-pointer"
                        >
                          <div className={`p-3 rounded-xl shrink-0 ${
                            need.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' :
                            need.priority === 'High' ? 'bg-paw-orange/10 text-paw-orange' :
                            'bg-paw-blue/10 text-paw-blue'
                          }`}>
                            {need.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-sm font-black text-paw-navy uppercase italic leading-tight">{need.item}</h5>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${
                                need.priority === 'Urgent' ? 'bg-red-500 text-white' :
                                need.priority === 'High' ? 'bg-paw-orange text-white' :
                                'bg-paw-blue/20 text-paw-blue'
                              }`}>
                                {need.priority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-400 italic">Qty: {need.quantity}</span>
                              <span className="text-[10px] font-black text-paw-green uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                SPONSOR →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 p-8 bg-paw-orange/5 rounded-[2.5rem] border-2 border-dashed border-paw-orange/20">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-paw-orange rounded-2xl text-white shrink-0">
                    <Info size={24} />
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-paw-navy uppercase italic mb-2">How to Donate In-Kind Items</h5>
                    <p className="text-sm text-gray-600 font-bold leading-relaxed">
                      You can drop off items at our shelter (123 Rescue Road, Iligan City) or coordinate pickup by messaging us at <span className="text-paw-orange font-black">0917-123-4567</span>. We also accept bulk donations from businesses and distribute surplus to underprivileged students.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="max-w-7xl mx-auto overflow-hidden px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end items-center  mb-16 gap-10">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-paw-green/10 px-4 py-2 rounded-full mb-6 border border-paw-green/20">
            <ShieldCheck size={18} className="text-paw-green" />
            <span className="text-xs font-black tracking-widest uppercase text-paw-green">100% Transparent Financials</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-primary text-primary leading-tight italic">Donation <span className="text-paw-green not-italic underline decoration-8 decoration-paw-green/30 underline-offset-4">Dashboard</span></h2>
          <p className="text-lg text-gray-500 font-bold max-w-xl font-quicksand mt-4">We believe in radical transparency. Track every peso donated and see exactly how it's used to save lives in Iligan.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('TRANS')}
            className={`w-full px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 lg:justify-start ${activeTab === 'TRANS' ? 'bg-paw-navy text-white scale-105' : 'bg-white text-paw-navy/60 hover:bg-gray-50'}`}
          >
            <TrendingUp size={18} />
            TRANSPARENCY
          </button>
          <button 
            onClick={() => setActiveTab('NEEDS')}
            className={`w-full lg:max-w-none px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 lg:justify-start ${activeTab === 'NEEDS' ? 'bg-paw-navy text-white scale-105' : 'bg-white text-paw-navy/60 hover:bg-gray-50'}`}
          >
            <Wallet size={18} />
            MONTHLY NEEDS
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`w-full lg:max-w-none px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 lg:justify-start ${activeTab === 'HISTORY' ? 'bg-paw-navy text-white scale-105' : 'bg-white text-paw-navy/60 hover:bg-gray-50'}`}
          >
            <History size={18} />
            DONOR HISTORY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'TRANS' && (
              <motion.div
                key="trans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl border border-gray-100"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl lg:text-3xl font-black italic uppercase tracking-tighter text-paw-navy">July Fundraising Progress</h3>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Goal</span>
                    <span className="text-xl font-black text-paw-navy">₱100,000</span>
                  </div>
                </div>

                <div className="relative h-12 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '53%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-paw-green to-paw-blue flex items-center justify-end px-6 shadow-lg"
                  >
                    <span className="text-white font-black text-xs tracking-widest uppercase">53% REACHED</span>
                  </motion.div>
                </div>
                
                <div className="flex justify-between items-center mb-12">
                  <span className="text-2xl lg:text-4xl font-black text-paw-green italic">₱53,420 <span className="text-gray-200 text-lg not-italic">Collected</span></span>
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest italic">11 Days Remaining</span>
                </div>

                <div className="h-[300px] w-full mb-12 relative">
                  {isMounted ? (
                        <ResponsiveContainer width="100%" height={300}>
                        <AreaChart key={`area-chart-${activeTab}`} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs key="defs">
                            <linearGradient key="gradient" id={`donation-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis key="xaxis" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                        <YAxis key="yaxis" hide />
                        <Tooltip
                            key="tooltip"
                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 'black' }}
                        />
                        <Area key="area" type="monotone" dataKey="amount" stroke="#22C55E" strokeWidth={4} fillOpacity={1} fill={`url(#donation-gradient-${gradientId})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                  // 👇 optional placeholder (prevents layout jump)
                  <div className="h-[300px] w-full flex items-center justify-center text-gray-300 font-bold">
                    Loading chart...
                  </div>
                              )}
                </div>

                <div className="space-y-6">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Usage Verification (Proofs)</span>
                  <div className="grid grid-cols-3 gap-6">
                    {proofs.map((src, i) => (
                      <div key={i} className="aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-gray-50 relative group cursor-pointer">
                        <ImageWithFallback src={src} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-paw-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'HISTORY' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl border border-gray-100 h-full"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-paw-navy">Recent Contributions</h3>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="bg-paw-bg p-3 rounded-xl text-paw-navy hover:bg-gray-100 transition-colors"
                    >
                      <Filter size={20} />
                    </button>
                    <AnimatePresence>
                      {showFilter && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 min-w-[200px] z-10"
                        >
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Filter by Type</p>
                          {(['All', 'Gcash', 'PayPal', 'Maya', 'Bank Transfer'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setFilterType(type);
                                setShowFilter(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all mb-1 ${
                                filterType === type
                                  ? 'bg-paw-orange text-white'
                                  : 'text-paw-navy hover:bg-gray-50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((h) => (
                      <div key={h.id} className="flex gap-6 p-6 rounded-[2rem] bg-gray-50 border border-transparent hover:border-paw-green hover:bg-white hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md text-paw-green shrink-0 group-hover:bg-paw-green group-hover:text-white transition-all">
                          <Heart size={28} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-lg font-black text-paw-navy uppercase italic">{h.user}</h4>
                            <span className="text-xl font-black text-paw-green">{h.amount}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-400 mb-3 italic">"{h.msg}"</p>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-paw-blue uppercase tracking-widest italic">{h.type}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{h.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-bold italic">No donations found for this filter.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/donate/history')}
                  className="w-full mt-10 py-5 rounded-2xl border-4 border-dashed border-gray-100 text-gray-400 font-black text-xs tracking-widest uppercase hover:bg-gray-50 hover:border-gray-200 transition-all italic flex items-center justify-center gap-2"
                >
                  LOAD MORE HISTORY
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {activeTab === 'NEEDS' && (
              <motion.div
                key="needs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl border border-gray-100 h-full"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-paw-navy">Shelter Budget Needs</h3>
                  <span className="text-[10px] font-black text-paw-blue bg-paw-blue/10 px-3 py-1.5 rounded-full uppercase tracking-widest italic">JULY 2025</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Animal Food & Supplements', cost: '₱45,000', icon: <Gift size={24} />, progress: 65, color: 'bg-paw-orange', category: 'Food & Nutrition' },
                    { label: 'Veterinary Bills & Medicine', cost: '₱35,000', icon: <ShieldCheck size={24} />, progress: 40, color: 'bg-red-500', category: 'Medical Care' },
                    { label: 'Shelter Rent & Utilities', cost: '₱12,000', icon: <Wallet size={24} />, progress: 90, color: 'bg-paw-blue', category: 'Infrastructure' },
                    { label: 'Rescue Ops & Gas', cost: '₱8,000', icon: <TrendingUp size={24} />, progress: 30, color: 'bg-paw-green', category: 'Operations' }
                  ].map((need, i) => (
                    <div key={i} className="bg-gray-50 p-8 rounded-[2.5rem] border border-transparent hover:border-paw-navy/10 transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-4 rounded-2xl text-white shadow-lg ${need.color}`}>
                          {need.icon}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Needed</span>
                          <span className="text-xl font-black text-paw-navy italic">{need.cost}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-paw-navy uppercase italic mb-4">{need.label}</h4>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div className={`h-full ${need.color}`} style={{ width: `${need.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{need.progress}% Funded</span>
                        <span
                          onClick={() => handleSponsorMonthlyNeed(need.label, need.cost, need.category)}
                          className="text-[10px] font-black text-paw-orange uppercase tracking-widest underline cursor-pointer hover:text-paw-navy transition-colors"
                        >
                          Sponsor This
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-10">
          <div className="bg-paw-orange text-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform -z-0">
              <Heart size={200} fill="white" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">Instant <br /> Impact.</h3>
              <p className="text-white/80 font-bold mb-10 font-quicksand leading-relaxed">Your donation goes directly to animal care. No administrative bloat.</p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {['50', '100', '500', '1000'].map((amt) => (
                  <button 
                    key={amt} 
                    onClick={() => setDonationAmount(amt)}
                    className={`px-5 py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-md ${donationAmount === amt ? 'bg-white text-paw-orange scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    ₱{amt}
                  </button>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">Custom Amount</span>
                  <Wallet size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">₱</span>
                  <input 
                    type="number" 
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="bg-transparent border-none outline-none text-4xl font-black w-full placeholder:text-white/40" 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Link href="/donate" className="w-full bg-paw-navy text-white py-6 rounded-[2rem] font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4">
                DONATE NOW
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>

          <div className="bg-paw-navy text-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl group cursor-pointer relative overflow-hidden">
             <div className="absolute bottom-0 right-0 p-8 opacity-10 -z-0">
               <FileText size={120} fill="white" />
             </div>
             <div className="relative z-10">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">In-Kind Donations</h3>
               <p className="text-white/60 font-bold mb-8 text-sm leading-relaxed italic text-left">Food, medicine, pet supplies, and rescue essentials&nbsp;&nbsp;are always welcome. Donations are used to support feeding programs, rescue operations, and the care of stray animals in Iligan City. </p>
               <button
                 onClick={() => setShowWishlist(true)}
                 className="flex items-center gap-3 text-paw-yellow font-black uppercase tracking-widest text-xs group"
               >
                 VIEW WISHLIST
                 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
               </button>
             </div>
          </div>
        </div>
      </div>
    </section>

    {receiptData && (
      <SubmissionReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setReceiptData(null);
          setWishlistForm({ name: '', phone: '', email: '', delivery: 'I will drop off at the shelter', message: '' });
          setMonthlyNeedForm({ name: '', phone: '', email: '', amount: '', payment: 'Gcash', message: '' });
        }}
        title={receiptData.title}
        subtitle={receiptData.subtitle}
        referenceNumber={receiptData.referenceNumber}
        items={receiptData.items}
        type={receiptData.type}
        footerMessage={receiptData.footerMessage}
      />
    )}
    </>
  );
}