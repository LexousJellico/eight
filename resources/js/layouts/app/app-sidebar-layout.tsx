import { AppContent } from '@/components/app-content';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BackendRouteLoader from '@/components/ui/backend-route-loader';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <div className="min-h-screen bg-[#f7f3ea] text-[#21180d] antialiased dark:bg-[#0c0f14] dark:text-white">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#d8b56d]/18 blur-3xl dark:bg-[#d8b56d]/8" />
                <div className="absolute bottom-[-16rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-[#7a5a24]/12 blur-3xl dark:bg-white/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_38%)]" />
            </div>

            <div className="relative z-10 flex min-h-screen">
                <AppSidebar />

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[18.5rem]">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />

                    <AppContent>
                        {children}
                    </AppContent>
                </div>
            </div>

            <BackendRouteLoader />
        </div>
    );
}
