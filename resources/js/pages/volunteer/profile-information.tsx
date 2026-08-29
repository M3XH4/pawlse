import { User, Mail, Phone, MapPin, Briefcase, FileText, Edit, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
        created_at: string;
    } | null;
}

export default function VolunteerProfileInformation({ profile }: VolunteerProfileProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        fullName: profile?.full_name || '',
        mobile: profile?.mobile || '',
        address: profile?.address || '',
        experience: profile?.experience || '',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
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
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-bold text-sm text-[#0B2340] dark:text-[#F8FAFC] dark:bg-[#1E293B]"
                                            required
                                        />
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
