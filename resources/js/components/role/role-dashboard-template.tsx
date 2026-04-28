import { RoleActionCard } from '@/components/role/role-action-card';
import { RoleKpiCard } from '@/components/role/role-kpi-card';
import { RoleWorkspaceShell } from '@/components/role/role-workspace-shell';
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
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  backendBookingsHref,
  backendCalendarHref,
  backendHomeHref,
} from '@/lib/backend-navigation';
import { type RoleKey } from '@/lib/role-workspaces';
import type { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  FileBarChart,
  Inbox,
  LayoutDashboard,
  Plus,
  Users,
} from 'lucide-react';

type WorkspaceStats = {
  pending?: number;
  confirmed?: number;
  active?: number;
  completed?: number;
  cancelled?: number;
  declined?: number;
  total_bookings?: number;
  today_bookings?: number;
  month_bookings?: number;
  month_blocks?: number;
  month_public_events?: number;
};

type RecentBooking = {
  id: number | string;
  client_name?: string;
  company_name?: string;
  type_of_event?: string;
  booking_status?: string;
  booking_date_from?: string;
  booking_date_to?: string;
};

type TodayScheduleItem = {
  id: number | string;
  title: string;
  status: string;
  time: string;
};

type WorkspaceSummary = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

type RoleDashboardTemplateProps = {
  role: RoleKey;
  workspaceStats?: WorkspaceStats;
  recentBookings?: RecentBooking[];
  todaySchedule?: TodayScheduleItem[];
  workspaceSummary?: WorkspaceSummary;
};

const roleBreadcrumbs: Record<RoleKey, BreadcrumbItem[]> = {
  admin: [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Dashboard', href: '/admin/dashboard' },
  ],
  manager: [
    { title: 'Manager', href: '/manager/dashboard' },
    { title: 'Dashboard', href: '/manager/dashboard' },
  ],
  staff: [
    { title: 'Staff', href: '/staff/dashboard' },
    { title: 'Dashboard', href: '/staff/dashboard' },
  ],
  user: [
    { title: 'Account', href: '/my-dashboard' },
    { title: 'Dashboard', href: '/my-dashboard' },
  ],
};

const roleTitles: Record<RoleKey, Required<WorkspaceSummary>> = {
  admin: {
    eyebrow: 'Executive Workspace',
    title: 'Administrator Dashboard',
    description:
      'A clean command workspace for public content, booking operations, payments, reports, calendar monitoring, and system configuration.',
  },
  manager: {
    eyebrow: 'Management Workspace',
    title: 'Manager Dashboard',
    description:
      'A focused review workspace for bookings, calendars, reports, payments, and operational decisions.',
  },
  staff: {
    eyebrow: 'Operations Workspace',
    title: 'Staff Dashboard',
    description:
      'A daily work area for assisted booking, schedule checking, client support, and inquiry follow-ups.',
  },
  user: {
    eyebrow: 'Client Portal',
    title: 'My Booking Dashboard',
    description:
      'A simple client workspace for creating event requests, tracking bookings, and returning to the public BCCC website.',
  },
};

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusLabel(status?: string | null) {
  return String(status || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status?: string | null) {
  const normalized = String(status || '').toLowerCase();

  if (['confirmed', 'approved', 'active', 'completed', 'paid'].includes(normalized)) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
  }

  if (['pending', 'pencil_booked', 'for_review', 'partial'].includes(normalized)) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  }

  if (['cancelled', 'declined', 'failed'].includes(normalized)) {
    return 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200';
  }

  return 'border-border bg-muted text-muted-foreground';
}

