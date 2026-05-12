import {
    EmptyPublicPanel,
    SectionIntro,
    cx,
    descriptionOf,
    formatPublicDate,
    imageOf,
    titleOf,
    visibleRecords,
    type PublicImageRecord,
} from '@/components/public/public-display-system';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Film, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    items?: PublicImageRecord[];
    bcccEvents?: PublicImageRecord[];
    cityEvents?: PublicImageRecord[];
};

type EventPanelState = {
    x: number;
    z: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
    opacity: number;
    zIndex: number;
    filter: string;
};

function mod(value: number, total: number) {
    return ((value % total) + total) % total;
}

function categoryOf(item: PublicImageRecord) {
    return String(item.category || item.event_category || '').toLowerCase();
}

function cleanCategory(item: PublicImageRecord) {
    return String(item.category || item.event_category || 'Event Highlight');
}

function eventDate(item: PublicImageRecord) {
    return item.starts_at || item.startsAt || item.event_date || item.date || null;
}

function signedOffset(index: number, active: number, total: number) {
    const raw = index - active;

    if (raw > total / 2) {
        return raw - total;
    }

    if (raw < -total / 2) {
        return raw + total;
    }

    return raw;
}

function panelState(offset: number, reducedMotion: boolean): EventPanelState {
    const states: Record<number, EventPanelState> = {
        [-4]: {
            x: -690,
            z: -430,
            rotateY: 78,
            rotateZ: -4,
            scale: 0.48,
            opacity: 0.07,
            zIndex: 2,
            filter: 'brightness(0.18) grayscale(1) blur(2px)',
        },
        [-3]: {
            x: -520,
            z: -300,
            rotateY: 70,
            rotateZ: -3,
            scale: 0.58,
            opacity: 0.16,
            zIndex: 4,
            filter: 'brightness(0.25) grayscale(1) blur(1.4px)',
        },
        [-2]: {
            x: -355,
            z: -170,
            rotateY: 54,
            rotateZ: -2,
            scale: 0.72,
            opacity: 0.42,
            zIndex: 8,
            filter: 'brightness(0.42) grayscale(1) blur(0.7px)',
        },
        [-1]: {
            x: -185,
            z: -20,
            rotateY: 34,
            rotateZ: -1,
            scale: 0.9,
            opacity: 0.78,
            zIndex: 18,
            filter: 'brightness(0.7) grayscale(0.45) blur(0.15px)',
        },
        [0]: {
            x: 0,
            z: 190,
            rotateY: 0,
            rotateZ: 0,
            scale: 1.12,
            opacity: 1,
            zIndex: 40,
            filter: 'brightness(1.06) grayscale(0) blur(0px)',
        },
        [1]: {
            x: 185,
            z: -20,
            rotateY: -34,
            rotateZ: 1,
            scale: 0.9,
            opacity: 0.78,
            zIndex: 18,
            filter: 'brightness(0.7) grayscale(0.45) blur(0.15px)',
        },
        [2]: {
            x: 355,
            z: -170,
            rotateY: -54,
            rotateZ: 2,
            scale: 0.72,
            opacity: 0.42,
            zIndex: 8,
            filter: 'brightness(0.42) grayscale(1) blur(0.7px)',
        },
        [3]: {
            x: 520,
            z: -300,
            rotateY: -70,
            rotateZ: 3,
            scale: 0.58,
            opacity: 0.16,
            zIndex: 4,
            filter: 'brightness(0.25) grayscale(1) blur(1.4px)',
        },
        [4]: {
            x: 690,
            z: -430,
            rotateY: -78,
            rotateZ: 4,
            scale: 0.48,
            opacity: 0.07,
            zIndex: 2,
            filter: 'brightness(0.18) grayscale(1) blur(2px)',
        },
    };

    const fallback = {
        x: offset * 180,
        z: -520,
        rotateY: offset > 0 ? -82 : 82,
        rotateZ: offset > 0 ? 5 : -5,
        scale: 0.42,
        opacity: 0,
        zIndex: 0,
        filter: 'brightness(0.12) grayscale(1) blur(2.5px)',
    };

    if (reducedMotion) {
        const state = states[offset] ?? fallback;

        return {
            ...state,
            z: 0,
            rotateY: 0,
            rotateZ: 0,
            filter: offset === 0 ? 'brightness(1)' : 'brightness(0.55) grayscale(1)',
        };
    }

    return states[offset] ?? fallback;
}

