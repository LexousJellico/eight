import {
    isBackendActive,
    userHasPermission,
    type BackendNavItem,
  } from '@/lib/backend-navigation';
  import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from '@/components/ui/sidebar';
  import type { SharedData } from '@/types';
  import { Link, usePage } from '@inertiajs/react';

  type NavMainProps = {
    label: string;
    items?: BackendNavItem[];
  };

  export function NavMain({ label, items = [] }: NavMainProps) {
    const page = usePage<SharedData>();
    const permissions = [
      ...((page.props.auth?.permissions ?? []) as string[]),
      ...(((page.props.auth?.user as any)?.permissions ?? []) as string[]),
    ];

    const visibleItems = items.filter((item) =>
      userHasPermission(permissions, item.permission),
    );

    if (visibleItems.length === 0) {
      return null;
    }

    return (
      <SidebarGroup className="backend-sidebar-group">
        <SidebarGroupLabel className="backend-sidebar-group-label">
          {label}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isBackendActive(page.url, item.href, item.exact);

              return (
                <SidebarMenuItem key={`${label}-${item.href}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className="backend-sidebar-menu-button"
                  >
                    <Link href={item.href} prefetch>
                      {Icon ? <Icon className="size-4 shrink-0" /> : null}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
