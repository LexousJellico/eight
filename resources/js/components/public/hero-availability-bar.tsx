import { BcccLogoLoader } from '@/components/shared/bccc-logo-loader';
import {
    blockMeta,
    cx,
    daysBetween,
    deriveDayStatus,
    formatRangeLabel,
    normalizeBlocks,
    normalizeStatus,
    postAvailabilityCheck,
    publicEventTypeOptions,
    rangeBookingHref,
    statusDescription,
    statusDot,
    statusLabel,
    statusTone,
    todayKey,
    type AvailabilityRangeResponse,
    type AvailabilityStatus,
    type PublicDayStatus,
} from '@/lib/public-availability';
import type { VenueOption } from '@/types/public-content';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    Clock3,
    LayoutGrid,
    LoaderCircle,
    Search,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type FormEvent, useMemo, useState } from 'react';

type Props = {
    venueOptions: VenueOption[];
};

const ease = [0.22, 1, 0.36, 1] as const;

function readableNumber(value?: number | null) {
    return Number(value ?? 0).toLocaleString('en-PH');
}

function asRangePayload(payload: unknown, form: {
    from: string;
    to: string;
    venue: string;
    eventType: string;
    guests: string;
}): AvailabilityRangeResponse {
    const raw = payload as Partial<AvailabilityRangeResponse> & Partial<PublicDayStatus>;

    if (Array.isArray(raw.results)) {
        return {
            mode: 'range',
            from: raw.from || form.from,
            to: raw.to || form.to,
            venue: raw.venue || form.venue,
            event_type: raw.event_type || form.eventType,
            guests: raw.guests || Number(form.guests),
            status: normalizeStatus(raw.status),
            title: raw.title || 'Availability checked',
            description: raw.description || 'The selected range was checked.',
            note: raw.note || raw.recommended_action || 'Review each day before continuing.',
            recommended_action: raw.recommended_action || null,
            can_proceed: raw.can_proceed !== false,
            days_count: raw.days_count || raw.results.length,
            available_days: raw.available_days,
            limited_days: raw.limited_days,
            blocked_days: raw.blocked_days,
            results: raw.results,
            event_titles: raw.event_titles || [],
            calendar_blocks: raw.calendar_blocks || [],
        };
    }

    const singleDay = payload as PublicDayStatus;
    const status = deriveDayStatus(singleDay);

    return {
        mode: 'range',
        from: singleDay.date || form.from,
        to: singleDay.date || form.to,
        date: singleDay.date || form.from,
        venue: singleDay.venue || form.venue,
        event_type: singleDay.event_type || form.eventType,
        guests: singleDay.guests || Number(form.guests),
        status,
        title: singleDay.title || statusLabel(status),
        description: singleDay.description || statusDescription(status),
        note: singleDay.note || 'Review the available time blocks before continuing.',
        recommended_action: singleDay.recommended_action || null,
        can_proceed: singleDay.can_proceed !== false,
        days_count: 1,
        available_days: status === 'available' ? 1 : 0,
        limited_days: status === 'limited' ? 1 : 0,
        blocked_days: status === 'blocked' || status === 'private_booked' ? 1 : 0,
        results: [singleDay],
        event_titles: singleDay.event_titles || [],
        calendar_blocks: singleDay.calendar_blocks || [],
    };
}

function FieldShell({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="group block rounded-[1.05rem] border border-[#d9c7a6]/70 bg-white/84 px-3 py-2.5 shadow-[0_12px_30px_rgba(47,37,23,0.06)] transition focus-within:border-[#b08d48] focus-within:ring-4 focus-within:ring-[#b08d48]/12 dark:border-white/10 dark:bg-white/7">
            <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                {icon}
                {label}
            </span>

            {children}
        </label>
    );
}

