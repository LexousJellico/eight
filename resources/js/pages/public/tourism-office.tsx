import TourismMembersShowcase from '@/components/public/tourism-members-showcase';
import PublicLayout from '@/layouts/public-layout';
import { Head, usePage } from '@inertiajs/react';
import { Building2, CalendarDays, Landmark, Mail, MapPin, Phone, Sparkles } from 'lucide-react';

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
    officeHours?: string | null;
    office_hours?: string | null;
};

type PageProps = {
    members?: TourismMember[];
    tourismMembers?: TourismMember[];
    siteSettings?: SiteSettings;
};

function recordsOf<T>(value?: T[]): T[] {
    return Array.isArray(value) ? value : [];
}

function setting(settings: SiteSettings | undefined, key: keyof SiteSettings, fallback = '') {
    return String(settings?.[key] ?? fallback);
}

export default function TourismOffice() {
    const { props } = usePage<PageProps>();
    const members = recordsOf(props.members).length > 0 ? recordsOf(props.members) : recordsOf(props.tourismMembers);
    const settings = props.siteSettings ?? {};

    return (
        <PublicLayout>
            <Head title="Tourism Office" />

            <main className="overflow-hidden bg-[#eef4f2] dark:bg-[#08110f]">
                <section className="relative overflow-hidden bg-[#176456] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.10),transparent_44%)]" />
                    <div className="relative mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white/58">City Tourism, Culture and Arts Office</p>
                            <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.07em] sm:text-6xl lg:text-7xl">Tourism Office profile</h1>
                        </div>
                        <p className="max-w-3xl text-sm leading-7 text-white/76 sm:text-base">
                            The Tourism Office supports Baguio City&apos;s visitor services, event coordination, cultural programming, creative-city initiatives, and public information work connected to tourism, culture, and arts. This page now presents the office profile first, then the people behind the operations.
                        </p>
                    </div>
                </section>
                <TourismMembersShowcase items={members} />
            </main>
        </PublicLayout>
    );
}
