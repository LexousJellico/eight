import AppLayout from '@/layouts/app-layout';
import {
  getRoleTheme,
  normalizeRoleTheme,
  type RoleThemeKey,
} from '@/lib/role-theme';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type RoleWorkspaceShellProps = {
  role?: RoleThemeKey | string | null;
  title: string;
  eyebrow?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  compact?: boolean;
};

export function RoleWorkspaceShell({
  role = 'admin',
  title,
  eyebrow,
  description,
  breadcrumbs = [],
  actions,
  children,
  compact = false,
}: RoleWorkspaceShellProps) {
  const normalizedRole = normalizeRoleTheme(role);
  const theme = getRoleTheme(normalizedRole);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />

      <div className="backend-page-shell">
        <div className="backend-page-container">
          <Card className="backend-page-hero overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c9a96a]/10 blur-3xl" />
              <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-foreground/[0.035] blur-3xl" />
            </div>

            <CardHeader className={compact ? 'relative p-5 sm:p-6' : 'relative p-6 sm:p-8'}>
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div className="max-w-5xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[11px] font-black uppercase tracking-[0.22em] text-[#7a5c21] dark:text-[#e8d8b5]"
                    >
                      {eyebrow || theme.eyebrow}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-border/70 bg-background/60 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {theme.label}
                    </Badge>
                  </div>

                  <CardTitle
                    className={`mt-4 max-w-5xl font-black leading-[0.98] tracking-[-0.055em] ${
                      compact ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-5xl'
                    }`}
                  >
                    {title}
                  </CardTitle>

                  {description ? (
                    <CardDescription className="mt-4 max-w-4xl text-sm leading-7 sm:text-base">
                      {description}
                    </CardDescription>
                  ) : null}
                </div>

                {actions ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {actions}
                  </div>
                ) : null}
              </div>
            </CardHeader>
          </Card>

          <CardContent className="backend-page-content px-0 pb-0">
            {children}
          </CardContent>
        </div>
      </div>
    </AppLayout>
  );
}
