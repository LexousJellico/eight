import { RoleWorkspaceShell } from '@/components/role/role-workspace-shell';
import { normalizeWorkspaceRole } from '@/lib/booking-role-ui';
import {
  roleBookingHref,
  roleDashboardHref,
  type RoleThemeKey,
} from '@/lib/role-theme';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

type BookingRolePageShellProps = {
  role?: string | null;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  compact?: boolean;
};

function bookingBreadcrumbs(role: RoleThemeKey): BreadcrumbItem[] {
  return [
    {
      title:
        role === 'admin'
          ? 'Admin'
          : role === 'manager'
            ? 'Manager'
            : role === 'staff'
              ? 'Staff'
              : 'My Dashboard',
      href: roleDashboardHref(role),
    },
    {
      title: role === 'user' ? 'My Bookings' : 'Bookings',
      href: roleBookingHref(role),
    },
  ];
}

function bookingEyebrow(role: RoleThemeKey): string {
  if (role === 'admin') return 'Booking Operations';
  if (role === 'manager') return 'Booking Review';
  if (role === 'staff') return 'Assisted Booking Desk';

  return 'Client Reservation';
}

function fallbackTitle(role: RoleThemeKey): string {
  if (role === 'admin') return 'Booking Operations';
  if (role === 'manager') return 'Booking Review';
  if (role === 'staff') return 'Staff Booking Desk';

  return 'Reserve Your Event Space';
}

function fallbackDescription(role: RoleThemeKey): string {
  if (role === 'admin') {
    return 'Review reservations, schedules, client details, payment proof, survey proof, and public calendar visibility.';
  }

  if (role === 'manager') {
    return 'Review booking records, schedules, payment readiness, and operational requirements.';
  }

  if (role === 'staff') {
    return 'Assist clients, encode bookings, review schedules, and support daily venue operations.';
  }

  return 'Choose your venue, complete the reservation details, and review the digital booking form before submission.';
}

export function BookingRolePageShell({
  role,
  title,
  description,
  actions,
  children,
  compact = false,
}: BookingRolePageShellProps) {
  const normalizedRole = normalizeWorkspaceRole(role) as RoleThemeKey;

  if (normalizedRole === 'user') {
    return (
      <div className="client-booking-inner-shell">
        <div className="client-booking-section-heading">
          <div>
            <p>{bookingEyebrow(normalizedRole)}</p>
            <h2>{title || fallbackTitle(normalizedRole)}</h2>
            <span>{description || fallbackDescription(normalizedRole)}</span>
          </div>

          {actions ? (
            <div className="client-booking-section-actions">
              {actions}
            </div>
          ) : null}
        </div>

        <div className="client-booking-page">
          {children}
        </div>
      </div>
    );
  }

  return (
    <RoleWorkspaceShell
      role={normalizedRole}
      title={title || fallbackTitle(normalizedRole)}
      eyebrow={bookingEyebrow(normalizedRole)}
      description={description || fallbackDescription(normalizedRole)}
      breadcrumbs={bookingBreadcrumbs(normalizedRole)}
      actions={actions}
      compact={compact}
    >
      <div className="backend-booking-page">{children}</div>
    </RoleWorkspaceShell>
  );
}
