import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    CalendarDays,
    Eye,
    Globe2,
    LayoutPanelTop,
    Mail,
    Plus,
    Settings2,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PublicEventItem = {
    id?: number | string;
    title?: string | null;
    category?: string | null;
    homepage_visible?: boolean | number | string | null;
    homepageVisible?: boolean;
    starts_at?: string | null;
    startsAt?: string | null;
};

type PublicSpaceItem = {
    id?: number | string;
    title?: string | null;
    name?: string | null;
    homepage_visible?: boolean | number | string | null;
    homepageVisible?: boolean;
    capacity?: string | number | null;
};

type OfferItem = {
    id?: number | string;
    title?: string | null;
    homepage_visible?: boolean | number | string | null;
    homepageVisible?: boolean;
};

type StatItem = {
    id?: number | string;
    label?: string | null;
    value?: string | number | null;
};

type TourismMemberItem = {
    id?: number | string;
    name?: string | null;
    position?: string | null;
};

type SiteSettings = {
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    visita_url?: string | null;
    arts_url?: string | null;
    creative_baguio_url?: string | null;
};

type PageProps = {
    events?: PublicEventItem[];
    bcccEvents?: PublicEventItem[];
    cityEvents?: PublicEventItem[];
    spaces?: PublicSpaceItem[];
    offers?: OfferItem[];
    packages?: OfferItem[];
    stats?: StatItem[];
    members?: TourismMemberItem[];
    tourismMembers?: TourismMemberItem[];
    siteSettings?: SiteSettings;
};

type ContentTabKey =
    | 'overview'
    | 'events'
    | 'facilities'
    | 'offers'
    | 'stats'
    | 'tourism'
    | 'settings';

type ContentTab = {
    key: ContentTabKey;
    title: string;
    subtitle: string;
    icon: typeof LayoutPanelTop;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Public Content',
        href: '/admin/content',
    },
];

const tabs: ContentTab[] = [
    {
        key: 'overview',
        title: 'Overview',
        subtitle: 'Workspace guide',
        icon: LayoutPanelTop,
    },
    {
        key: 'events',
        title: 'Events',
        subtitle: 'BCCC and City highlights',
        icon: CalendarDays,
    },
    {
        key: 'facilities',
        title: 'Facilities',
        subtitle: 'Public venue spaces',
        icon: Building2,
    },
    {
        key: 'offers',
        title: 'Offers',
        subtitle: 'Promos and packages',
        icon: Sparkles,
    },
    {
        key: 'stats',
        title: 'Stats',
        subtitle: 'Homepage counters',
        icon: BarChart3,
    },
    {
        key: 'tourism',
        title: 'Tourism Office',
        subtitle: 'Profiles and hierarchy',
        icon: UsersRound,
    },
    {
        key: 'settings',
        title: 'Site Settings',
        subtitle: 'Footer, contact, links',
        icon: Settings2,
    },
];

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function visibleFlag(item: { homepage_visible?: boolean | number | string | null; homepageVisible?: boolean }) {
    return item.homepageVisible === true || item.homepage_visible === true || item.homepage_visible === 1 || item.homepage_visible === '1';
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    description: string;
    icon: typeof CalendarDays;
}) {
    return (
        <article className="rounded-[1.25rem] border border-[#d9c7a6]/70 bg-white/78 p-4 shadow-[0_14px_40px_rgba(47,37,23,0.07)] dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#21180d] dark:text-white">
                        {value}
                    </p>
                </div>

                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                    <Icon className="h-5 w-5" />
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                {description}
            </p>
        </article>
    );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[1.35rem] border border-dashed border-[#d9c7a6]/80 bg-[#fffaf0]/58 p-6 text-center dark:border-white/10 dark:bg-white/[0.035]">
            <p className="text-sm font-semibold text-[#21180d] dark:text-white">{title}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#6e604c] dark:text-white/56">
                {description}
            </p>
        </div>
    );
}

