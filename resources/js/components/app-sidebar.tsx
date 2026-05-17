import SafeImage from '@/components/system/safe-image';
import {
    backendHomeHref,
    backendNavSections,
    backendRoleLabel,
    filterBackendSectionsByPermission,
    getBackendRole,
    isBackendActive,
    sectionIsActive,
    type BackendNavItem,
    type BackendNavSection,
} from '@/lib/backend-navigation';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    Circle,
    ExternalLink,
    PanelLeft,
    Search,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type AuthUser = {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    role_name?: string | null;
    permissions?: string[];
};

type SharedProps = {
    auth?: {
        user?: AuthUser | null;
        permissions?: string[];
    };
};

const ease = [0.22, 1, 0.36, 1] as const;

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function itemMatches(item: BackendNavItem, query: string) {
    const haystack = `${item.title} ${item.description ?? ''} ${item.href}`.toLowerCase();

    return haystack.includes(query.toLowerCase());
}

function filteredSections(sections: BackendNavSection[], query: string) {
    const trimmed = query.trim();

    if (!trimmed) {
        return sections;
    }

    return sections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => itemMatches(item, trimmed)),
        }))
        .filter((section) => section.items.length > 0);
}

function SidebarLeaf({ item, currentUrl }: { item: BackendNavItem; currentUrl: string }) {
    const Icon = item.icon as LucideIcon | undefined;
    const active = isBackendActive(currentUrl, item.href, item.exact);

    return (
        <Link
            href={item.href}
            className={cx(
                'group relative flex min-h-[2.75rem] items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition duration-200',
                active
                    ? 'bg-white text-slate-950 shadow-[0_14px_34px_rgba(0,0,0,0.20)] dark:bg-white dark:text-[#0b0f14]'
                    : 'text-white/66 hover:bg-white/[0.075] hover:text-white',
            )}
        >
            <span
                className={cx(
                    'absolute inset-y-2 left-0 w-1 rounded-r-full transition',
                    active ? 'bg-[#d6b05c] opacity-100' : 'bg-white/0 opacity-0 group-hover:bg-white/18 group-hover:opacity-100',
                )}
            />

            <span
                className={cx(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition',
                    active
                        ? 'border-slate-950/8 bg-[#efe4c8] text-[#7a5520]'
                        : 'border-white/8 bg-white/[0.055] text-[#e7ca84] group-hover:border-white/12 group-hover:bg-white/[0.09]',
                )}
            >
                {Icon ? <Icon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate">{item.title}</span>
                {item.description ? (
                    <span
                        className={cx(
                            'mt-0.5 block truncate text-[10px] font-medium',
                            active ? 'text-slate-500' : 'text-white/32',
                        )}
                    >
                        {item.description}
                    </span>
                ) : null}
            </span>
        </Link>
    );
}

function SidebarSection({
    section,
    currentUrl,
    open,
    onToggle,
}: {
    section: BackendNavSection;
    currentUrl: string;
    open: boolean;
    onToggle: () => void;
}) {
    const Icon = section.icon as LucideIcon | undefined;
    const active = sectionIsActive(currentUrl, section);

    return (
        <section className="rounded-2xl border border-white/8 bg-white/[0.035] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <button
                type="button"
                onClick={onToggle}
                className={cx(
                    'flex min-h-[2.85rem] w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition duration-200',
                    active || open ? 'bg-white/[0.075] text-white' : 'text-white/62 hover:bg-white/[0.055] hover:text-white',
                )}
                aria-expanded={open}
            >
                <span
                    className={cx(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition',
                        active || open
                            ? 'border-[#d6b05c]/30 bg-[#d6b05c]/16 text-[#f4d894]'
                            : 'border-white/8 bg-white/[0.045] text-white/48',
                    )}
                >
                    {Icon ? <Icon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{section.title}</span>
                    {section.description ? (
                        <span className="mt-0.5 block truncate text-[10px] font-medium text-white/34">
                            {section.description}
                        </span>
                    ) : null}
                </span>

                {active && !open ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4d894]" /> : null}

                <ChevronDown className={cx('h-4 w-4 shrink-0 text-white/38 transition', open && 'rotate-180')} />
            </button>

            <AnimatePresence initial={false}>
                {open ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 space-y-1">{section.items.map((item) => <SidebarLeaf key={`${section.key}-${item.href}`} item={item} currentUrl={currentUrl} />)}</div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </section>
    );
}

export function AppSidebar() {
    const page = usePage();
    const props = page.props as SharedProps;
    const role = getBackendRole(props.auth);
    const user = props.auth?.user;

    const permissions = useMemo(
        () => [...((props.auth?.permissions ?? []) as string[]), ...((user?.permissions ?? []) as string[])],
        [props.auth?.permissions, user?.permissions],
    );

    const sections = useMemo(() => filterBackendSectionsByPermission(backendNavSections(role), permissions), [role, permissions]);
    const [query, setQuery] = useState('');
    const visibleSections = useMemo(() => filteredSections(sections, query), [sections, query]);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setOpenSections((current) => {
            const next = { ...current };

            sections.forEach((section) => {
                if (sectionIsActive(page.url, section)) {
                    next[section.key] = true;
                }
            });

            if (query.trim()) {
                visibleSections.forEach((section) => {
                    next[section.key] = true;
                });
            }

            return next;
        });
    }, [page.url, sections, query, visibleSections]);

    const activeSection = sections.find((section) => sectionIsActive(page.url, section));

    return (
        <aside className="backend-sidebar fixed inset-y-0 left-0 z-[80] hidden w-[17.25rem] border-r border-white/8 bg-[#0a0d12]/94 text-white shadow-[24px_0_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:flex lg:flex-col">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(214,176,92,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))]" />

            <div className="relative flex min-h-0 flex-1 flex-col p-3">
                <Link
                    href={backendHomeHref(role)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#d6b05c]/32 hover:bg-white/[0.075]"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,176,92,0.18),transparent_44%)] opacity-80 transition group-hover:opacity-100" />

                    <div className="relative flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_16px_38px_rgba(0,0,0,0.22)]">
                            <SafeImage
                                src="/marketing/images/logo/bccc-seal.png"
                                fallbackSrc="/marketing/images/logo/bccc-seal.png"
                                alt="BCCC EASE"
                                className="h-full w-full object-contain p-1"
                                wrapperClassName="h-full w-full rounded-xl border-0"
                            />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold tracking-tight">BCCC EASE</span>
                            <span className="mt-0.5 block truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#f4d894]">
                                {backendRoleLabel(role)}
                            </span>
                        </span>

                        <PanelLeft className="h-4 w-4 text-white/28 transition group-hover:text-[#f4d894]" />
                    </div>
                </Link>

                <div className="mt-3 rounded-2xl border border-white/8 bg-black/18 p-2">
                    <label className="flex min-h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.045] px-2.5 text-white/58 transition focus-within:border-[#d6b05c]/30">
                        <Search className="h-4 w-4 shrink-0 text-white/36" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search workspace"
                            className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/32"
                        />
                    </label>

                    <div className="mt-2 flex items-center justify-between gap-2 px-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                        <span>{activeSection?.title ?? 'Navigation'}</span>
                        <span>{visibleSections.reduce((total, section) => total + section.items.length, 0)} links</span>
                    </div>
                </div>

                <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-2">
                        {visibleSections.length > 0 ? (
                            visibleSections.map((section) => (
                                <SidebarSection
                                    key={section.key}
                                    section={section}
                                    currentUrl={page.url}
                                    open={openSections[section.key] === true}
                                    onToggle={() =>
                                        setOpenSections((current) => ({
                                            ...current,
                                            [section.key]: current[section.key] !== true,
                                        }))
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-center">
                                <Search className="mx-auto h-5 w-5 text-white/34" />
                                <p className="mt-2 text-xs font-semibold text-white/62">No navigation match</p>
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="mt-3 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f4d894]"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#d6b05c]/18 bg-[#d6b05c]/8 p-3">
                    <div className="flex items-start gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#d6b05c]/16 text-[#f4d894]">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white">Quick access ready</p>
                            <p className="mt-1 text-[11px] leading-5 text-white/44">Use the topbar actions for calendar checks and assisted bookings.</p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.09]"
                    >
                        Public Site
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