function ResultStatusIcon({ status }: { status: AvailabilityStatus | string }) {
    const normalized = normalizeStatus(status);

    if (normalized === 'available') {
        return <CheckCircle2 className="h-4 w-4" />;
    }

    if (normalized === 'limited' || normalized === 'public_booked') {
        return <CircleAlert className="h-4 w-4" />;
    }

    return <AlertTriangle className="h-4 w-4" />;
}

function DayResultCard({ day }: { day: PublicDayStatus }) {
    const status = deriveDayStatus(day);
    const blocks = normalizeBlocks(day.blocks);

    return (
        <article className="rounded-[1.15rem] border border-black/10 bg-white/74 p-3 dark:border-white/10 dark:bg-white/7">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        {day.date}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-[#21180d] dark:text-white">
                        {day.title || statusLabel(status)}
                    </h4>
                </div>

                <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]', statusTone(status))}>
                    <ResultStatusIcon status={status} />
                    {statusLabel(status)}
                </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#6e604c] dark:text-white/58">
                {day.description || statusDescription(status)}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {blocks.map((block) => (
                    <div
                        key={String(block.key)}
                        className={cx(
                            'rounded-xl border px-2.5 py-2 text-xs',
                            block.is_available
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100'
                                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100',
                        )}
                    >
                        <p className="font-bold uppercase tracking-[0.14em]">
                            {block.key} · {block.label}
                        </p>
                        <p className="mt-1 opacity-75">
                            {block.from} – {block.to}
                        </p>
                        <p className="mt-1 font-semibold">
                            {block.is_available ? 'Open' : block.reason || 'Closed'}
                        </p>
                    </div>
                ))}
            </div>

            {day.event_titles?.length ? (
                <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                    <p className="font-bold uppercase tracking-[0.16em]">Visible Events</p>
                    <ul className="mt-2 space-y-1">
                        {day.event_titles.map((title) => (
                            <li key={title}>• {title}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {day.calendar_blocks?.length ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    <p className="font-bold uppercase tracking-[0.16em]">Calendar Blocks</p>
                    <ul className="mt-2 space-y-1">
                        {day.calendar_blocks.map((block, index) => (
                            <li key={`${block.title || 'block'}-${index}`}>
                                • {block.title || 'Calendar block'}
                                {block.area ? ` — ${block.area}` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </article>
    );
}

function AvailabilityResultModal({
    open,
    loading,
    message,
    result,
    onClose,
}: {
    open: boolean;
    loading: boolean;
    message: string;
    result: AvailabilityRangeResponse | null;
    onClose: () => void;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-[999990] grid place-items-center bg-white/72 px-4 py-6 backdrop-blur-2xl dark:bg-slate-950/58"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={reduceMotion ? undefined : { opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.section
                        className="max-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-hidden rounded-[1.8rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/96 shadow-[0_30px_100px_rgba(47,37,23,0.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#101419]/96"
                        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)' }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)' }}
                        transition={{ duration: 0.28, ease }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#d9c7a6]/60 p-5 dark:border-white/10">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                    Availability Status
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                                    {loading ? 'Checking selected schedule' : result?.title || 'Availability Result'}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/70 text-[#2f2517] transition hover:bg-white dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                aria-label="Close availability result"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {loading ? (
                                <div className="grid min-h-[22rem] place-items-center text-center">
                                    <div>
                                        <BcccLogoLoader
                                            logoSrc="/marketing/images/logo/bccc-seal.png"
                                            label="Checking availability"
                                            showLabel={false}
                                            size="lg"
                                        />
                                        <h4 className="mt-5 text-xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                                            Checking availability
                                        </h4>
                                        <p className="mt-2 max-w-md text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                            {message || 'Please wait while the system reviews the selected range, venue area, and calendar blocks.'}
                                        </p>
                                    </div>
                                </div>
                            ) : message && !result ? (
                                <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                        <div>
                                            <h4 className="text-base font-semibold">Unable to complete the check</h4>
                                            <p className="mt-2 text-sm leading-7">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="space-y-5">
                                    <div className={cx('rounded-[1.35rem] border p-4', statusTone(result.status))}>
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <span className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                                                    <ResultStatusIcon status={result.status} />
                                                    {statusLabel(result.status)}
                                                </span>

                                                <h4 className="mt-3 text-xl font-semibold tracking-[-0.045em]">
                                                    {result.title}
                                                </h4>

                                                <p className="mt-2 text-sm leading-7 opacity-80">
                                                    {formatRangeLabel(result.from, result.to)} · {result.venue}
                                                </p>

                                                <p className="mt-2 text-sm leading-7 opacity-80">
                                                    {result.description}
                                                </p>

                                                {result.note ? (
                                                    <p className="mt-2 text-sm leading-7 opacity-80">
                                                        {result.note}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="grid min-w-[16rem] gap-2 rounded-[1.15rem] bg-white/55 p-3 text-sm dark:bg-white/7">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>Days checked</span>
                                                    <strong>{readableNumber(result.days_count || result.results.length)}</strong>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>Available</span>
                                                    <strong>{readableNumber(result.available_days)}</strong>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>Limited</span>
                                                    <strong>{readableNumber(result.limited_days)}</strong>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>Blocked/Reserved</span>
                                                    <strong>{readableNumber(result.blocked_days)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        {result.results.map((day) => (
                                            <DayResultCard key={day.date} day={day} />
                                        ))}
                                    </div>

                                    <div className="rounded-[1.35rem] border border-[#d9c7a6]/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/7">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                            Booking Summary
                                        </p>

                                        <p className="mt-2 text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                            Range: {formatRangeLabel(result.from, result.to)} · Area: {result.venue} · Event:{' '}
                                            {result.event_type || 'Not specified'} · Guests: {result.guests || 'Not specified'}
                                        </p>

                                        <p className="mt-2 text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                            {result.recommended_action || 'Review each date and available block before continuing.'}
                                        </p>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                            {result.can_proceed !== false ? (
                                                <Link
                                                    href={rangeBookingHref(result)}
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(47,37,23,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                                                >
                                                    Continue to Booking
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            ) : null}

                                            <Link
                                                href={`/calendar?venue=${encodeURIComponent(result.venue)}`}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-5 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                            >
                                                Open Full Calendar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.section>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

export default function HeroAvailabilityBar({ venueOptions }: Props) {
    const options = venueOptions.length > 0 ? venueOptions : [];
    const defaultVenue = options[0]?.value || '';

    const [dateFrom, setDateFrom] = useState(todayKey());
    const [dateTo, setDateTo] = useState(todayKey());
    const [eventType, setEventType] = useState('');
    const [venue, setVenue] = useState(defaultVenue);
    const [guests, setGuests] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [result, setResult] = useState<AvailabilityRangeResponse | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const selectedVenue = useMemo(
        () => options.find((item) => item.value === venue) ?? null,
        [venue, options],
    );

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!dateFrom || !dateTo || !eventType || !venue || !guests) {
            setValidationMessage('Please complete the date range, event type, area, and guest count.');
            return;
        }

        if (dateFrom > dateTo) {
            setValidationMessage('The end date must be the same as or later than the start date.');
            return;
        }

        const days = daysBetween(dateFrom, dateTo);

        if (days < 1) {
            setValidationMessage('Please select a valid date range.');
            return;
        }

        if (days > 14) {
            setValidationMessage('Please keep the quick-check range to 14 days or fewer.');
            return;
        }

        setLoading(true);
        setModalOpen(true);
        setResult(null);
        setValidationMessage('');
        setModalMessage('Checking selected date range and area...');

        try {
            const payload = await postAvailabilityCheck({
                date: dateFrom,
                start_date: dateFrom,
                end_date: dateTo,
                date_from: dateFrom,
                date_to: dateTo,
                venue,
                event_type: eventType,
                guests: Number(guests),
            });

            setResult(
                asRangePayload(payload, {
                    from: dateFrom,
                    to: dateTo,
                    venue,
                    eventType,
                    guests,
                }),
            );
            setModalMessage('');
        } catch (error) {
            setModalMessage(error instanceof Error ? error.message : 'Unable to check availability right now.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <section className="sticky bottom-0 z-[99960] -mt-2 border-y border-[#d9c7a6]/70 bg-[#fffaf0]/90 px-3 py-3 shadow-[0_-18px_70px_rgba(47,37,23,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#101419]/90 sm:px-4 lg:px-6">
                <div className="mx-auto w-full max-w-[1920px]">
                    <form
                        onSubmit={handleSubmit}
                        className="grid gap-2 xl:grid-cols-[1.1fr_1.1fr_1.35fr_1.35fr_0.85fr_auto]"
                    >
                        <FieldShell label="Date From" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => {
                                    const next = event.target.value;

                                    setDateFrom(next);

                                    if (!dateTo || next > dateTo) {
                                        setDateTo(next);
                                    }
                                }}
                                className="h-8 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                            />
                        </FieldShell>

                        <FieldShell label="Date To" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="h-8 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                            />
                        </FieldShell>

                        <FieldShell label="Event Type" icon={<Sparkles className="h-3.5 w-3.5" />}>
                            <select
                                value={eventType}
                                onChange={(event) => setEventType(event.target.value)}
                                className="h-8 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                            >
                                <option value="">Select type</option>
                                {publicEventTypeOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </FieldShell>

                        <FieldShell label="Venue Area" icon={<LayoutGrid className="h-3.5 w-3.5" />}>
                            <select
                                value={venue}
                                onChange={(event) => setVenue(event.target.value)}
                                className="h-8 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none dark:text-white"
                            >
                                <option value="">Select area</option>
                                {options.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </FieldShell>

                        <FieldShell label="Guests" icon={<Users className="h-3.5 w-3.5" />}>
                            <input
                                type="number"
                                min="1"
                                value={guests}
                                onChange={(event) => setGuests(event.target.value)}
                                placeholder="Estimated"
                                className="h-8 w-full bg-transparent text-sm font-semibold text-[#2f2517] outline-none placeholder:text-[#85755d] dark:text-white dark:placeholder:text-white/42"
                            />
                        </FieldShell>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex min-h-[4.65rem] items-center justify-center gap-2 rounded-[1.05rem] bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-[#17120b]"
                        >
                            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            {loading ? 'Checking' : 'Check'}
                        </button>
                    </form>

                    <div className="mt-2 flex flex-col gap-2 text-xs text-[#6e604c] dark:text-white/58 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            {selectedVenue ? (
                                <span>
                                    {selectedVenue.label}
                                    {selectedVenue.category ? ` • ${selectedVenue.category}` : ''}
                                    {selectedVenue.capacity ? ` • Capacity: ${selectedVenue.capacity}` : ''}
                                </span>
                            ) : (
                                <span>Select a venue area to begin checking availability.</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {blockOrderPreview.map((item) => (
                                <span key={item.key} className="inline-flex items-center gap-1 rounded-full border border-[#d9c7a6]/70 bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/7">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#9d7b3d] dark:bg-[#f1d89b]" />
                                    {item.key} {item.display}
                                </span>
                            ))}
                        </div>
                    </div>

                    {validationMessage ? (
                        <div className="mt-2 flex items-start gap-2 rounded-[1rem] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {validationMessage}
                        </div>
                    ) : null}
                </div>
            </section>

            <AvailabilityResultModal
                open={modalOpen}
                loading={loading}
                message={modalMessage}
                result={result}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}

const blockOrderPreview = [
    { key: 'AM', display: blockMeta.AM.display },
    { key: 'PM', display: blockMeta.PM.display },
    { key: 'EVE', display: blockMeta.EVE.display },
];
