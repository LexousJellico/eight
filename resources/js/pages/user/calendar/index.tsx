import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, LockKeyhole, MapPin, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type CalendarAvailabilityDay = {
    AM?: boolean;
    PM?: boolean;
    EVE?: boolean;
    is_fully_booked?: boolean;
    day_status?: string;
};

type CalendarEvent = {
    id?: string | number;
    kind?: 'booking' | 'block' | 'public_event' | string;
    title?: string | null;
    start?: string | null;
    end?: string | null;
    status?: string | null;
    area?: string | null;
    block?: string | null;
};

type PageProps = {
    month?: string;
    monthAvailability?: Record<string, CalendarAvailabilityDay>;
    events?: CalendarEvent[];
};

const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function dateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
    return new Date(`${value}T00:00:00`);
}

function monthLabel(value: string) {
    const [year, month] = value.split('-').map(Number);

    return new Date(year, (month || 1) - 1, 1).toLocaleDateString('en-PH', {
        month: 'long',
        year: 'numeric',
    });
}

function fullDateLabel(value: string) {
    return parseLocalDate(value).toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function addMonth(value: string, offset: number) {
    const [year, month] = value.split('-').map(Number);
    const next = new Date(year, (month || 1) - 1 + offset, 1);

    return dateKey(next).slice(0, 7);
}

function buildGrid(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = new Date(year, (monthNumber || 1) - 1, 1);
    const start = new Date(first);

    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);

        return {
            key: dateKey(date),
            number: date.getDate(),
            current: date.getMonth() === first.getMonth(),
            today: dateKey(date) === dateKey(new Date()),
        };
    });
}

function eventTouchesDate(event: CalendarEvent, key: string) {
    const start = event.start?.slice(0, 10);
    const end = event.end?.slice(0, 10);

    if (!start) return false;
    if (!end) return start === key;

    return key >= start && key <= end;
}

function dayStatus(day?: CalendarAvailabilityDay) {
    const status = String(day?.day_status || '').toLowerCase();

    if (!day) return 'Available';
    if (status === 'blocked' || day.is_fully_booked) return 'Unavailable';
    if (status === 'public_booked') return 'Public Activity';
    if (status === 'private_booked') return 'Reserved';
    if (status === 'limited' || status === 'partial' || status === 'partially_booked') return 'Limited';

    return 'Available';
}

function dayStatusDescription(day?: CalendarAvailabilityDay) {
    const status = dayStatus(day);

    if (status === 'Unavailable') return 'This date is not open for a new reservation request.';
    if (status === 'Reserved') return 'This date already has a reservation or operational hold.';
    if (status === 'Public Activity') return 'This date includes a public BCCC activity.';
    if (status === 'Limited') return 'Some time blocks may still be available. Review the block details below.';

    return 'This date is generally available based on the current calendar.';
}

function dayTone(day?: CalendarAvailabilityDay) {
    const status = dayStatus(day);

    if (status === 'Unavailable') {
        return {
            fill: 'bg-rose-500/12 dark:bg-rose-400/12',
            border: 'border-rose-500/25 dark:border-rose-300/20',
            selectedBorder: 'border-rose-500/55 dark:border-rose-300/45',
            text: 'text-rose-700 dark:text-rose-100',
            badge: 'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-100',
            dot: 'bg-rose-500',
        };
    }

    if (status === 'Reserved') {
        return {
            fill: 'bg-amber-500/12 dark:bg-amber-300/12',
            border: 'border-amber-500/25 dark:border-amber-300/20',
            selectedBorder: 'border-amber-500/55 dark:border-amber-300/45',
            text: 'text-amber-800 dark:text-amber-100',
            badge: 'bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-100',
            dot: 'bg-amber-500',
        };
    }

    if (status === 'Public Activity') {
        return {
            fill: 'bg-sky-500/12 dark:bg-sky-300/12',
            border: 'border-sky-500/25 dark:border-sky-300/20',
            selectedBorder: 'border-sky-500/55 dark:border-sky-300/45',
            text: 'text-sky-800 dark:text-sky-100',
            badge: 'bg-sky-500/12 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-100',
            dot: 'bg-sky-500',
        };
    }

    if (status === 'Limited') {
        return {
            fill: 'bg-yellow-500/12 dark:bg-yellow-300/12',
            border: 'border-yellow-500/25 dark:border-yellow-300/20',
            selectedBorder: 'border-yellow-500/55 dark:border-yellow-300/45',
            text: 'text-yellow-800 dark:text-yellow-100',
            badge: 'bg-yellow-500/12 text-yellow-800 ring-1 ring-yellow-500/25 dark:text-yellow-100',
            dot: 'bg-yellow-500',
        };
    }

    return {
        fill: 'bg-emerald-500/10 dark:bg-emerald-300/10',
        border: 'border-emerald-500/22 dark:border-emerald-300/18',
        selectedBorder: 'border-emerald-500/50 dark:border-emerald-300/40',
        text: 'text-emerald-800 dark:text-emerald-100',
        badge: 'bg-emerald-500/12 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-100',
        dot: 'bg-emerald-500',
    };
}

