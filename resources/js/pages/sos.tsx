import { AlertCircle, MapPin, Camera, Clock, CheckCircle2, Siren, Phone, Navigation, Hospital } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';


const EMERGENCY_CONTACTS = [
  { name: 'Iligan City Veterinary Office', phone: '(063) 221-4563', type: 'Government Vet', available: '24/7' },
  { name: 'Animal Welfare Coalition Iligan', phone: '0912 345 6789', type: 'Rescue Hotline', available: '24/7' },
  { name: 'ISF Emergency Response', phone: '0923 456 7890', type: 'ISF Direct Line', available: '24/7' },
  { name: 'Barangay Animal Welfare', phone: '(063) 221-8888', type: 'Local Barangay', available: 'Office Hours' }
];

const NEARBY_VETS = [
  { name: 'Iligan Veterinary Clinic', address: 'Quezon Ave, Poblacion', distance: '1.2 km', contact: '(063) 221-3344', hours: '8AM - 8PM' },
  { name: 'Pet Care Center Iligan', address: 'Tibanga Highway', distance: '2.5 km', contact: '(063) 225-1122', hours: '24/7 Emergency' },
  { name: 'Animal Medical Center', address: 'Pala-o, Iligan City', distance: '3.8 km', contact: '(063) 223-9900', hours: '9AM - 6PM' },
  { name: 'Compassionate Vet Clinic', address: 'Mahayahay, Iligan', distance: '4.1 km', contact: '(063) 228-7766', hours: '8AM - 5PM' }
];

