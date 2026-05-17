import SiteVisitStat, { type SiteMetricPayload } from '@/components/public/site-visit-stat';
import SafeImage from '@/components/system/safe-image';
import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

type HeroBannerProps = {
    siteMetric?: SiteMetricPayload | null;
};

function FloatingBirds() {
    return (
        <div className="bccc-hero-birds" aria-hidden="true">
            {Array.from({ length: 11 }).map((_, index) => (
                <span key={index} className={`bccc-bird bccc-bird-${index + 1}`} />
            ))}
        </div>
    );
}

function SkyLayers() {
    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="bccc-sky-gradient absolute inset-0" />
            <div className="bccc-sky-sun absolute" />
            <div className="bccc-cloud bccc-cloud-1" />
            <div className="bccc-cloud bccc-cloud-2" />
            <div className="bccc-cloud bccc-cloud-3" />
            <div className="bccc-cloud bccc-cloud-4" />
            <div className="bccc-hero-fog bccc-hero-fog-1" />
            <div className="bccc-hero-fog bccc-hero-fog-2" />
            <FloatingBirds />
        </div>
    );
}

export default function HeroBanner({ siteMetric }: HeroBannerProps) {
    const reduceMotion = useReducedMotion();
    const sectionRef = useRef<HTMLElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    const buildingY = useTransform(scrollYProgress, [0, 1], ['-9%', '34%']);
    const buildingScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.16]);
    const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
    const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const skyScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.96, 0.72]);

    return (
        <section
            ref={sectionRef}
            className="bccc-cinematic-hero bccc-hero-final-stage relative isolate min-h-[126svh] overflow-hidden bg-[#dbeaf1] pt-0 text-[#1a160f] dark:bg-[#0c1118] dark:text-white"
        >
            <div className="bccc-hero-perspective-grid" aria-hidden="true" />
            <div className="bccc-hero-stage-rings" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>

            <motion.div style={reduceMotion ? undefined : { scale: skyScale }} className="absolute inset-0 z-0">
                <SkyLayers />
            </motion.div>

            <motion.div
                style={reduceMotion ? undefined : { y: titleY, opacity: heroOpacity }}
                className="bccc-hero-giant-word bccc-hero-title-behind"
                aria-hidden="true"
            >
                C O N E A S E
            </motion.div>

            <motion.div
                style={reduceMotion ? undefined : { y: buildingY, scale: buildingScale, opacity: heroOpacity }}
                initial={reduceMotion ? false : { opacity: 0, y: 56, scale: 0.97, filter: 'blur(14px)' }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.05, delay: 0.08, ease }}
                className="bccc-hero-building-stage pointer-events-none absolute inset-x-0 bottom-[8svh] z-30 mx-auto h-[102svh] w-full max-w-[1920px]"
            >
                <div className="absolute bottom-[3svh] left-1/2 h-[32svh] w-[94vw] -translate-x-1/2 rounded-[50%] bg-[#6f572b]/12 blur-3xl dark:bg-black/35" />
                <SafeImage
                    src="/marketing/images/hero/bccc-drone-transparent.png"
                    fallbackSrc="/marketing/images/hero/bccc.png"
                    alt="Baguio Convention and Cultural Center aerial view"
                    className="bccc-hero-building relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_48px_90px_rgba(61,47,25,0.32)]"
                    wrapperClassName="relative z-10 h-full w-full rounded-none border-0 bg-transparent"
                />
            </motion.div>

            <div className="absolute inset-x-0 bottom-0 z-[22] h-[42svh] bg-gradient-to-t from-[#f8f5ef] via-[#f8f5ef]/72 to-transparent dark:from-[#0d0f12] dark:via-[#0d0f12]/72" />

            <motion.div
                style={reduceMotion ? undefined : { opacity: heroOpacity }}
                className="relative z-24 mx-auto grid min-h-[126svh] w-full max-w-[1920px] items-start px-4 pb-[32svh] pt-[clamp(2rem,6svh,5rem)] sm:px-6 lg:px-8 xl:px-10"
            >
                <motion.div
                    style={reduceMotion ? undefined : { y: copyY }}
                    initial={reduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.78, ease }}
                    className="bccc-hero-copy-panel relative z-20 mt-[5svh] max-w-[70rem] lg:mt-[7svh]"
                >

                    <h1 className="bccc-hero-main-heading mt-1 max-w-8xl font-serif text-[clamp(4rem,8.3vw,10.6rem)] font-light leading-[0.82] tracking-[-0.078em] text-[#20170d] drop-shadow-[0_18px_55px_rgba(255,255,255,0.48)] dark:text-white dark:drop-shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                        B a g u i o C o n v
                    </h1>

                    <h1 className="bccc-hero-main-heading mt-6 max-w-6xl font-serif text-[clamp(3rem,7.3vw,9.6rem)] font-light leading-[0.82] tracking-[-0.078em] text-[#20170d] drop-shadow-[0_18px_55px_rgba(255,255,255,0.48)] dark:text-white dark:drop-shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                        C u l t u r a l C e n t e r
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d402d] dark:text-white/72 sm:text-lg">
                        Discover official venue spaces, check schedule visibility, and reserve event-ready packages through BCCC EASE.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 z-40 sm:flex-row sm:items-center">
                        <Link
                            href="/book"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-6 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(47,37,23,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                        >
                            Start Reservation
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            href="/calendar"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8b672d]/24 bg-white/58 px-6 text-sm font-semibold text-[#2f2517] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/14 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
                        >
                            <CalendarDays className="h-4 w-4" />
                            View Public Calendar
                        </Link>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <SiteVisitStat metric={siteMetric} compact />
                        {['Package-ready booking', 'MICE-aligned intake', 'Hourly public metrics'].map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-2 rounded-full border border-[#8b672d]/18 bg-white/50 px-3 py-2 text-[11px] font-semibold text-[#4e3c20] backdrop-blur-xl dark:border-white/12 dark:bg-white/7 dark:text-white/72"
                            >
                                <CheckCircle2 className="h-4 w-4 text-[#9d7b3d] dark:text-[#f4dfad]" />
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            <div className="bccc-hero-scroll-cue" aria-hidden="true">
                <span />
                <p>Scroll to explore</p>
            </div>
        </section>
    );
}
