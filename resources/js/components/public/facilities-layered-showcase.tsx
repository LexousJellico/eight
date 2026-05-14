import {
    EmptyPublicPanel,
    SectionIntro,
    cx,
    descriptionOf,
    imageOf,
    titleOf,
    visibleRecords,
    type PublicImageRecord,
} from '@/components/public/public-display-system';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    UsersRound,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

type Props = {
    items?: PublicImageRecord[];
};

type PreviewItem = {
    item: PublicImageRecord;
    index: number;
    order: number;
};

type RectState = {
    left: number;
    top: number;
    width: number;
    height: number;
};

type PendingTransition = {
    index: number;
    item: PublicImageRecord;
    from: RectState;
};

function mod(value: number, total: number) {
    return ((value % total) + total) % total;
}

function capacityOf(item: PublicImageRecord) {
    return item.capacity ? String(item.capacity) : 'Flexible capacity';
}

function facilityUrl(item: PublicImageRecord) {
    const slug = item.slug || item.id;

    return slug ? `/facilities/${slug}` : '/facilities';
}

function getPreviewItems(items: PublicImageRecord[], active: number): PreviewItem[] {
    if (items.length <= 1) {
        return [];
    }

    const count = Math.min(4, items.length - 1);

    return Array.from({ length: count }).map((_, order) => {
        const index = mod(active + order + 1, items.length);

        return {
            item: items[index],
            index,
            order,
        };
    });
}

function getStageRelativeRect(stage: HTMLDivElement, element: HTMLElement): RectState {
    const stageRect = stage.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return {
        left: elementRect.left - stageRect.left,
        top: elementRect.top - stageRect.top,
        width: elementRect.width,
        height: elementRect.height,
    };
}

function fallbackPreviewRect(stage: HTMLDivElement, direction: number): RectState {
    const stageRect = stage.getBoundingClientRect();
    const width = Math.min(stageRect.width * 0.26, 360);
    const height = width * 0.5625;

    return {
        left: direction > 0 ? stageRect.width - width - 56 : 56,
        top: stageRect.height - height - 56,
        width,
        height,
    };
}

function previewMotion(order: number, reducedMotion: boolean) {
    const states = [
        {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            zIndex: 44,
            filter: 'blur(0px) brightness(1) saturate(1.08)',
        },
        {
            x: 168,
            y: 18,
            scale: 0.86,
            opacity: 0.74,
            zIndex: 34,
            filter: 'blur(0.35px) brightness(0.82) saturate(0.9)',
        },
        {
            x: 302,
            y: 36,
            scale: 0.74,
            opacity: 0.46,
            zIndex: 24,
            filter: 'blur(0.9px) brightness(0.68) saturate(0.72)',
        },
        {
            x: 410,
            y: 52,
            scale: 0.64,
            opacity: 0.2,
            zIndex: 14,
            filter: 'blur(1.55px) brightness(0.54) saturate(0.58)',
        },
    ];

    const state = states[order] ?? states[states.length - 1];

    if (reducedMotion) {
        return {
            ...state,
            y: 0,
        };
    }

    return state;
}

