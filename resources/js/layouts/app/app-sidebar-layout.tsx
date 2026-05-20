import { AppContent } from '@/components/app-content';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BackendRouteLoader from '@/components/ui/backend-route-loader';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

function BackendChromePortal({ breadcrumbs, collapsed, onCollapsedChange }: { breadcrumbs: BreadcrumbItem[]; collapsed: boolean; onCollapsedChange: (value: boolean) => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div className="bccc-backend-chrome-portal" data-backend-chrome="fixed" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
            <AppSidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
            <AppSidebarHeader breadcrumbs={breadcrumbs} collapsed={collapsed} />
        </div>,
        document.body,
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem('bccc-sidebar-collapsed');
        setCollapsed(stored === 'true');
    }, []);

    const updateCollapsed = (value: boolean) => {
        setCollapsed(value);
        window.localStorage.setItem('bccc-sidebar-collapsed', value ? 'true' : 'false');
    };

    return (
        <div className="backend-boneyard-root min-h-screen overflow-x-hidden bg-[#edf0ea] text-[#111827] antialiased dark:bg-[#080b10] dark:text-white">
            <a href="#backend-main-content" className="bccc-skip-link">Skip to workspace</a>
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(31,116,101,0.15),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(77,96,124,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.80),rgba(232,236,232,0.84))] dark:bg-[radial-gradient(circle_at_12%_0%,rgba(125,215,198,0.12),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(82,115,156,0.16),transparent_30%),linear-gradient(135deg,#080b10,#0d1118_45%,#0a0d12)]" />
                <div className={collapsed ? 'absolute left-[5.25rem] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/50 to-transparent transition-[left] duration-300 dark:via-white/8 lg:block' : 'absolute left-[17.25rem] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/50 to-transparent transition-[left] duration-300 dark:via-white/8 lg:block'} />
                <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(17,24,39,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.5)_1px,transparent_1px)] [background-size:38px_38px] dark:opacity-[0.08] dark:[background-image:linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px)]" />
            </div>

            <BackendChromePortal breadcrumbs={breadcrumbs} collapsed={collapsed} onCollapsedChange={updateCollapsed} />

            <div className="backend-shell relative z-10 min-h-screen">
                <div className={collapsed ? 'backend-main min-w-0 transition-[padding] duration-300 lg:pl-[5.25rem]' : 'backend-main min-w-0 transition-[padding] duration-300 lg:pl-[17.25rem]'}>
                    <AppContent>{children}</AppContent>
                </div>
            </div>

            <BackendRouteLoader />
        </div>
    );
}
