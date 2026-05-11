import SafeImage from '@/components/system/safe-image';
import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, CalendarDays, Landmark, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const facts = [
    {
        title: 'Civic Landmark',
        description: 'A recognizable event venue connected to Baguio City’s civic, cultural, and public gatherings.',
        icon: Landmark,
    },
    {
        title: 'Flexible Spaces',
        description: 'Designed for conventions, conferences, exhibits, government programs, and formal celebrations.',
        icon: Building2,
    },
    {
        title: 'Structured Booking',
        description: 'BCCC EASE supports schedule checking, booking submission, proof review, and calendar visibility.',
        icon: CalendarDays,
    },
];

export default function WelcomeSection() {
    const reduceMotion = useReducedMotion();

    return (
        <section className="relative overflow-hidden bg-[#f8f5ef] px-4 py-14 dark:bg-[#0d0f12] sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute left-[-12rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-[#d8b56d]/18 blur-3xl dark:bg-[#d8b56d]/8" />
            <div className="pointer-events-none absolute bottom-[-14rem] right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#7a5a24]/10 blur-3xl dark:bg-white/5" />

            <div className="relative mx-auto grid max-w-[1920px] gap-8 lg:grid-cols-[0.92fr_1fr] lg:items-center">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, x: -18, filter: 'blur(8px)' }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease }}
                    className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-[#d9c7a6]/70 bg-white shadow-[0_28px_80px_rgba(47,37,23,0.12)] dark:border-white/10 dark:bg-white/[0.055]"
                >
                    <SafeImage
                        src="/marketing/images/facilities/darkvip.jpg"
                        fallbackSrc="/marketing/images/hero/noon2.jpg"
                        alt="Baguio Convention and Cultural Center interior"
                        className="h-full min-h-[34rem] w-full object-cover"
                        wrapperClassName="h-full min-h-[34rem] w-full rounded-none border-0"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#100b05]/82 via-[#100b05]/20 to-transparent" />
                </motion.div>

                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, delay: 0.08, ease }}
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#fffaf0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] shadow-[0_12px_30px_rgba(47,37,23,0.06)] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                        <Sparkles className="h-4 w-4" />
                        Welcome to BCCC
                    </div>

                    <h2 className="mt-5 font-serif text-[clamp(2rem,2.1vw,6rem)] font-light leading-[0.92] tracking-[-0.06em] text-[#21180d] dark:text-white">
                        A central venue for Baguio’s public life, culture, and events.
                    </h2>

                    <p className="mt-5 max-w-3xl text-base leading-8 text-[#6e604c] dark:text-white/58">
                        The Baguio Convention and Cultural Center serves as a major venue for conventions,
                        government activities, cultural programs, conferences, exhibits, and community gatherings.
                        Through BCCC EASE, clients can view venue information, check schedules, submit booking
                        requests, and coordinate with the office through a clearer digital process.
                    </p>

                    <div className="mt-7 grid gap-3 md:grid-cols-3">
                        {facts.map((fact) => {
                            const Icon = fact.icon;

                            return (
                                <article
                                    key={fact.title}
                                    className="rounded-[1.35rem] border border-[#d9c7a6]/70 bg-white/78 p-4 shadow-[0_16px_45px_rgba(47,37,23,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]"
                                >
                                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                                        <Icon className="h-5 w-5" />
                                    </span>

                                    <h3 className="mt-4 text-base font-semibold tracking-[-0.025em] text-[#21180d] dark:text-white">
                                        {fact.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                                        {fact.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
