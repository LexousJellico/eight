import BackendNotificationBell from '@/components/backend/backend-notification-bell';
import {
    backendBookingCreateHref,
    backendCalendarHref,
    backendNavSections,
    backendRoleLabel,
    filterBackendSectionsByPermission,
    getBackendRole,
    isBackendActive,
    sectionIsActive,
    userHasPermission,
    type BackendNavItem,
    type BackendNavSection,
} from '@/lib/backend-navigation';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpenCheck,
    CalendarDays,
    ChevronDown,
    Command,
    Globe2,
    LogOut,
    Menu,
    Moon,
    Search,
    Sun,
    X,
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

function resolveTitle(breadcrumbs: BreadcrumbItem[]) {
    return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Workspace' : 'Workspace';
}

function initials(name?: string | null) {
    if (!name) {
        return 'BA';
    }

    const parts = name.trim().split(/\s+/).slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'BA';
}

function ThemeToggleButton() {
    const { appearance, updateAppearance } = useAppearance();
    const [systemDark, setSystemDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = () => {
            setSystemDark(mediaQuery.matches);
            setMounted(true);
        };

        sync();
        mediaQuery.addEventListener('change', sync);

        return () => mediaQuery.removeEventListener('change', sync);
    }, []);

    const isDark = appearance === 'dark' || (appearance === 'system' && systemDark);

    return (
        <button
            type="button"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-white/78 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#d6b05c]/50 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/[0.09]"
            aria-label="Toggle backend theme"
        >
            {!mounted ? <span className="h-4 w-4 rounded-full border border-current opacity-40" /> : isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
    );
}

function MobileLeaf({
    item,
    currentUrl,
    permissions,
    onClick,
}: {
    item: BackendNavItem;
    currentUrl: string;
    permissions: string[];
    onClick: () => void;
}) {
    if (!userHasPermission(permissions, item.permission)) {
        return null;
    }

    const Icon = item.icon as LucideIcon | undefined;
    const active = isBackendActive(currentUrl, item.href, item.exact);

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cx(
                'flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition',
                active ? 'bg-white text-[#0b0f14]' : 'text-white/68 hover:bg-white/[0.075] hover:text-white',
            )}
        >
            <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg', active ? 'bg-[#efe4c8] text-[#7a5520]' : 'bg-white/[0.055] text-[#f4d894]')}>
                {Icon ? <Icon className="h-4 w-4" /> : null}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.title}</span>
        </Link>
    );
}

