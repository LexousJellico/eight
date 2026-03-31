import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FeaturePackageItem } from '@/types/public-content';

const PAGE_SIZE = 2;

export default function SpecialOffers({ items = [] }: { items?: FeaturePackageItem[] }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const visibleOffers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [page, items]);

  if (items.length === 0) {
    return (
      <section className="public-container mt-12">
        <div className="rounded-[2rem] border border-dashed border-black/10 bg-white/75 px-6 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          No feature packages are visible yet.
        </div>
      </section>
    );
  }

  return (
    <section className="public-container mt-12">
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-5 border-b border-black/5 px-6 py-6 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Special Offers
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Venue packages and featured options
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Browse package-style offerings and venue options that can guide public inquiries and event planning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-slate-800 transition disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label="Previous offers"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {page + 1} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-slate-800 transition disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label="Next offers"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-2 sm:px-8">
          {visibleOffers.map((offer) => (
            <article
              key={String(offer.id)}
              className="overflow-hidden rounded-3xl border border-black/5 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={offer.lightImage || offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover dark:hidden"
                />
                <img
                  src={offer.darkImage || offer.image}
                  alt={offer.title}
                  className="hidden h-full w-full object-cover dark:block"
                />
              </div>

              <div className="space-y-3 px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">
                  Package Feature
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {offer.title}
                </h3>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  {offer.subtitle}
                </p>

                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {offer.description}
                </p>

                <Link
                  href={offer.href || '/contact'}
                  className="inline-flex items-center rounded-full bg-[#174f40] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#2d47ff]"
                >
                  {offer.buttonLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
