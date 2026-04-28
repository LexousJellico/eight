import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  cleanLabel,
  compactDate,
  extractCollection,
  extractLinks,
} from '@/lib/admin-resource-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link, router, usePage } from '@inertiajs/react';
import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type UserRecord = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  organization_name?: string | null;
  position_title?: string | null;
  roles?: Array<string | { name?: string | null }>;
  created_at?: string | null;
  email_verified_at?: string | null;
};

type PageProps = {
  workspaceRole?: string;
  users?: unknown;
  filters?: {
    q?: string;
  };
};

function roleNames(user: UserRecord): string[] {
  if (!Array.isArray(user.roles)) return [];

  return user.roles
    .map((role) => (typeof role === 'string' ? role : role?.name))
    .filter(Boolean)
    .map((role) => String(role));
}

export function UserManagementPage() {
  const { props } = usePage() as unknown as { props: PageProps };
  const users = useMemo(() => extractCollection<UserRecord>(props.users), [props.users]);
  const pageLinks = extractLinks(props.users);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));

  function destroy(user: UserRecord) {
    if (!window.confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) {
      return;
    }

    router.delete(`/admin/users/${user.id}`, {
      preserveScroll: true,
    });
  }

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      '/admin/users',
      { q: q || undefined },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  return (
    <ResourcePageShell
      role={props.workspaceRole}
      current="Users"
      eyebrow="Access Configuration"
      title="User Management"
      description="Manage administrator, manager, staff, and client accounts using the same backend workspace style."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              New User
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/users/roles">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Role Matrix
            </Link>
          </Button>
        </div>
      }
    >
      <Card className="backend-admin-card overflow-hidden">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-[-0.04em]">
              {users.length} user{users.length === 1 ? '' : 's'}
            </CardTitle>

            <CardDescription>
              Manage backend access, roles, account status, and user information.
            </CardDescription>
          </div>

          <form onSubmit={search} className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="backend-admin-input pl-11"
              placeholder="Search users..."
            />
          </form>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => {
                const roles = roleNames(user);

                return (
                  <div
                    key={user.id}
                    className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="backend-admin-icon">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-lg font-black">
                            {user.name || 'Unnamed User'}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {user.organization_name || 'No organization'} · {user.position_title || 'No position title'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
                            >
                              {cleanLabel(role)}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No role</Badge>
                        )}

                        <Badge variant="outline">
                          Created {compactDate(user.created_at)}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={
                            user.email_verified_at
                              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                              : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200'
                          }
                        >
                          {user.email_verified_at ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => destroy(user)}
                        className="rounded-full border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h3 className="mt-4 text-xl font-black">No users found</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Create administrator, manager, staff, or client user accounts from here.
              </p>
            </div>
          )}

          {pageLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t p-5">
              {pageLinks.map((link, index) =>
                link.url ? (
                  <Link
                    key={`${link.label}-${index}`}
                    href={link.url}
                    preserveScroll
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      link.active
                        ? 'border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ) : (
                  <span
                    key={`${link.label}-${index}`}
                    className="rounded-full border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground/50"
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </ResourcePageShell>
  );
}
