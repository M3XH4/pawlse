import { User, Mail, Phone, MapPin, Briefcase, FileText, Edit, Save, X, Home, Award, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface VolunteerProfileProps {
    profile: {
        full_name: string;
        mobile: string;
        email: string;
        address: string;
        role: string;
        why: string;
        experience: string | null;
        foster_capacity?: number | null;
        foster_preference?: string | null;
        foster_needs?: string | null;
        medic_experience?: string | null;
        medic_certifications?: string | null;
        transport_has_license?: boolean;
        created_at: string;
    } | null;
}

export default function VolunteerProfileInformation({ profile }: VolunteerProfileProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        fullName: profile?.full_name || '',
        mobile: profile?.mobile ? formatPhoneNumber(profile.mobile) : '',
        address: profile?.address || '',
        experience: profile?.experience || '',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.mobile.trim() !== '' && !isValidPhoneNumber(data.mobile)) {
            return;
        }
        post('/account/volunteer/profile', {
            onSuccess: () => setIsEditing(false),
        });
    };

    if (!profile) {
        return (
            <DashboardSectionPage
                title="Profile Information"
                description="Review and update your volunteer profile, availability, and contact details."
                badge={<DashboardMetricBadge icon={<User className="h-4 w-4" />} label="Volunteer" />}
            >
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <User className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm font-bold">No volunteer profile record found.</p>
                </DashboardCard>
            </DashboardSectionPage>
        );
    }

    return (
        <DashboardSectionPage
            title="Profile Information"
            description="Review and update your volunteer profile, availability, and contact details."
            badge={<DashboardMetricBadge icon={<User className="h-4 w-4" />} label="Volunteer" />}
        >
            <div className="w-full">
                {!isEditing ? (
                    <div className="space-y-6">
                        <DashboardCard className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">Personal & Contact Details</h3>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                                >
                                    <Edit size={14} /> Edit Profile
                                </button>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-paw-orange rounded-xl">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Full Name</p>
                                            <p className="text-sm font-bold text-[#0B2340] dark:text-white">{profile.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-paw-orange rounded-xl">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Email Address</p>
                                            <p className="text-sm font-bold text-[#0B2340] dark:text-white">{profile.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-paw-orange rounded-xl">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Mobile Number</p>
                                            <p className="text-sm font-bold text-[#0B2340] dark:text-white">{profile.mobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-paw-orange rounded-xl">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Home Address</p>
                                            <p className="text-sm font-bold text-[#0B2340] dark:text-white">{profile.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard className="p-6">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-6">Volunteer Standing & Background</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl mt-0.5">
                                        <Briefcase size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Preferred / Active Role</p>
                                        <span className="inline-block mt-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-900">
                                            {profile.role}
                                        </span>
                                    </div>
                                </div>

                                {profile.role === 'Foster Volunteer' && (
                                    <div className="flex items-start gap-3 bg-purple-50/50 dark:bg-purple-950/15 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl mt-0.5">
                                            <Home size={18} />
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <p className="text-[10px] text-purple-700 dark:text-purple-300 font-black uppercase tracking-wider">Foster Specifications</p>
                                            <div className="grid sm:grid-cols-2 gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                <p><span className="text-gray-400">Capacity:</span> {profile.foster_capacity ?? 2} pet(s)</p>
                                                <p><span className="text-gray-400">Species Preference:</span> {profile.foster_preference === 'cats' ? 'Cats Only' : profile.foster_preference === 'dogs' ? 'Dogs Only' : 'Both Cats & Dogs'}</p>
                                            </div>
                                            {profile.foster_needs && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold leading-relaxed">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">Environment/Supplies:</span> {profile.foster_needs}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {profile.role === 'Medic Volunteer' && (
                                    <div className="flex items-start gap-3 bg-rose-50/50 dark:bg-rose-950/15 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                        <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-xl mt-0.5">
                                            <Award size={18} />
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-black uppercase tracking-wider">Medical Credentials & Experience</p>
                                            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                                                Certifications: <span className="font-semibold text-gray-700 dark:text-gray-300">{profile.medic_certifications || 'Not on file'}</span>
                                            </p>
                                            {profile.medic_experience && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold leading-relaxed">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">Clinical Background:</span> {profile.medic_experience}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {profile.role === 'Transport' && (
                                    <div className="flex items-start gap-3 bg-teal-50/50 dark:bg-teal-950/15 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                                        <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-xl mt-0.5">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className="text-[10px] text-teal-700 dark:text-teal-300 font-black uppercase tracking-wider">Transport Volunteer Verification</p>
                                            <p className="text-xs font-bold text-teal-950 dark:text-teal-200">
                                                Driver's License & Vehicle Registration: <span className="text-emerald-600 font-black">{profile.transport_has_license ? 'Declared & Verified ✓' : 'Pending verification'}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl mt-0.5">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Relevant Experience</p>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                                            {profile.experience || 'No experience details specified.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t pt-6 dark:border-gray-800">
                                    <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-xl mt-0.5">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Why Volunteer / Motivation</p>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                                            {profile.why}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <DashboardCard className="p-6">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white mb-6">Edit Profile Details</h3>

                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={data.fullName}
                                            onChange={(e) => setData('fullName', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                                            required
                                        />
                                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Mobile Number</label>
                                        <input
                                            type="text"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', formatPhoneNumber(e.target.value))}
                                            placeholder="+63 912 124 1241"
                                            className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                                            required
                                        />
                                        {data.mobile.trim() !== '' && !isValidPhoneNumber(data.mobile) && (
                                            <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit mobile number.</p>
                                        )}
                                        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Home Address</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                                        required
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 font-black uppercase tracking-wider mb-2">Past Relevant Experience</label>
                                    <textarea
                                        value={data.experience}
                                        onChange={(e) => setData('experience', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B] resize-none"
                                        placeholder="Outline any animal handling, feeding route, or rescue experience..."
                                    />
                                    {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setData({
                                            fullName: profile.full_name,
                                            mobile: profile.mobile,
                                            address: profile.address,
                                            experience: profile.experience || '',
                                        });
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-paw-orange text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-md shadow-paw-orange/20"
                                >
                                    {processing ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                                </button>
                            </div>
                        </DashboardCard>
                    </form>
                )}
            </div>
        </DashboardSectionPage>
    );
}
