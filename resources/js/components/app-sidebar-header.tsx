import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationBell from '@/components/layout/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  backendBookingCreateHref,
  backendCalendarHref,
  backendGuidelinesHref,
  backendHomeHref,
  backendRoleEyebrow,
  backendRoleLabel,
  getBackendRole,
} from '@/lib/backend-navigation';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  CalendarDays,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
} from 'lucide-react';

type AppSidebarHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

function resolveTitle(breadcrumbs: BreadcrumbItem[]) {
  if (breadcrumbs.length > 0) {
    return breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Workspace';
  }

  return 'Workspace';
}

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
  const page = usePage<SharedData>();
  const role = getBackendRole(page.props.auth as any);
  const title = resolveTitle(breadcrumbs);
  const guidelinesHref = backendGuidelinesHref(role);

  return (
    <header className="backend-topbar sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center gap-3 px-3 sm:px-4 lg:px-6">
        <SidebarTrigger className="backend-sidebar-trigger" />

        <div className="min-w-0 flex-1">
          <div className="hidden items-center gap-2 md:flex">
            <Badge
              variant="outline"
              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[10px] font-black uppercase tracking-[0.16em] text-[#8a6b2e] dark:text-[#e8d8b5]"
            >
              {backendRoleLabel(role)}
            </Badge>

            <span className="truncate text-xs font-semibold text-muted-foreground">
              {backendRoleEyebrow(role)}
            </span>
          </div>

          <div className="mt-0 flex min-w-0 items-center gap-3 md:mt-1">
            <h1 className="truncate text-sm font-black tracking-tight text-foreground sm:text-base">
              {title}
            </h1>

            {breadcrumbs.length > 1 ? (
              <div className="hidden min-w-0 text-xs text-muted-foreground lg:block">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border/70 bg-background/70 text-xs font-semibold xl:inline-flex"
            type="button"
          >
            <Search className="mr-2 size-4" />
            Search
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border/70 bg-background/70 text-xs font-semibold lg:inline-flex"
          >
            <Link href={backendHomeHref(role)}>
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border/70 bg-background/70 text-xs font-semibold xl:inline-flex"
          >
            <Link href={backendBookingCreateHref(role)}>
              <Plus className="mr-2 size-4" />
              New Booking
            </Link>
          </Button>

          {guidelinesHref ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden h-9 rounded-full border-border/70 bg-background/70 text-xs font-semibold xl:inline-flex"
            >
              <Link href={guidelinesHref}>
                <HelpCircle className="mr-2 size-4" />
                Guidelines
              </Link>
            </Button>
          ) : null}

          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/70 bg-background/70"
          >
            <Link href={backendCalendarHref(role)}>
              <CalendarDays className="size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/70 bg-background/70"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="size-4" />
            </Link>
          </Button>

          <NotificationBell />
          <AppearanceToggleDropdown />
        </div>
      </div>

      {breadcrumbs.length > 1 ? (
        <div className="border-t border-border/45 px-4 py-2 lg:hidden">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      ) : null}
    </header>
  );
}
