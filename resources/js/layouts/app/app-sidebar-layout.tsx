import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { GlobalFeedbackLayer } from '@/components/ui/global-feedback-layer';
import { BackendRouteLoader } from '@/components/ui/backend-route-loader';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell variant="sidebar">
      <BackendRouteLoader />

      <AppSidebar />

      <AppContent
        variant="sidebar"
        className="backend-app-content min-w-0 overflow-x-hidden bg-muted/30"
      >
        <AppSidebarHeader breadcrumbs={breadcrumbs} />

        <main className="backend-page-frame min-w-0 overflow-x-hidden">
          {children}
        </main>
      </AppContent>

      <GlobalFeedbackLayer />
    </AppShell>
  );
}
