import {
    AdminActionLink,
    AdminEmptyState,
    AdminPolishedPage,
    AdminSectionCard,
    AdminStatCard,
    AdminToolbar,
} from '@/components/admin-resource/admin-polished-page';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { Building2, CheckCircle2, Layers3, Plus, UsersRound } from 'lucide-react';

type VenueArea = {
    id?: number | string;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    capacity?: number | string | null;
    min_capacity?: number | null;
    max_capacity?: number | null;
    is_active?: boolean | number | string | null;
    services_count?: number | null;
};

type PageProps = {
    venueAreas?: VenueArea[];
    serviceTypes?: VenueArea[];
    areas?: VenueArea[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Venue Areas', href: '/admin/venue-areas' },
];

function activeFlag(item: VenueArea) {
    return item.is_active === true || item.is_active === 1 || item.is_active === '1' || item.is_active === undefined;
}

function capacityLabel(item: VenueArea) {
    if (item.capacity) {
        return String(item.capacity);
    }

    if (item.min_capacity || item.max_capacity) {
        return `${item.min_capacity ?? 0} - ${item.max_capacity ?? '∞'}`;
    }

    return 'Not set';
}

export default function VenueAreasIndex() {
    const { props } = usePage<PageProps>();
    const rows = props.venueAreas ?? props.serviceTypes ?? props.areas ?? [];
    const activeRows = rows.filter(activeFlag);
    const totalServices = rows.reduce((sum, item) => sum + Number(item.services_count ?? 0), 0);

    return (
        <AdminPolishedPage
            title="Venue Areas"
            eyebrow="System Setup"
            icon={Building2}
            breadcrumbs={breadcrumbs}
            subtitle="Manage service types as BCCC venue areas. These should match the booking form, availability checker, and public facility choices."
            actions={
                <AdminActionLink href="/admin/venue-areas/create">
                    New Venue Area
                </AdminActionLink>
            }
        >
            <div className="grid gap-3 md:grid-cols-3">
                <AdminStatCard
                    label="Total Areas"
                    value={rows.length}
                    description="All configured venue spaces."
                    icon={Building2}
                />
                <AdminStatCard
                    label="Active Areas"
                    value={activeRows.length}
                    description="Visible or usable in booking workflows."
                    icon={CheckCircle2}
                />
                <AdminStatCard
                    label="Linked Options"
                    value={totalServices}
                    description="Rental services connected to areas."
                    icon={Layers3}
                />
            </div>

            <div className="mt-5">
                <AdminSectionCard
                    title="Configured venue spaces"
                    eyebrow="Service Types"
                    description="Use clear venue names such as Full Hall, Main Hall, Foyer & Lobby Area, VIP Lounge, Board Room, Basement, Gallery2600, Grounds & Parking, and Tech Booth."
                    actions={
                        <AdminActionLink href="/admin/rental-options" variant="secondary">
                            Rental Options
                        </AdminActionLink>
                    }
                >
                    <AdminToolbar
                        searchPlaceholder="Search venue areas..."
                        right={
                            <AdminActionLink href="/admin/venue-areas/create" variant="secondary">
                                <Plus className="h-4 w-4" />
                                Add Area
                            </AdminActionLink>
                        }
                    />

                    {rows.length === 0 ? (
                        <AdminEmptyState
                            icon={Building2}
                            title="No venue areas configured"
                            description="Create venue areas first. Rental options should be connected to these areas so bookings and availability remain synchronized."
                            actionHref="/admin/venue-areas/create"
                            actionLabel="Create Venue Area"
                        />
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {rows.map((item, index) => (
                                <article
                                    key={item.id ?? index}
                                    className="rounded-[1.35rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/70 p-4 shadow-[0_14px_40px_rgba(47,37,23,0.06)] dark:border-white/10 dark:bg-white/[0.035]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                                            <Building2 className="h-5 w-5" />
                                        </span>

                                        <span
                                            className={
                                                activeFlag(item)
                                                    ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
                                                    : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-white/52'
                                            }
                                        >
                                            {activeFlag(item) ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                                        {item.name || item.title || 'Untitled venue area'}
                                    </h3>

                                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#6e604c] dark:text-white/56">
                                        {item.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="rounded-[1rem] border border-[#eadcc2]/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                                            <UsersRound className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                                Capacity
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#21180d] dark:text-white">
                                                {capacityLabel(item)}
                                            </p>
                                        </div>

                                        <div className="rounded-[1rem] border border-[#eadcc2]/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                                            <Layers3 className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                                Options
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#21180d] dark:text-white">
                                                {item.services_count ?? 0}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </AdminSectionCard>
            </div>
        </AdminPolishedPage>
    );
}
