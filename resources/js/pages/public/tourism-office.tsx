import PublicLayout from '@/layouts/public-layout';
import TourismMembersShowcase from '@/components/public/tourism-members-showcase';
import { Head, usePage } from '@inertiajs/react';
import { Building2, Mail, MapPin, Phone, UsersRound } from 'lucide-react';

type TourismMember = {
    id?: number | string;
    fullName?: string | null;
    full_name?: string | null;
    name?: string | null;
    title?: string | null;
    designation?: string | null;
    position?: string | null;
    role?: string | null;
    officeSection?: string | null;
    office_section?: string | null;
    unitName?: string | null;
    unit_name?: string | null;
    teamLabel?: string | null;
    team_label?: string | null;
    reportsToName?: string | null;
    reports_to_name?: string | null;
    treeLevel?: number | string | null;
    tree_level?: number | string | null;
    shortBio?: string | null;
    short_bio?: string | null;
    bio?: string | null;
    description?: string | null;
    details?: string[] | string | null;
    photo?: string | null;
    photoUrl?: string | null;
    photo_url?: string | null;
    photoPath?: string | null;
    photo_path?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
    imagePath?: string | null;
    image_path?: string | null;
    active?: boolean | number | string | null;
    is_active?: boolean | number | string | null;
    featured?: boolean | number | string | null;
    is_featured?: boolean | number | string | null;
    email?: string | null;
    phone?: string | null;
    sortOrder?: number | string | null;
    sort_order?: number | string | null;
};

type SiteSettings = {
    address?: string | null;
    phone?: string | null;
    email?: string | null;
};

type PageProps = {
    members?: TourismMember[];
    tourismMembers?: TourismMember[];
    siteSettings?: SiteSettings;
};

function recordsOf<T>(value?: T[]): T[] {
    return Array.isArray(value) ? value : [];
}

function setting(settings: SiteSettings | undefined, key: keyof SiteSettings) {
    return String(settings?.[key] ?? '');
}

export default function TourismOffice() {
    const { props } = usePage<PageProps>();

    const members = recordsOf(props.members).length > 0
        ? recordsOf(props.members)
        : recordsOf(props.tourismMembers);

    const settings = props.siteSettings ?? {};

    return (
        <PublicLayout>
            <Head title="Tourism Office" />

            <main className="public-display-page overflow-hidden">
                <section className="relative isolate overflow-hidden bg-[#f7f0e3] px-4 pb-12 pt-16 text-[#21180d] dark:bg-[#080b0f] dark:text-white sm:px-6 lg:px-8">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute left-[-10rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#b08d48]/16 blur-3xl" />
                        <div className="absolute right-[-12rem] top-[8rem] h-[36rem] w-[36rem] rounded-full bg-[#2f4d8d]/14 blur-3xl" />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/40 to-transparent dark:from-black/30" />
                    </div>

                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                City Tourism, Culture and Arts Office
                            </p>

                            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.075em] text-[#21180d] dark:text-white md:text-7xl">
                                Tourism Office and BCCC Support Team
                            </h1>

                            <p className="mt-6 max-w-[70ch] text-base leading-8 text-[#6e604c] dark:text-white/62 md:text-lg">
                                Meet the people supporting tourism, culture, events, and convention coordination for the Baguio Convention and Cultural Center.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-2">
                                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white/74 px-4 text-sm font-semibold text-[#2f2517] shadow-sm dark:border-white/10 dark:bg-white/7 dark:text-white">
                                    <UsersRound className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    {members.length} profiles
                                </span>

                                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white/74 px-4 text-sm font-semibold text-[#2f2517] shadow-sm dark:border-white/10 dark:bg-white/7 dark:text-white">
                                    <Building2 className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    CTCAO / BCCC
                                </span>
                            </div>
                        </div>

                        <aside className="rounded-[1.5rem] border border-[#d9c7a6]/70 bg-white/78 p-5 shadow-[0_24px_70px_rgba(47,37,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                Contact
                            </p>

                            <div className="mt-4 grid gap-3 text-sm leading-6 text-[#6e604c] dark:text-white/62">
                                {setting(settings, 'address') ? (
                                    <p className="flex gap-3">
                                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                        <span>{setting(settings, 'address')}</span>
                                    </p>
                                ) : null}

                                {setting(settings, 'phone') ? (
                                    <p className="flex gap-3">
                                        <Phone className="mt-1 h-4 w-4 shrink-0 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                        <span>{setting(settings, 'phone')}</span>
                                    </p>
                                ) : null}

                                {setting(settings, 'email') ? (
                                    <p className="flex gap-3">
                                        <Mail className="mt-1 h-4 w-4 shrink-0 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                        <span>{setting(settings, 'email')}</span>
                                    </p>
                                ) : null}

                                {!setting(settings, 'address') && !setting(settings, 'phone') && !setting(settings, 'email') ? (
                                    <p>Contact details can be updated in the Content Manager settings.</p>
                                ) : null}
                            </div>
                        </aside>
                    </div>
                </section>

                <TourismMembersShowcase items={members} />
            </main>
        </PublicLayout>
    );
}
