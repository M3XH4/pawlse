import { FileText, Shield, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type LegalTermsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: 'terms' | 'privacy';
    onAccept?: () => void;
};

export default function LegalTermsModal({
    open,
    onOpenChange,
    initialTab = 'terms',
    onAccept,
}: LegalTermsModalProps) {
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

    useEffect(() => {
        if (open) {
            setActiveTab(initialTab);
        }
    }, [open, initialTab]);

    const handleAccept = () => {
        if (onAccept) {
            onAccept();
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-2 border-paw-navy/10 rounded-2xl md:rounded-3xl shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-paw-orange/10 flex items-center justify-center text-paw-orange">
                            {activeTab === 'terms' ? <FileText size={18} /> : <Shield size={18} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-paw-orange">
                            Legal & Compliance
                        </span>
                    </div>

                    <DialogTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-paw-navy dark:text-white">
                        {activeTab === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 font-medium">
                        Last revised: October 2026 • PAWLSE Iligan Stray Feeders Community
                    </DialogDescription>

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-2 mt-4 bg-gray-200/60 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('terms')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'terms'
                                    ? 'bg-white dark:bg-gray-900 text-paw-navy dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <FileText size={14} />
                            Terms of Service
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('privacy')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'privacy'
                                    ? 'bg-white dark:bg-gray-900 text-paw-navy dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Shield size={14} />
                            Privacy Policy
                        </button>
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 dark:text-gray-300">
                    {activeTab === 'terms' ? (
                        <div className="space-y-5 leading-relaxed">
                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    1. Acceptance of Terms
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    By creating an account and registering on PAWLSE (Iligan Stray Feeders), you agree to abide by all platform rules, shelter guidelines, and community policies. If you do not agree to these terms, please do not proceed with registration.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    2. Account Responsibilities
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    You are responsible for maintaining the confidentiality of your account credentials, password, and contact details. You agree to provide accurate, up-to-date personal information (such as your legitimate first name, last name, and contact details).
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    3. Animal Welfare & Adoption Policy
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    All adoption, foster, and shelter visit requests submitted through the system are evaluated under Philippine animal welfare laws (Republic Act No. 8485 as amended by RA 10631). PAWLSE reserves the right to:
                                </p>
                                <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>Conduct background verifications and home visits prior to finalizing adoptions.</li>
                                    <li>Decline applications that do not meet safe living conditions for rescued animals.</li>
                                    <li>Reclaim animals if neglect, abuse, or violation of adoption agreements occurs.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    4. Volunteer & Rescue Safety
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Volunteers participating in field rescues, feeding drives, or shelter operations must comply with designated protective guidelines. While safety protocols are enforced, rescue missions involve handling stray or injured animals at the participant's discretion.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    5. Donations & Sponsorships
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Monetary and in-kind contributions made to PAWLSE directly fund animal nutrition, veterinary surgeries, shelter maintenance, and rescue logistics. All donations are non-refundable and documented transparently.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-orange"></span>
                                    6. Disclaimers and Limitations
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    PAWLSE strives to ensure all information regarding adoptable pets, medical history, and events is accurate, but provides services on an &quot;as is&quot; basis without warranties of any kind.
                                </p>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-5 leading-relaxed">
                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-blue"></span>
                                    1. Information We Collect
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    When you create an account or interact with PAWLSE, we collect:
                                </p>
                                <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>Full name (First Name, Middle Initial, Last Name) and email address.</li>
                                    <li>Contact numbers, barangay/city location, and emergency contacts when submitting rescue or adoption applications.</li>
                                    <li>Rescue reports, pet photos, and location coordinates submitted via SOS alerts.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-blue"></span>
                                    2. How We Use Your Data
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Your personal information is used exclusively to process your account access, coordinate animal adoptions, notify you of rescue progress, generate volunteer certificates, and issue official e-receipts for donations. We do not sell or monetize personal data to third parties.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-blue"></span>
                                    3. Data Protection & Security
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    We employ modern cryptographic hashing for passwords, encrypted session storage, rate limiting, and two-factor authentication safeguards to protect against unauthorized access.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-blue"></span>
                                    4. Your Rights
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Under data privacy principles, you have the right to:
                                </p>
                                <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>Access and review your registered profile information anytime.</li>
                                    <li>Update or correct inaccurate details in your account settings.</li>
                                    <li>Request deletion of your profile and data upon request.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-black text-paw-navy dark:text-white text-base uppercase mb-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-paw-blue"></span>
                                    5. Contact Our Privacy Team
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    For inquiries regarding your personal data or privacy concerns, contact us at <span className="font-bold text-paw-navy dark:text-white">privacy@pawlse.org</span> or visit our shelter at Zone 5, Barangay Tambo, Iligan City.
                                </p>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <DialogFooter className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between sm:justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-xs uppercase tracking-wider"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAccept}
                        className="rounded-xl bg-paw-navy text-white hover:bg-paw-orange font-black text-xs uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <CheckCircle2 size={16} />
                        I Understand & Agree
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
