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
import type { BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileBarChart,
  Globe2,
  LayoutDashboard,
  Megaphone,
  PanelsTopLeft,
  Settings2,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  activeTab?: string;
  activeSection?: string;
  breadcrumbs?: BreadcrumbItem[];
};

type PageProps = {
  auth?: {
    user?: {
      name?: string;
      email?: string;
    };
  };
};

const contentLinks = [
  {
    label: 'Content Manager',
    href: '/admin/content',
    icon: PanelsTopLeft,
  },
  {
    label: 'Homepage',
    href: '/admin/content?section=homepage',
    icon: Globe2,
  },
  {
    label: 'Events',
    href: '/admin/content?section=events',
    icon: Megaphone,
  },
  {
    label: 'Facilities',
    href: '/admin/content?section=facilities',
    icon: Sparkles,
  },
  {
    label: 'Tourism Office',
    href: '/admin/content?section=tourism',
    icon: UsersRound,
  },
];

const operationsLinks = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendar',
    href: '/admin/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Manage Calendar',
    href: '/admin/calendar/manage',
    icon: Settings2,
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    icon: ClipboardList,
  },
  {
    label: 'Payments',
    href: '/admin/payments/review',
    icon: CreditCard,
  },
  {
    label: 'MICE Registry',
    href: '/admin/reports/mice-registry',
    icon: FileBarChart,
  },
  {
    label: 'Analytics',
    href: '/admin/bookings/analytics',
    icon: BarChart3,
  },
];

function ShortcutButton({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: typeof PanelsTopLeft;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="backend-admin-shortcut rounded-full"
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}

export default function AdminLayout({
  children,
  title = 'Public Content Manager',
  subtitle,
  description = 'Manage public-facing content while staying inside the same BCCC backend workspace.',
  eyebrow = 'Content Configuration',
  actions,
  breadcrumbs = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Content', href: '/admin/content' },
  ],
}: AdminLayoutProps) {
  const { props } = usePage() as unknown as { props: PageProps };
  const userName = props.auth?.user?.name || 'BCCC Admin';

  return (
    <RoleWorkspaceShell
      role="admin"
      title={title}
      eyebrow={eyebrow}
      description={subtitle || description}
      breadcrumbs={breadcrumbs}
      actions={actions}
      compact
    >
      <div className="backend-admin-page">
        <Card className="backend-admin-card overflow-hidden">
          <CardHeader className="gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge
                variant="outline"
                className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
              >
                Unified Admin Workspace
              </Badge>

              <CardTitle className="mt-3 text-2xl font-black tracking-[-0.04em]">
                Public content and backend tools now share one interface
              </CardTitle>

              <CardDescription className="mt-2 max-w-4xl">
                Signed in as {userName}. Use these shortcuts without switching into a different-looking admin page.
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className="w-fit border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
            >
              Same admin shell
            </Badge>
          </CardHeader>

          <CardContent className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="backend-admin-label mb-3">
                Public Website Content
              </p>

              <div className="flex flex-wrap gap-2">
                {contentLinks.map((item) => (
                  <ShortcutButton key={item.href} {...item} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="backend-admin-label mb-3">
                Booking Operations
              </p>

              <div className="flex flex-wrap gap-2">
                {operationsLinks.map((item) => (
                  <ShortcutButton key={item.href} {...item} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="backend-admin-content-normalizer min-w-0">
          {children}
        </section>
      </div>
    </RoleWorkspaceShell>
  );
}
