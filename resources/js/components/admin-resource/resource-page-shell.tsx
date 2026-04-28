import { RoleWorkspaceShell } from '@/components/role/role-workspace-shell';
import {
  currentWorkspaceRole,
  normalizeAdminResourceRole,
  roleHomeHref,
  type AdminResourceRole,
} from '@/lib/admin-resource-ui';
import { getRoleTheme } from '@/lib/role-theme';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

type ResourcePageShellProps = {
  role?: string | null;
  title: string;
  eyebrow?: string;
  description: string;
  current: string;
  children: ReactNode;
  actions?: ReactNode;
};

function resourceHref(role: AdminResourceRole, current: string): string {
  if (role === 'admin') {
    if (current === 'Content') return '/admin/content';
    if (current === 'Venue Areas') return '/admin/venue-areas';
    if (current === 'Rental Options') return '/admin/rental-options';
    if (current === 'Users') return '/admin/users';
    if (current === 'Inquiries') return '/admin/inquiries';
    if (current === 'Payment Review') return '/admin/payments/review';
    if (current === 'MICE Registry') return '/admin/reports/mice-registry';

    return '/admin/dashboard';
  }

  if (role === 'manager') {
    if (current === 'Payment Review') return '/manager/payments/review';
    if (current === 'MICE Registry') return '/manager/reports/mice-registry';
    if (current === 'Bookings') return '/manager/bookings';

    return '/manager/dashboard';
  }

  if (role === 'staff') {
    if (current === 'Inquiries') return '/staff/inquiries';
    return '/staff/dashboard';
  }

  return '/my-dashboard';
}

export function ResourcePageShell({
  role,
  title,
  eyebrow = 'Backend Workspace',
  description,
  current,
  children,
  actions,
}: ResourcePageShellProps) {
  const normalizedRole = normalizeAdminResourceRole(role ?? currentWorkspaceRole());
  const theme = getRoleTheme(normalizedRole);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: theme.label,
      href: roleHomeHref(normalizedRole),
    },
    {
      title: current,
      href: resourceHref(normalizedRole, current),
    },
  ];

  return (
    <RoleWorkspaceShell
      role={normalizedRole}
      title={title}
      eyebrow={eyebrow}
      description={description}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="backend-admin-page">
        {children}
      </div>
    </RoleWorkspaceShell>
  );
}
