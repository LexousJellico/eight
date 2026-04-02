import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { PublicEventItem } from '@/types/public-content';

type Props = {
  items?: PublicEventItem[];
};

export default function EventsHighlights({ items = [] }: Props) {
  const bcccEvents = useMemo(() => items.filter((item) => item.isPublic && item.scope !== 'city'), [items]);
  const cityEvents = useMemo(() => items.filter((item) => item.isPublic && item.scope === 'city').slice(0, 4), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartRef = useRef<number | null>(null);

  if (bcccEvents.length === 0 && cityEvents.length === 0) return null;

  const safeIndex = bcccEvents.length === 0 ? 0 : activeIndex % bcccEvents.length;
  const activeEvent = bcccEvents[safeIndex] ?? null;
  const previewEvents = activeEvent
    ? [1, 2].map((offset) => bcccEvents[(safeIndex + offset) % bcccEvents.length]).filter(Boolean)
    : [];

  const goNext = () => {
    if (bcccEvents.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % bcccEvents.length);
  };

  const goPrev = () => {
    if (bcccEvents.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + bcccEvents.length) % bcccEvents.length);
  };

  const onPointerStart = (x: number) => {
    dragStartRef.current = x;
  };

  const onPointerEnd = (x: number) => {
    if (dragStartRef.current === null) return;
    const delta = x - dragStartRef.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      if (delta > 0) goPrev();
    }
    dragStartRef.current = null;
  };

  return (
    <section className="mt-14 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="public-chip border-[#0f8b6d]/20 bg-[#0f8b6d]/10 text-[#0f8b6d] dark:border-[#8ea3ff]/20 dark:bg-[#8ea3ff]/10 dark:text-[#b6c6ff]">
              Event Highlights
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Separate BCCC events and Baguio City events for better scanning.
            </h2>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5"
          >
            View All Events
          </Link>
        </div>

        <div className="mt-8 grid gap-7 xl:grid-cols-[1.14fr_0.86fr]">
          <div className="rounded-[2.2rem] border border-black/5 bg-white/86 p-5 shadow-[0_24px_65px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  BCCC Events
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  Featured venue activities
                </div>
              </div>

              {bcccEvents.length > 1 ? (
                <div className="group flex items-center gap-2 opacity-80 transition hover:opacity-100">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-slate-800 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    aria-label="Previous BCCC event"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-slate-800 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    aria-label="Next BCCC event"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {activeEvent ? (
              <>
                <div
                  className="group relative mt-6 min-h-[430px] cursor-grab select-none"
                  onMouseDown={(e) => onPointerStart(e.clientX)}
                  onMouseUp={(e) => onPointerEnd(e.clientX)}
                  onMouseLeave={(e) => onPointerEnd(e.clientX)}
                  onTouchStart={(e) => onPointerStart(e.touches[0].clientX)}
                  onTouchEnd={(e) => onPointerEnd(e.changedTouches[0].clientX)}
                >
                  {previewEvents.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="absolute inset-x-6 top-0 h-[360px] overflow-hidden rounded-[2rem] border border-black/5 bg-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:border-white/10"
                      style={{
                        transform: `translateX(${(index + 1) * 18}px) translateY(${(index + 1) * 16}px) scale(${1 - (index + 1) * 0.05})`,
                        opacity: 0.35 - index * 0.1,
                        zIndex: 1 - index,
                      }}
                    >
                      <img
                        src={item.images?.[0] || item.image || '/marketing/images/events/1.JPG'}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40" />
                    </div>
                  ))}

                  <article className="public-image-sheen relative z-10 overflow-hidden rounded-[2rem] border border-black/5 bg-black shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:border-white/10">
                    <div className="relative h-[360px]">
                      <img
                        src={activeEvent.images?.[0] || activeEvent.image || '/marketing/images/events/1.JPG'}
                        alt={activeEvent.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0.22)_32%,rgba(15,23,42,0.88)_100%)]" />

                      <div className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                        BCCC Event
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <h3 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{activeEvent.title}</h3>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-black/5 bg-[#f8f4ea] p-5 dark:border-white/10 dark:bg-slate-900/70">
                  <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {activeEvent.date}
                    </div>
                    {activeEvent.time ? (
                      <div className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {activeEvent.time}
                      </div>
                    ) : null}
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {activeEvent.venue}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {activeEvent.summary || activeEvent.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-black/10 bg-white/70 px-6 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No BCCC public events are visible yet.
              </div>
            )}
          </div>

          <div className="rounded-[2.2rem] border border-black/5 bg-white/86 p-5 shadow-[0_24px_65px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 sm:p-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                Baguio City Events
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">City activity list</div>
            </div>

            <div className="mt-6 space-y-4">
              {cityEvents.length > 0 ? (
                cityEvents.map((item) => (
                  <article
                    key={String(item.id)}
                    className="public-hover-card overflow-hidden rounded-[1.7rem] border border-black/5 bg-slate-50 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="grid gap-0 sm:grid-cols-[160px_1fr]">
                      <div className="relative min-h-[150px] overflow-hidden">
                        <img
                          src={item.images?.[0] || item.image || '/marketing/images/events/5.jpg'}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>

                      <div className="p-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          Baguio City Event
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          <div className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {item.date}
                          </div>
                          {item.time ? (
                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {item.time}
                            </div>
                          ) : null}
                          <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {item.venue}
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {item.summary || item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-black/10 bg-white/70 px-6 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  No Baguio City event highlights are visible yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
