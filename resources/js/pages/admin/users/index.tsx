import {
    AdminActionLink,
    AdminEmptyState,
    AdminPolishedPage,
    AdminSectionCard,
    AdminStatCard,
    AdminToolbar,
} from '@/components/admin-resource/admin-polished-page';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { Mail, ShieldCheck, UserCog, UsersRound } from 'lucide-react';

type UserRow = {
    id?: number | string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    role_name?: string | null;
    roles?: Array<string | { name?: string | null }> | null;
    created_at?: string | null;
};

type PageProps = {
    users?: UserRow[] | { data?: UserRow[] };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Users & Roles', href: '/admin/users' },
];

function resolveRows(input?: UserRow[] | { data?: UserRow[] }) {
    if (Array.isArray(input)) {
        return input;
    }

    return input?.data ?? [];
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

function roleCounts(users: UserRow[]) {
    return users.reduce<Record<string, number>>((carry, user) => {
        const role = roleLabel(user);
        carry[role] = (carry[role] ?? 0) + 1;
        return carry;
    }, {});
}

export default function AdminUsersIndex() {
    const { props } = usePage<PageProps>();
    const users = resolveRows(props.users);
    const counts = roleCounts(users);

    return (
        <AdminPolishedPage
            title="Users & Roles"
            eyebrow="System Setup"
            icon={UsersRound}
            breadcrumbs={breadcrumbs}
            subtitle="Manage administrator, manager, staff, and client accounts in one cleaner workspace."
            actions={
                <AdminActionLink href="/admin/users/create">
                    Add User
                </AdminActionLink>
            }
        >
            <div className="grid gap-3 md:grid-cols-4">
                <AdminStatCard
                    label="Total Users"
                    value={users.length}
                    description="All accounts loaded for this workspace."
                    icon={UsersRound}
                />
                <AdminStatCard
                    label="Admins"
                    value={counts.Admin ?? counts.admin ?? counts.Administrator ?? 0}
                    description="System administration accounts."
                    icon={ShieldCheck}
                />
                <AdminStatCard
                    label="Staff"
                    value={counts.Staff ?? counts.staff ?? 0}
                    description="Operational staff accounts."
                    icon={UserCog}
                />
                <AdminStatCard
                    label="Clients"
                    value={counts.User ?? counts.user ?? counts.Client ?? counts.client ?? 0}
                    description="Public or client accounts."
                    icon={Mail}
                />
            </div>

            <div className="mt-5">
                <AdminSectionCard
                    title="Account directory"
                    eyebrow="Users"
                    description="Review workspace users and their assigned role labels."
                >
                    <AdminToolbar
                        searchPlaceholder="Search users by name, email, or role..."
                        right={
                            <AdminActionLink href="/admin/users/create" variant="secondary">
                                Add User
                            </AdminActionLink>
                        }
                    />

                    {users.length === 0 ? (
                        <AdminEmptyState
                            icon={UsersRound}
                            title="No users found"
                            description="Create user accounts for administrators, managers, staff, or clients."
                            actionHref="/admin/users/create"
                            actionLabel="Create User"
                        />
                    ) : (
                        <div className="overflow-hidden rounded-[1.25rem] border border-[#d9c7a6]/70 dark:border-white/10">
                            <div className="grid grid-cols-[1.2fr_1.2fr_0.7fr] gap-3 bg-[#f7f0e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:bg-white/7 dark:text-[#f1d89b]">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Role</span>
                            </div>

                            {users.map((user, index) => (
                                <article
                                    key={user.id ?? index}
                                    className="grid grid-cols-[1.2fr_1.2fr_0.7fr] gap-3 border-t border-[#eadcc2]/80 bg-white/62 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.035]"
                                >
                                    <span className="truncate font-semibold text-[#21180d] dark:text-white">
                                        {user.name || 'Unnamed user'}
                                    </span>
                                    <span className="truncate text-[#6e604c] dark:text-white/56">
                                        {user.email || 'No email'}
                                    </span>
                                    <span className="truncate">
                                        <span className="rounded-full bg-[#f4ead8] px-3 py-1 text-xs font-bold text-[#7a5a24] dark:bg-white/10 dark:text-[#f1d89b]">
                                            {roleLabel(user)}
                                        </span>
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </AdminSectionCard>
            </div>
        </AdminPolishedPage>
    );
}
