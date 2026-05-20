import BookingDeadlineBadge from '@/components/bookings/booking-deadline-badge';
import BookingDeadlinePanel from '@/components/bookings/booking-deadline-panel';
import BookingApprovalPanel from '@/components/bookings/booking-approval-panel';
import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import OfficialReservationPreview from '@/components/bookings/official-reservation-preview';
import { PaymentProofPanel } from '@/components/bookings/payment-proof-panel';
import {
    bookingBasePath,
    bookingEditPath,
    bookingSurveyPath,
    cleanLabel,
    formatDateTime,
    formatMoney,
    normalizeWorkspaceRole,
    type BookingLike,
} from '@/lib/booking-role-ui';
import { Link, router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    FileText,
    Mail,
    MapPin,
    Phone,
    ReceiptText,
    ShieldCheck,
    Printer,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';

type BookingShowPageProps = {
    workspaceRole?: string;
    booking?: BookingLike;
    canUpdateBooking?: boolean;
    canDeleteBooking?: boolean;
    canManagePayments?: boolean;
};

type TimelineItem = {
    id?: number | string;
    label?: string | null;
    title?: string | null;
    description?: string | null;
    from_booking_status?: string | null;
    to_booking_status?: string | null;
    from_payment_status?: string | null;
    to_payment_status?: string | null;
    event_at?: string | null;
    created_at?: string | null;
    meta?: unknown;
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function safeText(value: unknown, fallback = 'Not set'): string {
    if (value === null || value === undefined || String(value).trim() === '') {
        return fallback;
    }

    return String(value);
}

function numberValue(value: unknown): number {
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
}

function totalValue(booking: BookingLike, key: string): number | string | null {
    const totals = booking.totals as
        | Record<string, number | string | null | undefined>
        | null
        | undefined;

    return totals?.[key] ?? null;
}

function remainingBalance(booking: BookingLike): number {
    const explicit = totalValue(booking, 'remaining_balance');

    if (explicit !== null && explicit !== undefined) {
        return numberValue(explicit);
    }

    const total = numberValue(totalValue(booking, 'items_total'));
    const paid = numberValue(
        totalValue(booking, 'confirmed_payments_total') ??
            totalValue(booking, 'payments_total'),
    );

    return Math.max(total - paid, 0);
}

function serviceName(booking: BookingLike): string {
    const serviceTypeName =
        booking.service?.service_type?.name ??
        booking.service?.serviceType?.name ??
        null;

    return safeText(
        serviceTypeName ?? booking.service_name ?? booking.service?.name,
        'Venue not set',
    );
}

function primaryClient(booking: BookingLike): string {
    return (
        safeText(booking.company_name, '') ||
        safeText(booking.client_name, '') ||
        safeText(booking.client_email, '') ||
        'Client not set'
    );
}

function eventTimeline(booking: BookingLike): TimelineItem[] {
    const possible =
        (booking.lifecycle_events as TimelineItem[] | undefined) ??
        (booking.lifecycleEvents as TimelineItem[] | undefined) ??
        (booking.events as TimelineItem[] | undefined);

    return Array.isArray(possible) ? possible : [];
}


function bookingScheduleSegments(booking: BookingLike) {
    const segments = booking.schedule_segments ?? booking.scheduleSegments;

    return Array.isArray(segments) ? segments as Array<Record<string, unknown>> : [];
}

function bookingAreaLabels(booking: BookingLike): string[] {
    const labels = booking.selected_area_labels ?? booking.selectedAreaLabels ?? booking.area_labels;

    if (Array.isArray(labels)) {
        return labels.map((label) => String(label)).filter(Boolean);
    }

    const keys = booking.selected_area_keys ?? booking.selectedAreaKeys;

    if (Array.isArray(keys)) {
        return keys.map((key) => cleanLabel(String(key)));
    }

    return [];
}

function bookingPaymentMeta(booking: BookingLike): Record<string, unknown> {
    const meta = booking.payment_meta ?? booking.paymentMeta;

    return meta && typeof meta === 'object' && !Array.isArray(meta) ? meta as Record<string, unknown> : {};
}


function bookingPrintablePath(role: ReturnType<typeof normalizeWorkspaceRole>, id: number | string, kind: 'reservation' | 'final-bill' | 'cancellation' | 'mice-summary'): string {
    return `${bookingBasePath(role)}/${id}/print/${kind}`;
}

function bookingPaymentsCount(booking: BookingLike): number {
    return Array.isArray(booking.payments) ? booking.payments.length : 0;
}

function scheduleRange(booking: BookingLike): string {
    return `${formatDateTime(booking.booking_date_from)} — ${formatDateTime(booking.booking_date_to)}`;
}

function DetailCard({
    label,
    value,
    icon: Icon,
    wide = false,
}: {
    label: string;
    value?: string | number | null;
    icon?: LucideIcon;
    wide?: boolean;
}) {
    return (
        <article
            className={cx(
                'rounded-[1.15rem] border border-[#eadcc2]/80 bg-white/70 p-4 shadow-[0_12px_32px_rgba(47,37,23,0.045)] dark:border-white/10 dark:bg-white/[0.035]',
                wide && 'md:col-span-2',
            )}
        >
            <div className="flex items-center gap-2">
                {Icon ? (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                    {label}
                </p>
            </div>

            <p className="mt-3 break-words text-sm font-semibold leading-7 text-[#21180d] dark:text-white">
                {safeText(value)}
            </p>
        </article>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: LucideIcon;
}) {
    return (
        <article className="rounded-[1.25rem] border border-[#d9c7a6]/70 bg-white/78 p-4 shadow-[0_14px_40px_rgba(47,37,23,0.07)] dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        {label}
                    </p>

                    <p className="mt-2 truncate text-xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                        {value}
                    </p>
                </div>

                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </article>
    );
}

function SectionCard({
    eyebrow,
    title,
    description,
    children,
    actions,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-[1.55rem] border border-[#d9c7a6]/70 bg-white/84 shadow-[0_22px_70px_rgba(47,37,23,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex flex-col gap-4 border-b border-[#eadcc2]/80 p-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        {eyebrow}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#21180d] dark:text-white">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6e604c] dark:text-white/56">
                            {description}
                        </p>
                    ) : null}
                </div>

                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

function TimelineRow({ item }: { item: TimelineItem }) {
    const label =
        item.title ||
        item.label ||
        item.to_booking_status ||
        item.to_payment_status ||
        'Lifecycle update';

    const date = item.event_at || item.created_at;

    return (
        <article className="flex gap-3 rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#b08d48]" />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                    {item.to_booking_status ? (
                        <BookingStatusBadge value={item.to_booking_status} size="sm" />
                    ) : null}

                    {item.to_payment_status ? (
                        <BookingStatusBadge value={item.to_payment_status} size="sm" />
                    ) : null}
                </div>

                <h3 className="mt-2 text-sm font-semibold text-[#21180d] dark:text-white">
                    {cleanLabel(label)}
                </h3>

                {item.description ? (
                    <p className="mt-1 text-sm leading-6 text-[#6e604c] dark:text-white/56">
                        {item.description}
                    </p>
                ) : null}

                <p className="mt-2 text-xs font-medium text-[#8a7a63] dark:text-white/40">
                    {formatDateTime(date)}
                </p>
            </div>
        </article>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[1.25rem] border border-dashed border-[#d9c7a6]/80 bg-[#fffaf0]/58 p-8 text-center dark:border-white/10 dark:bg-white/[0.035]">
            <Icon className="mx-auto h-9 w-9 text-[#b08d48] dark:text-[#f1d89b]" />

            <h3 className="mt-4 text-base font-semibold text-[#21180d] dark:text-white">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#6e604c] dark:text-white/56">
                {description}
            </p>
        </div>
    );
}

export function BookingShowPage() {
    const { props } = usePage<BookingShowPageProps>();
    const role = normalizeWorkspaceRole(props.workspaceRole);
    const booking = props.booking;

    if (!booking) {
        return (
            <BookingRolePageShell
                role={role}
                title="Booking Not Found"
                description="The booking record could not be loaded."
            >
                <div className="rounded-[1.55rem] border border-[#d9c7a6]/70 bg-white/84 p-10 text-center shadow-[0_22px_70px_rgba(47,37,23,0.08)] dark:border-white/10 dark:bg-white/[0.055]">
                    <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#21180d] dark:text-white">
                        The booking record could not be loaded.
                    </h2>

                    <Link
                        href={bookingBasePath(role)}
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white transition hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Bookings
                    </Link>
                </div>
            </BookingRolePageShell>
        );
    }

    const canUpdate = Boolean(props.canUpdateBooking);
    const canDelete = Boolean(props.canDeleteBooking);
    const canManagePayments = Boolean(props.canManagePayments);
    const isUser = role === 'user';
    const currentBooking = booking;
    const timeline = eventTimeline(currentBooking);

    function deleteBooking() {
        if (!window.confirm('Delete this booking record? This action cannot be undone.')) {
            return;
        }

        router.delete(`${bookingBasePath(role)}/${currentBooking.id}`, {
            preserveScroll: false,
        });
    }

    return (
        <BookingRolePageShell
            role={role}
            title={safeText(booking.type_of_event, `Booking #${booking.id}`)}
            description={
                isUser
                    ? 'Review your booking request, complete requirements, submit payment proof, and monitor your deadline status.'
                    : 'Review booking details, client information, schedule, MICE report, payment proof, deadline status, and internal actions.'
            }
            actions={
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={bookingBasePath(role)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-5 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>

                    {canUpdate ? (
                        <Link
                            href={bookingEditPath(role, booking.id)}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit
                        </Link>
                    ) : null}

                    {canDelete ? (
                        <button
                            type="button"
                            onClick={deleteBooking}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(225,29,72,0.18)] transition hover:-translate-y-0.5 hover:bg-rose-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    ) : null}
                </div>
            }
        >
            <div className="space-y-5">
                <section className="relative overflow-hidden rounded-[1.75rem] border border-[#d9c7a6]/70 bg-white/88 p-5 shadow-[0_24px_80px_rgba(47,37,23,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,181,109,0.18),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_48%)]" />

                    <div className="relative grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                                <BookingStatusBadge value={booking.booking_status} />
                                <BookingStatusBadge value={booking.payment_status} />
                                <BookingDeadlineBadge booking={booking} />
                                <span className="inline-flex items-center rounded-full border border-[#d9c7a6]/70 bg-white/75 px-3 py-1.5 text-xs font-bold text-[#7a5a24] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                                    Booking #{booking.id}
                                </span>
                            </div>

                            <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-0.065em] text-[#21180d] dark:text-white lg:text-5xl">
                                {safeText(booking.type_of_event, `Booking #${booking.id}`)}
                            </h1>

                            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                {primaryClient(booking)} · {serviceName(booking)}
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                    <CalendarDays className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                        Schedule
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-6 text-[#21180d] dark:text-white">
                                        {scheduleRange(booking)}
                                    </p>
                                </div>

                                <div className="rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                    <MapPin className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                        Venue
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-6 text-[#21180d] dark:text-white">
                                        {serviceName(booking)}
                                    </p>
                                </div>

                                <div className="rounded-[1.1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/70 p-4 dark:border-white/10 dark:bg-white/[0.035] md:col-span-2 xl:col-span-1">
                                    <Users className="h-5 w-5 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                        Guests
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-6 text-[#21180d] dark:text-white">
                                        {safeText(booking.number_of_guests)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:w-52 xl:flex-col">
                            <Link
                                href={bookingSurveyPath(role, booking.id)}
                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-5 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12 xl:flex-none"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                MICE Report
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Schedule From"
                        value={formatDateTime(booking.booking_date_from)}
                        icon={CalendarDays}
                    />

                    <SummaryCard
                        label="Schedule To"
                        value={formatDateTime(booking.booking_date_to)}
                        icon={Clock3}
                    />

                    <SummaryCard
                        label="Total Charges"
                        value={formatMoney(totalValue(booking, 'items_total'))}
                        icon={ReceiptText}
                    />

                    <SummaryCard
                        label="Remaining Balance"
                        value={formatMoney(remainingBalance(booking))}
                        icon={CheckCircle2}
                    />
                </section>

                <BookingDeadlinePanel booking={booking} />

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <main className="space-y-5">
                        <SectionCard
                            eyebrow="Booking Information"
                            title="Client and event details"
                            description="Essential booking information is grouped here for quick review."
                        >
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <DetailCard label="Client Name" value={booking.client_name} icon={UserRound} />
                                <DetailCard label="Company / Organization" value={booking.company_name} icon={Building2} />
                                <DetailCard label="Event Type" value={booking.type_of_event} icon={ReceiptText} />
                                <DetailCard label="Email" value={booking.client_email} icon={Mail} />
                                <DetailCard label="Contact Number" value={booking.client_contact_number} icon={Phone} />
                                <DetailCard label="Number of Guests" value={booking.number_of_guests} icon={Users} />
                                <DetailCard label="Client Address" value={booking.client_address} icon={MapPin} wide />
                            </div>
                        </SectionCard>

                        <SectionCard
                            eyebrow="Venue and Calendar"
                            title="Schedule and public visibility"
                            description="Review venue, dates, and public calendar display settings."
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailCard label="Venue / Service" value={serviceName(booking)} icon={MapPin} />
                                <DetailCard label="Schedule" value={scheduleRange(booking)} icon={CalendarDays} />
                                <DetailCard
                                    label="Public Calendar Visible"
                                    value={booking.is_public_calendar_visible ? 'Yes' : 'No'}
                                    icon={CalendarDays}
                                />
                                <DetailCard
                                    label="Public Calendar Title"
                                    value={
                                        booking.public_calendar_title as
                                            | string
                                            | number
                                            | null
                                            | undefined
                                    }
                                    icon={ReceiptText}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            eyebrow="Official Review"
                            title="Reservation form preview"
                            description="A cleaner official-style view for client review, staff checking, and printing."
                        >
                            <OfficialReservationPreview
                                data={{
                                    organization_type: booking.organization_type as string | undefined,
                                    company_name: booking.company_name as string | undefined,
                                    client_name: booking.client_name as string | undefined,
                                    client_contact_number: booking.client_contact_number as string | undefined,
                                    client_email: booking.client_email as string | undefined,
                                    survey_email: booking.survey_email as string | undefined,
                                    client_address: booking.client_address as string | undefined,
                                    client_region: booking.client_region as string | undefined,
                                    client_province: booking.client_province as string | undefined,
                                    client_city_municipality: booking.client_city_municipality as string | undefined,
                                    client_barangay: booking.client_barangay as string | undefined,
                                    client_zip_code: booking.client_zip_code as string | undefined,
                                    client_street_address: booking.client_street_address as string | undefined,
                                    head_of_organization: booking.head_of_organization as string | undefined,
                                    type_of_event: booking.type_of_event as string | undefined,
                                    booking_date_from: booking.booking_date_from as string | undefined,
                                    booking_date_to: booking.booking_date_to as string | undefined,
                                    number_of_guests: booking.number_of_guests as string | number | undefined,
                                    public_calendar_title: booking.public_calendar_title as string | undefined,
                                    selected_package_code: booking.selected_package_code as string | undefined,
                                    dressing_room_selection: booking.dressing_room_selection as string | undefined,
                                    mice_required: booking.mice_required as boolean | string | number | undefined,
                                }}
                                selectedVenue={{
                                    label: serviceName(booking),
                                    displayLabel: serviceName(booking),
                                    capacity: booking.venue_capacity as string | number | undefined,
                                }}
                                usage={booking.estimated_usage as string | undefined}
                                durationHours={booking.estimated_duration_hours as string | number | undefined}
                                otherRentals={booking.dressing_room_selection as string | undefined}
                                additionalCharges={(booking.dressing_room_charge ?? booking.estimated_additional_charges) as string | number | undefined}
                                reservationNotes={booking.reservation_notes as string | undefined}
                                estimatedBase={totalValue(booking, 'items_total') ?? undefined}
                                estimatedTotal={totalValue(booking, 'items_total') ?? undefined}
                                fullAddress={booking.client_address as string | undefined}
                                selectedPackageName={(booking.selected_package_name ?? booking.selectedPackageName) as string | undefined}
                                selectedAreaLabels={bookingAreaLabels(booking)}
                                scheduleSegments={bookingScheduleSegments(booking) as any}
                                miceDraft={bookingPaymentMeta(booking).mice_draft as any}
                            />
                        </SectionCard>

                        <BookingApprovalPanel
                            role={role}
                            booking={booking}
                            canManagePayments={canManagePayments}
                        />

                        <PaymentProofPanel
                            role={role}
                            booking={booking}
                            canManagePayments={canManagePayments}
                        />

                        <SectionCard
                            eyebrow="Audit Trail"
                            title="Lifecycle timeline"
                            description="Recent booking and payment updates appear here when loaded by the controller."
                        >
                            {timeline.length > 0 ? (
                                <div className="grid gap-3">
                                    {timeline.slice(0, 10).map((item, index) => (
                                        <TimelineRow
                                            key={item.id ?? `${index}-${item.event_at}`}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyPanel
                                    icon={Clock3}
                                    title="No lifecycle events loaded"
                                    description="Status and payment lifecycle history will appear here when available."
                                />
                            )}
                        </SectionCard>
                    </main>

                    <aside className="space-y-5">
                        <SectionCard eyebrow="Payment Snapshot" title="Financial status">
                            <div className="grid gap-3">
                                <MiniBox label="Items Total" value={formatMoney(totalValue(booking, 'items_total'))} />
                                <MiniBox label="Submitted Payments" value={formatMoney(totalValue(booking, 'submitted_payments_total'))} />
                                <MiniBox
                                    label="Confirmed Payments"
                                    value={formatMoney(
                                        totalValue(booking, 'confirmed_payments_total') ??
                                            totalValue(booking, 'payments_total'),
                                    )}
                                />
                                <MiniBox label="Remaining Balance" value={formatMoney(remainingBalance(booking))} />
                                <MiniBox label="Payment Records" value={bookingPaymentsCount(booking).toString()} />
                            </div>
                        </SectionCard>


                        <SectionCard eyebrow="Printables" title="Official outputs">
                            <div className="grid gap-3">
                                <Link
                                    href={bookingPrintablePath(role, booking.id, 'reservation')}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6] bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#fff8ea] dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    <FileText className="h-4 w-4" />
                                    Reservation Summary
                                </Link>
                                <Link
                                    href={bookingPrintablePath(role, booking.id, 'final-bill')}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6] bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#fff8ea] dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    <ReceiptText className="h-4 w-4" />
                                    Final Bill
                                </Link>
                                <Link
                                    href={bookingPrintablePath(role, booking.id, 'cancellation')}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6] bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#fff8ea] dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    <Printer className="h-4 w-4" />
                                    Cancellation Assessment
                                </Link>
                                <Link
                                    href={bookingPrintablePath(role, booking.id, 'mice-summary')}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6] bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#fff8ea] dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    MICE Summary
                                </Link>
                            </div>
                        </SectionCard>

                        <SectionCard eyebrow="MICE Report" title="Required report status">
                            <div className="rounded-[1.2rem] border border-[#eadcc2]/80 bg-[#fffaf0]/76 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                                <p className="text-sm leading-7 text-[#6e604c] dark:text-white/56">
                                    The booking now opens directly to this details page after submission. The built-in MICE report remains available here, while payment proof and the 10-working-day deadline can be monitored from the same record.
                                </p>
                                <Link
                                    href={bookingSurveyPath(role, booking.id)}
                                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white transition hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Open MICE Report
                                </Link>
                            </div>
                        </SectionCard>

                        <SectionCard eyebrow="Contact" title="Client contact">
                            <div className="grid gap-3">
                                <DetailCard label="Client" value={booking.client_name} icon={UserRound} />
                                <DetailCard label="Email" value={booking.client_email} icon={Mail} />
                                <DetailCard label="Phone" value={booking.client_contact_number} icon={Phone} />
                            </div>
                        </SectionCard>
                    </aside>
                </section>
            </div>
        </BookingRolePageShell>
    );
}

function MiniBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.035]">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9d7b3d] dark:text-[#f1d89b]">
                {label}
            </span>

            <strong className="text-sm font-semibold text-[#21180d] dark:text-white">
                {value}
            </strong>
        </div>
    );
}

export default BookingShowPage;