function formatDate(value?: string | null) {
  if (!value) return 'No date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPrimaryActions(role: RoleKey) {
  if (role === 'admin') {
    return [
      {
        title: 'Public Website Content',
        description:
          'Manage homepage sections, events, facilities, tourism office, contact details, and guidelines.',
        href: '/admin/content',
        icon: Building2,
      },
      {
        title: 'Booking Calendar',
        description:
          'View venue availability, bookings, public events, and calendar blocks.',
        href: '/admin/calendar',
        icon: CalendarDays,
      },
      {
        title: 'Payment Review',
        description:
          'Review payment compliance, proof uploads, and remaining balances.',
        href: '/admin/payments/review',
        icon: CreditCard,
      },
      {
        title: 'Users and Roles',
        description:
          'Manage administrators, managers, staff, clients, and permissions.',
        href: '/admin/users',
        icon: Users,
      },
    ];
  }

  if (role === 'manager') {
    return [
      {
        title: 'Review Bookings',
        description:
          'Open reservations that need management review, updates, or approval decisions.',
        href: '/manager/bookings',
        icon: ClipboardList,
      },
      {
        title: 'Calendar Monitoring',
        description:
          'Review venue schedules, blocked dates, and reservation conflicts.',
        href: '/manager/calendar',
        icon: CalendarDays,
      },
      {
        title: 'Payment Review',
        description:
          'Check payment proof, compliance status, and reservation readiness.',
        href: '/manager/payments/review',
        icon: CreditCard,
      },
      {
        title: 'MICE Registry',
        description:
          'Review reporting records and registry data for internal reports.',
        href: '/manager/reports/mice-registry',
        icon: FileBarChart,
      },
    ];
  }

  if (role === 'staff') {
    return [
      {
        title: 'Today’s Calendar',
        description:
          'Open the daily operations calendar and check venue use for today.',
        href: '/staff/calendar',
        icon: CalendarDays,
      },
      {
        title: 'Assist Booking',
        description:
          'Create a booking request for walk-in, phone, or office-assisted clients.',
        href: '/staff/bookings/create',
        icon: Plus,
      },
      {
        title: 'Booking Records',
        description:
          'Search, review, and update active booking records.',
        href: '/staff/bookings',
        icon: ClipboardList,
      },
      {
        title: 'Inquiries',
        description:
          'Review public inquiries and support client follow-ups.',
        href: '/staff/inquiries',
        icon: Inbox,
      },
    ];
  }

  return [
    {
      title: 'Book Event',
      description:
        'Start a new event reservation request for BCCC review.',
      href: '/book',
      icon: CalendarDays,
    },
    {
      title: 'My Bookings',
      description:
        'View submitted booking requests, payment proof, and status progress.',
      href: '/my-bookings',
      icon: ClipboardList,
    },
    {
      title: 'Public Website',
      description:
        'Return to the public BCCC website.',
      href: '/',
      icon: Building2,
    },
  ];
}

function bookingHref(role: RoleKey, id: number | string) {
  if (role === 'admin') return `/admin/bookings/${id}`;
  if (role === 'manager') return `/manager/bookings/${id}`;
  if (role === 'staff') return `/staff/bookings/${id}`;
  return `/my-bookings/${id}`;
}

