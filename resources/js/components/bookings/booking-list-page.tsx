import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import {
  bookingBasePath,
  bookingCreatePath,
  bookingShowPath,
  formatDateTime,
  normalizeWorkspaceRole,
  type BookingLike,
} from '@/lib/booking-role-ui';
import { type RoleThemeKey } from '@/lib/role-theme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link, router, usePage } from '@inertiajs/react';
import {
  CalendarDays,
  ClipboardList,
  Eye,
  Filter,
  Plus,
  Search,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type PaginationLink = {
  url?: string | null;
  label?: string | null;
  active?: boolean;
};

type CollectionLike<T> =
  | T[]
  | {
      data?: T[];
      links?: PaginationLink[];
      meta?: {
        links?: PaginationLink[];
      };
    };

type PageProps = {
  workspaceRole?: string;
  bookings?: CollectionLike<BookingLike>;
  filters?: {
    q?: string;
    status?: string;
    payment_status?: string;
  };
};

function collection<T>(value?: CollectionLike<T>): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;

  return [];
}

function links(value?: CollectionLike<BookingLike>): PaginationLink[] {
  if (!value || Array.isArray(value)) return [];
  if (Array.isArray(value.links)) return value.links;
  if (Array.isArray(value.meta?.links)) return value.meta.links;

  return [];
}

function text(value: unknown, fallback = 'Not set'): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return fallback;
  }

  return String(value);
}

function statusOptions() {
  return [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Declined', value: 'declined' },
  ];
}

function paymentOptions() {
  return [
    { label: 'All Payments', value: '' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid', value: 'paid' },
    { label: 'Owing', value: 'owing' },
  ];
}

function listTitle(role: RoleThemeKey) {
  if (role === 'admin') return 'Booking Operations';
  if (role === 'manager') return 'Booking Review';
  if (role === 'staff') return 'Staff Bookings';

  return 'My Bookings';
}

function listDescription(role: RoleThemeKey) {
  if (role === 'user') {
    return 'Track your submitted event requests, proof requirements, and reservation progress.';
  }

  return 'Search, filter, review, and open booking records using one clean backend workspace.';
}

export function BookingListPage() {
  const { props } = usePage<PageProps>();
  const role = normalizeWorkspaceRole(props.workspaceRole) as RoleThemeKey;
  const rows = useMemo(() => collection(props.bookings), [props.bookings]);
  const pageLinks = links(props.bookings);

  const [q, setQ] = useState(props.filters?.q ?? '');
  const [status, setStatus] = useState(props.filters?.status ?? '');
  const [paymentStatus, setPaymentStatus] = useState(props.filters?.payment_status ?? '');

  const basePath = bookingBasePath(role);
  const canCreate = role === 'admin' || role === 'staff' || role === 'user';

  function submitFilter(event: FormEvent) {
    event.preventDefault();

    router.get(
      basePath,
      {
        q: q || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  return (
    <BookingRolePageShell
      role={role}
      title={listTitle(role)}
      description={listDescription(role)}
      actions={
        canCreate ? (
          <Button asChild className="rounded-full">
            <Link href={bookingCreatePath(role)}>
              <Plus className="mr-2 h-4 w-4" />
              {role === 'user' ? 'Book Event' : 'Create Booking'}
            </Link>
          </Button>
        ) : null
      }
    >
      <Card className="backend-booking-card">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a5c21] dark:text-[#e8d8b5]"
            >
              Records
            </Badge>

            <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
              {rows.length} booking{rows.length === 1 ? '' : 's'} loaded
            </CardTitle>

            <CardDescription className="mt-2">
              Use search and filters before opening a record.
            </CardDescription>
          </div>

          <form
            onSubmit={submitFilter}
            className="grid w-full gap-2 lg:max-w-3xl lg:grid-cols-[1fr_180px_180px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                className="backend-booking-input pl-10"
                placeholder="Search client, company, event..."
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="backend-booking-input"
            >
              {statusOptions().map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="backend-booking-input"
            >
              {paymentOptions().map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button type="submit" variant="outline" className="rounded-full">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </form>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((booking) => (
                    <TableRow key={booking.id} className="backend-booking-row">
                      <TableCell className="min-w-[260px]">
                        <Link
                          href={bookingShowPath(role, booking.id)}
                          className="font-black text-foreground hover:text-[#8a6b2e] dark:hover:text-[#e8d8b5]"
                        >
                          {text(booking.type_of_event, `Booking #${booking.id}`)}
                        </Link>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {text(booking.service_name ?? booking.service?.name, 'Venue not set')}
                        </p>
                      </TableCell>

                      <TableCell className="min-w-[240px]">
                        <p className="font-semibold">
                          {text(booking.client_name)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {text(booking.company_name, 'No organization')}
                        </p>
                      </TableCell>

                      <TableCell className="min-w-[220px]">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            {formatDateTime(booking.booking_date_from)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="min-w-[220px]">
                        <div className="flex flex-wrap gap-2">
                          <BookingStatusBadge value={booking.booking_status} />
                          <BookingStatusBadge value={booking.payment_status} />
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Link href={bookingShowPath(role, booking.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h3 className="mt-4 text-lg font-black">
                No bookings found
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Try clearing filters or create a new booking request.
              </p>

              {canCreate ? (
                <Button asChild className="mt-5 rounded-full">
                  <Link href={bookingCreatePath(role)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Booking
                  </Link>
                </Button>
              ) : null}
            </div>
          )}

          {pageLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t p-4">
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
                    className="rounded-full border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground/50"
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </BookingRolePageShell>
  );
}
