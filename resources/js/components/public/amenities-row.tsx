import { motion, useReducedMotion } from 'framer-motion';
import {
    BadgeCheck,
    CalendarCheck2,
    Car,
    MonitorSpeaker,
    ShieldCheck,
    Wifi,
} from 'lucide-react';

const amenities = [
    {
        title: 'Official Booking Workflow',
        description: 'Structured request, review, and approval process.',
        icon: CalendarCheck2,
    },
    {
        title: 'Venue Support Areas',
        description: 'Lobby, foyer, lounge, board room, and auxiliary spaces.',
        icon: BadgeCheck,
    },
    {
        title: 'Parking and Access',
        description: 'Client guidance for guest arrival and access coordination.',
        icon: Car,
    },
    {
        title: 'Technical Readiness',
        description: 'LED wall, audio-visual, and setup requirements can be coordinated.',
        icon: MonitorSpeaker,
    },
    {
        title: 'Connectivity Assistance',
        description: 'Internet and operations support subject to event requirements.',
        icon: Wifi,
    },
    {
        title: 'Government-managed Portal',
        description: 'BCCC EASE centralizes public scheduling and booking records.',
        icon: ShieldCheck,
    },
];

export default function AmenitiesRow() {
    const reduceMotion = useReducedMotion();

    return (
        <section className="bg-[#f8f5ef] px-4 py-0 dark:bg-[#0d0f12] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1920px]">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    {amenities.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.article
                                key={item.title}
                                className="group min-h-[12rem] rounded-[1.45rem] border border-[#d9c7a6]/70 bg-white/78 p-4 shadow-[0_16px_45px_rgba(47,37,23,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#b08d48]/80 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/9"
                                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.42, delay: index * 0.035 }}
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] transition group-hover:bg-[#2f2517] group-hover:text-white dark:bg-white/10 dark:text-[#f1d89b] dark:group-hover:bg-white dark:group-hover:text-[#17120b]">
                                    <Icon className="h-5 w-5" />
                                </span>

                                <h3 className="mt-4 text-base font-semibold tracking-[-0.025em] text-[#21180d] dark:text-white">
                                    {item.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                                    {item.description}
                                </p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