function mergedUniqueEvents(items: PublicImageRecord[], bcccEvents: PublicImageRecord[], cityEvents: PublicImageRecord[]) {
    const merged = [...items, ...bcccEvents, ...cityEvents];
    const seen = new Set<string>();

    return merged.filter((item, index) => {
        const key = String(item.id ?? `${titleOf(item, 'Event')}-${index}`);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export default function EventsCinemaShowcase({ items = [], bcccEvents = [], cityEvents = [] }: Props) {
    const all = useMemo(
        () => visibleRecords(mergedUniqueEvents(items, bcccEvents, cityEvents)),
        [items, bcccEvents, cityEvents],
    );

    const [mode, setMode] = useState<'bccc' | 'city'>('bccc');
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const reducedMotion = Boolean(useReducedMotion());

    const records = useMemo(() => {
        const filtered = all.filter((item) => {
            const category = categoryOf(item);

            if (mode === 'city') {
                return category.includes('city') || category.includes('baguio');
            }

            return category.includes('bccc') || !category.includes('city');
        });

        return filtered.length > 0 ? filtered : all;
    }, [all, mode]);

    const current = records[active % Math.max(records.length, 1)];

    useEffect(() => {
        records.forEach((item) => {
            const src = imageOf(item);

            if (!src) {
                return;
            }

            const img = new Image();
            img.src = src;
        });
    }, [records]);

    useEffect(() => {
        if (records.length === 0) {
            return;
        }

        setActive((value) => mod(value, records.length));
    }, [records.length]);

    if (records.length === 0) {
        return (
            <section className="public-display-page py-16">
                <div className="public-section-shell">
                    <EmptyPublicPanel
                        icon={CalendarDays}
                        title="No events yet"
                        description="Event highlights configured in the Content Manager will appear here."
                    />
                </div>
            </section>
        );
    }

    function changeActive(index: number) {
        if (index === active) {
            return;
        }

        const forwardDistance = mod(index - active, records.length);
        const backwardDistance = mod(active - index, records.length);

        setDirection(forwardDistance <= backwardDistance ? 1 : -1);
        setActive(index);
    }

    function switchMode(nextMode: 'bccc' | 'city') {
        if (nextMode === mode) {
            return;
        }

        setDirection(nextMode === 'city' ? 1 : -1);
        setMode(nextMode);
        setActive(0);
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
        <section className="event-cinema-fullbleed public-display-page overflow-hidden py-20">
            <div className="event-cinema-intro-wrap">
                <SectionIntro
                    kicker="Event Highlights"
                    title="Cinematic event carousel"
                    description="Browse BCCC and Baguio City highlights through a full-width dark film stage with curved depth, center focus, and smooth rotation."
                    align="center"
                />

                <div className="mt-8 flex justify-center">
                    <div className="event-cinema-toggle creative">
                        <button
                            type="button"
                            onClick={() => switchMode('bccc')}
                            className={cx('event-cinema-toggle-button', mode === 'bccc' && 'is-active')}
                        >
                            BCCC Events
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode('city')}
                            className={cx('event-cinema-toggle-button', mode === 'city' && 'is-active')}
                        >
                            Baguio City Events
                        </button>
                    </div>
                </div>
            </div>

            <div className="event-cinema-stage event-cinema-stage-full mt-10">
                <div className="event-cinema-ambient-grid" />
                <div className="event-cinema-vignette" />
                <div className="event-cinema-top-glow" />
                <div className="event-cinema-side-glow left" />
                <div className="event-cinema-side-glow right" />
                <div className="event-cinema-floor" />

                <motion.div
                    key={`${mode}-${current?.id ?? active}-hero-glow`}
                    className="event-cinema-active-glow"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: reducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {imageOf(current) ? (
                        <img src={imageOf(current)} alt="" draggable={false} />
                    ) : null}
                </motion.div>

                <button
                    type="button"
                    onClick={previous}
                    className="event-cinema-arrow event-cinema-arrow-wide left-5 md:left-10"
                    aria-label="Previous event"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={next}
                    className="event-cinema-arrow event-cinema-arrow-wide right-5 md:right-10"
                    aria-label="Next event"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                <div className="event-cinema-track event-cinema-track-wide">
                    <AnimatePresence initial={false}>
                        {records.map((item, index) => {
                            const offset = signedOffset(index, active, records.length);
                            const state = panelState(offset, reducedMotion);
                            const visible = Math.abs(offset) <= 4;
                            const image = imageOf(item);
                            const isActive = offset === 0;

                            return (
                                <motion.button
                                    type="button"
                                    key={item.id ?? index}
                                    className={cx(
                                        'event-cinema-panel event-cinema-panel-creative',
                                        isActive && 'is-active',
                                        !visible && 'pointer-events-none',
                                    )}
                                    initial={false}
                                    animate={{
                                        x: state.x,
                                        z: state.z,
                                        rotateY: state.rotateY,
                                        rotateZ: state.rotateZ,
                                        scale: state.scale,
                                        opacity: state.opacity,
                                        filter: state.filter,
                                    }}
                                    transition={{
                                        type: reducedMotion ? false : 'spring',
                                        stiffness: 64,
                                        damping: 18,
                                        mass: 0.96,
                                    }}
                                    style={{
                                        zIndex: state.zIndex,
                                        transformStyle: 'preserve-3d',
                                        pointerEvents: visible ? 'auto' : 'none',
                                    }}
                                    onClick={() => changeActive(index)}
                                    aria-label={`View ${titleOf(item, 'Event')}`}
                                >
                                    <div className="event-cinema-panel-inner">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={titleOf(item, 'Event')}
                                                draggable={false}
                                            />
                                        ) : (
                                            <div className="grid h-full place-items-center bg-neutral-900 text-white/45">
                                                <Film className="h-12 w-12" />
                                            </div>
                                        )}

                                        <div className="event-cinema-panel-shade" />

                                        <div className="event-cinema-panel-rim" />

                                        <div className="event-cinema-panel-content">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1d89b]">
                                                {formatPublicDate(eventDate(item)) || cleanCategory(item)}
                                            </p>

                                            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-white">
                                                {titleOf(item, 'Event')}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`${mode}-${current?.id ?? active}-details`}
                        className="event-cinema-details event-cinema-details-wide"
                        initial={
                            reducedMotion
                                ? false
                                : {
                                      opacity: 0,
                                      y: 20,
                                      x: direction > 0 ? 24 : -24,
                                      filter: 'blur(10px)',
                                  }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                            x: 0,
                            filter: 'blur(0px)',
                        }}
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
                        transition={{
                            duration: reducedMotion ? 0 : 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-xl">
                            <Sparkles className="h-3.5 w-3.5 text-[#f1d89b]" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f1d89b]">
                                {formatPublicDate(eventDate(current)) || cleanCategory(current)}
                            </p>
                        </div>

                        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
                            {titleOf(current, 'Event')}
                        </h3>

                        {descriptionOf(current) ? (
                            <p className="public-readable mx-auto mt-3 max-w-[70ch] text-sm text-white/68 md:text-base">
                                {descriptionOf(current)}
                            </p>
                        ) : null}

                        <div className="mt-5 flex justify-center gap-1.5">
                            {records.map((item, index) => (
                                <button
                                    key={item.id ?? index}
                                    type="button"
                                    onClick={() => changeActive(index)}
                                    className={cx(
                                        'event-cinema-dot',
                                        index === active && 'is-active',
                                    )}
                                    aria-label={`Go to event ${index + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