function blockAvailable(day: CalendarAvailabilityDay | undefined, block: 'AM' | 'PM' | 'EVE') {
    if (!day) return true;

    return day[block] !== false && !day.is_fully_booked && dayStatus(day) !== 'Unavailable';
}

function goToMonth(month: string) {
    router.get('/my-calendar', { month }, { preserveScroll: true, replace: true });
}

function eventLabel(event: CalendarEvent) {
    if (event.kind === 'booking') return event.title || 'My booking';
    if (event.kind === 'public_event') return 'Public activity';
    if (event.kind === 'block') return 'Calendar hold';

    return event.title || 'Calendar item';
}

function eventStatusTone(status?: string | null) {
    const normalized = String(status || '').toLowerCase();

    if (normalized.includes('confirmed') || normalized.includes('active') || normalized.includes('completed')) {
        return 'border-emerald-500/20 bg-emerald-500/8 text-emerald-800 dark:text-emerald-100';
    }

    if (normalized.includes('public')) {
        return 'border-sky-500/20 bg-sky-500/8 text-sky-800 dark:text-sky-100';
    }

    if (normalized.includes('blocked') || normalized.includes('declined') || normalized.includes('cancelled')) {
        return 'border-rose-500/20 bg-rose-500/8 text-rose-800 dark:text-rose-100';
    }

    return 'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-100';
}

