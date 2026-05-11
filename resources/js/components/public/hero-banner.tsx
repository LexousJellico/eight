import SafeImage from '@/components/system/safe-image';
import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { FormEvent, useState } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroBanner() {
    const reduceMotion = useReducedMotion();
    const [query, setQuery] = useState('');

    const searchHref = query.trim()
        ? `/events?q=${encodeURIComponent(query.trim())}`
        : '/events';

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        window.location.href = searchHref;
    };

    return (
        <section className="relative min-h-[100svh] overflow-hidden bg-[#130f09] pt-[72px] text-white">
            <div className="absolute inset-0">
                <SafeImage
                    src="/marketing/images/facilities/darkvip.jpg"
                    fallbackSrc="/marketing/images/hero/noon2.jpg"
                    alt="Baguio Convention and Cultural Center"
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full w-full rounded-none border-0 bg-[#130f09]"
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,9,5,0.88)_0%,rgba(18,13,7,0.68)_38%,rgba(18,13,7,0.24)_70%,rgba(18,13,7,0.34)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#f8f5ef] via-[#f8f5ef]/74 to-transparent dark:from-[#0d0f12] dark:via-[#0d0f12]/72" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-[1920px] items-center px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
                <div className="grid w-full items-end gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(22rem,0.48fr)]">
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.65, ease }}
                        className="max-w-5xl"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f7dfaa] shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                            <ShieldCheck className="h-4 w-4" />
                            Official BCCC Booking Portal
                        </div>

                        <h1 className="mt-7 max-w-5xl font-serif text-[clamp(3rem,7vw,8rem)] font-light leading-[0.9] tracking-[-0.06em] text-white">
                            Baguio Convention and Cultural Center
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                            View official venue spaces, check public calendar schedules, and submit event booking
                            requests through BCCC EASE.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/book"
                                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-[#17120b] shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#f4dfad]"
                            >
                                <CalendarDays className="h-4 w-4" />
                                Book Your Event
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/calendar"
                                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/18"
                            >
                                View Calendar
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98, filter: 'blur(10px)' }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.72, delay: 0.08, ease }}
                        className="rounded-[2rem] border border-white/18 bg-white/12 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
                    >
                        <div className="rounded-[1.45rem] bg-[#fffaf0]/94 p-4 text-[#21180d] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] dark:bg-[#111418]/92 dark:text-white">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7739] dark:text-[#f0d69a]">
                                Quick Search
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                Find events, spaces, and calendar items.
                            </h2>

                            <form onSubmit={handleSearch} className="mt-5 flex min-h-13 items-center gap-2 rounded-full border border-black/10 bg-white px-2 pl-4 shadow-[0_16px_45px_rgba(42,30,13,0.08)] dark:border-white/10 dark:bg-white/8">
                                <Search className="h-4 w-4 shrink-0 text-[#9b7739]" />

                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search events, facilities..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#82735f] dark:text-white dark:placeholder:text-white/45"
                                />

                                <button
                                    type="submit"
                                    className="inline-flex h-10 items-center rounded-full bg-[#2f2517] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                                >
                                    Search
                                </button>
                            </form>

                            <div className="mt-5 grid gap-2 text-sm text-[#5f513f] dark:text-white/68">
                                {[
                                    'Official booking request workflow',
                                    'Public calendar and event visibility',
                                    'Facility information and venue guidance',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9b7739]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
