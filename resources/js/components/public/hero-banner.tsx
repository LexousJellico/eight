import SafeImage from '@/components/system/safe-image';
import { ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroBanner() {
    const reduceMotion = useReducedMotion();
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
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
