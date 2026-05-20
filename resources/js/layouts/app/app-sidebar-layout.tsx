import { AppContent } from '@/components/app-content';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BackendRouteLoader from '@/components/ui/backend-route-loader';
import type { BreadcrumbItem } from '@/types';
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

const SIDEBAR_EXPANDED_WIDTH = '17.25rem';
const SIDEBAR_COLLAPSED_WIDTH = '5.25rem';

function getInitialSidebarState() {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = window.localStorage.getItem('bccc-sidebar-collapsed');

    if (stored === 'true') {
        return true;
    }

    if (stored === 'false') {
        return false;
    }

    return window.matchMedia('(min-width: 1024px) and (max-width: 1366px)').matches;
}

function BackendChromePortal({
    breadcrumbs,
    collapsed,
    onCollapsedChange,
    shellStyle,
}: {
    breadcrumbs: BreadcrumbItem[];
    collapsed: boolean;
    onCollapsedChange: (value: boolean) => void;
    shellStyle: CSSProperties;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            className="bccc-backend-chrome-portal"
            data-backend-chrome="fixed"
            data-sidebar-collapsed={collapsed ? 'true' : 'false'}
            style={shellStyle}
        >
            <AppSidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
            <AppSidebarHeader breadcrumbs={breadcrumbs} collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
        </div>,
        document.body,
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [collapsed, setCollapsed] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setCollapsed(getInitialSidebarState());
        setReady(true);
    }, []);

    const updateCollapsed = useCallback((value: boolean) => {
        setCollapsed(value);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('bccc-sidebar-collapsed', value ? 'true' : 'false');
        }
    }, []);

    const shellStyle = useMemo(
        () =>
            ({
                '--bccc-backend-sidebar-width': collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
                '--bccc-backend-sidebar-expanded-width': SIDEBAR_EXPANDED_WIDTH,
                '--bccc-backend-sidebar-collapsed-width': SIDEBAR_COLLAPSED_WIDTH,
            }) as CSSProperties,
        [collapsed],
    );

    return (
        <div
            className="backend-boneyard-root min-h-screen overflow-x-hidden bg-[#edf0ea] text-[#111827] antialiased dark:bg-[#080b10] dark:text-white"
            data-sidebar-collapsed={collapsed ? 'true' : 'false'}
            data-sidebar-ready={ready ? 'true' : 'false'}
            style={shellStyle}
        >
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(31,116,101,0.15),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(77,96,124,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.80),rgba(232,236,232,0.84))] dark:bg-[radial-gradient(circle_at_12%_0%,rgba(125,215,198,0.12),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(82,115,156,0.16),transparent_30%),linear-gradient(135deg,#080b10,#0d1118_45%,#0a0d12)]" />
                <div className="absolute top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/50 to-transparent transition-[left] duration-300 dark:via-white/8 lg:block" style={{ left: 'var(--bccc-backend-sidebar-width)' }} />
                <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(17,24,39,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.5)_1px,transparent_1px)] [background-size:38px_38px] dark:opacity-[0.08] dark:[background-image:linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px)]" />
            </div>

            <BackendChromePortal breadcrumbs={breadcrumbs} collapsed={collapsed} onCollapsedChange={updateCollapsed} shellStyle={shellStyle} />

            <div className="backend-shell relative z-10 min-h-screen">
                <div className="backend-main min-w-0 transition-[padding] duration-300 ease-out">
                    <AppContent>{children}</AppContent>
                </div>
            </div>

            <BackendRouteLoader />
        </div>
    );
}