function MobileSection({
    section,
    currentUrl,
    permissions,
    open,
    onToggle,
    onClose,
}: {
    section: BackendNavSection;
    currentUrl: string;
    permissions: string[];
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    const Icon = section.icon as LucideIcon | undefined;
    const active = sectionIsActive(currentUrl, section);

    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-1.5">
            <button
                type="button"
                onClick={onToggle}
                className={cx(
                    'flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition',
                    active || open ? 'bg-white/[0.075] text-white' : 'text-white/68 hover:bg-white/[0.055] hover:text-white',
                )}
                aria-expanded={open}
            >
                <span className={cx('grid h-8 w-8 place-items-center rounded-lg', active || open ? 'bg-[#d6b05c]/16 text-[#f4d894]' : 'bg-white/[0.055] text-white/48')}>
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{section.title}</span>
                <ChevronDown className={cx('h-4 w-4 text-white/38 transition', open && 'rotate-180')} />
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
                        <div className="mt-1 space-y-1">
                            {section.items.map((item) => (
                                <MobileLeaf key={`mobile-${section.key}-${item.href}`} item={item} currentUrl={currentUrl} permissions={permissions} onClick={onClose} />
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const page = usePage();
    const props = page.props as SharedProps;
    const role = getBackendRole(props.auth);
    const user = props.auth?.user;

    const permissions = useMemo(
        () => [...((props.auth?.permissions ?? []) as string[]), ...((user?.permissions ?? []) as string[])],
        [props.auth?.permissions, user?.permissions],
    );

    const sections = useMemo(() => filterBackendSectionsByPermission(backendNavSections(role), permissions), [role, permissions]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const title = resolveTitle(breadcrumbs);
    const bookingHref = backendBookingCreateHref(role);
    const calendarHref = backendCalendarHref(role);
    const breadcrumbTrail = useMemo(() => breadcrumbs.filter((item) => item.title), [breadcrumbs]);

    useEffect(() => {
        setMobileOpen(false);
        setAccountOpen(false);
    }, [page.url]);

    useEffect(() => {
        setOpenSections((current) => {
            const next = { ...current };

            sections.forEach((section) => {
                if (sectionIsActive(page.url, section)) {
                    next[section.key] = true;
                }
            });

            return next;
        });
    }, [page.url, sections]);

    useEffect(() => {
        document.body.classList.toggle('overflow-hidden', mobileOpen);

        return () => document.body.classList.remove('overflow-hidden');
    }, [mobileOpen]);

    const logout = () => {
        router.post('/logout');
    };

    return (
        <>
            <header className="backend-topbar backend-main-topbar fixed inset-x-0 top-0 z-[99960] border-b border-slate-200/70 bg-white/88 shadow-[0_14px_46px_rgba(15,23,42,0.07)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a0d12]/88 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)] lg:left-[17.25rem]">
                <div className="backend-main-topbar-inner mx-auto flex min-h-16 w-full max-w-[1920px] items-center gap-2 px-3 py-2 sm:px-4 lg:px-5 xl:px-6">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-white/78 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white lg:hidden"
                        aria-label="Open workspace menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-[#d6b05c]/30 bg-[#d6b05c]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6320] dark:border-[#f4d894]/18 dark:bg-[#f4d894]/8 dark:text-[#f4d894]">
                                {backendRoleLabel(role)}
                            </span>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-white/20 sm:block" />
                            <span className="hidden truncate text-[11px] font-semibold text-slate-500 dark:text-white/38 sm:block">
                                BCCC Operations Console
                            </span>
                        </div>

                        <h1 className="mt-0.5 truncate text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-xl">
                            {title}
                        </h1>

                        {breadcrumbTrail.length > 1 ? (
                            <div className="mt-0.5 hidden items-center gap-1 text-[11px] text-slate-500 dark:text-white/38 md:flex">
                                {breadcrumbTrail.map((item, index) => {
                                    const last = index === breadcrumbTrail.length - 1;

                                    return (
                                        <span key={`${item.title}-${index}`} className="inline-flex items-center gap-1">
                                            {item.href && !last ? (
                                                <Link href={item.href} className="transition hover:text-[#8a6320] dark:hover:text-[#f4d894]">
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                <span className={last ? 'text-slate-800 dark:text-white/70' : ''}>{item.title}</span>
                                            )}
                                            {!last ? <span>/</span> : null}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    <div className="hidden min-w-[18rem] max-w-[32rem] flex-1 items-center rounded-2xl border border-slate-200/75 bg-slate-50/82 px-3 text-slate-500 shadow-inner dark:border-white/10 dark:bg-white/[0.045] dark:text-white/38 2xl:flex">
                        <Search className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1 px-2 py-2.5 text-sm font-medium">Search bookings, calendar, payments...</div>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:border-white/10 dark:bg-white/[0.055] dark:text-white/32">
                            <Command className="h-3 w-3" /> K
                        </span>
                    </div>

                    <div className="hidden items-center gap-2 xl:flex">
                        <Link
                            href={calendarHref}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/78 px-3 text-xs font-bold uppercase tracking-[0.13em] text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-[#d6b05c]/50 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/[0.09]"
                        >
                            <CalendarDays className="h-4 w-4" />
                            Calendar
                        </Link>

                        <Link
                            href={bookingHref}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold uppercase tracking-[0.13em] text-white shadow-[0_16px_36px_rgba(15,23,42,0.20)] transition hover:-translate-y-0.5 hover:bg-[#2d2618] dark:bg-white dark:text-[#0b0f14]"
                        >
                            <BookOpenCheck className="h-4 w-4" />
                            New Booking
                        </Link>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <BackendNotificationBell />
                        <ThemeToggleButton />

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountOpen((prev) => !prev)}
                                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/78 px-2 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#d6b05c]/50 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/[0.09]"
                                aria-expanded={accountOpen}
                                aria-label="Open account menu"
                            >
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#efe4c8] text-[11px] font-bold text-[#7a5520] dark:bg-[#f4d894]/14 dark:text-[#f4d894]">
                                    {initials(user?.name)}
                                </span>
                                <span className="hidden max-w-[9rem] truncate text-sm font-semibold lg:block">{user?.name || backendRoleLabel(role)}</span>
                                <ChevronDown className={cx('h-4 w-4 transition', accountOpen && 'rotate-180')} />
                            </button>

                            <AnimatePresence>
                                {accountOpen ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.18, ease }}
                                        className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/96 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a0d12]/96"
                                    >
                                        <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-white/[0.055]">
                                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.name || backendRoleLabel(role)}</p>
                                            <p className="truncate text-xs text-slate-500 dark:text-white/42">{user?.email || 'BCCC workspace'}</p>
                                        </div>

                                        <Link href="/" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/[0.055]">
                                            <Globe2 className="h-4 w-4 text-[#9d7b3d]" />
                                            Public Website
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileOpen ? (
                    <motion.div className="fixed inset-0 z-[99990] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <button type="button" className="absolute inset-0 bg-black/58 backdrop-blur-xl" onClick={() => setMobileOpen(false)} aria-label="Close workspace menu" />

                        <motion.aside
                            className="absolute left-3 top-3 flex max-h-[calc(100dvh-1.5rem)] w-[min(29rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0d12]/96 text-white shadow-[0_30px_100px_rgba(0,0,0,0.42)]"
                            initial={{ x: -34, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ x: -34, opacity: 0, filter: 'blur(10px)' }}
                            transition={{ duration: 0.26, ease }}
                        >
                            <div className="flex items-center justify-between border-b border-white/10 p-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f4d894]">BCCC EASE</p>
                                    <p className="mt-1 text-sm font-semibold">{backendRoleLabel(role)} Workspace</p>
                                </div>
                                <button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-white" aria-label="Close workspace menu">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {sections.map((section) => (
                                    <MobileSection
                                        key={`mobile-section-${section.key}`}
                                        section={section}
                                        currentUrl={page.url}
                                        permissions={permissions}
                                        open={openSections[section.key] === true}
                                        onToggle={() =>
                                            setOpenSections((current) => ({
                                                ...current,
                                                [section.key]: current[section.key] !== true,
                                            }))
                                        }
                                        onClose={() => setMobileOpen(false)}
                                    />
                                ))}
                            </div>

                            <div className="grid gap-2 border-t border-white/10 p-4">
                                <Link href={calendarHref} onClick={() => setMobileOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] text-sm font-semibold text-white">
                                    <CalendarDays className="h-4 w-4" />
                                    Calendar
                                </Link>
                                <Link href={bookingHref} onClick={() => setMobileOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#0b0f14]">
                                    <BookOpenCheck className="h-4 w-4" />
                                    New Booking
                                </Link>
                                <button type="button" onClick={logout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-semibold text-white/74">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
