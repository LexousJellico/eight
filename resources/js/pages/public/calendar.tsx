import PublicLayout from '@/layouts/public-layout';
import {
    addMonths,
    buildMonthWeeks,
    cx,
    dateKey,
    deriveDayStatus,
    fallbackVenues,
    getPublicCalendarMonth,
    longDate,
    monthKeyFromDate,
    monthLabel,
    normalizeBlocks,
    statusDescription,
    statusDot,
    statusLabel,
    todayKey,
    type AvailabilityStatus,
    type PublicDayStatus,
} from '@/lib/public-availability';
import type { VenueOption } from '@/types/public-content';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    Clock3,
    Info,
    LoaderCircle,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    venueOptions?: VenueOption[];
};

type CalendarIndex = Record<string, PublicDayStatus>;

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function statusSurface(status: AvailabilityStatus | string, active = false) {
    const normalized = String(status || '').toLowerCase();

    if (active) {
        return 'border-[#b08d48] bg-[#2f2517] text-white shadow-[0_18px_55px_rgba(47,37,23,0.22)] dark:border-[#f1d89b] dark:bg-[#f1d89b] dark:text-[#17120b]';
    }

    if (normalized === 'blocked') {
        return 'border-rose-200/80 bg-rose-50/70 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-50';
    }

    if (normalized === 'private_booked' || normalized === 'private-booked') {
        return 'border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-50';
    }

    if (normalized === 'public_booked' || normalized === 'public-booked') {
        return 'border-sky-200/80 bg-sky-50/70 text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-50';
    }

    if (normalized === 'limited') {
        return 'border-blue-200/80 bg-blue-50/70 text-blue-900 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-50';
    }

    return 'border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-50';
}

function StatusIcon({ status }: { status: AvailabilityStatus | string }) {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'available') {
        return <CheckCircle2 className="h-4 w-4" />;
    }

    if (normalized === 'blocked' || normalized === 'private_booked' || normalized === 'private-booked') {
        return <ShieldAlert className="h-4 w-4" />;
    }

    return <CircleAlert className="h-4 w-4" />;
}

function LegendItem({ status }: { status: AvailabilityStatus }) {
    return (
        <div className="rounded-[1.1rem] border border-[#d9c7a6]/70 bg-white/68 p-3 dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex items-center gap-2">
                <span className={cx('h-2.5 w-2.5 rounded-full', statusDot(status))} />
                <strong className="text-sm text-[#21180d] dark:text-white">{statusLabel(status)}</strong>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#6e604c] dark:text-white/52">{statusDescription(status)}</p>
        </div>
    );
}

function CalendarDay({
    day,
    month,
    entry,
    selected,
    onSelect,
}: {
    day: Date;
    month: string;
    entry?: PublicDayStatus;
    selected: boolean;
    onSelect: () => void;
}) {
    const key = dateKey(day);
    const inMonth = key.startsWith(month);
    const isToday = key === todayKey();
    const status = deriveDayStatus(entry);
    const blocks = normalizeBlocks(entry?.blocks);
    const unavailableCount = blocks.filter((block) => block.is_available === false).length;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cx(
                'group relative min-h-[5.8rem] rounded-[1rem] border p-2.5 text-left transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#b08d48]/18',
                statusSurface(status, selected),
                !inMonth && 'opacity-35',
            )}
            aria-label={`${key} ${statusLabel(status)}`}
        >
            <div className="flex items-start justify-between gap-2">
                <span
                    className={cx(
                        'grid h-8 w-8 place-items-center rounded-full text-sm font-semibold',
                        selected
                            ? 'bg-white/14 text-white dark:bg-[#17120b]/8 dark:text-[#17120b]'
                            : isToday
                              ? 'bg-[#2f2517] text-white dark:bg-white dark:text-[#17120b]'
                              : 'bg-white/62 text-[#21180d] dark:bg-white/10 dark:text-white',
                    )}
                >
                    {day.getDate()}
                </span>
                <span className={cx('mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-white/60 dark:ring-black/20', statusDot(status))} />
            </div>

            <p className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.16em] opacity-80">{statusLabel(status)}</p>
            <p className="mt-1 text-[11px] leading-4 opacity-70">
                {unavailableCount > 0 ? `${unavailableCount} time block${unavailableCount > 1 ? 's' : ''} affected` : 'No listed conflict'}
            </p>

            {entry?.event_titles?.length ? (
                <p className="mt-1 line-clamp-1 text-[10px] font-semibold opacity-70">{entry.event_titles[0]}</p>
            ) : null}
        </button>
    );
}

