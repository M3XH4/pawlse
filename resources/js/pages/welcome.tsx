import { motion, useScroll, useSpring } from 'motion/react';
import React from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HorizontalAdoptionGallery } from '@/components/horizontal-adoption-gallery';
import { HorizontalPhotoStory } from '@/components/horizontal-photo-story';
import { MissingPets } from '@/components/missing-pets';
import { ScrollRevealWrapper } from '@/components/scroll-reveal-wrapper';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { AboutSections } from '@/components/sections/about-section';
import { AdoptionSection } from '@/components/sections/adoption-section';
import { CategoryStrip } from '@/components/sections/category-strip-section';
import { DonationDashboard } from '@/components/sections/donation-dashboard-section';
import { Events } from '@/components/sections/events-section';
import { FAQSection } from '@/components/sections/faq-section';
import { Hero } from '@/components/sections/hero-section';
import { ImpactStats } from '@/components/sections/impact-stats-section';   
import { KineticTextDivider } from '@/components/sections/kinetic-text-divider-section';
import { MissionQuote } from '@/components/sections/mission-quote-section';

interface WelcomeProps {
    pets?: any[];
    missingPets?: any[];
    events?: any[];
    donationStats?: any;
    impactStats?: any;
}

export default function Welcome({ pets = [], missingPets = [], events = [], donationStats, impactStats }: WelcomeProps) {
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

            <main className="relative z-0 overflow-y-hidden overflow-x-hidden">
                <Hero />    

                <ImpactStats stats={impactStats} />

                <KineticTextDivider />

                <ScrollRevealWrapper>
                    <CategoryStrip />
                </ScrollRevealWrapper>

                <HorizontalPhotoStory />

                <MissionQuote />
                
                <HorizontalAdoptionGallery pets={pets} />

                <div id="adoption">
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
                        <Events events={events} />
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
                    <FAQSection />
                </ScrollRevealWrapper>
            </main>

            <Footer />

            <ScrollToTopButton />
        </div>
    )
}