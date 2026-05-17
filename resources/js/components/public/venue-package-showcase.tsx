import SafeImage from '@/components/system/safe-image';
import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Layers3, Sparkles } from 'lucide-react';
import type { FeaturePackageItem } from '@/types/public-content';

const ease = [0.22, 1, 0.36, 1] as const;

function imageFor(item: FeaturePackageItem) {
    return (
        item.lightImage ||
        item.light_image ||
        item.image ||
        item.imageUrl ||
        item.image_url ||
        item.images?.[0] ||
        '/marketing/images/facilities/darkvip.JPG'
    );
}

function packageAreas(item: FeaturePackageItem) {
    const areaLabels = item.areaLabels || item.area_labels;
    const areaKeys = item.areaKeys || item.area_keys;

    if (Array.isArray(areaLabels) && areaLabels.length > 0) {
        return areaLabels;
    }

    if (Array.isArray(areaKeys) && areaKeys.length > 0) {
        return areaKeys.map((key) => key.replace(/_/g, ' '));
    }

    return ['Venue package'];
}

export default function VenuePackageShowcase({ items = [] }: { items?: FeaturePackageItem[] }) {
    const reduceMotion = useReducedMotion();
    const visible = items.filter((item) => item.homepageVisible !== false && item.homepage_visible !== false).slice(0, 8);

    if (visible.length === 0) {
        return null;
    }

    return (
        <section className="bccc-package-stage relative isolate overflow-hidden bg-[#f8f5ef] px-4 py-16 dark:bg-[#0d0f12] sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f8f5ef] to-transparent dark:from-[#0d0f12]" />
            <div className="pointer-events-none absolute left-1/2 top-8 h-[26rem] w-[44rem] -translate-x-1/2 rounded-full bg-[#d6b36a]/12 blur-3xl dark:bg-[#d6b36a]/8" />

            <div className="relative mx-auto max-w-[1920px]">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease }}
                    className="grid gap-4 lg:grid-cols-[0.74fr_1fr] lg:items-end"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-[#fffaf0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] shadow-[0_12px_30px_rgba(47,37,23,0.06)] dark:border-white/10 dark:bg-white/7 dark:text-[#f1d89b]">
                            <Sparkles className="h-4 w-4" />
                            Curated venue packages
                        </div>

                        <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2.5rem,5vw,6.8rem)] font-light leading-[0.88] tracking-[-0.07em] text-[#21180d] dark:text-white">
                            Select a combination before choosing your schedule.
                        </h2>
                    </div>

                    <p className="max-w-2xl text-sm leading-7 text-[#6e604c] dark:text-white/58 lg:justify-self-end">
                        These packages are operational booking combinations. Full Hall is kept separate and does not automatically include the VIP Lounge, Board Room, or LED Wall.
                    </p>
                </motion.div>

                <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {visible.map((item, index) => {
                        const href = item.href || item.url || `/book?package=${encodeURIComponent(String(item.code || ''))}`;
                        const areas = packageAreas(item);
                        const featured = item.featured || item.is_featured;

                        return (
                            <motion.article
                                key={String(item.id ?? item.code ?? item.title)}
                                initial={reduceMotion ? false : { opacity: 0, y: 24, rotateX: 8, filter: 'blur(8px)' }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                                viewport={{ once: true, amount: 0.18 }}
                                transition={{ duration: 0.58, delay: Math.min(index * 0.05, 0.2), ease }}
                                className="bccc-package-card group relative min-h-[31rem] overflow-hidden rounded-[1.7rem] border border-black/10 bg-white shadow-[0_28px_90px_rgba(47,37,23,0.13)] dark:border-white/10 dark:bg-[#111418]"
                            >
                                <Link href={href} className="absolute inset-0 z-20" aria-label={`Reserve ${item.title}`} />

                                <SafeImage
                                    src={imageFor(item)}
                                    fallbackSrc="/marketing/images/facilities/darkvip.JPG"
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    wrapperClassName="absolute inset-0 h-full w-full rounded-none border-0"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#100b05]/94 via-[#100b05]/42 to-[#100b05]/8" />
                                <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between gap-3">
                                    <span className="rounded-full border border-white/18 bg-white/13 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                                        {item.code || `Package ${index + 1}`}
                                    </span>

                                    {featured ? (
                                        <span className="rounded-full bg-[#f4dfad] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#32220e]">
                                            Suggested
                                        </span>
                                    ) : null}
                                </div>

                                <div className="relative z-10 flex min-h-[31rem] flex-col justify-end p-5 text-white">
                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {areas.slice(0, 4).map((area) => (
                                            <span
                                                key={area}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/82 backdrop-blur-xl"
                                            >
                                                <Layers3 className="h-3.5 w-3.5 text-[#f4dfad]" />
                                                {area}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4dfad]">
                                        {item.subtitle || 'BCCC EASE package'}
                                    </p>

                                    <h3 className="mt-2 font-serif text-3xl font-light leading-tight tracking-[-0.045em]">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                                        {item.description || item.summary || 'A prepared venue combination for easier reservation planning.'}
                                    </p>

                                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f4dfad]">
                                        {item.buttonLabel || item.button_label || item.ctaLabel || item.cta_label || 'Reserve This Package'}
                                        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
