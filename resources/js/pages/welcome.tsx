import { motion, useScroll, useSpring } from 'motion/react';
import React, { lazy, Suspense } from 'react';
import { Header } from '@/components/header';
import { ScrollRevealWrapper } from '@/components/scroll-reveal-wrapper';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { CategoryStrip } from '@/components/sections/category-strip-section';
import { Hero } from '@/components/sections/hero-section';
import { ImpactStats } from '@/components/sections/impact-stats-section';
import { KineticTextDivider } from '@/components/sections/kinetic-text-divider-section';
import { MissionQuote } from '@/components/sections/mission-quote-section';
import type { CareSustainabilityData } from '@/types/care-sustainability';

const HorizontalPhotoStory = lazy(() =>
    import('@/components/sections/horizontal-photo-story').then((m) => ({ default: m.HorizontalPhotoStory })),
);
const HorizontalAdoptionGallery = lazy(() =>
    import('@/components/adoption/horizontal-adoption-gallery').then((m) => ({ default: m.HorizontalAdoptionGallery })),
);
const AdoptionSection = lazy(() =>
    import('@/components/sections/adoption-section').then((m) => ({ default: m.AdoptionSection })),
);
const DonationDashboard = lazy(() =>
    import('@/components/sections/donation-dashboard-section').then((m) => ({ default: m.DonationDashboard })),
);
const Events = lazy(() =>
    import('@/components/sections/events-section').then((m) => ({ default: m.Events })),
);
const MissingPets = lazy(() =>
    import('@/components/sections/missing-pets').then((m) => ({ default: m.MissingPets })),
);
const AboutSections = lazy(() =>
    import('@/components/sections/about-section').then((m) => ({ default: m.AboutSections })),
);
const ContactSection = lazy(() =>
    import('@/components/contact/contact-section').then((m) => ({ default: m.ContactSection })),
);
const FAQSection = lazy(() =>
    import('@/components/sections/faq-section').then((m) => ({ default: m.FAQSection })),
);
const Footer = lazy(() =>
    import('@/components/footer').then((m) => ({ default: m.Footer })),
);

interface WelcomeProps {
    pets?: any[];
    stories?: any[];
    missingPets?: any[];
    events?: any[];
    joinedEventIds?: number[];
    joinedEventRoles?: Record<number, string>;
    donationStats?: any;
    impactStats?: any;
    careSustainability?: CareSustainabilityData;
}

export default function Welcome({ pets = [], stories = [], missingPets = [], events = [], joinedEventIds = [], joinedEventRoles = {}, donationStats, impactStats, careSustainability }: WelcomeProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="relative font-quicksand min-h-screen overflow-x-hidden">
            {/* Progress Bar */}
            <motion.div
            className="fixed top-0 left-0 right-0 h-1.5 bg-paw-orange z-[100] origin-left"
            style={{ scaleX }}
            />

            <Header />

            <main className="relative overflow-y-hidden overflow-x-hidden">
                <Hero stats={impactStats} />    

                <ImpactStats stats={impactStats} />

                <KineticTextDivider />

                <ScrollRevealWrapper>
                    <CategoryStrip />
                </ScrollRevealWrapper>

                <Suspense fallback={<div className="min-h-[24rem]" />}>
                    <HorizontalPhotoStory stories={stories} />

                    <MissionQuote />

                    <div id="adoption">
                        <HorizontalAdoptionGallery pets={pets} />

                        <ScrollRevealWrapper delay={0.2}>
                            <AdoptionSection pets={pets} />
                        </ScrollRevealWrapper>
                    </div>

                    <div id="donate">
                        <ScrollRevealWrapper>
                            <DonationDashboard stats={donationStats} />
                        </ScrollRevealWrapper>
                    </div>

                    <div id="events">
                        <ScrollRevealWrapper>
                            <Events events={events} joinedEventIds={joinedEventIds} joinedEventRoles={joinedEventRoles} />
                        </ScrollRevealWrapper>
                    </div>
                    <div id="missing">
                        <ScrollRevealWrapper>
                            <MissingPets pets={missingPets} />
                        </ScrollRevealWrapper>
                    </div>
                    <ScrollRevealWrapper>
                        <AboutSections />
                    </ScrollRevealWrapper>
                    <ScrollRevealWrapper delay={0.1}>
                        <ContactSection />
                    </ScrollRevealWrapper>
                    <ScrollRevealWrapper delay={0.1}>
                        <FAQSection />
                    </ScrollRevealWrapper>
                </Suspense>
            </main>

            <Suspense fallback={null}>
                <Footer />
            </Suspense>

            <ScrollToTopButton />
        </div>
    )
}