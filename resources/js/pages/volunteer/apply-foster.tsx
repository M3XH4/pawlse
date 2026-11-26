import { router, Link } from '@inertiajs/react';
import {
    HeartHandshake,
    MapPin,
    Sparkles,
    Clock,
    CheckCircle2,
    ArrowLeft,
    Home,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ModernSelect } from '@/components/ui/modern-select';

interface FosterParentInfo {
    id: number;
    status: string;
    capacity: number;
    location: string | null;
    pet_preference: string | null;
    housing_type: string | null;
    notes: string | null;
    created_at: string | null;
}

interface ApplyFosterProps {
    fosterParent?: FosterParentInfo | null;
}

export default function ApplyFoster({ fosterParent }: ApplyFosterProps) {
    const [capacity, setCapacity] = useState(fosterParent?.capacity || 2);
    const [location, setLocation] = useState(fosterParent?.location || '');
    const [petPreference, setPetPreference] = useState(fosterParent?.pet_preference || 'both');
    const [housingType, setHousingType] = useState(
        fosterParent?.housing_type || 'Single Family Home with Yard',
    );
    const [notes, setNotes] = useState(fosterParent?.notes || '');
    const [submitting, setSubmitting] = useState(false);

    const isPending = fosterParent?.status === 'pending';

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
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to submit foster application.',
                    );
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <DashboardSectionPage
            title="Apply to Foster"
            description="Provide your home setup and care preferences to become an authorized shelter foster parent."
            badge={
                <DashboardMetricBadge
                    icon={<HeartHandshake className="h-4 w-4" />}
                    label={isPending ? 'Application Pending' : 'Foster Application'}
                />
            }
        >
            {isPending && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                        <p className="font-bold">Application Under Review</p>
                        <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                            Your application to become a Foster Parent is currently being reviewed by
                            our shelter coordinators. You can update your submitted details below if
                            needed.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <DashboardCard className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-orange-100 p-2.5 text-paw-orange dark:bg-orange-950">
                                <HeartHandshake size={20} />
                            </div>
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                    Foster Parent Application
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Apply to temporarily foster animals in your home
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleApplySubmit} className="mt-5 space-y-5">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                <MapPin size={14} className="text-paw-orange" /> Foster Home
                                Location / Address *
                            </label>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Barangay San Antonio, Pasig City / 123 Maple St."
                                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-semibold text-gray-900 focus:border-paw-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <p className="mt-1.5 text-[11px] text-gray-400">
                                Where the pet will reside during foster care. Helps the shelter team
                                coordinate transport & veterinary visits.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                                    Caretaker Capacity *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    required
                                    value={capacity}
                                    onChange={(e) =>
                                        setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-semibold text-gray-900 focus:border-paw-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                <p className="mt-1.5 text-[11px] text-gray-400">
                                    Maximum number of pets you can foster at once (1-10)
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                                    Pet Preference *
                                </label>
                                <ModernSelect
                                    size="sm"
                                    searchable={false}
                                    value={petPreference}
                                    onChange={(val) => setPetPreference(val)}
                                    options={[
                                        { value: 'both', label: 'Any / Both Dogs & Cats' },
                                        { value: 'dogs', label: 'Dogs Only' },
                                        { value: 'cats', label: 'Cats Only' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                <Home size={14} className="text-paw-orange" /> Housing Environment &
                                Setup *
                            </label>
                            <ModernSelect
                                size="sm"
                                searchable={false}
                                value={housingType}
                                onChange={(val) => setHousingType(val)}
                                options={[
                                    {
                                        value: 'Single Family Home with Yard',
                                        label: 'Single Family Home with Fenced Yard',
                                    },
                                    {
                                        value: 'Townhouse with Courtyard',
                                        label: 'Townhouse with Courtyard',
                                    },
                                    {
                                        value: 'Pet-Friendly Apartment / Condo',
                                        label: 'Pet-Friendly Apartment / Condo',
                                    },
                                    {
                                        value: 'Rural / Farm Setting',
                                        label: 'Rural / Farm Setting',
                                    },
                                    {
                                        value: 'Other Residential',
                                        label: 'Other Residential Setup',
                                    },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                                Experience, Other Pets & Daily Routine Notes
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tell us about previous pet experience, existing pets at home, daily schedule, or willingness to nurse sick/post-surgery rescues..."
                                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-medium text-gray-900 focus:border-paw-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                            <Link
                                href="/account/volunteer/status"
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-3 sm:px-4 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft size={14} className="shrink-0" />
                                <span className="sm:hidden">Back</span>
                                <span className="hidden sm:inline">Back to Volunteer Status</span>
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting || !location.trim()}
                                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-paw-orange px-3.5 sm:px-5 py-2.5 text-xs font-bold text-white whitespace-nowrap shadow-xs transition-colors hover:bg-paw-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCircle2 size={15} className="shrink-0" />
                                <span>
                                    {submitting
                                        ? 'Submitting...'
                                        : isPending
                                          ? 'Update Foster Application'
                                          : 'Submit Foster Application'}
                                </span>
                            </button>
                        </div>
                    </form>
                </DashboardCard>

                <div className="space-y-6">
                    <DashboardCard className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles size={16} className="text-paw-orange" />
                            <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                Foster Home Benefits
                            </h4>
                        </div>
                        <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Open your home to animals needing temporary shelter, healing, or
                            behavioral socialization before permanent adoption.
                        </p>
                        <ul className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={14}
                                    className="mt-0.5 shrink-0 text-green-600"
                                />
                                <span>All veterinary costs & food covered by the shelter</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={14}
                                    className="mt-0.5 shrink-0 text-green-600"
                                />
                                <span>Flexible placement durations (1-4 weeks)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={14}
                                    className="mt-0.5 shrink-0 text-green-600"
                                />
                                <span>Direct coordinator support & 24/7 hotline</span>
                            </li>
                        </ul>
                    </DashboardCard>

                    <DashboardCard className="p-6">
                        <h4 className="font-fredoka mb-2 text-lg font-bold text-[#0B2340] dark:text-white">
                            What Happens Next?
                        </h4>
                        <ol className="space-y-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <li>1. Submit your foster home address, capacity, and setup.</li>
                            <li>2. Shelter coordinators review your housing details.</li>
                            <li>
                                3. Once approved, your sidebar unlocks{' '}
                                <span className="font-bold text-[#0B2340] dark:text-white">
                                    My Foster Pets
                                </span>{' '}
                                to manage placements and care updates.
                            </li>
                        </ol>
                    </DashboardCard>
                </div>
            </div>
        </DashboardSectionPage>
    );
}
