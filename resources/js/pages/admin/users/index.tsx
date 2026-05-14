import {
    ResourceActionLink,
    ResourceEmptyState,
    ResourcePageShell,
    ResourceSection,
    ResourceStatCard,
} from '@/components/admin-resource/resource-page-shell';
import type { BreadcrumbItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Clock3,
    KeyRound,
    Mail,
    MailCheck,
    MailWarning,
    Pencil,
    Search,
    ShieldCheck,
    UserCog,
    UsersRound,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type RoleValue = string | { name?: string | null };

type PaginationLink = {
    url?: string | null;
    label?: string | null;
    active?: boolean;
};

type PaginatedUsers = {
    data?: UserRow[];
    links?: PaginationLink[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
};

type UserRow = {
    id?: number | string;
    name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    organization_name?: string | null;
    organization_type?: string | null;
    position_title?: string | null;
    role?: string | null;
    role_name?: string | null;
    roles?: RoleValue[] | null;
    email_verified_at?: string | null;
    last_login_at?: string | null;
    google_id?: string | number | null;
    created_at?: string | null;
};

type PageProps = {
    users?: UserRow[] | PaginatedUsers;
    availableRoles?: string[];
    filters?: {
        q?: string | null;
        search?: string | null;
        role?: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Users & Roles', href: '/admin/users' },
];

function paginated(value: PageProps['users']): PaginatedUsers {
    if (Array.isArray(value)) {
        return { data: value };
    }

    if (value && typeof value === 'object') {
        return value;
    }

    return { data: [] };
}

function plainLabel(label?: string | null) {
    if (!label) {
        return '';
    }

    return label
        .replace(/&laquo;/g, '‹')
        .replace(/&raquo;/g, '›')
        .replace(/&amp;/g, '&');
}

function roleLabel(user: UserRow) {
    if (user.role_name || user.role) {
        return user.role_name || user.role || 'User';
    }

    const firstRole = user.roles?.[0];

    if (typeof firstRole === 'string') {
        return firstRole;
    }

    return firstRole?.name || 'User';
}

function normalizedRole(user: UserRow) {
    return roleLabel(user).toLowerCase();
}

function roleBadgeClass(role: string) {
    const normalized = role.toLowerCase();

    if (normalized.includes('admin')) {
        return 'bg-[#2f2517] text-white dark:bg-white dark:text-[#17120b]';
    }

    if (normalized.includes('manager')) {
        return 'bg-[#ead6a3] text-[#4a3515] dark:bg-[#f1d89b] dark:text-[#17120b]';
    }

    if (normalized.includes('staff')) {
        return 'bg-[#f4ead8] text-[#7a5a24] dark:bg-white/10 dark:text-[#f1d89b]';
    }

    return 'bg-[#fff8ea] text-[#6e604c] ring-1 ring-[#d9c7a6]/70 dark:bg-white/7 dark:text-white/70 dark:ring-white/10';
}

function formatDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    return value;
}

export default function AdminUsersIndex() {
    const { props } = usePage<PageProps>();
    const safeUsers = useMemo(() => paginated(props.users), [props.users]);
    const users = useMemo(() => safeUsers.data ?? [], [safeUsers.data]);
    const availableRoles = props.availableRoles ?? [];
    const initialSearch = props.filters?.q ?? props.filters?.search ?? '';
    const initialRole = props.filters?.role ?? '';

    const [search, setSearch] = useState(initialSearch);
    const [role, setRole] = useState(initialRole || 'all');
    const [verifyingId, setVerifyingId] = useState<number | string | null>(null);

    const stats = useMemo(() => {
        const adminCount = users.filter((user) => normalizedRole(user).includes('admin')).length;
        const managerCount = users.filter((user) => normalizedRole(user).includes('manager')).length;
        const staffCount = users.filter((user) => normalizedRole(user).includes('staff')).length;
        const verifiedCount = users.filter((user) => Boolean(user.email_verified_at)).length;
        const unverifiedCount = users.filter((user) => !user.email_verified_at).length;

        return {
            total: safeUsers.total ?? users.length,
            loaded: users.length,
            admins: adminCount,
            managers: managerCount,
            staff: staffCount,
            verified: verifiedCount,
            unverified: unverifiedCount,
        };
    }, [safeUsers.total, users]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/admin/users',
            {
                q: search.trim() || undefined,
                role: role && role !== 'all' ? role : undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRole('all');

        router.get(
            '/admin/users',
            {},
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const verifyEmail = (user: UserRow) => {
        if (!user.id || user.email_verified_at) {
            return;
        }

        setVerifyingId(user.id);

        router.post(
            `/admin/users/${user.id}/verify-email`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setVerifyingId(null),
            },
        );
    };

    return (
        <ResourcePageShell
            title="Users & Roles"
            eyebrow="System Setup"
            icon={UsersRound}
            breadcrumbs={breadcrumbs}
            subtitle="Manage administrator, manager, staff, and client accounts with email verification controls in one consistent workspace."
            actions={
                <ResourceActionLink href="/admin/users/create">
                    Add User
                </ResourceActionLink>
            }
        >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <ResourceStatCard
                    label="Total Users"
                    value={stats.total}
                    description={`${stats.loaded} loaded on this page.`}
                    icon={UsersRound}
                />

                <ResourceStatCard
                    label="Verified"
                    value={stats.verified}
                    description="Email verified on this page."
                    icon={MailCheck}
                />

                <ResourceStatCard
                    label="Unverified"
                    value={stats.unverified}
                    description="Needs admin action."
                    icon={MailWarning}
                />

                <ResourceStatCard
                    label="Admins"
                    value={stats.admins}
                    description="System control accounts."
                    icon={ShieldCheck}
                />

                <ResourceStatCard
                    label="Managers"
                    value={stats.managers}
                    description="Review and approval accounts."
                    icon={UserCog}
                />

                <ResourceStatCard
                    label="Staff"
                    value={stats.staff}
                    description="Operations workspace accounts."
                    icon={KeyRound}
                />
            </div>

            <div className="mt-5">
                <ResourceSection
                    title="Account directory"
                    eyebrow="Users"
                    description="Review accounts, check email verification status, and manually verify new users when needed."
                    actions={
                        <ResourceActionLink href="/admin/users/create" variant="secondary">
                            Add User
                        </ResourceActionLink>
                    }
                >
                    <form
                        onSubmit={submitSearch}
                        className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#d9c7a6]/70 bg-[#fffaf0]/70 p-3 dark:border-white/10 dark:bg-white/[0.035] lg:grid-cols-[minmax(0,1fr)_220px_auto_auto] lg:items-center"
                    >
                        <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 dark:border-white/10 dark:bg-white/7">
                            <Search className="h-4 w-4 shrink-0 text-[#9d7b3d] dark:text-[#f1d89b]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search users by name, email, phone, organization, or position..."
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#21180d] outline-none placeholder:text-[#8a7a63] dark:text-white dark:placeholder:text-white/42"
                            />
                        </label>

                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="min-h-11 rounded-full border border-[#d9c7a6]/70 bg-white px-4 text-sm font-semibold text-[#2f2517] outline-none transition focus:border-[#9d7b3d] dark:border-white/10 dark:bg-white/7 dark:text-white"
                        >
                            <option value="all">All roles</option>
                            {availableRoles.map((roleName) => (
                                <option key={roleName} value={roleName}>
                                    {roleName}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.14)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] dark:bg-white dark:text-[#17120b]"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>

                        {(search || (role && role !== 'all')) ? (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-5 text-sm font-semibold text-[#2f2517] transition hover:-translate-y-0.5 hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </button>
                        ) : null}
                    </form>

                    {users.length === 0 ? (
                        <ResourceEmptyState
                            icon={UsersRound}
                            title="No users found"
                            description="Create user accounts for administrators, managers, staff, and clients."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-[1.25rem] border border-[#d9c7a6]/70 dark:border-white/10">
                            <div className="hidden grid-cols-[1.05fr_1.15fr_0.8fr_0.95fr_0.75fr] gap-3 bg-[#f7f0e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:bg-white/7 dark:text-[#f1d89b] xl:grid">
                                <span>Name</span>
                                <span>Contact</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span className="text-right">Actions</span>
                            </div>

                            <div className="divide-y divide-[#eadcc2]/80 dark:divide-white/10">
                                {users.map((user, index) => {
                                    const userRole = roleLabel(user);
                                    const verified = Boolean(user.email_verified_at);
                                    const isVerifying = verifyingId === user.id;

                                    return (
                                        <article
                                            key={user.id ?? index}
                                            className="grid gap-3 bg-white/62 px-4 py-4 text-sm dark:bg-white/[0.035] xl:grid-cols-[1.05fr_1.15fr_0.8fr_0.95fr_0.75fr] xl:items-center"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-[#21180d] dark:text-white">
                                                    {user.name || 'Unnamed user'}
                                                </p>

                                                <p className="mt-1 text-xs text-[#7a6b55] dark:text-white/42">
                                                    ID #{user.id ?? '—'} · Created {formatDate(user.created_at)}
                                                </p>
                                            </div>

                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-[#6e604c] dark:text-white/64">
                                                    {user.email || 'No email'}
                                                </p>

                                                <p className="truncate text-xs text-[#8a7a63] dark:text-white/42">
                                                    {user.phone_number || 'No phone'}
                                                    {user.organization_name ? ` · ${user.organization_name}` : ''}
                                                </p>

                                                {(user.organization_type || user.position_title) ? (
                                                    <p className="truncate text-xs text-[#8a7a63] dark:text-white/42">
                                                        {[user.organization_type, user.position_title].filter(Boolean).join(' · ')}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div>
                                                <span
                                                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-bold ${roleBadgeClass(userRole)}`}
                                                >
                                                    {userRole}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={
                                                        verified
                                                            ? 'inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-300/20'
                                                            : 'inline-flex min-h-8 items-center gap-1.5 rounded-full bg-amber-50 px-3 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-300/20'
                                                    }
                                                >
                                                    {verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <MailWarning className="h-3.5 w-3.5" />}
                                                    {verified ? 'Verified' : 'Unverified'}
                                                </span>

                                                {user.google_id ? (
                                                    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#f4ead8] px-3 text-xs font-bold text-[#7a5a24] ring-1 ring-[#d9c7a6]/70 dark:bg-white/10 dark:text-[#f1d89b] dark:ring-white/10">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Google
                                                    </span>
                                                ) : null}

                                                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-[#6e604c] ring-1 ring-[#d9c7a6]/70 dark:bg-white/7 dark:text-white/56 dark:ring-white/10">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    Last login {formatDate(user.last_login_at)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                                                {!verified && user.id ? (
                                                    <button
                                                        type="button"
                                                        disabled={isVerifying}
                                                        onClick={() => verifyEmail(user)}
                                                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-3 text-xs font-bold text-white transition hover:bg-[#4a3921] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#17120b]"
                                                    >
                                                        <MailCheck className="h-3.5 w-3.5" />
                                                        {isVerifying ? 'Verifying...' : 'Verify email'}
                                                    </button>
                                                ) : null}

                                                {user.id ? (
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-3 text-xs font-bold text-[#2f2517] transition hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {safeUsers.links && safeUsers.links.length > 3 ? (
                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                            {safeUsers.links.map((link, index) => {
                                const label = plainLabel(link.label);

                                return link.url ? (
                                    <Link
                                        key={`${label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={
                                            link.active
                                                ? 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-[#2f2517] px-3 text-xs font-bold text-white dark:bg-white dark:text-[#17120b]'
                                                : 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[#d9c7a6]/70 bg-white px-3 text-xs font-bold text-[#2f2517] transition hover:bg-[#f7f0e3] dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:bg-white/12'
                                        }
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <span
                                        key={`${label}-${index}`}
                                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[#eadcc2]/70 bg-[#fffaf0]/60 px-3 text-xs font-bold text-[#9b8a72] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/32"
                                    >
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    ) : null}
                </ResourceSection>
            </div>
        </ResourcePageShell>
    );
}
