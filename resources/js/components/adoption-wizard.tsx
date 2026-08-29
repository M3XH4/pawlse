import { X, CheckCircle2, User, FileText, Upload, Calendar, ChevronLeft, ChevronRight, MapPin, Mail, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { formatPhoneNumber } from '@/lib/phone-formatter';

interface AdoptionWizardProps {
  pet: any;
  onClose: () => void;
}

export function AdoptionWizard({ pet, onClose }: AdoptionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { data, setData, post, processing, errors } = useForm({
    pet_id: pet.id,
    
    // Step 1: Applicant Information
    fullName: '',
    address: '',
    phone: '',
    email: '',
    birthDate: '',
    occupation: '',
    company: '',
    socialMedia: '',
    status: '',
    pronouns: '',
    adoptionSource: [] as string[],
    adoptedBefore: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    emergencyEmail: '',

    // Step 2: Questionnaire
    adoptionPreference: '',
    residenceType: '',
    isRenting: '',
    movingPlan: '',
    livesWith: [] as string[],
    hasAllergies: '',
    dailyCareHandler: '',
    expensesHandler: '',
    emergencyHandler: '',
    hoursAlone: '',
    introductionPlan: '',
    familySupport: '',
    familySupportExplanation: '',
    currentPets: '',
    pastPets: '',

    // Step 3: Home & Uploads
    frontHouse: null as File | null,
    streetView: null as File | null,
    livingRoom: null as File | null,
    diningArea: null as File | null,
    kitchen: null as File | null,
    bedroom: null as File | null,
    windows: null as File | null,
    yard: null as File | null,
    uploadedId: null as File | null,

    // Step 4: Interview & Confirmation
    preferredDate: '',
    preferredTime: '',
    canVisitShelter: '',
  });

  const steps = [
    { number: 1, title: 'Applicant Info', icon: User },
    { number: 2, title: 'Questionnaire', icon: FileText },
    { number: 3, title: 'Home & Uploads', icon: Upload },
    { number: 4, title: 'Interview', icon: Calendar }
  ];

  const handleFileUpload = (key: string, file: File | null) => {
    if (file && file.size > 8 * 1024 * 1024) {
      toast.error('File size must be less than 8MB');
      return;
    }
    setData(key as any, file);
  };

  const validateStep1 = () => {
    return data.fullName && data.address && data.phone && data.email && data.birthDate && data.company && data.status && data.pronouns && data.adoptionSource.length > 0 && data.adoptedBefore && data.emergencyName && data.emergencyRelationship && data.emergencyPhone && data.emergencyEmail;
  };

  const validateStep2 = () => {
    const baseValid = data.adoptionPreference && data.residenceType && data.isRenting && data.movingPlan && data.livesWith.length > 0 && data.hasAllergies && data.dailyCareHandler && data.expensesHandler && data.emergencyHandler && data.hoursAlone && data.introductionPlan && data.familySupport && data.currentPets && data.pastPets;

    if (data.familySupport === 'No' && !data.familySupportExplanation) {
      return false;
    }

    return baseValid;
  };

  const validateStep3 = () => {
    return data.uploadedId !== null;
  };

  const validateStep4 = () => {
    return data.preferredDate && data.preferredTime && data.canVisitShelter;
  };

  const canProceed = () => {
    // eslint-disable-next-line curly
    if (currentStep === 1) return validateStep1();

    // eslint-disable-next-line curly
    if (currentStep === 2) return validateStep2();

    // eslint-disable-next-line curly
    if (currentStep === 3) return validateStep3();

    // eslint-disable-next-line curly
    if (currentStep === 4) return validateStep4();
    
    return false;
  };

  const handleNext = () => {
    if (canProceed()) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
      // Auto-scroll to first error
      setTimeout(() => {
        const firstInvalid = document.querySelector('input:invalid, select:invalid, textarea:invalid');

        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep4()) {
      post('/adopt/apply', {
        onSuccess: () => {
          setCompletedSteps(prev => [...new Set([...prev, 4])]);
          toast.success(`Adoption application for ${pet.name} submitted successfully! We will contact you soon.`);
          setTimeout(() => onClose(), 1500);
        },
        onError: (errs) => {
          console.error(errs);
          const firstErr = Object.values(errs)[0];
          toast.error(typeof firstErr === 'string' ? firstErr : 'Please correct errors on the form');
        }
      });
    }
  };

  const progress = (currentStep / 4) * 100;

  const toggleArrayValue = (array: string[], value: string, key: string) => {
    if (array.includes(value)) {
      setData(key as any, array.filter(v => v !== value));
    } else {
      setData(key as any, [...array, value]);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 relative z-20">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-paw-orange">
              <ImageWithFallback src={pet.mainImg} alt={pet.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-black text-paw-orange uppercase tracking-widest block">Adoption Application</span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{pet.name}</h2>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                      completedSteps.includes(step.number)
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-gradient-to-r from-paw-orange to-orange-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {completedSteps.includes(step.number) ? <CheckCircle2 size={20} /> : step.number}
                    </div>
                    <span className={`text-xs font-bold mt-2 text-center hidden sm:block ${
                      currentStep === step.number ? 'text-paw-orange' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center text-sm font-bold text-gray-500 dark:text-gray-400">
              Step {currentStep} of 4 • {Math.round(progress)}% Complete
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Applicant Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Please provide your basic details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={data.fullName}
                      onChange={(e) => setData('fullName', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Address *</label>
                    <input
                      required
                      type="text"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      placeholder="Iligan City, Philippines"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', formatPhoneNumber(e.target.value))}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Email *</label>
                    <input
                      required
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Birth Date *</label>
                    <div className="relative">
                      <input
                        required
                        type="date"
                        value={data.birthDate}
                        onChange={(e) => setData('birthDate', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Work & Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Occupation</label>
                      <input
                        type="text"
                        value={data.occupation}
                        onChange={(e) => setData('occupation', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Your job title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Company/Business Name * (N/A if none)</label>
                      <input
                        required
                        type="text"
                        value={data.company}
                        onChange={(e) => setData('company', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Company name or N/A"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Social Media Profile (N/A if none)</label>
                      <input
                        type="text"
                        value={data.socialMedia}
                        onChange={(e) => setData('socialMedia', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Facebook, Instagram, etc. or N/A"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Status *</label>
                      <select
                        required
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Pronouns *</label>
                      <select
                        required
                        value={data.pronouns}
                        onChange={(e) => setData('pronouns', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      >
                        <option value="">Select pronouns</option>
                        <option value="She/Her">She/Her</option>
                        <option value="He/Him">He/Him</option>
                        <option value="They/Them">They/Them</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Adoption Source</h3>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">What prompted you to adopt? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Friends', 'Website', 'Social Media', 'Other'].map(source => (
                      <label key={source} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.adoptionSource.includes(source)}
                          onChange={() => toggleArrayValue(data.adoptionSource, source, 'adoptionSource')}
                          className="w-5 h-5 rounded accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Adoption History</h3>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Adopted before? *</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="adoptedBefore"
                          value={option}
                          checked={data.adoptedBefore === option}
                          onChange={(e) => setData('adoptedBefore', e.target.value)}
                          className="w-5 h-5 accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Name *</label>
                      <input
                        required
                        type="text"
                        value={data.emergencyName}
                        onChange={(e) => setData('emergencyName', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Relationship *</label>
                      <input
                        required
                        type="text"
                        value={data.emergencyRelationship}
                        onChange={(e) => setData('emergencyRelationship', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Mother, Brother, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Phone *</label>
                      <input
                        required
                        type="tel"
                        value={data.emergencyPhone}
                        onChange={(e) => setData('emergencyPhone', formatPhoneNumber(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Email *</label>
                      <input
                        required
                        type="email"
                        value={data.emergencyEmail}
                        onChange={(e) => setData('emergencyEmail', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="emergency@email.com"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Questionnaire */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Adoption Questionnaire</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Help us understand your preferences and living situation</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">What would you like to adopt? *</label>
                      <select
                        required
                        value={data.adoptionPreference}
                        onChange={(e) => setData('adoptionPreference', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      >
                        <option value="">Select preference</option>
                        <option value="Cat">Cat</option>
                        <option value="Dog">Dog</option>
                        <option value="Both">Both</option>
                        <option value="Not decided">Not decided</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Living Situation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Residence Type *</label>
                      <select
                        required
                        value={data.residenceType}
                        onChange={(e) => setData('residenceType', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      >
                        <option value="">Select type</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Do you rent? *</label>
                      <select
                        required
                        value={data.isRenting}
                        onChange={(e) => setData('isRenting', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                      >
                        <option value="">Select option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">If you move, what will happen to the pet? *</label>
                      <input
                        required
                        type="text"
                        value={data.movingPlan}
                        onChange={(e) => setData('movingPlan', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="What will happen to the pet if you move?"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Household</h3>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Who do you live with? *</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {['Alone', 'Partner', 'Children', 'Parents', 'Roommates'].map(option => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.livesWith.includes(option)}
                          onChange={() => toggleArrayValue(data.livesWith, option, 'livesWith')}
                          className="w-5 h-5 rounded accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>

                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Does anyone in your household have allergies? *</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasAllergies"
                          value={option}
                          checked={data.hasAllergies === option}
                          onChange={(e) => setData('hasAllergies', e.target.value)}
                          className="w-5 h-5 accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Responsibility</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Who will handle daily care? *</label>
                      <input
                        required
                        type="text"
                        value={data.dailyCareHandler}
                        onChange={(e) => setData('dailyCareHandler', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Who will feed, walk, and care for the pet?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Who will pay for expenses? *</label>
                      <input
                        required
                        type="text"
                        value={data.expensesHandler}
                        onChange={(e) => setData('expensesHandler', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Who will handle food, vet, and other costs?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Who will handle emergencies? *</label>
                      <input
                        required
                        type="text"
                        value={data.emergencyHandler}
                        onChange={(e) => setData('emergencyHandler', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Who will handle emergency vet visits?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">How many hours will the pet be left alone daily? *</label>
                      <input
                        required
                        type="text"
                        value={data.hoursAlone}
                        onChange={(e) => setData('hoursAlone', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                        placeholder="Average hours per day the pet will be alone"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Adaptation</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">How will you introduce your new pet to your home? *</label>
                    <textarea
                      required
                      value={data.introductionPlan}
                      onChange={(e) => setData('introductionPlan', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white h-24 resize-none"
                      placeholder="Describe your plan for introducing the pet to your home..."
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Family Support</h3>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Is your family supportive of this adoption? *</label>
                  <div className="flex gap-4 mb-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="familySupport"
                          value={option}
                          checked={data.familySupport === option}
                          onChange={(e) => setData('familySupport', e.target.value)}
                          className="w-5 h-5 accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>

                  {data.familySupport === 'No' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Please explain *</label>
                      <textarea
                        required
                        value={data.familySupportExplanation}
                        onChange={(e) => setData('familySupportExplanation', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white h-24 resize-none"
                        placeholder="Why doesn't your family support the adoption?"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Pet History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Do you currently have pets? *</label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="currentPets"
                              value={option}
                              checked={data.currentPets === option}
                              onChange={(e) => setData('currentPets', e.target.value)}
                              className="w-5 h-5 accent-paw-orange"
                            />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Have you had pets in the past? *</label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="pastPets"
                              value={option}
                              checked={data.pastPets === option}
                              onChange={(e) => setData('pastPets', e.target.value)}
                              className="w-5 h-5 accent-paw-orange"
                            />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Home & Uploads */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Home Verification</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload photos to verify your living environment</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'frontHouse', label: 'Front of House' },
                    { key: 'streetView', label: 'Street View' },
                    { key: 'livingRoom', label: 'Living Room' },
                    { key: 'diningArea', label: 'Dining Area' },
                    { key: 'kitchen', label: 'Kitchen' },
                    { key: 'bedroom', label: 'Bedroom(s)' },
                    { key: 'windows', label: 'Windows (for cats)' },
                    { key: 'yard', label: 'Yard (for dogs)' }
                  ].map(({ key, label }) => {
                    const fileObj = (data as any)[key] as File | null;
                    return (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block">{label}</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(key, e.target.files?.[0] || null)}
                            className="hidden"
                            id={`upload-${key}`}
                          />
                          <label
                            htmlFor={`upload-${key}`}
                            className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                              fileObj
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-paw-orange bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            {fileObj ? (
                              <>
                                <CheckCircle2 size={24} className="text-green-500 mb-2" />
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 text-center px-2 truncate max-w-full">{fileObj.name}</span>
                              </>
                            ) : (
                              <>
                                <Camera size={24} className="text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center px-2">Upload</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">ID Upload</h3>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Upload Valid ID * (Max 8MB)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 8 * 1024 * 1024) {
                        toast.error('File size must be less than 8MB');
                        return;
                      }
                      setData('uploadedId', file);
                    }}
                    className="hidden"
                    id="upload-id"
                  />
                  <label
                    htmlFor="upload-id"
                    className={`flex items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      data.uploadedId
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-paw-orange bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    {data.uploadedId ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={32} className="text-green-500" />
                        <div>
                          <p className="font-bold text-green-600 dark:text-green-400">{data.uploadedId.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{(data.uploadedId.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={48} className="text-gray-400 mx-auto mb-3" />
                        <p className="font-bold text-gray-700 dark:text-gray-300">Click to upload your ID</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Driver's License, Passport, or Government ID</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Your photos will only be used for adoption screening and will be kept confidential.</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Interview & Confirmation */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Interview & Confirmation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule your interview and review your application</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Preferred Date *</label>
                    <div className="relative">
                      <input
                        required
                        type="date"
                        value={data.preferredDate}
                        onChange={(e) => setData('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Preferred Time *</label>
                    <input
                      required
                      type="time"
                      value={data.preferredTime}
                      onChange={(e) => setData('preferredTime', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-transparent focus:border-paw-orange outline-none transition-all font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-3">Can you visit the shelter for an in-person interview? *</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="canVisitShelter"
                          value={option}
                          checked={data.canVisitShelter === option}
                          onChange={(e) => setData('canVisitShelter', e.target.value)}
                          className="w-5 h-5 accent-paw-orange"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Final Review</h3>
                  <div className="bg-gradient-to-br from-paw-orange/10 to-orange-100/50 dark:from-paw-orange/20 dark:to-orange-900/20 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800">
                        <ImageWithFallback src={pet.mainImg} alt={pet.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Application Summary</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Adopting {pet.name}</h4>
                        <div className="space-y-1 text-sm font-bold text-gray-600 dark:text-gray-400">
                          <p className="flex items-center gap-2"><User size={14} /> {data.fullName}</p>
                          <p className="flex items-center gap-2"><MapPin size={14} /> {data.address}</p>
                          <p className="flex items-center gap-2"><Mail size={14} /> {data.email}</p>
                          <p className="flex items-center gap-2"><Calendar size={14} /> Interview: {data.preferredDate} at {data.preferredTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">Submission does not guarantee approval. Screening will be conducted by our volunteers to ensure the best match for both pet and adopter.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center gap-4 relative z-20">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ml-auto ${
                canProceed()
                  ? 'bg-gradient-to-r from-paw-orange to-orange-500 text-white hover:shadow-lg hover:shadow-paw-orange/30'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep4() || processing}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ml-auto ${
                validateStep4() && !processing
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {processing ? 'Submitting...' : (
                <>
                  <CheckCircle2 size={20} />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
