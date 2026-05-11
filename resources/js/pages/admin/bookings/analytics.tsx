import {
    ResourceActionLink,
    ResourcePageShell,
    ResourceSection,
    ResourceStatCard,
} from '@/components/admin-resource/resource-page-shell';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { BarChart3, CalendarDays, CheckCircle2, Clock3, CreditCard, FileBarChart } from 'lucide-react';

type AnalyticsSummary = {
    total_bookings?: number;
    totalBookings?: number;
    pending_bookings?: number;
    pendingBookings?: number;
    approved_bookings?: number;
    approvedBookings?: number;
    completed_bookings?: number;
    completedBookings?: number;
    revenue?: number | string;
    total_revenue?: number | string;
    totalRevenue?: number | string;
};

type PageProps = {
    summary?: AnalyticsSummary;
    statusCounts?: Array<{ label?: string; booking_status?: string; total?: number }>;
    monthly?: Array<{ month?: string; total?: number }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Analytics', href: '/admin/bookings/analytics' },
];

function money(value?: number | string) {
    const numeric = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(Number.isFinite(numeric) ? numeric : 0);
}

export default function AdminBookingAnalytics() {
    const { props } = usePage<PageProps>();
    const summary = props.summary ?? {};

    const total = summary.total_bookings ?? summary.totalBookings ?? 0;
    const pending = summary.pending_bookings ?? summary.pendingBookings ?? 0;
    const approved = summary.approved_bookings ?? summary.approvedBookings ?? 0;
    const completed = summary.completed_bookings ?? summary.completedBookings ?? 0;
    const revenue = summary.total_revenue ?? summary.totalRevenue ?? summary.revenue ?? 0;

    const statusCounts = props.statusCounts ?? [];
    const monthly = props.monthly ?? [];

    return (
        <ResourcePageShell
            title="Booking Analytics"
            eyebrow="Review & Reports"
            icon={BarChart3}
            breadcrumbs={breadcrumbs}
            subtitle="Monitor booking volume, status distribution, and operational metrics."
            actions={
                <>
                    <ResourceActionLink href="/admin/bookings" variant="secondary">
                        Bookings
                    </ResourceActionLink>
                    <ResourceActionLink href="/admin/reports/mice-registry" variant="primary">
                        MICE Registry
                    </ResourceActionLink>
                </>
            }
        >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <ResourceStatCard label="Total Bookings" value={total} description="All tracked booking records." icon={CalendarDays} />
                <ResourceStatCard label="Pending" value={pending} description="Requests needing action." icon={Clock3} />
                <ResourceStatCard label="Approved" value={approved} description="Approved or active bookings." icon={CheckCircle2} />
                <ResourceStatCard label="Completed" value={completed} description="Finished booking records." icon={FileBarChart} />
                <ResourceStatCard label="Revenue" value={money(revenue)} description="Reported payment total." icon={CreditCard} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <ResourceSection title="Status distribution" eyebrow="Booking Status">
                    {statusCounts.length === 0 ? (
                        <p className="rounded-[1.25rem] border border-dashed border-[#d9c7a6]/80 bg-[#fffaf0]/58 p-6 text-center text-sm font-semibold text-[#21180d] dark:border-white/10 dark:bg-white/[0.035] dark:text-white">
                            No status analytics available.
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {statusCounts.map((item, index) => {
                                const label = item.label || item.booking_status || 'Unknown';
                                const count = item.total ?? 0;

                                return (
                                    <article
                                        key={`${label}-${index}`}
                                        className="rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold capitalize text-[#21180d] dark:text-white">
                                                {label.replaceAll('_', ' ')}
                                            </p>
                                            <p className="text-xl font-semibold text-[#21180d] dark:text-white">
                                                {count}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </ResourceSection>

                <ResourceSection title="Monthly booking trend" eyebrow="Monthly">
                    {monthly.length === 0 ? (
                        <p className="rounded-[1.25rem] border border-dashed border-[#d9c7a6]/80 bg-[#fffaf0]/58 p-6 text-center text-sm font-semibold text-[#21180d] dark:border-white/10 dark:bg-white/[0.035] dark:text-white">
                            No monthly analytics available.
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {monthly.slice(0, 12).map((item, index) => (
                                <article
                                    key={`${item.month}-${index}`}
                                    className="flex items-center justify-between rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                                >
                                    <p className="text-sm font-semibold text-[#21180d] dark:text-white">
                                        {item.month || `Month ${index + 1}`}
                                    </p>
                                    <p className="text-xl font-semibold text-[#21180d] dark:text-white">
                                        {item.total ?? 0}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </ResourceSection>
            </div>
        </ResourcePageShell>
    );
}
