import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, Phone, Star, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

type TourismRecord = {
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
    detailsText?: string | null;
    details_text?: string | null;

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

type Props = {
    items?: TourismRecord[];
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function truthy(value: unknown) {
    return value === true || value === 1 || value === '1' || value === 'true';
}

function hidden(value: unknown) {
    return value === false || value === 0 || value === '0' || value === 'false';
}

function safeString(value: unknown, fallback = '') {
    if (value === null || value === undefined) return fallback;
    return String(value);
}

function nameOf(item: TourismRecord) {
    return safeString(item.fullName || item.full_name || item.name || item.title, 'Tourism Member');
}

function designationOf(item: TourismRecord) {
    return safeString(item.designation || item.position || item.role, 'Tourism Office');
}

function officeOf(item: TourismRecord) {
    return safeString(item.officeSection || item.office_section, 'CTCAO');
}

function unitOf(item: TourismRecord) {
    return safeString(item.unitName || item.unit_name || item.teamLabel || item.team_label);
}

function teamOf(item: TourismRecord) {
    return safeString(item.teamLabel || item.team_label);
}

function reportsToOf(item: TourismRecord) {
    return safeString(item.reportsToName || item.reports_to_name);
}

function levelOf(item: TourismRecord) {
    return safeString(item.treeLevel || item.tree_level);
}

function bioOf(item: TourismRecord) {
    return safeString(item.shortBio || item.short_bio || item.bio || item.description);
}

function photoOf(item: TourismRecord) {
    return safeString(
        item.photo ||
            item.photoUrl ||
            item.photo_url ||
            item.photoPath ||
            item.photo_path ||
            item.imageUrl ||
            item.image_url ||
            item.imagePath ||
            item.image_path ||
            item.image,
    );
}

function isFeatured(item: TourismRecord) {
    return truthy(item.featured) || truthy(item.is_featured);
}

function isVisible(item: TourismRecord) {
    if (hidden(item.active) || hidden(item.is_active)) return false;
    return true;
}

function sortOrderOf(item: TourismRecord) {
    const value = Number(item.sortOrder ?? item.sort_order ?? 9999);
    return Number.isFinite(value) ? value : 9999;
}

function detailsOf(item: TourismRecord) {
    const raw = item.details ?? item.detailsText ?? item.details_text;

    if (Array.isArray(raw)) {
        return raw.map((line) => safeString(line).trim()).filter(Boolean);
    }

    if (typeof raw === 'string') {
        return raw
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeMembers(items: TourismRecord[]) {
    return items
        .filter(isVisible)
        .sort((a, b) => {
            if (isFeatured(a) !== isFeatured(b)) return isFeatured(a) ? -1 : 1;

            const levelA = Number(levelOf(a) || 99);
            const levelB = Number(levelOf(b) || 99);

            if (levelA !== levelB) return levelA - levelB;

            const sortA = sortOrderOf(a);
            const sortB = sortOrderOf(b);

            if (sortA !== sortB) return sortA - sortB;

            return nameOf(a).localeCompare(nameOf(b));
        });
}

function mod(value: number, total: number) {
    return ((value % total) + total) % total;
}

function signedOffset(index: number, active: number, total: number) {
    const raw = index - active;

    if (raw > total / 2) return raw - total;
    if (raw < -total / 2) return raw + total;

    return raw;
}

function cardState(index: number, active: number, total: number, reducedMotion: boolean) {
    const offset = signedOffset(index, active, total);

    const states: Record<number, { x: number; y: number; scale: number; opacity: number; zIndex: number; filter: string }> = {
        [-3]: { x: -500, y: 42, scale: 0.54, opacity: 0.12, zIndex: 2, filter: 'grayscale(1) blur(2px) brightness(0.48)' },
        [-2]: { x: -330, y: 32, scale: 0.68, opacity: 0.34, zIndex: 6, filter: 'grayscale(1) blur(1.2px) brightness(0.60)' },
        [-1]: { x: -175, y: 18, scale: 0.86, opacity: 0.72, zIndex: 14, filter: 'grayscale(0.8) blur(0.35px) brightness(0.78)' },
        [0]: { x: 0, y: -18, scale: 1.12, opacity: 1, zIndex: 32, filter: 'grayscale(0) blur(0px) brightness(1.04)' },
        [1]: { x: 175, y: 18, scale: 0.86, opacity: 0.72, zIndex: 14, filter: 'grayscale(0.8) blur(0.35px) brightness(0.78)' },
        [2]: { x: 330, y: 32, scale: 0.68, opacity: 0.34, zIndex: 6, filter: 'grayscale(1) blur(1.2px) brightness(0.60)' },
        [3]: { x: 500, y: 42, scale: 0.54, opacity: 0.12, zIndex: 2, filter: 'grayscale(1) blur(2px) brightness(0.48)' },
    };

    const fallback = {
        x: offset * 150,
        y: 46,
        scale: 0.42,
        opacity: 0,
        zIndex: 0,
        filter: 'grayscale(1) blur(3px) brightness(0.35)',
    };

    const state = states[offset] ?? fallback;

    if (reducedMotion) {
        return {
            ...state,
            y: 0,
            filter: offset === 0 ? 'brightness(1)' : 'grayscale(1) brightness(0.74)',
        };
    }

    return state;
}

function EmptyTourismPanel() {
    return (
        <section className="bg-[#f7f0e3] px-4 py-16 dark:bg-[#080b0f] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid min-h-[20rem] place-items-center rounded-[1.5rem] border border-dashed border-[#d9c7a6]/70 bg-white/55 p-8 text-center dark:border-white/10 dark:bg-white/[0.035]">
                    <div>
                        <UsersRound className="mx-auto h-10 w-10 text-[#b08d48] dark:text-[#f1d89b]" />

                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#21180d] dark:text-white">
                            No tourism members yet
                        </h3>

                        <p className="mx-auto mt-3 max-w-[62ch] text-sm leading-7 text-[#6e604c] dark:text-white/56">
                            Create active Tourism Office profiles in the Content Manager. Saved members will appear here automatically.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function TourismMembersShowcase({ items = [] }: Props) {
    const records = useMemo(() => normalizeMembers(Array.isArray(items) ? items : []), [items]);
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const reducedMotion = Boolean(useReducedMotion());

    if (records.length === 0) {
        return <EmptyTourismPanel />;
    }

    const current = records[mod(active, records.length)];

    function goTo(index: number) {
        if (index === active) return;

        setDirection(index > active ? 1 : -1);
        setActive(index);
    }

    function next() {
        setDirection(1);
        setActive((value) => mod(value + 1, records.length));
    }

    function previous() {
        setDirection(-1);
        setActive((value) => mod(value - 1, records.length));
    }

    return (
        <section className="bg-[#f7f0e3] px-0 py-20 text-[#21180d] dark:bg-[#080b0f] dark:text-white">
            <div className="mx-auto max-w-[100vw] overflow-hidden">
                <div className="mx-auto mb-10 max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#9d7b3d] dark:text-[#f1d89b]">
                        Tourism Office
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.075em] md:text-7xl">
                        Meet the Team
                    </h2>

                    <p className="mx-auto mt-5 max-w-[70ch] text-base leading-8 text-[#6e604c] dark:text-white/62">
                        A center-focused profile carousel for Tourism Office and BCCC support members.
                    </p>
                </div>

                <div className="relative isolate min-h-[46rem] overflow-hidden border-y border-[#d9c7a6]/70 bg-white/64 py-10 shadow-[0_28px_90px_rgba(47,37,23,0.10)] dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-8 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-[#2f4d8d]/10 blur-3xl" />
                        <div className="absolute left-1/2 top-[8rem] -translate-x-1/2 text-center text-[clamp(5rem,15vw,13rem)] font-black uppercase leading-none tracking-[-0.09em] text-[#2f4d8d]/10 dark:text-white/7">
                            Our Team
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f7f0e3] to-transparent dark:from-[#080b0f]" />
                    </div>

                    <button
                        type="button"
                        onClick={previous}
                        className="absolute left-4 top-[18rem] z-40 grid h-11 w-11 place-items-center rounded-full bg-[#2f4d8d] text-white shadow-[0_16px_40px_rgba(47,77,141,0.28)] transition hover:-translate-y-1 hover:scale-105 md:left-10"
                        aria-label="Previous member"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        className="absolute right-4 top-[18rem] z-40 grid h-11 w-11 place-items-center rounded-full bg-[#2f4d8d] text-white shadow-[0_16px_40px_rgba(47,77,141,0.28)] transition hover:-translate-y-1 hover:scale-105 md:right-10"
                        aria-label="Next member"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="relative mx-auto h-[28rem] max-w-7xl">
                        {records.map((member, index) => {
                            const state = cardState(index, active, records.length, reducedMotion);
                            const photo = photoOf(member);
                            const selected = index === active;

                            return (
                                <motion.button
                                    type="button"
                                    key={member.id ?? `${nameOf(member)}-${index}`}
                                    onClick={() => goTo(index)}
                                    className={cx(
                                        'absolute left-1/2 top-1/2 h-[20rem] w-[15rem] overflow-hidden rounded-[1.45rem] border bg-white text-left shadow-[0_28px_80px_rgba(32,23,13,0.20)] dark:bg-white/8',
                                        selected ? 'border-[#2f4d8d]/35 dark:border-white/20' : 'border-white/60 dark:border-white/10',
                                    )}
                                    initial={false}
                                    animate={{
                                        x: state.x,
                                        y: state.y,
                                        scale: state.scale,
                                        opacity: state.opacity,
                                        filter: state.filter,
                                    }}
                                    transition={{
                                        type: reducedMotion ? false : 'spring',
                                        stiffness: 82,
                                        damping: 22,
                                        mass: 0.88,
                                    }}
                                    style={{
                                        zIndex: state.zIndex,
                                        marginLeft: '-7.5rem',
                                        marginTop: '-10rem',
                                    }}
                                    aria-label={`View ${nameOf(member)}`}
                                >
                                    {photo ? (
                                        <img
                                            src={photo}
                                            alt={nameOf(member)}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center bg-[#f4ead8] text-[#8b672d] dark:bg-white/10 dark:text-[#f1d89b]">
                                            <UsersRound className="h-14 w-14" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/12 to-transparent" />

                                    {isFeatured(member) ? (
                                        <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f1d89b] text-[#2f2517] shadow-lg">
                                            <Star className="h-4 w-4 fill-current" />
                                        </span>
                                    ) : null}

                                    <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                                        <p className="line-clamp-1 text-base font-bold tracking-[-0.02em] text-white">
                                            {nameOf(member)}
                                        </p>
                                        <p className="mt-1 line-clamp-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/64">
                                            {designationOf(member)}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${current.id ?? active}-details`}
                            initial={
                                reducedMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 18,
                                          x: direction > 0 ? 22 : -22,
                                          filter: 'blur(10px)',
                                      }
                            }
                            animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
                            exit={
                                reducedMotion
                                    ? { opacity: 0 }
                                    : {
                                          opacity: 0,
                                          y: -10,
                                          x: direction > 0 ? -18 : 18,
                                          filter: 'blur(8px)',
                                      }
                            }
                            transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-30 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
                        >
                            <div className="flex items-center justify-center gap-4">
                                <span className="hidden h-px w-16 bg-[#2f4d8d]/50 sm:block" />
                                <h3 className="text-3xl font-bold tracking-[-0.055em] text-[#22396b] dark:text-white md:text-4xl">
                                    {nameOf(current)}
                                </h3>
                                <span className="hidden h-px w-16 bg-[#2f4d8d]/50 sm:block" />
                            </div>

                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2f4d8d] dark:text-[#f1d89b]">
                                {designationOf(current)}
                            </p>

                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <Badge>{officeOf(current)}</Badge>

                                {unitOf(current) ? <Badge>{unitOf(current)}</Badge> : null}
                                {teamOf(current) && teamOf(current) !== unitOf(current) ? <Badge>{teamOf(current)}</Badge> : null}
                                {levelOf(current) ? <Badge>Level {levelOf(current)}</Badge> : null}
                                {reportsToOf(current) ? <Badge>Reports to {reportsToOf(current)}</Badge> : null}
                            </div>

                            {bioOf(current) ? (
                                <p className="mx-auto mt-5 max-w-[70ch] text-base leading-8 text-[#6e604c] dark:text-white/62">
                                    {bioOf(current)}
                                </p>
                            ) : null}

                            {detailsOf(current).length > 0 ? (
                                <div className="mx-auto mt-5 grid max-w-3xl gap-2 text-left sm:grid-cols-2">
                                    {detailsOf(current)
                                        .slice(0, 4)
                                        .map((detail, index) => (
                                            <div
                                                key={`${detail}-${index}`}
                                                className="rounded-[1rem] border border-[#d9c7a6]/60 bg-white/72 px-4 py-3 text-sm leading-6 text-[#6e604c] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/58"
                                            >
                                                {detail}
                                            </div>
                                        ))}
                                </div>
                            ) : null}

                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                {current.email ? (
                                    <a
                                        href={`mailto:${current.email}`}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </a>
                                ) : null}

                                {current.phone ? (
                                    <a
                                        href={`tel:${current.phone}`}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-sm font-semibold text-[#2f2517] transition hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Call
                                    </a>
                                ) : null}
                            </div>

                            <div className="mt-6 flex justify-center gap-2">
                                {records.map((member, index) => (
                                    <button
                                        key={member.id ?? index}
                                        type="button"
                                        onClick={() => goTo(index)}
                                        className={cx(
                                            'h-2 rounded-full transition-all',
                                            index === active ? 'w-7 bg-[#2f4d8d]' : 'w-2 bg-[#2f4d8d]/25 dark:bg-white/25',
                                        )}
                                        aria-label={`Go to member ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-full bg-[#f4ead8] px-3 py-1.5 text-xs font-bold text-[#7a5a24] dark:bg-white/10 dark:text-[#f1d89b]">
            {children}
        </span>
    );
}