function RecordList({
    title,
    records,
    getTitle,
    getMeta,
}: {
    title: string;
    records: Array<Record<string, unknown>>;
    getTitle: (record: Record<string, unknown>) => string;
    getMeta: (record: Record<string, unknown>) => string;
}) {
    return (
        <section className="rounded-[1.35rem] border border-[#d9c7a6]/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.045]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        {title}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#21180d] dark:text-white">
                        Recent records
                    </h3>
                </div>

                <span className="rounded-full border border-[#d9c7a6]/70 bg-[#f7f0e3] px-3 py-1.5 text-xs font-bold text-[#7a5a24] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                    {records.length}
                </span>
            </div>

            {records.length === 0 ? (
                <EmptyPanel
                    title={`No ${title.toLowerCase()} yet`}
                    description="Once records are created and marked for public display, they will appear here."
                />
            ) : (
                <div className="grid gap-2">
                    {records.slice(0, 8).map((record, index) => (
                        <article
                            key={`${title}-${record.id ?? index}`}
                            className="flex items-center justify-between gap-3 rounded-[1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/74 px-3 py-3 dark:border-white/10 dark:bg-white/[0.035]"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#21180d] dark:text-white">
                                    {getTitle(record)}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-[#6e604c] dark:text-white/48">
                                    {getMeta(record)}
                                </p>
                            </div>

                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#b08d48] dark:bg-[#f1d89b]" />
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function OverviewPanel({
    eventCount,
    facilityCount,
    offerCount,
    statsCount,
    tourismCount,
}: {
    eventCount: number;
    facilityCount: number;
    offerCount: number;
    statsCount: number;
    tourismCount: number;
}) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    label="Public Events"
                    value={eventCount}
                    description="Highlighted BCCC and Baguio City event records."
                    icon={CalendarDays}
                />
                <StatCard
                    label="Facilities"
                    value={facilityCount}
                    description="Venue spaces visible on the public website."
                    icon={Building2}
                />
                <StatCard
                    label="Offers"
                    value={offerCount}
                    description="Packages and public announcement cards."
                    icon={Sparkles}
                />
                <StatCard
                    label="Tourism Profiles"
                    value={tourismCount}
                    description="Public office members and hierarchy entries."
                    icon={UsersRound}
                />
                <StatCard
                    label="Stats"
                    value={statsCount}
                    description="Homepage metric counters and quick facts."
                    icon={BarChart3}
                />
            </div>

            <section className="rounded-[1.45rem] border border-[#d9c7a6]/70 bg-white/78 p-5 shadow-[0_18px_58px_rgba(47,37,23,0.08)] dark:border-white/10 dark:bg-white/[0.055]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                    Publishing Flow
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                    Edit by section, not all at once.
                </h3>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-[#6e604c] dark:text-white/58">
                    Use the section tabs above to edit only the information needed for each public page area.
                    This keeps public content cleaner and avoids overwhelming the homepage with too many cards.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                        {
                            title: '1. Prepare',
                            description: 'Add short titles, clean summaries, and official image paths.',
                        },
                        {
                            title: '2. Review',
                            description: 'Check visibility flags, dates, contact details, and public wording.',
                        },
                        {
                            title: '3. Publish',
                            description: 'Open the public site and verify the section on desktop and mobile.',
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-[1.25rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                        >
                            <h4 className="text-sm font-semibold text-[#21180d] dark:text-white">
                                {item.title}
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/52">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function AdminContentIndex() {
    const page = usePage<PageProps>();
    const props = page.props;

    const [activeTab, setActiveTab] = useState<ContentTabKey>('overview');

    const events = useMemo(
        () => [...(props.events ?? []), ...(props.bcccEvents ?? []), ...(props.cityEvents ?? [])],
        [props.events, props.bcccEvents, props.cityEvents],
    );

    const spaces = props.spaces ?? [];
    const offers = props.offers?.length ? props.offers : props.packages ?? [];
    const stats = props.stats ?? [];
    const members = props.members?.length ? props.members : props.tourismMembers ?? [];
    const settings = props.siteSettings ?? {};

    const eventCount = events.length;
    const facilityCount = spaces.filter(visibleFlag).length || spaces.length;
    const offerCount = offers.filter(visibleFlag).length || offers.length;
    const statsCount = stats.length;
    const tourismCount = members.length;

    const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
    const ActiveIcon = active.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Content Manager" />

            <div className="space-y-5">
                <section className="relative overflow-hidden rounded-[1.65rem] border border-[#d9c7a6]/70 bg-white/86 p-5 shadow-[0_22px_70px_rgba(47,37,23,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,181,109,0.18),transparent_46%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_46%)]" />

                    <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#f7f0e3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                                    <Globe2 className="h-3.5 w-3.5" />
                                    Frontend Configuration
                                </span>

                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a3b27] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                >
                                    Public Site
                                    <Eye className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.065em] text-[#21180d] dark:text-white lg:text-5xl">
                                Public Content Manager
                            </h1>

                            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                Manage homepage sections, public events, venue spaces, offers, tourism office profiles,
                                statistics, contact details, and official external links from one organized workspace.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Link
                                href="/"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                            >
                                <Eye className="h-4 w-4" />
                                Open Public Site
                            </Link>

                            <Link
                                href="/admin/calendar"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-4 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                            >
                                <CalendarDays className="h-4 w-4" />
                                Manage Calendar
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="rounded-[1.65rem] border border-[#d9c7a6]/70 bg-white/82 p-3 shadow-[0_18px_58px_rgba(47,37,23,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const selected = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cx(
                                        'group flex min-h-[5.2rem] items-center gap-3 rounded-[1.15rem] border px-3 py-3 text-left transition duration-200',
                                        selected
                                            ? 'border-[#b08d48]/80 bg-[#2f2517] text-white shadow-[0_18px_44px_rgba(47,37,23,0.20)] dark:border-white/20 dark:bg-white dark:text-[#17120b]'
                                            : 'border-[#eadcc2]/80 bg-[#fffaf0]/70 text-[#4a3b27] hover:border-[#b08d48]/70 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:text-white/68 dark:hover:bg-white/9',
                                    )}
                                >
                                    <span
                                        className={cx(
                                            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                                            selected
                                                ? 'bg-white/14 text-white dark:bg-[#17120b]/8 dark:text-[#17120b]'
                                                : 'bg-[#efe3cd] text-[#8b672d] group-hover:bg-[#f7ecd8] dark:bg-white/8 dark:text-[#f1d89b]',
                                        )}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-bold">
                                            {tab.title}
                                        </span>
                                        <span
                                            className={cx(
                                                'mt-0.5 block truncate text-[11px] font-medium',
                                                selected ? 'text-white/62 dark:text-[#17120b]/58' : 'opacity-62',
                                            )}
                                        >
                                            {tab.subtitle}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-[1.65rem] border border-[#d9c7a6]/70 bg-white/84 p-5 shadow-[0_22px_70px_rgba(47,37,23,0.09)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
                    <div className="mb-5 flex flex-col gap-4 border-b border-[#d9c7a6]/60 pb-4 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                <ActiveIcon className="h-3.5 w-3.5" />
                                {active.subtitle}
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-[#21180d] dark:text-white">
                                {active.title}
                            </h2>
                        </div>

                        {activeTab !== 'overview' ? (
                            <Link
                                href="/admin/content"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                            >
                                <Plus className="h-4 w-4" />
                                Add / Edit in Content Forms
                            </Link>
                        ) : null}
                    </div>

                    {activeTab === 'overview' ? (
                        <OverviewPanel
                            eventCount={eventCount}
                            facilityCount={facilityCount}
                            offerCount={offerCount}
                            statsCount={statsCount}
                            tourismCount={tourismCount}
                        />
                    ) : null}

                    {activeTab === 'events' ? (
                        <RecordList
                            title="Events"
                            records={events as Array<Record<string, unknown>>}
                            getTitle={(record) => String(record.title || 'Untitled event')}
                            getMeta={(record) => String(record.category || record.starts_at || record.startsAt || 'Public event highlight')}
                        />
                    ) : null}

                    {activeTab === 'facilities' ? (
                        <RecordList
                            title="Facilities"
                            records={spaces as Array<Record<string, unknown>>}
                            getTitle={(record) => String(record.title || record.name || 'Untitled venue space')}
                            getMeta={(record) => String(record.capacity || 'Venue space shown on the public website')}
                        />
                    ) : null}

                    {activeTab === 'offers' ? (
                        <RecordList
                            title="Offers"
                            records={offers as Array<Record<string, unknown>>}
                            getTitle={(record) => String(record.title || 'Untitled offer')}
                            getMeta={() => 'Special offer, homepage promotion, or package card'}
                        />
                    ) : null}

                    {activeTab === 'stats' ? (
                        <RecordList
                            title="Stats"
                            records={stats as Array<Record<string, unknown>>}
                            getTitle={(record) => String(record.label || 'Untitled statistic')}
                            getMeta={(record) => `Value: ${String(record.value ?? '—')}`}
                        />
                    ) : null}

                    {activeTab === 'tourism' ? (
                        <RecordList
                            title="Tourism Office"
                            records={members as Array<Record<string, unknown>>}
                            getTitle={(record) => String(record.name || 'Unnamed member')}
                            getMeta={(record) => String(record.position || 'Tourism office profile')}
                        />
                    ) : null}

                    {activeTab === 'settings' ? (
                        <section className="grid gap-3 lg:grid-cols-3">
                            <article className="rounded-[1.25rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                <Mail className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                <h3 className="mt-3 text-sm font-semibold text-[#21180d] dark:text-white">
                                    Contact Details
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                                    Email: {settings.email || 'Not configured'}
                                    <br />
                                    Phone: {settings.phone || 'Not configured'}
                                    <br />
                                    Address: {settings.address || 'Not configured'}
                                </p>
                            </article>

                            <article className="rounded-[1.25rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                <Globe2 className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                <h3 className="mt-3 text-sm font-semibold text-[#21180d] dark:text-white">
                                    External Links
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                                    VISITA: {settings.visita_url || 'Not configured'}
                                    <br />
                                    Arts: {settings.arts_url || settings.creative_baguio_url || 'Not configured'}
                                </p>
                            </article>

                            <article className="rounded-[1.25rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                <Settings2 className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                <h3 className="mt-3 text-sm font-semibold text-[#21180d] dark:text-white">
                                    Footer and Public Settings
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                                    Use the site settings form to update footer text, map embed, logos, and public contact links.
                                </p>
                            </article>
                        </section>
                    ) : null}
                </section>
            </div>
        </AppLayout>
    );
}
