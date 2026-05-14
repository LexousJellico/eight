import {
    addMonths,
    blockIsOpen,
    blockOrder,
    blockQueryHref,
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
    normalizeStatus,
    postAvailabilityCheck,
    publicEventTypeOptions,
    statusDescription,
    statusDot,
    statusLabel,
    statusTone,
    todayKey,
    type AvailabilityStatus,
    type BlockKey,
    type PublicDayStatus,
} from '@/lib/public-availability';
import PublicLayout from '@/layouts/public-layout';
import type { VenueOption } from '@/types/public-content';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    LoaderCircle,
    MapPin,
    Sparkles,
    Users,
    XCircle,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

type Props = {
    venueOptions?: VenueOption[];
};

function StatusIcon({ status }: { status: AvailabilityStatus | string }) {
    const normalized = normalizeStatus(status);

    if (normalized === 'available') {
        return <CheckCircle2 className="h-4 w-4" />;
    }

    if (normalized === 'limited' || normalized === 'public_booked') {
        return <CircleAlert className="h-4 w-4" />;
    }

    return <XCircle className="h-4 w-4" />;
}

function PanelField({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="block rounded-[1.1rem] border border-[#d9c7a6]/70 bg-white/82 px-3 py-2.5 shadow-[0_12px_30px_rgba(47,37,23,0.06)] transition focus-within:border-[#b08d48] focus-within:ring-4 focus-within:ring-[#b08d48]/12 dark:border-white/10 dark:bg-white/7">
            <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                {icon}
                {label}
            </span>
            {children}
        </label>
    );
}

function LegendItem({ status }: { status: AvailabilityStatus }) {
    return (
        <div className="rounded-[1rem] border border-[#d9c7a6]/70 bg-white/65 p-3 dark:border-white/10 dark:bg-white/7">
            <div className="flex items-center gap-2">
                <span className={cx('h-2.5 w-2.5 rounded-full', statusDot(status))} />
                <span className="text-sm font-semibold text-[#21180d] dark:text-white">
                    {statusLabel(status)}
                </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#6e604c] dark:text-white/50">
                {statusDescription(status)}
            </p>
        </div>
    );
}

function DayCell({
    day,
    month,
    selected,
    today,
    entry,
    onSelect,
}: {
    day: Date;
    month: string;
    selected: boolean;
    today: boolean;
    entry?: PublicDayStatus | null;
    onSelect: () => void;
}) {
    const key = dateKey(day);
    const inMonth = key.startsWith(month);
    const status = deriveDayStatus(entry);
    const blocks = normalizeBlocks(entry?.blocks);

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cx(
                'group min-h-[8.4rem] rounded-[1.15rem] border p-2.5 text-left transition duration-300 hover:-translate-y-0.5',
                selected
                    ? 'border-[#b08d48] bg-[#2f2517] text-white shadow-[0_18px_44px_rgba(47,37,23,0.24)] dark:border-white dark:bg-white dark:text-[#17120b]'
                    : 'border-[#d9c7a6]/70 bg-white/70 text-[#21180d] hover:border-[#b08d48]/70 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/10',
                !inMonth && 'opacity-38',
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span
                    className={cx(
                        'grid h-8 w-8 place-items-center rounded-full text-sm font-bold',
                        today && !selected
                            ? 'bg-[#f4ead8] text-[#9d7b3d] dark:bg-white/10 dark:text-[#f1d89b]'
                            : selected
                              ? 'bg-white/14 text-white dark:bg-[#17120b]/8 dark:text-[#17120b]'
                              : 'bg-[#f7f0e3] text-[#6e604c] dark:bg-white/7 dark:text-white/70',
                    )}
                >
                    {day.getDate()}
                </span>

                <span className={cx('h-2.5 w-2.5 rounded-full', selected ? 'bg-[#f1d89b] dark:bg-[#9d7b3d]' : statusDot(status))} />
            </div>

            <p className={cx('mt-2 text-[10px] font-bold uppercase tracking-[0.15em]', selected ? 'text-white/70 dark:text-[#17120b]/60' : 'text-[#9d7b3d] dark:text-[#f1d89b]')}>
                {statusLabel(status)}
            </p>

            <div className="mt-2 grid gap-1">
                {blocks.map((block) => (
                    <div
                        key={String(block.key)}
                        className={cx(
                            'flex items-center justify-between gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold',
                            selected
                                ? 'bg-white/12 text-white/80 dark:bg-[#17120b]/8 dark:text-[#17120b]/70'
                                : block.is_available
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-100',
                        )}
                    >
                        <span>{String(block.key)}</span>
                        <span>{block.is_available ? 'Open' : 'Closed'}</span>
                    </div>
                ))}
            </div>

            {entry?.event_titles?.length ? (
                <p className={cx('mt-2 line-clamp-1 text-[10px]', selected ? 'text-white/70 dark:text-[#17120b]/60' : 'text-[#6e604c] dark:text-white/46')}>
                    {entry.event_titles[0]}
                </p>
            ) : null}
        </button>
    );
}

