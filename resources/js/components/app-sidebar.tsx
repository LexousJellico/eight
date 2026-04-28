import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  backendAdminConfigNav,
  backendExternalNav,
  backendHomeHref,
  backendMainNav,
  backendRoleEyebrow,
  backendRoleLabel,
  getBackendRole,
} from '@/lib/backend-navigation';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, Sparkles } from 'lucide-react';

export function AppSidebar() {
  const page = usePage<SharedData>();
  const role = getBackendRole(page.props.auth as any);
  const configNav = backendAdminConfigNav(role);
  const quickLinks = backendExternalNav(role);

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="backend-sidebar"
    >
      <SidebarHeader className="backend-sidebar-header">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="backend-sidebar-brand"
              tooltip="BCCC EASE"
            >
              <Link href={backendHomeHref(role)} prefetch>
                <div className="backend-sidebar-logo">
                  <Building2 className="size-5" />
                </div>

                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-black tracking-[-0.03em]">
                    BCCC EASE
                  </span>
                  <span className="truncate text-[11px] font-semibold text-sidebar-foreground/60">
                    Events Access & Scheduling
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="backend-sidebar-role-card group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#c9a96a]" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96a]">
              {backendRoleEyebrow(role)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-black text-sidebar-foreground">
              {backendRoleLabel(role)}
            </p>

            <Badge
              variant="outline"
              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96a]"
            >
              Active
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="backend-sidebar-content backend-sidebar-scroll">
        <NavMain label="Workspace" items={backendMainNav(role)} />

        {configNav.length > 0 ? (
          <>
            <SidebarSeparator className="backend-sidebar-separator" />
            <NavMain label="Configuration" items={configNav} />
          </>
        ) : null}

        {quickLinks.length > 0 ? (
          <>
            <SidebarSeparator className="backend-sidebar-separator" />
            <NavMain label="Quick Links" items={quickLinks} />
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="backend-sidebar-footer">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