function SelectedDayDetails({ day }: { day: PublicDayStatus | null }) {
    const status = deriveDayStatus(day);
    const blocks = normalizeBlocks(day?.blocks);

    return (
        <aside className="rounded-[1.65rem] border border-[#d9c7a6]/70 bg-white/82 p-5 shadow-[0_24px_70px_rgba(47,37,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#f7f0e3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#9d7b3d] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                <CalendarDays className="h-3.5 w-3.5" />
                Date Details
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#21180d] dark:text-white">
                {day?.date ? longDate(day.date) : 'Select a date'}
            </h2>

            <div className={cx('mt-4 rounded-[1.2rem] border p-4', statusSurface(status))}>
                <span className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]">
                    <StatusIcon status={status} />
                    {statusLabel(status)}
                </span>
                <p className="mt-3 text-sm leading-7 opacity-78">
                    {day?.description || statusDescription(status)}
                </p>
                {day?.note ? <p className="mt-2 text-xs leading-6 opacity-68">{day.note}</p> : null}
            </div>

            <div className="mt-4 grid gap-2">
                {blocks.map((block) => (
                    <div key={String(block.key)} className="flex items-center justify-between rounded-[0.95rem] border border-[#d9c7a6]/60 bg-[#f9f4ea]/72 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.045]">
                        <div>
                            <strong className="text-[#21180d] dark:text-white">{block.label || block.key}</strong>
                            <p className="text-xs text-[#6e604c] dark:text-white/46">{block.from} – {block.to}</p>
                        </div>
                        <span className={cx('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]', block.is_available === false ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-100' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100')}>
                            {block.is_available === false ? 'Not open' : 'Open'}
                        </span>
                    </div>
                ))}
            </div>

            {day?.event_titles?.length ? (
                <div className="mt-4 rounded-[1.1rem] border border-[#d9c7a6]/70 bg-[#f7f0e3]/70 p-4 dark:border-white/10 dark:bg-white/[0.045]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">Listed activity</p>
                    <ul className="mt-2 space-y-1 text-sm text-[#21180d] dark:text-white/78">
                        {day.event_titles.slice(0, 4).map((title) => <li key={title}>{title}</li>)}
                    </ul>
                </div>
            ) : null}

            <div className="mt-4 rounded-[1.1rem] border border-[#d9c7a6]/70 bg-white/55 p-4 text-xs leading-6 text-[#6e604c] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
                <Info className="mb-2 h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                This public calendar is for quick viewing only. Exact booking validation happens inside the reservation form using the selected package, areas, ingress/egress, and time blocks.
            </div>
        </aside>
    );
}

