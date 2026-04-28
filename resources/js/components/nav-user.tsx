import {
    ChevronsUpDown,
    LogOut,
    Settings,
    User2,
  } from 'lucide-react';
  import { Link, usePage } from '@inertiajs/react';
  import type { SharedData } from '@/types';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from '@/components/ui/sidebar';

  function initialsFromName(name?: string) {
    if (!name) return 'U';

    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'U';
  }

  export function NavUser() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

    const name = user?.name ?? 'BCCC User';
    const email = user?.email ?? 'user@bccc-ease.local';
    const role =
      (user as any)?.role_name ??
      (user as any)?.role ??
      'User';

    const initials = initialsFromName(name);

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="backend-user-menu-button"
                tooltip={name}
              >
                <div className="backend-user-avatar">
                  {initials}
                </div>

                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-black">{name}</span>
                  <span className="truncate text-[11px] font-semibold text-sidebar-foreground/60">
                    {String(role).toUpperCase()}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-4 opacity-70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="end"
              className="w-64 rounded-2xl"
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-black">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User2 className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="w-full text-left"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
