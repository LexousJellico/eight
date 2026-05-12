import FacilitiesLayeredShowcase from '@/components/public/facilities-layered-showcase';
import {
    EmptyPublicPanel,
    titleOf,
    visibleRecords,
    type PublicImageRecord,
} from '@/components/public/public-display-system';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock,
    MapPin,
    MonitorSpeaker,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

type FacilitiesPageProps = {
    spaces?: PublicImageRecord[];
    venueSpaces?: PublicImageRecord[];
    facilities?: PublicImageRecord[];
};

function titleKey(item: PublicImageRecord, index: number) {
    return String(item.id ?? item.slug ?? item.title ?? item.name ?? `facility-${index}`);
}

function uniqueSpaces(items: PublicImageRecord[]) {
    const seen = new Set<string>();

    return items.filter((item, index) => {
        const key = titleKey(item, index);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function getFacilityNames(items: PublicImageRecord[]) {
    return items
        .map((item) => titleOf(item, 'Facility'))
        .filter(Boolean)
        .slice(0, 10);
}

export default function FacilitiesPage() {
    const { props } = usePage<FacilitiesPageProps>();

    const spaces = useMemo(
        () =>
            uniqueSpaces(
                visibleRecords([
                    ...(props.spaces ?? []),
                    ...(props.venueSpaces ?? []),
                    ...(props.facilities ?? []),
                ]),
            ),
        [props.spaces, props.venueSpaces, props.facilities],
    );

    const facilityNames = getFacilityNames(spaces);

    return (
        <PublicLayout>
            <Head title="Facilities" />

            <main className="min-h-screen bg-[#f8f5ef] text-[#201a12] dark:bg-[#0d0f12] dark:text-white">
                {spaces.length > 0 ? (
                    <FacilitiesLayeredShowcase items={spaces} />
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <EmptyPublicPanel
                            icon={Building2}
                            title="No facilities configured"
                            description="Facilities created in the Content Manager will appear on this page."
                        />
                    </section>
                )}

                <section className="facility-info-section border-y border-[#e7dbc5]/80 bg-[#fffaf0]/82 px-4 py-16 dark:border-white/10 dark:bg-white/[0.035] sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.45fr)] lg:items-start">
                        <div className="facility-readable">
                            <p className="facility-kicker">Facility Information</p>

                            <h2 className="facility-heading mt-4">
                                Choosing the right BCCC space for your event
                            </h2>

                            <div className="mt-6 space-y-5 text-left text-[16px] leading-[1.6] text-[#6e604c] dark:text-white/62 md:text-[18px]">
                                <p>
                                    The Baguio Convention and Cultural Center offers spaces that can support civic programs,
                                    conventions, cultural events, seminars, meetings, exhibits, and public activities. Each area
                                    should be selected based on guest count, event format, required time block, technical setup,
                                    and expected movement of participants.
                                </p>

                                <p>
                                    Before submitting a reservation, review the facility capacity, preferred date, event type,
                                    setup requirements, ingress and egress needs, and whether the activity requires additional
                                    support such as audio, visual equipment, registration areas, holding rooms, or parking access.
                                </p>
                            </div>

                            {facilityNames.length > 0 ? (
                                <div className="mt-8">
                                    <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                        Available spaces
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {facilityNames.map((name) => (
                                            <span
                                                key={name}
                                                className="rounded-full border border-[#d9c7a6]/70 bg-white/76 px-4 py-2 text-[14px] font-semibold text-[#3f3526] shadow-sm dark:border-white/10 dark:bg-white/7 dark:text-white/72"
                                            >
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link
                                    href="/calendar"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/80 bg-white px-6 text-[15px] font-bold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                >
                                    View Calendar
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href="/bookings/create"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-6 text-[15px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-[#f1d89b] dark:text-[#17120b] dark:hover:bg-white"
                                >
                                    Check Availability
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <aside className="rounded-[1.5rem] border border-[#d9c7a6]/70 bg-white/76 p-6 shadow-[0_22px_70px_rgba(47,37,23,0.08)] dark:border-white/10 dark:bg-white/[0.055]">
                            <p className="facility-kicker">Quick Planning Notes</p>

                            <div className="mt-5 grid gap-4">
                                <InfoLine
                                    icon={CalendarDays}
                                    title="Date and time block"
                                    description="Confirm the preferred date, range, and whether the event needs AM, PM, evening, half-day, whole-day, or additional hours."
                                />

                                <InfoLine
                                    icon={UsersRound}
                                    title="Expected attendance"
                                    description="Match the space with the estimated number of guests, staff, organizers, exhibitors, and visitors."
                                />

                                <InfoLine
                                    icon={MonitorSpeaker}
                                    title="Technical support"
                                    description="Identify audio, visual, LED wall, staging, lighting, internet, and presentation needs before final review."
                                />

                                <InfoLine
                                    icon={ShieldCheck}
                                    title="Policy readiness"
                                    description="Prepare required letters, supporting documents, payment requirements, and compliance details when applicable."
                                />
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="facility-info-section px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1600px]">
                        <div className="facility-readable">
                            <p className="facility-kicker">Before You Book</p>

                            <h2 className="facility-subheading mt-4">
                                Facility use depends on availability, event requirements, and administrative review.
                            </h2>

                            <p className="mt-5 text-left text-[16px] leading-[1.6] text-[#6e604c] dark:text-white/62 md:text-[18px]">
                                The public availability display is intended to help clients plan earlier, but final booking
                                confirmation still depends on schedule validation, venue fit, required documents, payment status,
                                and approval by the authorized BCCC personnel.
                            </p>
                        </div>

                        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <FacilityGuideCard
                                icon={ClipboardList}
                                title="Prepare event details"
                                description="Prepare the event title, purpose, organization name, guest count, target date, and preferred time block."
                            />

                            <FacilityGuideCard
                                icon={MapPin}
                                title="Select the correct area"
                                description="Choose the facility that best matches your program flow, setup scale, access needs, and participant movement."
                            />

                            <FacilityGuideCard
                                icon={Clock}
                                title="Review booking timing"
                                description="Some bookings may require lead time for setup, technical coordination, payment processing, and document review."
                            />

                            <FacilityGuideCard
                                icon={CheckCircle2}
                                title="Wait for validation"
                                description="Submitted requests are reviewed for schedule conflicts, completeness, facility fit, and policy compliance."
                            />
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}

function InfoLine({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="grid grid-cols-[2.75rem_1fr] gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                <Icon className="h-5 w-5" />
            </span>

            <div className="text-left">
                <h3 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.035em] text-[#21180d] dark:text-white">
                    {title}
                </h3>

                <p className="mt-2 text-[15px] leading-[1.6] text-[#6e604c] dark:text-white/58">
                    {description}
                </p>
            </div>
        </div>
    );
}

function FacilityGuideCard({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <article className="rounded-[1.4rem] border border-[#d9c7a6]/70 bg-white/76 p-6 text-left shadow-[0_18px_55px_rgba(47,37,23,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(47,37,23,0.11)] dark:border-white/10 dark:bg-white/[0.045]">
            <Icon className="h-7 w-7 text-[#9d7b3d] dark:text-[#f1d89b]" />

            <h3 className="mt-5 text-[24px] font-semibold leading-[1.25] tracking-[-0.045em] text-[#21180d] dark:text-white">
                {title}
            </h3>

            <p className="mt-3 text-[16px] leading-[1.6] text-[#6e604c] dark:text-white/58">
                {description}
            </p>
        </article>
    );
}
