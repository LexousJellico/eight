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
            <main className="public-display-page overflow-hidden">
                <TourismMembersShowcase items={members} />
            </main>
        </PublicLayout>
    );
}