export default function UserCalendarIndex() {
    const { props } = usePage<PageProps>();
    const month = props.month || dateKey(new Date()).slice(0, 7);
    const availability = props.monthAvailability ?? {};
    const events = props.events ?? [];
    const grid = useMemo(() => buildGrid(month), [month]);
    const todayKey = dateKey(new Date());
    const [selectedDate, setSelectedDate] = useState(todayKey.slice(0, 7) === month ? todayKey : `${month}-01`);

    useEffect(() => {
        setSelectedDate((current) => {
            if (current.slice(0, 7) === month) return current;

            const today = dateKey(new Date());
            return today.slice(0, 7) === month ? today : `${month}-01`;
        });
    }, [month]);

    const selectedAvailability = availability[selectedDate];
    const selectedStatus = dayStatus(selectedAvailability);
    const selectedTone = dayTone(selectedAvailability);
    const selectedEvents = useMemo(
        () => events.filter((event) => eventTouchesDate(event, selectedDate)).slice(0, 4),
        [events, selectedDate],
    );

    const statusCounts = useMemo(() => {
        return Object.values(availability).reduce(
            (carry, day) => {
                const status = dayStatus(day);

                if (status === 'Available') carry.available += 1;
                else if (status === 'Limited') carry.limited += 1;
                else if (status === 'Reserved') carry.reserved += 1;
                else if (status === 'Public Activity') carry.public += 1;
                else carry.unavailable += 1;

                return carry;
            },
            {
                available: 0,
                limited: 0,
                reserved: 0,
                public: 0,
                unavailable: 0,
            },
        );
    }, [availability]);

    return (
        <BookingRolePageShell
            role="user"
            title="My Calendar"
            description="Check date availability first. Selecting a day only opens the details panel and will not immediately create a booking."
            actions={
                <Link
                    href="/book"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                    <Plus className="h-4 w-4" />
                    New Booking
                </Link>
            }
        >
            <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card text-card-foreground shadow-[0_28px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
                <div className="relative border-b border-border bg-muted/40 p-4 sm:p-6">
                    <button
                        type="button"
                        onClick={() => goToMonth(addMonth(month, -1))}
                        className="absolute left-4 top-5 grid h-11 w-11 place-items-center border border-border bg-background/70 text-foreground transition hover:-translate-x-0.5 hover:border-primary/40 hover:bg-primary/10 sm:left-6"
                        aria-label="Previous month"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="mx-auto max-w-xl px-14 text-center">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-muted-foreground">Calendar</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-4xl">
                            {monthLabel(month)}
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted-foreground sm:text-sm">
                            Tap a date to view simple availability details. Color fills show the current day status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => goToMonth(addMonth(month, 1))}
                        className="absolute right-4 top-5 grid h-11 w-11 place-items-center border border-border bg-background/70 text-foreground transition hover:translate-x-0.5 hover:border-primary/40 hover:bg-primary/10 sm:right-6"
                        aria-label="Next month"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {[
                            ['Available', statusCounts.available, 'bg-emerald-500'],
                            ['Limited', statusCounts.limited, 'bg-yellow-500'],
                            ['Reserved', statusCounts.reserved, 'bg-amber-500'],
                            ['Public', statusCounts.public, 'bg-sky-500'],
                            ['Unavailable', statusCounts.unavailable, 'bg-rose-500'],
                        ].map(([label, count, dot]) => (
                            <span
                                key={String(label)}
                                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background/70 px-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-muted-foreground"
                            >
                                <i className={cx('h-2.5 w-2.5 rounded-full', String(dot))} />
                                {label}
                                <b className="font-black text-foreground">{count}</b>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_23rem]">
                    <div className="overflow-x-auto p-3 sm:p-5">
                        <div className="min-w-[42rem] overflow-hidden">
                            <div className="grid grid-cols-7 gap-2">
                                {weekLabels.map((label) => (
                                    <div
                                        key={label}
                                        className="px-2 py-3 text-center text-[0.68rem] font-black uppercase tracking-[0.24em] text-muted-foreground"
                                    >
                                        {label}
                                    </div>
                                ))}

                                {grid.map((day) => {
                                    const dayAvailability = availability[day.key];
                                    const tone = dayTone(dayAvailability);
                                    const selected = day.key === selectedDate;

                                    return (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => setSelectedDate(day.key)}
                                            className={cx(
                                                'group relative min-h-[5.5rem] overflow-hidden border bg-background/70 p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_40px_rgba(0,0,0,0.10)] dark:bg-white/[0.035] sm:min-h-[6.15rem]',
                                                tone.border,
                                                !day.current && 'opacity-40',
                                                selected && cx('z-10 bg-background shadow-[0_0_0_1px_rgba(180,140,80,0.20),0_24px_65px_rgba(0,0,0,0.16)] dark:bg-white/[0.07]', tone.selectedBorder),
                                                day.today && !selected && 'ring-1 ring-inset ring-primary/35',
                                            )}
                                            aria-label={`${fullDateLabel(day.key)} ${dayStatus(dayAvailability)}`}
                                        >
                                            <span className={cx('pointer-events-none absolute inset-0 transition duration-300', tone.fill)} />

                                            <span className="relative z-10 flex h-full min-h-[4.4rem] items-start justify-between">
                                                <strong className={cx('text-lg font-black tracking-[-0.03em]', day.current ? 'text-foreground' : 'text-muted-foreground')}>
                                                    {day.number}
                                                </strong>

                                                {selected ? (
                                                    <span className={cx('rounded-full px-2 py-1 text-[0.56rem] font-black uppercase tracking-[0.12em]', tone.badge)}>
                                                        Selected
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <aside className="border-t border-border bg-muted/30 p-4 sm:p-5 xl:border-l xl:border-t-0">
                        <div className="rounded-[1.2rem] border border-border bg-card p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                            <p className="text-[0.66rem] font-black uppercase tracking-[0.28em] text-muted-foreground">Selected Date</p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">{fullDateLabel(selectedDate)}</h3>

                            <div className={cx('mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em]', selectedTone.badge)}>
                                <span className={cx('h-2.5 w-2.5 rounded-full', selectedTone.dot)} />
                                {selectedStatus}
                            </div>

                            <p className="mt-4 text-sm leading-7 text-muted-foreground">{dayStatusDescription(selectedAvailability)}</p>

                            <div className="mt-5 grid gap-2">
                                {(['AM', 'PM', 'EVE'] as const).map((block) => {
                                    const available = blockAvailable(selectedAvailability, block);

                                    return (
                                        <div key={block} className="flex items-center justify-between gap-3 border border-border bg-background/70 px-3 py-3">
                                            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                                                <Clock3 className="h-4 w-4 text-primary" />
                                                {block === 'AM' ? 'AM Block' : block === 'PM' ? 'PM Block' : 'Evening'}
                                            </span>

                                            <strong className={cx('text-xs font-black uppercase tracking-[0.13em]', available ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200')}>
                                                {available ? 'Available' : 'Not Available'}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 grid gap-2">
                                <p className="text-[0.66rem] font-black uppercase tracking-[0.22em] text-muted-foreground">Small Details</p>

                                {selectedEvents.length > 0 ? (
                                    selectedEvents.map((event, index) => (
                                        <div
                                            key={`${event.id ?? event.title ?? index}`}
                                            className={cx('rounded-xl border px-3 py-3 text-sm', eventStatusTone(event.status))}
                                        >
                                            <div className="flex items-start gap-2">
                                                {event.kind === 'block' ? <LockKeyhole className="mt-0.5 h-4 w-4" /> : <CalendarDays className="mt-0.5 h-4 w-4" />}
                                                <div className="min-w-0">
                                                    <strong className="block truncate font-bold">{eventLabel(event)}</strong>
                                                    <span className="mt-1 inline-flex items-center gap-1 text-xs opacity-75">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {event.area || event.block || 'BCCC'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-border bg-background/70 px-3 py-3 text-sm leading-6 text-muted-foreground">
                                        No visible client calendar item on this date.
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 flex flex-col gap-2">
                                {selectedStatus === 'Unavailable' ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-muted px-4 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground"
                                    >
                                        <LockKeyhole className="h-4 w-4" />
                                        Booking Not Available
                                    </button>
                                ) : (
                                    <Link
                                        href={`/book?date=${selectedDate}`}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Use This Date
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() => goToMonth(dateKey(new Date()).slice(0, 7))}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Back to Current Month
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </BookingRolePageShell>
    );
}
