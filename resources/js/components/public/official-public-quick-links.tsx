import type { SiteSettings } from '@/layouts/public-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ExternalLink,
    FileText,
    Landmark,
    Map,
    Palette,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type PageProps = {
    siteSettings?: SiteSettings;
};

type QuickLink = {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
    external?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

function QuickLinkCard({ item, index }: { item: QuickLink; index: number }) {
    const reduceMotion = useReducedMotion();
    const Icon = item.icon;

    const className =
        'group relative min-h-[14rem] overflow-hidden rounded-[1.55rem] border border-[#d9c7a6]/70 bg-white/82 p-5 text-[#21180d] shadow-[0_20px_60px_rgba(47,37,23,0.09)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#b08d48]/80 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/9';

    const content = (
        <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,181,109,0.17),transparent_48%)] opacity-0 transition group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] transition group-hover:bg-[#2f2517] group-hover:text-white dark:bg-white/10 dark:text-[#f1d89b] dark:group-hover:bg-white dark:group-hover:text-[#17120b]">
                        <Icon className="h-5 w-5" />
                    </span>

                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em]">
                        {item.label}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                        {item.description}
                    </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                    Open
                    {item.external ? (
                        <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    ) : (
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    )}
                </span>
            </div>
        </>
    );

    return (
        <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.24 }}
            transition={{ duration: 0.45, delay: index * 0.045, ease }}
        >
            {item.external ? (
                <a href={item.href} target="_blank" rel="noreferrer" className={className}>
                    {content}
                </a>
            ) : (
                <Link href={item.href} className={className}>
                    {content}
                </Link>
            )}
        </motion.article>
    );
}

export default function OfficialPublicQuickLinks() {
    const reduceMotion = useReducedMotion();
    const page = usePage<PageProps>();
    const settings = page.props.siteSettings || {};

    const visitaUrl = settings.visitaUrl || settings.visita_url || 'https://visita.baguio.gov.ph/';
    const artsUrl =
        settings.creativeBaguioUrl ||
        settings.creative_baguio_url ||
        settings.arts_url ||
        'https://creativecity.baguio.gov.ph/';

    const links: QuickLink[] = [
        {
            label: 'Book Your Event',
            description: 'Start an event booking request through the public BCCC EASE workflow.',
            href: '/book',
            icon: CalendarDays,
        },
        {
            label: 'Public Calendar',
            description: 'Check public availability, public events, and AM/PM/EVE schedule blocks.',
            href: '/calendar',
            icon: Map,
        },
        {
            label: 'Guidelines',
            description: 'Review venue policies, booking reminders, and public client guidance.',
            href: '/guidelines',
            icon: FileText,
        },
        {
            label: 'Tourism Office',
            description: 'View related tourism office information and public service context.',
            href: '/tourism-office',
            icon: Landmark,
        },
        {
            label: 'VISITA Baguio',
            description: 'Open the official tourist assistance and visitor platform.',
            href: visitaUrl,
            icon: ShieldCheck,
            external: true,
        },
        {
            label: 'Creative Baguio',
            description: 'Open the official creative city and arts information platform.',
            href: artsUrl,
            icon: Palette,
            external: true,
        },
    ];

    return (
        <section className="relative overflow-hidden bg-[#f8f5ef] px-4 py-14 dark:bg-[#0d0f12] sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute bottom-[-14rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[#d8b56d]/12 blur-3xl dark:bg-white/5" />

            <div className="relative mx-auto max-w-[1920px]">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.5, ease }}
                    className="mb-7 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#fffaf0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] shadow-[0_12px_30px_rgba(47,37,23,0.06)] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                        <ShieldCheck className="h-4 w-4" />
                        Official Quick Links
                    </div>

                    <h2 className="mt-4 font-serif text-[clamp(2.4rem,4vw,5.5rem)] font-light leading-[0.94] tracking-[-0.055em] text-[#21180d] dark:text-white">
                        Access the most important public services quickly.
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6e604c] dark:text-white/58">
                        Use these links to move between booking, public availability, venue policy, tourism,
                        and official Baguio public service portals.
                    </p>
                </motion.div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    {links.map((item, index) => (
                        <QuickLinkCard key={item.label} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
