import {
    backendAdminConfigNav,
    backendExternalNav,
    backendHomeHref,
    backendMainNav,
    backendRoleEyebrow,
    backendRoleLabel,
    getBackendRole,
    isBackendActive,
    userHasPermission,
    type BackendNavItem,
} from '@/lib/backend-navigation';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Building2,
    ChevronRight,
    Circle,
    Globe2,
    LayoutDashboard,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function initials(name?: string | null) {
    if (!name) {
        return 'BC';
    }

    const parts = name.trim().split(/\s+/).slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'BC';
}

function NavGroup({
    label,
    items,
    currentUrl,
    permissions,
}: {
    label: string;
    items: BackendNavItem[];
    currentUrl: string;
    permissions: string[];
}) {
    const visibleItems = items.filter((item) => userHasPermission(permissions, item.permission));

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <section className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] dark:text-[#f1d89b]">
                {label}
            </p>

            <div className="space-y-1">
                {visibleItems.map((item) => {
                    const Icon = item.icon as LucideIcon | undefined;
                    const active = isBackendActive(currentUrl, item.href, item.exact);

                    return (
                        <Link
                            key={`${label}-${item.href}`}
                            href={item.href}
                            className={cx(
                                'group relative flex min-h-12 items-center gap-3 rounded-[1.05rem] px-3 py-2.5 text-sm font-semibold transition duration-200',
                                active
                                    ? 'bg-[#2f2517] text-white shadow-[0_18px_40px_rgba(47,37,23,0.22)] dark:bg-white dark:text-[#17120b]'
                                    : 'text-[#4a3b27] hover:bg-white/82 hover:text-[#21180d] dark:text-white/68 dark:hover:bg-white/10 dark:hover:text-white',
                            )}
                        >
                            <span
                                className={cx(
                                    'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition',
                                    active
                                        ? 'bg-white/14 text-white dark:bg-[#17120b]/8 dark:text-[#17120b]'
                                        : 'bg-[#ede1cc] text-[#8b672d] group-hover:bg-[#f4ead8] dark:bg-white/8 dark:text-[#f4d894] dark:group-hover:bg-white/12',
                                )}
                            >
                                {Icon ? <Icon className="h-4.5 w-4.5" /> : <Circle className="h-3 w-3" />}
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block truncate">{item.title}</span>
                                {item.description ? (
                                    <span
                                        className={cx(
                                            'mt-0.5 block truncate text-[11px] font-medium',
                                            active
                                                ? 'text-white/62 dark:text-[#17120b]/60'
                                                : 'text-[#7a6b55] dark:text-white/42',
                                        )}
                                    >
                                        {item.description}
                                    </span>
                                ) : null}
                            </span>

                            {active ? (
                                <span className="h-2 w-2 rounded-full bg-[#f4d894] dark:bg-[#9d7b3d]" />
                            ) : (
                                <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

export function AppSidebar() {
    const page = usePage();
    const props = page.props as SharedProps;
    const role = getBackendRole(props.auth);
    const user = props.auth?.user;

    const permissions = [
        ...((props.auth?.permissions ?? []) as string[]),
        ...((user?.permissions ?? []) as string[]),
    ];

    const mainNav = backendMainNav(role);
    const configNav = backendAdminConfigNav(role);
    const quickLinks = backendExternalNav(role);

    return (
        <aside className="fixed inset-y-0 left-0 z-[80] hidden w-[18.5rem] border-r border-[#d9c7a6]/60 bg-[#fffaf0]/88 shadow-[18px_0_80px_rgba(47,37,23,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#101419]/88 lg:flex lg:flex-col">
            <div className="flex min-h-0 flex-1 flex-col p-3">
                <Link
                    href={backendHomeHref(role)}
                    className="group relative overflow-hidden rounded-[1.35rem] border border-[#d9c7a6]/70 bg-white/78 p-4 shadow-[0_18px_44px_rgba(47,37,23,0.10)] transition hover:border-[#b08d48]/70 hover:bg-white dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,181,109,0.22),transparent_45%)]" />

                    <div className="relative flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#2f2517] text-white shadow-[0_16px_36px_rgba(47,37,23,0.24)] dark:bg-white dark:text-[#17120b]">
                            <Building2 className="h-6 w-6" />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-base font-semibold tracking-tight text-[#21180d] dark:text-white">
                                BCCC EASE
                            </span>
                            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                Events Access
                            </span>
                        </span>
                    </div>
                </Link>

                <div className="mt-3 rounded-[1.2rem] border border-[#d9c7a6]/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efe2c8] text-sm font-bold text-[#7a5a24] ring-1 ring-[#d9c7a6]/70 dark:bg-white/10 dark:text-[#f1d89b] dark:ring-white/10">
                            {initials(user?.name)}
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                {backendRoleEyebrow(role)}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-[#21180d] dark:text-white">
                                {user?.name || backendRoleLabel(role)}
                            </p>
                            <p className="truncate text-xs text-[#7a6b55] dark:text-white/48">
                                {user?.email || 'BCCC workspace'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <NavGroup label="Workspace" items={mainNav} currentUrl={page.url} permissions={permissions} />

                    {configNav.length > 0 ? (
                        <NavGroup label="Config" items={configNav} currentUrl={page.url} permissions={permissions} />
                    ) : null}

                    <NavGroup label="Quick Links" items={quickLinks} currentUrl={page.url} permissions={permissions} />
                </div>

                <div className="mt-4 rounded-[1.35rem] border border-[#d9c7a6]/60 bg-[#2f2517] p-4 text-white shadow-[0_18px_44px_rgba(47,37,23,0.18)] dark:border-white/10 dark:bg-white/8">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#f4d894]" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f4d894]">
                            Active Role
                        </p>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/72">
                        {backendRoleLabel(role)} workspace is active. Navigation is filtered according to your allowed operations.
                    </p>

                    <Link
                        href="/"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f4d894] transition hover:text-white"
                    >
                        <Globe2 className="h-4 w-4" />
                        Public Website
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
