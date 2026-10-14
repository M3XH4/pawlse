import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Zap,
    Clock,
    CheckCircle2,
    ClipboardList,
    Award,
    HeartHandshake,
    MapPin,
    Heart,
    Home,
    AlertCircle,
    Sparkles,
    X,
    ChevronRight,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface FosterParentInfo {
    id: number;
    status: string;
    capacity: number;
    location: string | null;
    pet_preference: string | null;
    housing_type: string | null;
    notes: string | null;
    approved_at: string | null;
    created_at: string | null;
}

interface VolunteerStatusProps {
    application: {
        status: string;
        role: string;
        reference_number: string;
        created_at: string;
    } | null;
    fosterParent?: FosterParentInfo | null;
    stats: {
        total_hours: number;
        completed_tasks_count: number;
        pending_tasks_count: number;
    };
}

export default function VolunteerStatus({ application, fosterParent, stats }: VolunteerStatusProps) {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [capacity, setCapacity] = useState(fosterParent?.capacity || 2);
    const [location, setLocation] = useState(fosterParent?.location || '');
    const [petPreference, setPetPreference] = useState(fosterParent?.pet_preference || 'both');
    const [housingType, setHousingType] = useState(fosterParent?.housing_type || 'Single Family Home with Yard');
    const [notes, setNotes] = useState(fosterParent?.notes || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'foster' && fosterParent?.status !== 'approved') {
                setShowApplyModal(true);
            }
        }
    }, [fosterParent]);

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/account/volunteer/apply-foster',
            {
                capacity,
                location,
                pet_preference: petPreference,
                housing_type: housingType,
                notes: notes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowApplyModal(false);
                    toast.success('Foster caretaker application submitted successfully!');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Failed to submit foster application.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <DashboardSectionPage
            title="Volunteer Status"
            description="Monitor your active volunteer standing, logged service hours, and task contributions."
            badge={<DashboardMetricBadge icon={<Zap className="h-4 w-4" />} label="Active Volunteer" />}
        >
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Logged Hours</span>
                        <div className="p-2 bg-orange-100 dark:bg-orange-950 text-paw-orange rounded-xl">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.total_hours || 0} hrs
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Total verified service time</p>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Completed Activities</span>
                        <div className="p-2 bg-green-100 dark:bg-green-950 text-green-600 rounded-xl">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.completed_tasks_count || 0}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Successful events & routes</p>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-sm uppercase tracking-wider">Active Assignments</span>
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                            <ClipboardList size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#0B2340] dark:text-white mb-1">
                            {stats?.pending_tasks_count || 0}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold">Upcoming tasks on your list</p>
                    </div>
                </DashboardCard>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Volunteer Registration Details */}
                <DashboardCard className="p-6">
                    <h3 className="font-fredoka text-xl font-bold mb-4 text-[#0B2340] dark:text-white">Volunteer Registration Details</h3>
                    <div className="space-y-3 font-bold text-sm">
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Preferred Role</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.role || 'Volunteer'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Reference ID</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.reference_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Registration Date</span>
                            <span className="text-[#0B2340] dark:text-white">{application?.created_at || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                            <span className="text-[#64748B] dark:text-[#94A3B8]">Standing Status</span>
                            <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs px-2.5 py-0.5 rounded font-black uppercase">Approved</span>
                        </div>
                    </div>
                </DashboardCard>

                {/* Foster Home Caretaker Standing */}
                <DashboardCard className="p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white flex items-center gap-2">
                                <HeartHandshake className="text-paw-orange h-5 w-5" /> Foster Care Standing
                            </h3>
                            {fosterParent?.status === 'approved' && (
                                <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs px-2.5 py-0.5 rounded font-black uppercase">
                                    Approved Foster Home
                                </span>
                            )}
                            {fosterParent?.status === 'pending' && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded font-black uppercase animate-pulse">
                                    Application Pending
                                </span>
                            )}
                            {(!fosterParent || fosterParent.status === 'inactive') && (
                                <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs px-2.5 py-0.5 rounded font-black uppercase">
                                    Not Registered
                                </span>
                            )}
                        </div>

                        {fosterParent?.status === 'approved' ? (
                            <div className="space-y-3 font-bold text-sm">
                                <p className="text-xs text-gray-500 font-medium">
                                    You are an authorized shelter foster home. You can accept animals, view care instructions, and record care updates.
                                </p>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                                        <MapPin size={14} className="text-paw-orange" /> Foster Home Location
                                    </span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.location || 'Location on file'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Approved Capacity</span>
                                    <span className="text-paw-orange font-black">{fosterParent.capacity} concurrent pet slot(s)</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Pet Preference</span>
                                    <span className="text-[#0B2340] dark:text-white capitalize">{fosterParent.pet_preference || 'Any'}</span>
                                </div>
                            </div>
                        ) : fosterParent?.status === 'pending' ? (
                            <div className="space-y-3 font-bold text-sm">
                                <p className="text-xs text-amber-800 dark:text-amber-300/90 font-medium bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                                    Your application to become a Foster Parent is currently being reviewed by our shelter coordinators. We verify housing setup and availability before assigning animals.
                                </p>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                                        <MapPin size={14} className="text-paw-orange" /> Home Location
                                    </span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.location || 'Provided in application'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                    <span className="text-[#64748B] dark:text-[#94A3B8]">Requested Capacity</span>
                                    <span className="text-[#0B2340] dark:text-white">{fosterParent.capacity} pet slot(s)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-medium">
                                    Open your home to animals needing temporary shelter, healing, or behavioral socialization before permanent adoption. Shelter coordinates food, medical care, and guidance.
                                </p>
                                <div className="bg-orange-50/60 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-[#0B2340] dark:text-white">
                                        <Sparkles size={14} className="text-paw-orange" /> Foster Home Benefits
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        • All veterinary costs & food covered by shelter<br />
                                        • Flexible placement durations (1-4 weeks)<br />
                                        • Direct coordinator support & 24/7 hotline
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        {fosterParent?.status === 'approved' ? (
                            <Link
                                href="/account/volunteer/foster-care"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 shadow-xs transition-colors"
                            >
                                <Heart size={14} /> Open My Foster Pets Dashboard
                            </Link>
                        ) : fosterParent?.status === 'pending' ? (
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 text-[#0B2340] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Edit Application Details
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-paw-orange text-white hover:bg-paw-orange/90 shadow-xs transition-colors"
                            >
                                <HeartHandshake size={15} /> Apply to Become a Foster Parent
                            </button>
                        )}
                    </div>
                </DashboardCard>
            </div>

            {/* APPLY TO FOSTER MODAL */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-950 text-paw-orange rounded-xl">
                                    <HeartHandshake size={20} />
                                </div>
                                <div>
                                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                        Foster Parent Application
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Apply to temporarily foster animals in your home
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <MapPin size={13} className="text-paw-orange" /> Foster Home Location / Address *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Barangay San Antonio, Pasig City / 123 Maple St."
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Where the pet will reside during foster care. Helps shelter team coordinate transport & veterinary visits.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Caretaker Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        required
                                        value={capacity}
                                        onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Max pets you can foster at once
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Pet Preference *
                                    </label>
                                    <select
                                        value={petPreference}
                                        onChange={(e) => setPetPreference(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                    >
                                        <option value="both">Any / Both Dogs & Cats</option>
                                        <option value="dogs">Dogs Only</option>
                                        <option value="cats">Cats Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Housing Environment & Setup *
                                </label>
                                <select
                                    value={housingType}
                                    onChange={(e) => setHousingType(e.target.value)}
                                    className="w-full text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                >
                                    <option value="Single Family Home with Yard">Single Family Home with Fenced Yard</option>
                                    <option value="Townhouse with Courtyard">Townhouse with Courtyard</option>
                                    <option value="Pet-Friendly Apartment / Condo">Pet-Friendly Apartment / Condo</option>
                                    <option value="Rural / Farm Setting">Rural / Farm Setting</option>
                                    <option value="Other Residential">Other Residential Setup</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Experience, Other Pets & Daily Routine Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tell us about previous pet experience, existing pets at home, daily schedule, or willingness to nurse sick/post-surgery rescues..."
                                    className="w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !location.trim()}
                                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-paw-orange text-white hover:bg-paw-orange/90 transition-colors shadow-xs"
                                >
                                    {submitting ? 'Submitting Application...' : 'Submit Foster Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardSectionPage>
    );
}
