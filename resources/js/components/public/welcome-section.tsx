import SafeImage from '@/components/system/safe-image';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Landmark, MapPinned, Sparkles } from 'lucide-react';
import type { SiteSettings } from '@/layouts/public-layout';

export default function WelcomeSection() {
    const page = usePage<{ siteSettings?: SiteSettings }>();
    const siteSettings = page.props.siteSettings;

    const visitaUrl = siteSettings?.visitaUrl || siteSettings?.visita_url || 'https://visita.baguio.gov.ph';
    const artsUrl = siteSettings?.creativeBaguioUrl || siteSettings?.creative_baguio_url || siteSettings?.arts_url || 'https://creativecity.baguio.gov.ph';

    return (
        <section className="relative z-20 w-full bg-[#edf2f1] px-4 pt-10 text-[#163f37] dark:bg-[#081311] dark:text-white sm:px-6 lg:px-8 lg:pt-12">
            <div className="mx-auto grid w-full max-w-[1680px] gap-7 border-y border-[#176456]/14 bg-white/54 px-4 py-7 shadow-[0_18px_60px_rgba(14,60,52,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/[0.035] sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-9">
                <div className="flex flex-col justify-center">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#176456]/18 bg-[#176456]/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#176456] dark:border-[#9fe8dc]/20 dark:bg-[#9fe8dc]/8 dark:text-[#9fe8dc]">
                        <Sparkles className="h-4 w-4" />
                        Welcome to BCCC
                    </div>

                    <h2 className="mt-5 max-w-3xl text-[clamp(2.2rem,5vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.075em] text-[#143f38] dark:text-white">
                        A city venue shaped by conventions, culture, and public life in Baguio.
                    </h2>

                    <div className="mt-6 max-w-3xl space-y-3 text-sm leading-8 text-[#53645f] dark:text-white/64 sm:text-[15px]">
                        <p>
                            The Baguio Convention and Cultural Center serves as a recognizable setting for government assemblies, cultural programs, exhibitions,
                            conferences, and large public gatherings.
                        </p>
                        <p>
                            This public site presents venue discovery, event visibility, and booking guidance in a calmer, more visual, and more direct experience.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 rounded-full border border-[#176456]/18 bg-white/70 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#176456] transition hover:bg-[#176456] hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-[#9fe8dc] dark:hover:bg-white/14"
                        >
                            Explore Events
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <a
                            href={visitaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-[#176456]/18 bg-white/70 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#176456] transition hover:bg-[#176456] hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-[#9fe8dc] dark:hover:bg-white/14"
                        >
                            VISITA Baguio
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <div className="relative min-h-[24rem] overflow-hidden bg-[#d8e2df] shadow-[0_24px_70px_rgba(23,100,86,0.12)] dark:bg-white/5">
                    <SafeImage
                        src="/marketing/images/facilities/darkvip.JPG"
                        fallbackSrc="/marketing/images/hero/noon2.jpg"
                        alt="Baguio Convention and Cultural Center interior"
                        className="h-full min-h-[24rem] w-full object-cover"
                        wrapperClassName="h-full w-full"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.48))]" />

                    <div className="absolute bottom-0 left-0 right-0 grid gap-3 p-5 text-white sm:grid-cols-2 sm:p-6">
                        <a
                            href={artsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-start gap-3 border-t border-white/22 pt-4 transition hover:border-[#f4dfad]"
                        >
                            <Landmark className="mt-1 h-5 w-5 shrink-0 text-[#f4dfad]" />
                            <span>
                                <span className="block text-sm font-bold">Arts and Culture</span>
                                <span className="mt-1 block text-xs leading-5 text-white/72">Creative-city and cultural resources.</span>
                            </span>
                        </a>

                        <Link href="/tourism-office" className="group flex items-start gap-3 border-t border-white/22 pt-4 transition hover:border-[#f4dfad]">
                            <MapPinned className="mt-1 h-5 w-5 shrink-0 text-[#f4dfad]" />
                            <span>
                                <span className="block text-sm font-bold">Tourism Office</span>
                                <span className="mt-1 block text-xs leading-5 text-white/72">Visitor and public assistance channels.</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}