export default function SOS() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    animalType: '',
    location: '',
    urgency: 'high',
    description: '',
    contactName: '',
    contactPhone: '',
    situationType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadedFiles(files);

    const newPreviews: string[] = [];
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const preview = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        } else if (file.type.startsWith('video/')) {
            newPreviews.push(URL.createObjectURL(file));
        }
    }
    setFilePreviews(newPreviews);
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      toast.info('Detecting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({ ...formData, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Current Location)` });
          toast.success('Location pinned!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to detect location. Please enter manually.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.situationType) {
      toast.error('Please select the type of emergency.');
      return;
    }
    if (!formData.location) {
      toast.error('Location is required.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('animalType', formData.animalType);
    data.append('location', formData.location);
    data.append('urgency', formData.urgency);
    data.append('description', formData.description);
    data.append('contactName', formData.contactName || '');
    data.append('contactPhone', formData.contactPhone || '');
    data.append('situationType', formData.situationType);

    uploadedFiles.forEach((file) => {
      data.append('images[]', file);
    });

    router.post('/pet-reports/sos', data, {
      onSuccess: () => {
        setSubmitted(true);
        toast.success('SOS report submitted successfully!');
        setSubmitting(false);
      },
      onError: (errors) => {
        const message = Object.values(errors).flat().join(' ');
        toast.error(message || 'Failed to submit SOS report.');
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 font-quicksand">
      <Header />

      <main className="py-12 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          {!submitted ? (
            <>
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Siren size={48} className="text-red-600 animate-pulse" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Emergency Animal Report</h1>
                <p className="text-white/80 max-w-2xl mx-auto font-bold text-xl leading-relaxed">
                  Report an animal in distress, being abused, or in immediate danger. Our emergency response team will be notified instantly.
                </p>
              </div>

              <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Emergency Type */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-4 uppercase tracking-widest">Type of Emergency</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Abuse', 'Injured', 'Trapped', 'Sick'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, situationType: type })}
                          className={`p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                            formData.situationType === type
                              ? 'bg-red-600 text-white border-red-600 shadow-xl'
                              : 'bg-gray-50 text-gray-600 border-transparent hover:border-red-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animal & Location */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Animal Type</label>
                      <select
                        required
                        name="animalType"
                        value={formData.animalType}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-500 transition-all font-bold text-lg"
                      >
                        <option value="">Select animal type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Current Location</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          required
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-500 transition-all font-bold text-lg"
                          placeholder="Type manually or pin your location"
                        />
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="px-6 py-4 sm:py-0 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <MapPin size={18} />
                          <span className="hidden sm:inline">Pin Location</span>
                          <span className="sm:hidden">Pin My Location</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 font-bold mt-2 ml-1">Click "Pin Location" to use your current coordinates</p>
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-4 uppercase tracking-widest">Urgency Level</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'high', label: 'CRITICAL', desc: 'Life-threatening', color: 'red' },
                        { id: 'medium', label: 'URGENT', desc: 'Needs help soon', color: 'orange' },
                        { id: 'low', label: 'MODERATE', desc: 'Can wait', color: 'yellow' }
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, urgency: level.id })}
                          className={`p-6 rounded-2xl border-4 transition-all ${
                            formData.urgency === level.id
                              ? `border-${level.color}-500 bg-${level.color}-50 shadow-xl`
                              : 'border-transparent bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-${level.color}-500 mx-auto mb-2`}></div>
                          <p className="font-black text-sm uppercase tracking-widest text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-500 font-bold mt-1">{level.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Detailed Description</label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-500 transition-all font-bold min-h-[150px]"
                      placeholder="Describe what you saw. Include any injuries, behavior, and immediate threats..."
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Upload Photo/Video (if safe to do so)</label>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="border-4 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-red-300 transition-all cursor-pointer bg-gray-50 block"
                    >
                      {uploadedFiles.length === 0 ? (
                        <>
                          <Camera size={40} className="mx-auto text-gray-400 mb-3" />
                          <p className="font-black text-gray-900 mb-1">Upload evidence</p>
                          <p className="text-sm text-gray-500 font-bold">Photo or video of the situation (Max 10MB, multiple allowed)</p>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {filePreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                                {uploadedFiles[idx]?.type.startsWith('image/') ? (
                                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                                ) : (
                                  <video src={preview} className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            <p className="font-black text-green-600">{uploadedFiles.length} files selected</p>
                          </div>
                          <p className="text-xs text-gray-400 font-bold">Click to change files</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Your Name</label>
                      <input
                        required
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-500 transition-all font-bold"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 uppercase tracking-widest">Contact Number</label>
                      <input
                        required
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-500 transition-all font-bold"
                        placeholder="09XX XXX XXXX"
                      />
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-4 p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                    <AlertCircle className="text-red-600 shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-black text-red-900 text-sm uppercase tracking-widest mb-2">Important Reminder</p>
                      <p className="text-sm text-red-800 font-bold leading-relaxed">
                        DO NOT approach aggressive or dangerous animals. Keep a safe distance and wait for trained responders.
                        False reports will be subject to legal action.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 text-white py-6 rounded-[24px] font-black text-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 uppercase tracking-tight disabled:opacity-50"
                  >
                    <Siren size={28} className={submitting ? 'animate-spin' : 'animate-bounce'} />
                    {submitting ? 'SENDING EMERGENCY REPORT...' : 'SEND EMERGENCY REPORT'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Success Message */}
              <div className="bg-white rounded-[40px] p-12 text-center shadow-2xl">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={48} strokeWidth={3} />
                </div>
                <h2 className="text-5xl font-black text-gray-900 mb-4 uppercase">Report Received!</h2>
                <p className="text-gray-600 font-bold text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                  Emergency responders and nearby volunteers have been notified. Help is on the way to <span className="text-red-600 font-black">{formData.location}</span>.
                </p>
                <div className="inline-flex items-center gap-3 bg-red-50 px-6 py-3 rounded-full border-2 border-red-200">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-black text-red-900 text-sm uppercase tracking-widest">Response Team Dispatched</span>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Phone size={32} className="text-red-600" />
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Emergency Contacts</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {EMERGENCY_CONTACTS.map((contact, index) => (
                    <motion.a
                      key={index}
                      href={`tel:${contact.phone}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight mb-1">{contact.name}</p>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{contact.type}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Phone size={20} className="text-white" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-red-600 mb-2">{contact.phone}</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-green-600" />
                        <p className="text-xs text-green-600 font-black uppercase tracking-widest">{contact.available}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Nearby Vets */}
              <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Hospital size={32} className="text-blue-600" />
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Nearest Veterinary Clinics</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {NEARBY_VETS.map((vet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="font-black text-gray-900 text-lg leading-tight mb-2">{vet.name}</p>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin size={14} className="text-blue-600" />
                            <p className="text-sm font-bold">{vet.address}</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={14} className="text-blue-600" />
                            <p className="text-sm font-bold">{vet.hours}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Distance</p>
                          <p className="text-xl font-black text-blue-600">{vet.distance}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={`tel:${vet.contact}`}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                        <button className="px-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all">
                          <Navigation size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      animalType: '',
                      location: '',
                      urgency: 'high',
                      description: '',
                      contactName: '',
                      contactPhone: '',
                      situationType: ''
                    });
                    setUploadedFile(null);
                    setFilePreview(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white text-red-600 px-12 py-5 rounded-[24px] font-black text-xl hover:bg-gray-100 transition-all shadow-xl border-2 border-white"
                >
                  REPORT ANOTHER EMERGENCY
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