function SelectedDayPanel({
    day,
    venue,
    eventType,
    guests,
    selectedBlock,
    setSelectedBlock,
    loading,
}: {
    day: PublicDayStatus | null;
    venue: string;
    eventType: string;
    guests: string;
    selectedBlock: BlockKey;
    setSelectedBlock: (block: BlockKey) => void;
    loading: boolean;
}) {
    const status = deriveDayStatus(day);
    const blocks = normalizeBlocks(day?.blocks);
    const selectedBlockOpen = blockIsOpen(day, selectedBlock);
    const canProceed = Boolean(day?.date) && day?.can_proceed !== false && selectedBlockOpen && status !== 'blocked';

    return (
        <aside className="overflow-hidden rounded-[1.75rem] border border-[#d9c7a6]/70 bg-white/84 p-5 shadow-[0_24px_70px_rgba(47,37,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#f7f0e3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                <CalendarDays className="h-3.5 w-3.5" />
                Selected Date
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                {day?.date ? longDate(day.date) : 'Select a date'}
            </h2>

            <div className={cx('mt-4 rounded-[1.25rem] border p-4', statusTone(status))}>
                <span className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                    <StatusIcon status={status} />
                    {statusLabel(status)}
                </span>

                <h3 className="mt-3 text-lg font-semibold tracking-[-0.035em]">
                    {loading ? 'Checking availability' : day?.title || statusLabel(status)}
                </h3>

                <p className="mt-2 text-sm leading-7 opacity-80">
                    {loading ? 'Loading selected date details...' : day?.description || statusDescription(status)}
                </p>

                {day?.note ? (
                    <p className="mt-2 text-sm leading-7 opacity-80">
                        {day.note}
                    </p>
                ) : null}
            </div>

            <div className="mt-4 grid gap-2">
                {blocks.map((block) => {
                    const key = String(block.key).toUpperCase() as BlockKey;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedBlock(key)}
                            disabled={!block.is_available}
                            className={cx(
                                'rounded-[1.15rem] border p-3 text-left transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
                                selectedBlock === key
                                    ? 'border-[#b08d48] bg-[#2f2517] text-white shadow-[0_16px_40px_rgba(47,37,23,0.18)] dark:border-white dark:bg-white dark:text-[#17120b]'
                                    : 'border-[#d9c7a6]/70 bg-[#f7f0e3]/74 text-[#4a3b27] dark:border-white/10 dark:bg-white/7 dark:text-white/68',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.16em]">
                                        {block.key} · {block.label}
                                    </p>
                                    <p className="mt-1 text-xs opacity-70">
                                        {block.from} – {block.to}
                                    </p>
                                </div>

                                <span className="text-xs font-bold uppercase tracking-[0.14em]">
                                    {block.is_available ? 'Open' : 'Closed'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {day?.venue_capacity_message ? (
                <div className="mt-4 flex items-start gap-2 rounded-[1.15rem] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                    {day.venue_capacity_message}
                </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3">
                {canProceed ? (
                    <Link
                        href={blockQueryHref(day!.date, selectedBlock, venue, eventType, guests)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.20)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                    >
                        Continue to Booking
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <div className="flex items-start gap-2 rounded-[1.15rem] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        Select an open block before continuing. Blocked dates and closed blocks cannot proceed directly.
                    </div>
                )}

                <Link
                    href="/contact"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-5 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                >
                    Contact Office
                </Link>
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-[#d9c7a6]/70 bg-[#f7f0e3]/74 p-4 dark:border-white/10 dark:bg-white/7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">
                    Public Calendar Notes
                </p>

                {day?.event_titles?.length ? (
                    <div className="mt-3 text-sm leading-6 text-[#6e604c] dark:text-white/58">
                        <p className="font-semibold text-[#21180d] dark:text-white">Visible Events</p>
                        <ul className="mt-1 space-y-1">
                            {day.event_titles.map((title) => (
                                <li key={title}>• {title}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {day?.calendar_blocks?.length ? (
                    <div className="mt-3 text-sm leading-6 text-[#6e604c] dark:text-white/58">
                        <p className="font-semibold text-[#21180d] dark:text-white">Calendar Blocks</p>
                        <ul className="mt-1 space-y-1">
                            {day.calendar_blocks.map((block, index) => (
                                <li key={`${block.title || 'block'}-${index}`}>
                                    • {block.title || 'Calendar block'}
                                    {block.area ? ` — ${block.area}` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {!day?.event_titles?.length && !day?.calendar_blocks?.length ? (
                    <p className="mt-3 text-sm leading-6 text-[#6e604c] dark:text-white/58">
                        No public event or public calendar note is attached to the selected date.
                    </p>
                ) : null}
            </div>
        </aside>
    );
}

export default function CalendarPage({ venueOptions = [] }: Props) {
    const today = todayKey();
    const options = venueOptions.length > 0 ? venueOptions : fallbackVenues;

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const venueFromQuery = searchParams?.get('venue') || '';

    const [currentMonth, setCurrentMonth] = useState(() => monthKeyFromDate(new Date()));
    const [selectedVenue, setSelectedVenue] = useState(venueFromQuery || options[0]?.value || 'FULL HALL');
    const [eventType, setEventType] = useState('');
    const [guests, setGuests] = useState('');
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedBlock, setSelectedBlock] = useState<BlockKey>('AM');
    const [monthData, setMonthData] = useState<Record<string, PublicDayStatus>>({});
    const [dayStatus, setDayStatus] = useState<PublicDayStatus | null>(null);
    const [loadingMonth, setLoadingMonth] = useState(false);
    const [loadingDay, setLoadingDay] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const weeks = useMemo(() => buildMonthWeeks(currentMonth), [currentMonth]);
    const selectedMonthEntry = monthData[selectedDate] ?? null;
    const selectedVenueMeta = options.find((item) => item.value === selectedVenue);
    const selectedResolvedDay = dayStatus || selectedMonthEntry;

    useEffect(() => {
        let mounted = true;

        async function loadMonth() {
            if (!selectedVenue) {
                return;
            }

            setLoadingMonth(true);
            setErrorMessage('');

            try {
                const payload = await getPublicCalendarMonth({
                    month: currentMonth,
                    venue: selectedVenue,
                });

                if (!mounted) {
                    return;
                }

                const map: Record<string, PublicDayStatus> = {};

                (payload.days || []).forEach((item) => {
                    if (item?.date) {
                        map[item.date] = {
                            ...item,
                            status: normalizeStatus(item.status),
                        };
                    }
                });

                setMonthData(map);
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setMonthData({});
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load calendar month.');
            } finally {
                if (mounted) {
                    setLoadingMonth(false);
                }
            }
        }

        loadMonth();

        return () => {
            mounted = false;
        };
    }, [currentMonth, selectedVenue]);

    useEffect(() => {
        if (selectedDate.startsWith(`${currentMonth}-`)) {
            return;
        }

        if (today.startsWith(`${currentMonth}-`)) {
            setSelectedDate(today);
            return;
        }

        setSelectedDate(`${currentMonth}-01`);
    }, [currentMonth, selectedDate, today]);

    useEffect(() => {
        let mounted = true;

        async function loadDay() {
            if (!selectedVenue || !selectedDate) {
                return;
            }

            setLoadingDay(true);
            setErrorMessage('');

            try {
                const payload = await postAvailabilityCheck({
                    date: selectedDate,
                    start_date: selectedDate,
                    end_date: selectedDate,
                    date_from: selectedDate,
                    date_to: selectedDate,
                    venue: selectedVenue,
                    event_type: eventType || undefined,
                    guests: guests ? Number(guests) : undefined,
                });

                if (!mounted) {
                    return;
                }

                const next = Array.isArray(payload?.results)
                    ? ((payload.results[0] ?? null) as PublicDayStatus | null)
                    : (payload as PublicDayStatus);

                setDayStatus(
                    next
                        ? {
                              ...next,
                              status: normalizeStatus(next.status),
                          }
                        : null,
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setDayStatus(null);
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load selected date.');
            } finally {
                if (mounted) {
                    setLoadingDay(false);
                }
            }
        }

        loadDay();

        return () => {
            mounted = false;
        };
    }, [selectedDate, selectedVenue, eventType, guests]);

    useEffect(() => {
        const blocks = normalizeBlocks(dayStatus?.blocks || selectedMonthEntry?.blocks);
        const firstOpen = blocks.find((block) => block.is_available && blockOrder.includes(String(block.key).toUpperCase() as BlockKey));

        setSelectedBlock((firstOpen?.key as BlockKey) || 'AM');
    }, [dayStatus, selectedMonthEntry]);

    function handleInspectorSubmit(event: FormEvent) {
        event.preventDefault();

        if (!selectedVenue) {
            setErrorMessage('Please select a venue area.');
        }
    }

    return (
        <PublicLayout>
            <Head title="Public Availability Calendar" />

            <section className="relative overflow-hidden bg-[#130f09] px-4 pb-16 pt-[8.5rem] text-white sm:px-6 lg:px-8">
                <div className="absolute inset-0">
                    <img
                        src="/marketing/images/facilities/darkvip.jpg"
                        alt=""
                        className="h-full w-full object-cover opacity-48"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#120d06] via-[#120d06]/82 to-[#120d06]/44" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f5ef] to-transparent dark:from-[#0d0f12]" />
                </div>

                <div className="relative mx-auto max-w-[1920px]">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f1d89b] backdrop-blur-xl">
                            <CalendarDays className="h-4 w-4" />
                            Public Availability Calendar
                        </div>

                        <h1 className="mt-6 font-serif text-[clamp(3rem,6vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
                            Read the venue schedule before booking.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
                            Check AM, PM, and evening availability by venue area. Public events are shown, while private reservations remain protected.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-[#f8f5ef] px-4 py-10 dark:bg-[#0d0f12] sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-[1920px] gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
                    <div className="space-y-5">
                        <form
                            onSubmit={handleInspectorSubmit}
                            className="rounded-[1.75rem] border border-[#d9c7a6]/70 bg-white/84 p-4 shadow-[0_24px_70px_rgba(47,37,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]"
                        >
                            <div className="grid gap-3 lg:grid-cols-[1.3fr_1.2fr_0.9fr_auto]">
                                <PanelField label="Venue Area" icon={<MapPin className="h-3.5 w-3.5" />}>
                                    <select
                                        value={selectedVenue}
                                        onChange={(event) => setSelectedVenue(event.target.value)}
                                        className="h-9 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                                    >
                                        {options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </PanelField>

                                <PanelField label="Event Type" icon={<Sparkles className="h-3.5 w-3.5" />}>
                                    <select
                                        value={eventType}
                                        onChange={(event) => setEventType(event.target.value)}
                                        className="h-9 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                                    >
                                        <option value="">Any event type</option>
                                        {publicEventTypeOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </PanelField>

                                <PanelField label="Guests" icon={<Users className="h-3.5 w-3.5" />}>
                                    <input
                                        type="number"
                                        min="1"
                                        value={guests}
                                        onChange={(event) => setGuests(event.target.value)}
                                        className="h-9 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none placeholder:text-[#85755d] dark:text-white dark:placeholder:text-white/42"
                                        placeholder="Estimated"
                                    />
                                </PanelField>

                                <button
                                    type="submit"
                                    className="inline-flex min-h-[4.5rem] items-center justify-center gap-2 rounded-[1.1rem] bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.20)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                                >
                                    Refresh
                                </button>
                            </div>

                            {selectedVenueMeta ? (
                                <div className="mt-3 text-xs leading-6 text-[#6e604c] dark:text-white/58">
                                    {selectedVenueMeta.label}
                                    {selectedVenueMeta.category ? ` · ${selectedVenueMeta.category}` : ''}
                                    {selectedVenueMeta.capacity ? ` · Capacity: ${selectedVenueMeta.capacity}` : ''}
                                </div>
                            ) : null}
                        </form>

                        <div className="rounded-[1.75rem] border border-[#d9c7a6]/70 bg-white/84 p-4 shadow-[0_24px_70px_rgba(47,37,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                        Monthly Availability
                                    </p>
                                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-[#21180d] dark:text-white">
                                        {monthLabel(currentMonth)}
                                    </h2>
                                    <p className="mt-2 text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                        Cells show overall day status. AM, PM, and EVE rows show specific block availability.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCurrentMonth(monthKeyFromDate(new Date()))}
                                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b08d48]/70 bg-[#f7f0e3] px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#9d7b3d] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]"
                                    >
                                        Today
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {errorMessage ? (
                                <div className="mt-4 flex items-start gap-2 rounded-[1.15rem] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    {errorMessage}
                                </div>
                            ) : null}

                            <div className="mt-5 grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-[#d9c7a6]/60 bg-[#f7f0e3]/70 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]"
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {loadingMonth ? (
                                <div className="mt-3 grid min-h-[28rem] place-items-center rounded-[1.35rem] border border-[#d9c7a6]/70 bg-[#f7f0e3]/60 text-center dark:border-white/10 dark:bg-white/7">
                                    <div>
                                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#9d7b3d] dark:text-[#f1d89b]" />
                                        <p className="mt-3 text-sm font-semibold text-[#6e604c] dark:text-white/58">
                                            Loading public calendar...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 grid grid-cols-7 gap-2">
                                    {weeks.flat().map((day) => {
                                        const key = dateKey(day);

                                        return (
                                            <DayCell
                                                key={key}
                                                day={day}
                                                month={currentMonth}
                                                selected={selectedDate === key}
                                                today={today === key}
                                                entry={monthData[key]}
                                                onSelect={() => setSelectedDate(key)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-5">
                            {(['available', 'limited', 'public_booked', 'private_booked', 'blocked'] as AvailabilityStatus[]).map((status) => (
                                <LegendItem key={status} status={status} />
                            ))}
                        </div>
                    </div>

                    <SelectedDayPanel
                        day={selectedResolvedDay}
                        venue={selectedVenue}
                        eventType={eventType}
                        guests={guests}
                        selectedBlock={selectedBlock}
                        setSelectedBlock={setSelectedBlock}
                        loading={loadingDay}
                    />
                </div>
            </section>
        </PublicLayout>
    );
}
