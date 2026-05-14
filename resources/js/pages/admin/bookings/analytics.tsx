import {
    ResourceActionLink,
    ResourcePageShell,
    ResourceSection,
    ResourceStatCard,
} from '@/components/admin-resource/resource-page-shell';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileBarChart,
    Users,
} from 'lucide-react';

type AnalyticsSummary = Record<string, number | string | undefined>;

type BreakdownItem = {
    label?: string;
    booking_status?: string;
    status?: string;
    total?: number;
    count?: number;
    value?: number;
};

type MonthlyTrendItem = {
    key?: string;
    month?: string;
    label?: string;
    total?: number;
    count?: number;
    value?: number;
    bookings?: number;
    guests?: number;
    confirmed_revenue?: number | string;
};

type WorkloadItem = {
    label?: string;
    date?: string;
    bookings?: number;
    guests?: number;
};

type PageProps = {
    summary?: AnalyticsSummary;
    statusCounts?: BreakdownItem[];
    statusBreakdown?: BreakdownItem[];
    paymentBreakdown?: BreakdownItem[];
    monthly?: MonthlyTrendItem[];
    monthlyTrend?: MonthlyTrendItem[];
    upcomingWorkload?: WorkloadItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Booking Analytics', href: '/admin/bookings/analytics' },
];

function num(value?: number | string) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function money(value?: number | string) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(num(value));
}