export function RoleDashboardTemplate({
  role,
  workspaceStats = {},
  recentBookings = [],
  todaySchedule = [],
  workspaceSummary = {},
}: RoleDashboardTemplateProps) {
  const summary = {
    ...roleTitles[role],
    ...workspaceSummary,
  };

  const primaryActions = getPrimaryActions(role);

  const pending = numberValue(workspaceStats.pending);
  const confirmed = numberValue(workspaceStats.confirmed);
  const active = numberValue(workspaceStats.active);
  const completed = numberValue(workspaceStats.completed);
  const monthBookings = numberValue(workspaceStats.month_bookings);
  const todayBookings = numberValue(workspaceStats.today_bookings);
  const monthBlocks = numberValue(workspaceStats.month_blocks);
  const totalBookings = numberValue(workspaceStats.total_bookings);

  const kpis =
    role === 'user'
      ? [
          {
            title: 'My Bookings',
            value: totalBookings || recentBookings.length,
            description: 'Submitted booking requests in your account.',
            icon: ClipboardList,
          },
          {
            title: 'Pending Review',
            value: pending,
            description: 'Requests currently waiting for BCCC review.',
            icon: Clock3,
          },
          {
            title: 'Confirmed',
            value: confirmed,
            description: 'Approved or confirmed reservations.',
            icon: CheckCircle2,
          },
          {
            title: 'Completed',
            value: completed,
            description: 'Finished booking records.',
            icon: CalendarDays,
          },
        ]
      : [
          {
            title: 'Pending',
            value: pending,
            description: 'Reservations requiring review or action.',
            icon: Clock3,
          },
          {
            title: 'Confirmed',
            value: confirmed,
            description: 'Approved reservations in the system.',
            icon: CheckCircle2,
          },
          {
            title: 'Active Today',
            value: todayBookings || active,
            description: 'Bookings active or scheduled for today.',
            icon: CalendarDays,
          },
          {
            title: 'This Month',
            value: monthBookings || totalBookings,
            description: 'Booking activity counted for the current month.',
            icon: BarChart3,
          },
        ];

  return (
    <RoleWorkspaceShell
      role={role}
      title={summary.title}
      eyebrow={summary.eyebrow}
      description={summary.description}
      breadcrumbs={roleBreadcrumbs[role]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="rounded-full bg-[#171812] text-[#f7f2e8] hover:bg-[#2a2a22] dark:bg-[#c9a96a] dark:text-[#171812] dark:hover:bg-[#d7b978]"
          >
            <Link href={backendHomeHref(role)}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Role Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-full"
          >
            <Link href={role === 'user' ? '/book' : backendCalendarHref(role)}>
              {role === 'user' ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Book Event
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Calendar
                </>
              )}
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <RoleKpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            tone={role}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <Card className="backend-dashboard-section">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a5c21] dark:text-[#e8d8b5]"
                >
                  Primary Actions
                </Badge>

                <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Open your main work areas
                </CardTitle>

                <CardDescription className="mt-2 max-w-3xl">
                  These shortcuts match your role and keep the backend workflow focused.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {primaryActions.map((action) => (
                  <RoleActionCard
                    key={action.href}
                    title={action.title}
                    description={action.description}
                    href={action.href}
                    icon={action.icon}
                    tone={role}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backend-dashboard-section overflow-hidden">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a5c21] dark:text-[#e8d8b5]"
                >
                  Recent Activity
                </Badge>

                <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Latest booking records
                </CardTitle>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link href={backendBookingsHref(role)}>
                  View all
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {recentBookings.length > 0 ? (
                <Table>
                  <TableBody>
                    {recentBookings.slice(0, 8).map((booking) => (
                      <TableRow key={booking.id} className="backend-table-row">
                        <TableCell className="w-[48%] px-6 py-4">
                          <Link
                            href={bookingHref(role, booking.id)}
                            className="font-black text-foreground hover:text-[#8a6b2e] dark:hover:text-[#e8d8b5]"
                          >
                            {booking.type_of_event || 'Event Booking'}
                          </Link>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.company_name || booking.client_name || 'Client'}
                          </p>
                        </TableCell>

                        <TableCell className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                          {formatDate(booking.booking_date_from)}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-right">
                          <Badge
                            variant="outline"
                            className={statusClass(booking.booking_status)}
                          >
                            {statusLabel(booking.booking_status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-6 py-12 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/45" />
                  <h3 className="mt-4 text-lg font-black">
                    No recent booking records
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    New reservations and booking updates will appear in this section.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="backend-dashboard-section">
            <CardHeader>
              <Badge
                variant="outline"
                className="w-fit border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a5c21] dark:text-[#e8d8b5]"
              >
                Workspace Summary
              </Badge>

              <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
                Monthly overview
              </CardTitle>

              <CardDescription>
                A compact count of booking activity, completed records, and calendar blocks.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {[
                ['Total Bookings', totalBookings],
                ['Active', active],
                ['Completed', completed],
                ['Calendar Blocks', monthBlocks],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border bg-muted/35 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-xl font-black tracking-[-0.03em]">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="backend-dashboard-section overflow-hidden">
            <CardHeader>
              <Badge
                variant="outline"
                className="w-fit border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a5c21] dark:text-[#e8d8b5]"
              >
                Today
              </Badge>

              <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
                Active schedule
              </CardTitle>

              <CardDescription>
                Today’s booking and calendar activity.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border bg-muted/35 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.time}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={statusClass(item.status)}
                        >
                          {statusLabel(item.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/25 p-6 text-center">
                  <CalendarDays className="mx-auto h-9 w-9 text-muted-foreground/45" />
                  <h3 className="mt-4 font-black">
                    No active schedule today
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Today’s bookings and venue activities will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backend-dashboard-section">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-[-0.035em]">
                System note
              </CardTitle>
              <CardDescription>
                Keep booking, payment, calendar, and content records aligned before publishing public updates.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Separator className="mb-4" />

              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>
                  Pending bookings should be checked against the calendar before confirmation.
                </p>
                <p>
                  Payment proof must be validated before treating a reservation as fully compliant.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </RoleWorkspaceShell>
  );
}