export default function PublicCalendar({ venueOptions = [] }: Props) {
    const venues = venueOptions.length ? venueOptions : fallbackVenues;
    const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
    const [venue, setVenue] = useState(() => venues[0]?.value ?? 'FULL HALL');
    const [calendar, setCalendar] = useState<CalendarIndex>({});
    const [selectedDate, setSelectedDate] = useState(() => todayKey());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const weeks = useMemo(() => buildMonthWeeks(month), [month]);
    const selectedDay = calendar[selectedDate] ?? {
        date: selectedDate,
        status: 'available',
        title: 'No listed conflict',
        description: statusDescription('available'),
        note: '',
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        getPublicCalendarMonth({ month, venue })
            .then((payload) => {
                if (!active) return;
                const next: CalendarIndex = {};
                (payload.days ?? []).forEach((day) => {
                    next[day.date] = day;
                });
                setCalendar(next);
            })
            .catch((exception: Error) => {
                if (!active) return;
                setError(exception.message || 'Unable to load calendar.');
                setCalendar({});
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [month, venue]);

    return (
        <PublicLayout>
            <Head title="Public Calendar" />

            <main className="min-h-screen bg-[#f7f0e3] text-[#21180d] dark:bg-[#0f0d09] dark:text-white">
                <section className="public-container pt-32 pb-12">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/80 bg-white/72 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#9d7b3d] shadow-sm dark:border-white/10 dark:bg-white/[0.055] dark:text-[#f1d89b]">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Public Calendar
                            </div>

                            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.075em] text-[#21180d] dark:text-white md:text-7xl">
                                        Simple date status for BCCC availability.
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6e604c] dark:text-white/56">
                                        Tap a date to view its quick status. Booking-specific package validation is handled inside the reservation form.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-3 rounded-[1.4rem] border border-[#d9c7a6]/70 bg-white/68 p-3 shadow-[0_20px_65px_rgba(47,37,23,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] md:grid-cols-[minmax(0,1fr)_auto]">
                                <label className="flex items-center gap-3 rounded-[1rem] border border-[#d9c7a6]/70 bg-[#fdfaf4]/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.045]">
                                    <Search className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    <select value={venue} onChange={(event) => setVenue(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none dark:text-white">
                                        {venues.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex items-center justify-between gap-2 rounded-[1rem] border border-[#d9c7a6]/70 bg-[#fdfaf4]/80 p-1.5 dark:border-white/10 dark:bg-white/[0.045]">
                                    <button type="button" onClick={() => setMonth((current) => addMonths(current, -1))} className="grid h-10 w-10 place-items-center rounded-full text-[#9d7b3d] transition hover:bg-[#f4ead8] dark:text-[#f1d89b] dark:hover:bg-white/10">
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <strong className="min-w-[9rem] text-center text-sm tracking-[-0.02em] text-[#21180d] dark:text-white">{monthLabel(month)}</strong>
                                    <button type="button" onClick={() => setMonth((current) => addMonths(current, 1))} className="grid h-10 w-10 place-items-center rounded-full text-[#9d7b3d] transition hover:bg-[#f4ead8] dark:text-[#f1d89b] dark:hover:bg-white/10">
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {error ? (
                                <div className="mt-4 rounded-[1.1rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
                                    {error}
                                </div>
                            ) : null}

                            <div className="mt-5 rounded-[1.5rem] border border-[#d9c7a6]/70 bg-white/72 p-3 shadow-[0_24px_80px_rgba(47,37,23,0.10)] dark:border-white/10 dark:bg-white/[0.055]">
                                <div className="grid grid-cols-7 gap-2 px-1 pb-2">
                                    {weekdayLabels.map((day) => <span key={day} className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">{day}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {weeks.flat().map((day) => {
                                        const key = dateKey(day);
                                        return (
                                            <CalendarDay
                                                key={key}
                                                day={day}
                                                month={month}
                                                entry={calendar[key]}
                                                selected={selectedDate === key}
                                                onSelect={() => setSelectedDate(key)}
                                            />
                                        );
                                    })}
                                </div>
                                {loading ? (
                                    <div className="mt-3 flex items-center justify-center gap-2 rounded-[1rem] bg-[#f7f0e3]/80 py-3 text-sm text-[#6e604c] dark:bg-white/[0.045] dark:text-white/50">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Refreshing calendar status...
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                <LegendItem status="available" />
                                <LegendItem status="limited" />
                                <LegendItem status="public_booked" />
                                <LegendItem status="private_booked" />
                                <LegendItem status="blocked" />
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-28">
                            <SelectedDayDetails day={selectedDay} />
                            <div className="mt-4 rounded-[1.4rem] border border-[#d9c7a6]/70 bg-white/68 p-4 text-sm leading-7 text-[#6e604c] dark:border-white/10 dark:bg-white/[0.055] dark:text-white/52">
                                <div className="flex items-center gap-2 font-semibold text-[#21180d] dark:text-white">
                                    <Clock3 className="h-4 w-4 text-[#9d7b3d] dark:text-[#f1d89b]" />
                                    Booking rule reminder
                                </div>
                                <p className="mt-2">Evening is no longer selected alone. It is activated only as additional hours after PM or Whole Day inside the booking form.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