function cleanLabel(value?: string) {
    return String(value || 'Unknown')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function maxValue(items: Array<{ value: number }>) {
    return Math.max(...items.map((item) => item.value), 1);
}

function BarRow({ label, value, max, helper }: { label: string; value: number; max: number; helper?: string }) {
    const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;

    return (
        <article className="rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#21180d] dark:text-white">{label}</p>
                    {helper ? <p className="mt-1 text-xs leading-5 text-[#7a6b55] dark:text-white/45">{helper}</p> : null}
                </div>
                <p className="text-xl font-semibold text-[#21180d] dark:text-white">{value}</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#eadcc2] dark:bg-white/10">
                <div className="h-full rounded-full bg-[#2f2517] transition-all duration-500 dark:bg-[#f1d89b]" style={{ width }} />
            </div>
        </article>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <p className="rounded-[1.25rem] border border-dashed border-[#d9c7a6]/80 bg-[#fffaf0]/58 p-6 text-center text-sm font-semibold text-[#21180d] dark:border-white/10 dark:bg-white/[0.035] dark:text-white">
            {message}
        </p>
    );
}

export default function AdminBookingAnalytics() {
    const { props } = usePage<PageProps>();
    const summary = props.summary ?? {};

    const statusCounts = (props.statusBreakdown ?? props.statusCounts ?? []).map((item) => ({
        label: cleanLabel(item.label || item.booking_status || item.status),
        value: num(item.value ?? item.total ?? item.count),
    }));

    const paymentCounts = (props.paymentBreakdown ?? []).map((item) => ({
        label: cleanLabel(item.label || item.status),
        value: num(item.value ?? item.total ?? item.count),
    }));

    const monthly = (props.monthlyTrend ?? props.monthly ?? []).map((item, index) => ({
        label: item.label || item.month || item.key || `Month ${index + 1}`,
        value: num(item.bookings ?? item.value ?? item.total ?? item.count),
        guests: num(item.guests),
        revenue: num(item.confirmed_revenue),
    }));

    const workload = (props.upcomingWorkload ?? []).map((item) => ({
        label: item.label || item.date || 'Date',
        value: num(item.bookings),
        guests: num(item.guests),
    }));

    const statusMax = maxValue(statusCounts);
    const paymentMax = maxValue(paymentCounts);
    const monthlyMax = maxValue(monthly);
    const workloadMax = maxValue(workload);
    const yearlyBookings = monthly.reduce((sum, item) => sum + item.value, 0);
    const yearlyGuests = monthly.reduce((sum, item) => sum + item.guests, 0);
    const yearlyRevenue = monthly.reduce((sum, item) => sum + item.revenue, 0);

    return (
        <ResourcePageShell
            title="Booking Analytics"
            eyebrow="Review & Reports"
            icon={BarChart3}
            breadcrumbs={breadcrumbs}
            subtitle="Accurate booking volume, payment compliance, monthly trend, yearly totals, and operational workload from the booking database."
            actions={
                <>
                    <ResourceActionLink href="/admin/bookings" variant="secondary">Bookings</ResourceActionLink>
                    <ResourceActionLink href="/admin/bookings/analytics/print" variant="secondary">Print</ResourceActionLink>
                    <ResourceActionLink href="/admin/bookings/analytics/export">Export CSV</ResourceActionLink>
                </>
            }
        >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
                <ResourceStatCard label="Total Bookings" value={num(summary.total_bookings)} description="All matching booking records." icon={CalendarDays} />
                <ResourceStatCard label="Pending" value={num(summary.pending)} description="Requests needing action." icon={Clock3} />
                <ResourceStatCard label="Confirmed" value={num(summary.confirmed) + num(summary.active)} description="Confirmed or active." icon={CheckCircle2} />
                <ResourceStatCard label="Completed" value={num(summary.completed)} description="Finished records." icon={FileBarChart} />
                <ResourceStatCard label="Guests" value={num(summary.total_guests)} description="Total estimated guests." icon={Users} />
                <ResourceStatCard label="Confirmed Revenue" value={money(summary.confirmed_revenue)} description="Verified/confirmed payments." icon={CreditCard} />
                <ResourceStatCard label="Outstanding" value={money(summary.outstanding_balance)} description="Remaining balance." icon={AlertTriangle} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ResourceStatCard label="12-Month Bookings" value={yearlyBookings} description="Computed from monthly trend." icon={CalendarDays} />
                <ResourceStatCard label="12-Month Guests" value={yearlyGuests} description="Estimated guests across trend." icon={Users} />
                <ResourceStatCard label="12-Month Revenue" value={money(yearlyRevenue)} description="Confirmed revenue trend total." icon={CreditCard} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <ResourceSection title="Monthly booking trend" eyebrow="Monthly" description="Booking totals for the last 12 months.">
                    {monthly.length === 0 ? <EmptyChart message="No monthly analytics available." /> : <div className="grid gap-3">{monthly.map((item) => <BarRow key={item.label} label={item.label} value={item.value} max={monthlyMax} helper={`${item.guests} guests · ${money(item.revenue)}`} />)}</div>}
                </ResourceSection>

                <ResourceSection title="Status distribution" eyebrow="Booking Status" description="Lifecycle distribution across all matching records.">
                    {statusCounts.length === 0 ? <EmptyChart message="No status analytics available." /> : <div className="grid gap-3">{statusCounts.map((item) => <BarRow key={item.label} label={item.label} value={item.value} max={statusMax} />)}</div>}
                </ResourceSection>

                <ResourceSection title="Payment distribution" eyebrow="Payment Status" description="Payment status spread for compliance review.">
                    {paymentCounts.length === 0 ? <EmptyChart message="No payment analytics available." /> : <div className="grid gap-3">{paymentCounts.map((item) => <BarRow key={item.label} label={item.label} value={item.value} max={paymentMax} />)}</div>}
                </ResourceSection>

                <ResourceSection title="Upcoming workload" eyebrow="Next 30 Days" description="Daily workload preview for scheduling and staffing.">
                    {workload.length === 0 ? <EmptyChart message="No upcoming workload data available." /> : <div className="grid gap-3">{workload.map((item) => <BarRow key={item.label} label={item.label} value={item.value} max={workloadMax} helper={`${item.guests} guests`} />)}</div>}
                </ResourceSection>
            </div>
        </ResourcePageShell>
    );
}
