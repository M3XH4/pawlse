import { Head } from '@inertiajs/react';
import { AdminBarChart } from '@/components/admin/bar-chart';
import { AdminCard } from '@/components/admin/card';

const rescueHeights = [40, 55, 45, 70, 60, 85, 75];
const adoptionHeights = [35, 50, 42, 65, 58, 80, 72];

export default function ReportsAnalytics() {
    return (
        <>
            <Head title="Reports & Analytics" />
            <h2 className="mb-6 font-fredoka text-2xl font-bold uppercase tracking-wide text-[#0B2340] dark:text-[#F8FAFC]">
                Reports &amp; Analytics
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
                <AdminCard>
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-[#94A3B8]">
                        Monthly Rescues
                    </h3>
                    <AdminBarChart
                        values={rescueHeights}
                        colorClassName="bg-gradient-to-t from-[#38BDF8] to-[#7DD3FC]"
                    />
                </AdminCard>

                <AdminCard>
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-[#94A3B8]">
                        Monthly Adoptions
                    </h3>
                    <AdminBarChart
                        values={adoptionHeights}
                        colorClassName="bg-gradient-to-t from-[#FB7185] to-[#FDA4AF]"
                    />
                </AdminCard>
            </div>
        </>
    );
}