export default function FacilitiesLayeredShowcase({ items = [] }: Props) {
    const records = useMemo(() => visibleRecords(items), [items]);
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [pending, setPending] = useState<PendingTransition | null>(null);

    const stageRef = useRef<HTMLDivElement | null>(null);
    const previewRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const reducedMotion = Boolean(useReducedMotion());

    const current = records[active];
    const previews = useMemo(() => getPreviewItems(records, active), [records, active]);
    const isAnimating = pending !== null;

    if (records.length === 0) {
        return (
            <section className="public-display-page py-16">
                <div className="public-section-shell">
                    <EmptyPublicPanel
                        icon={Building2}
                        title="No facilities yet"
                        description="Venue spaces configured in the Content Manager will appear here."
                    />
                </div>
            </section>
        );
    }

    function beginTransition(nextIndex: number, sourceElement?: HTMLElement | null, nextDirection = 1) {
        if (!stageRef.current || nextIndex === active || isAnimating) {
            return;
        }

        const nextItem = records[nextIndex];

        const from = sourceElement
            ? getStageRelativeRect(stageRef.current, sourceElement)
            : fallbackPreviewRect(stageRef.current, nextDirection);

        setDirection(nextDirection);
        setPending({
            index: nextIndex,
            item: nextItem,
            from,
        });
    }

    function goTo(index: number, sourceElement?: HTMLElement | null) {
        if (index === active) {
            return;
        }

        const forwardDistance = mod(index - active, records.length);
        const backwardDistance = mod(active - index, records.length);
        const nextDirection = forwardDistance <= backwardDistance ? 1 : -1;

        beginTransition(index, sourceElement, nextDirection);
    }

    function next() {
        const nextIndex = mod(active + 1, records.length);
        const source = previewRefs.current[nextIndex];

        beginTransition(nextIndex, source, 1);
    }

    function previous() {
        const nextIndex = mod(active - 1, records.length);

        beginTransition(nextIndex, null, -1);
    }

    function finishTransition() {
        if (!pending) {
            return;
        }

        setActive(pending.index);
        setPending(null);
    }

    return (
        <section className="facility-display-section public-display-page overflow-hidden">
            <div className="facility-display-intro">
                <SectionIntro
                    kicker="Facilities"
                    title="Explore BCCC venue spaces"
                    description="Browse each facility through a full-width visual stage. Select a landscape preview at the bottom-right to expand it into the main display."
                />
            </div>

            <div ref={stageRef} className="facility-image-stage" aria-live="polite">
                <div className="facility-image-stage-bg">
                    {imageOf(current) ? (
                        <img
                            src={imageOf(current)}
                            alt={titleOf(current, 'Facility')}
                            draggable={false}
                        />
                    ) : (
                        <div className="grid h-full w-full place-items-center bg-[#1f3a25] text-white/60">
                            <Building2 className="h-24 w-24" />
                        </div>
                    )}
                </div>

                <div className="facility-image-stage-shade" />
                <div className="facility-image-stage-grid" />
                <div className="facility-image-stage-light" />

                <AnimatePresence>
                    {pending ? (
                        <motion.div
                            key={`expanding-${pending.item.id ?? pending.index}`}
                            className="facility-image-expander"
                            initial={{
                                left: pending.from.left,
                                top: pending.from.top,
                                width: pending.from.width,
                                height: pending.from.height,
                                borderRadius: 20,
                                opacity: 1,
                                filter: 'blur(0px) brightness(1)',
                            }}
                            animate={{
                                left: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: 0,
                                opacity: 1,
                                filter: 'blur(0px) brightness(1)',
                            }}
                            exit={{
                                opacity: 0,
                                filter: 'blur(8px) brightness(0.72)',
                            }}
                            transition={{
                                duration: reducedMotion ? 0 : 1.05,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            onAnimationComplete={finishTransition}
                        >
                            {imageOf(pending.item) ? (
                                <img
                                    src={imageOf(pending.item)}
                                    alt={titleOf(pending.item, 'Facility')}
                                    draggable={false}
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center bg-[#1f3a25] text-white/60">
                                    <Building2 className="h-24 w-24" />
                                </div>
                            )}

                            <div className="facility-image-expander-shade" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`facility-copy-${current.id ?? active}`}
                        className="facility-image-copy"
                        initial={
                            reducedMotion
                                ? false
                                : {
                                      opacity: 0,
                                      x: direction > 0 ? 34 : -34,
                                      y: 18,
                                      filter: 'blur(10px)',
                                  }
                        }
                        animate={{
                            opacity: isAnimating ? 0.52 : 1,
                            x: 0,
                            y: 0,
                            filter: 'blur(0px)',
                        }}
                        exit={
                            reducedMotion
                                ? { opacity: 0 }
                                : {
                                      opacity: 0,
                                      x: direction > 0 ? -24 : 24,
                                      y: -10,
                                      filter: 'blur(8px)',
                                  }
                        }
                        transition={{
                            duration: reducedMotion ? 0 : 0.62,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <p className="facility-image-kicker">Venue Space</p>

                        <h2 className="facility-image-title">
                            {titleOf(current, 'Facility')}
                        </h2>

                        <p className="facility-image-description">
                            {descriptionOf(
                                current,
                                'A BCCC venue space available for conventions, civic programs, cultural activities, meetings, and public events.',
                            )}
                        </p>

                        <div className="facility-image-meta">
                            <span>
                                <UsersRound className="h-4 w-4" />
                                {capacityOf(current)}
                            </span>

                            <span>
                                <Maximize2 className="h-4 w-4" />
                                BCCC Facility
                            </span>

                            <span>
                                <CalendarDays className="h-4 w-4" />
                                Subject to availability
                            </span>
                        </div>

                        <div className="facility-image-actions">
                            <Link href={facilityUrl(current)}>
                                View Facility
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link href="/book">
                                Check Availability
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="facility-image-preview-area" aria-label="Facility choices">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {previews.map(({ item, index, order }) => {
                            const image = imageOf(item);
                            const state = previewMotion(order, reducedMotion);

                            return (
                                <motion.button
                                    type="button"
                                    key={`facility-preview-${item.id ?? index}`}
                                    ref={(node) => {
                                        previewRefs.current[index] = node;
                                    }}
                                    className={cx(
                                        'facility-image-preview-card',
                                        order === 0 && 'is-front',
                                    )}
                                    initial={
                                        reducedMotion
                                            ? false
                                            : {
                                                  x: state.x + 112,
                                                  y: state.y + 18,
                                                  scale: state.scale * 0.84,
                                                  opacity: 0,
                                                  filter: 'blur(12px) brightness(0.52)',
                                              }
                                    }
                                    animate={{
                                        ...state,
                                        opacity: isAnimating ? state.opacity * 0.5 : state.opacity,
                                    }}
                                    exit={
                                        reducedMotion
                                            ? { opacity: 0 }
                                            : {
                                                  x: state.x - 112,
                                                  y: state.y + 10,
                                                  scale: state.scale * 0.86,
                                                  opacity: 0,
                                                  filter: 'blur(12px) brightness(0.48)',
                                              }
                                    }
                                    transition={{
                                        type: reducedMotion ? false : 'spring',
                                        stiffness: 95,
                                        damping: 22,
                                        mass: 0.9,
                                    }}
                                    disabled={isAnimating}
                                    onClick={(event) => goTo(index, event.currentTarget)}
                                    aria-label={`View ${titleOf(item, 'Facility')}`}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={titleOf(item, 'Facility')}
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center bg-[#f4ead8] text-[#8b672d]">
                                            <Building2 className="h-10 w-10" />
                                        </div>
                                    )}

                                    <div className="facility-image-preview-shade" />

                                    <div className="facility-image-preview-label">
                                        <p>{titleOf(item, 'Facility')}</p>
                                        <span>{capacityOf(item)}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <div className="facility-image-controls">
                    <button
                        type="button"
                        onClick={previous}
                        disabled={isAnimating}
                        className="facility-image-control"
                        aria-label="Previous facility"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        disabled={isAnimating}
                        className="facility-image-control"
                        aria-label="Next facility"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="facility-image-dots">
                        {records.map((item, index) => (
                            <button
                                key={item.id ?? index}
                                type="button"
                                disabled={isAnimating}
                                onClick={(event) => goTo(index, event.currentTarget)}
                                className={cx('facility-image-dot', index === active && 'is-active')}
                                aria-label={`Go to facility ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
