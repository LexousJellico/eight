import { RoleWorkspaceShell } from '@/components/role/role-workspace-shell';
import {
  addMonths,
  availabilityLabel,
  availabilityTone,
  blockLabel,
  buildMonthGrid,
  calendarRoleCopy,
  cleanCalendarLabel,
  eventTone,
  formatDateKey,
  monthLabel,
  normalizeCalendarRole,
  parseMonth,
  roleBookingCreatePath,
  roleBookingShowPath,
  roleCalendarBasePath,
  roleCalendarManagePath,
  type CalendarBlockKey,
  type CalendarDayCell,
  type CalendarEventItem,
} from '@/lib/calendar-role-ui';
import { getRoleTheme, roleDashboardHref, type RoleThemeKey } from '@/lib/role-theme';
import type { BreadcrumbItem } from '@/types';
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
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  ExternalLink,
  ListFilter,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type RoleCalendarPageProps = {
  workspaceRole?: string;
  counts?: Record<string, number>;
  events?: CalendarEventItem[];
  month?: string;
  monthAvailability?: Record<string, any>;
  areaOptions?: string[];
};

const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function calendarBreadcrumbs(role: RoleThemeKey): BreadcrumbItem[] {
  return [
    {
      title:
        role === 'admin'
          ? 'Admin'
          : role === 'manager'
            ? 'Manager'
            : role === 'staff'
              ? 'Staff'
              : 'Account',
      href: roleDashboardHref(role),
    },
    {
      title: 'Calendar',
      href: roleCalendarBasePath(role),
    },
  ];
}

function eventHref(role: RoleThemeKey, event: CalendarEventItem): string | null {
  if (event.kind === 'booking' && /^\d+$/.test(String(event.id))) {
    return roleBookingShowPath(role, event.id);
  }

  if (event.kind === 'block' && (role === 'admin' || role === 'manager')) {
    return roleCalendarManagePath(role);
  }

  return null;
}

function AvailabilityPill({
  block,
  open,
}: {
  block: CalendarBlockKey;
  open?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={
        open
          ? 'border-emerald-500/25 bg-emerald-500/10 text-[10px] font-black text-emerald-700 dark:text-emerald-200'
          : 'border-red-500/25 bg-red-500/10 text-[10px] font-black text-red-700 dark:text-red-200'
      }
    >
      {blockLabel(block)}
    </Badge>
  );
}

function CountCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card className="backend-admin-card">
      <CardContent className="p-5">
        <p className="backend-admin-label">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-[-0.04em]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function CalendarDay({
  role,
  day,
  selected,
  onSelect,
}: {
  role: RoleThemeKey;
  day: CalendarDayCell;
  selected: boolean;
  onSelect: (day: CalendarDayCell) => void;
}) {
  const visibleEvents = day.events.slice(0, 3);
  const overflow = Math.max(day.events.length - visibleEvents.length, 0);
  const canCreate = role === 'admin' || role === 'staff' || role === 'user';
  const canBlock = role === 'admin' || role === 'manager';

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={`backend-calendar-day ${selected ? 'is-selected' : ''} ${
        day.isCurrentMonth ? '' : 'opacity-45'
      } ${availabilityTone(day.availability)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-black tracking-[-0.04em]">
            {day.dayNumber}
          </p>
          <p className="backend-admin-label">
            {availabilityLabel(day.availability)}
          </p>
        </div>

        {day.isToday ? (
          <Badge
            variant="outline"
            className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
          >
            Today
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <AvailabilityPill block="AM" open={day.availability?.AM} />
        <AvailabilityPill block="PM" open={day.availability?.PM} />
        <AvailabilityPill block="EVE" open={day.availability?.EVE} />
      </div>

      <div className="mt-3 space-y-1.5">
        {visibleEvents.map((event) => (
          <div
            key={`${event.kind}-${event.id}-${event.start}`}
            className={`truncate rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${eventTone(event)}`}
          >
            {cleanCalendarLabel(event.title)}
          </div>
        ))}

        {overflow > 0 ? (
          <div className="rounded-full border bg-muted/40 px-2.5 py-1 text-[10px] font-black text-muted-foreground">
            +{overflow} more
          </div>
        ) : null}

        {day.events.length === 0 ? (
          <p className="text-xs font-bold text-muted-foreground">
            No scheduled item
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {canCreate ? (
          <Link
            href={roleBookingCreatePath(role, day.key)}
            onClick={(event) => event.stopPropagation()}
            className="backend-calendar-mini-action"
          >
            Book
          </Link>
        ) : null}

        {canBlock ? (
          <Link
            href={roleCalendarManagePath(role, day.key)}
            onClick={(event) => event.stopPropagation()}
            className="backend-calendar-mini-action"
          >
            Block
          </Link>
        ) : null}
      </div>
    </button>
  );
}

function SelectedDayPanel({
  role,
  day,
}: {
  role: RoleThemeKey;
  day?: CalendarDayCell;
}) {
  if (!day) {
    return (
      <Card className="backend-admin-card">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Select a date to view details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = day.date.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const canCreate = role === 'admin' || role === 'staff' || role === 'user';
  const canBlock = role === 'admin' || role === 'manager';

  return (
    <Card className="backend-admin-card sticky top-24">
      <CardHeader>
        <Badge
          variant="outline"
          className="w-fit border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
        >
          Selected Date
        </Badge>

        <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
          {formattedDate}
        </CardTitle>

        <CardDescription>
          Availability, blocks, bookings, and public event items for this day.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <AvailabilityPill block="AM" open={day.availability?.AM} />
          <AvailabilityPill block="PM" open={day.availability?.PM} />
          <AvailabilityPill block="EVE" open={day.availability?.EVE} />
        </div>

        <div className="rounded-2xl border bg-muted/35 p-4">
          <p className="backend-admin-label">Day Status</p>
          <p className="mt-2 text-sm font-black">
            {availabilityLabel(day.availability)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCreate ? (
            <Button asChild className="rounded-full">
              <Link href={roleBookingCreatePath(role, day.key)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Booking
              </Link>
            </Button>
          ) : null}

          {canBlock ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={roleCalendarManagePath(role, day.key)}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Manage Blocks
              </Link>
            </Button>
          ) : null}
        </div>

        <Separator />

        <div>
          <p className="backend-admin-label">Schedule Items</p>
          <h4 className="mt-1 text-lg font-black">
            {day.events.length} item{day.events.length === 1 ? '' : 's'}
          </h4>

          <div className="mt-4 grid gap-2">
            {day.events.length > 0 ? (
              day.events.map((event) => {
                const href = eventHref(role, event);

                const content = (
                  <div className={`rounded-2xl border p-3 ${eventTone(event)}`}>
                    <p className="text-sm font-black">
                      {cleanCalendarLabel(event.title)}
                    </p>
                    <p className="mt-1 text-xs opacity-70">
                      {event.area || event.block || event.kind || 'Calendar item'}
                    </p>
                    {href ? (
                      <span className="mt-2 inline-flex items-center text-xs font-black">
                        Open <ExternalLink className="ml-1 h-3 w-3" />
                      </span>
                    ) : null}
                  </div>
                );

                return href ? (
                  <Link key={`${event.kind}-${event.id}-${event.start}`} href={href}>
                    {content}
                  </Link>
                ) : (
                  <div key={`${event.kind}-${event.id}-${event.start}`}>
                    {content}
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
                No booking, block, or public event is attached to this date.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoleCalendarPage() {
  const { props } = usePage<RoleCalendarPageProps>();
  const role = normalizeCalendarRole(props.workspaceRole) as RoleThemeKey;
  const theme = getRoleTheme(role);
  const copy = calendarRoleCopy(role);
  const month = props.month || formatDateKey(new Date()).slice(0, 7);
  const availability = props.monthAvailability || {};
  const events = Array.isArray(props.events) ? props.events : [];
  const counts = props.counts || {};
  const [selectedKey, setSelectedKey] = useState(() => formatDateKey(new Date()));

  const grid = useMemo(
    () => buildMonthGrid(month, availability, events),
    [month, availability, events],
  );

  const selectedDay = useMemo(
    () => grid.find((day) => day.key === selectedKey) ?? grid.find((day) => day.isToday) ?? grid[0],
    [grid, selectedKey],
  );

  const currentMonthDate = parseMonth(month);
  const previousMonth = formatDateKey(addMonths(currentMonthDate, -1)).slice(0, 7);
  const nextMonth = formatDateKey(addMonths(currentMonthDate, 1)).slice(0, 7);

  function goToMonth(nextMonthValue: string) {
    router.get(
      roleCalendarBasePath(role),
      { month: nextMonthValue },
      {
        preserveScroll: true,
        preserveState: false,
        replace: true,
      },
    );
  }

  return (
    <RoleWorkspaceShell
      role={role}
      title={copy.title}
      eyebrow={copy.eyebrow}
      description={copy.description}
      breadcrumbs={calendarBreadcrumbs(role)}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href={copy.manageHref}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {copy.primaryAction}
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link href={copy.createHref}>
              <Plus className="mr-2 h-4 w-4" />
              {copy.secondaryAction}
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link href={copy.analyticsHref}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {copy.tertiaryAction}
            </Link>
          </Button>
        </div>
      }
    >
      <div className="backend-admin-page">
        <section className="grid gap-4 md:grid-cols-4">
          <CountCard label="Pending" value={counts.pending ?? 0} />
          <CountCard label="Confirmed" value={counts.confirmed ?? 0} />
          <CountCard label="Active" value={counts.active ?? 0} />
          <CountCard label="Completed" value={counts.completed ?? 0} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <Card className="backend-admin-card">
              <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
                  >
                    Calendar Month
                  </Badge>

                  <CardTitle className="mt-3 text-3xl font-black tracking-[-0.05em]">
                    {monthLabel(month)}
                  </CardTitle>

                  <CardDescription>
                    View bookings, public events, blocked dates, and time-block availability.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => goToMonth(previousMonth)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => goToMonth(formatDateKey(new Date()).slice(0, 7))}
                  >
                    <Clock3 className="mr-2 h-4 w-4" />
                    Today
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => goToMonth(nextMonth)}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="backend-admin-card overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {weekLabels.map((label) => (
                    <div
                      key={label}
                      className="rounded-2xl border bg-muted/35 py-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {label}
                    </div>
                  ))}

                  {grid.map((day) => (
                    <CalendarDay
                      key={day.key}
                      role={role}
                      day={day}
                      selected={selectedDay?.key === day.key}
                      onSelect={(nextDay) => setSelectedKey(nextDay.key)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="backend-admin-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ListFilter className="h-5 w-5 text-[#8a6b2e] dark:text-[#e8d8b5]" />
                  <div>
                    <CardTitle className="text-xl font-black">Legend</CardTitle>
                    <CardDescription>Calendar color meanings</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-700 dark:text-emerald-200">
                  Confirmed / Active Booking
                </div>
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm font-bold text-amber-700 dark:text-amber-200">
                  Pending / Partial
                </div>
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm font-bold text-red-700 dark:text-red-200">
                  Blocked / Unavailable
                </div>
                <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3 text-sm font-bold text-sky-700 dark:text-sky-200">
                  Public Event
                </div>
              </CardContent>
            </Card>
          </div>

          <SelectedDayPanel role={role} day={selectedDay} />
        </section>
      </div>
    </RoleWorkspaceShell>
  );
}
