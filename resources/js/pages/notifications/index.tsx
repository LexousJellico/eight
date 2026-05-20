import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    BellRing,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Eye,
    FileText,
    MessageCircle,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    UserCog,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type NotificationItem = {
    id: number | string;
    type?: string | null;
    kind?: string | null;
    action_key?: string | null;
    severity?: 'info' | 'success' | 'warning' | 'danger' | string | null;
    audience?: string | null;
    privacy_scope?: string | null;
    title: string;
    message?: string | null;
    link?: string | null;
    read_at?: string | null;
    created_at?: string | null;
    is_unread?: boolean;
    actor?: {
        id?: number | string;
        name?: string | null;
        email?: string | null;
    } | null;
};

type PaginationLink = {
    url?: string | null;
    label?: string | null;
    active?: boolean;
};

type Feed = {
    data?: NotificationItem[];
    links?: PaginationLink[];
};

type Props = {
    notificationFeed?: Feed | NotificationItem[];
    notifications?: Feed | NotificationItem[];
    notificationFilters?: {
        q?: string;
        status?: 'all' | 'unread' | 'read' | string;
        kind?: string;
    };
    notificationStats?: Record<string, number | undefined>;
    automationLatest?: Feed | NotificationItem[];
    isClientNotificationCenter?: boolean;
    notificationKindOptions?: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

const optionLabels: Record<string, string> = {
    all: 'All Types',
    automation: 'Automation',
    bookings: 'Bookings',
    payments: 'Payments',
    calendar: 'Calendar',
    services: 'Services',
    users: 'Users / Accounts',
    account: 'My Account',
    inquiries: 'Inquiries',
    mice: 'MICE',
    deadline: 'Deadlines',
    content: 'Content',
    system: 'System',
};

function collection(value: unknown): NotificationItem[] {
    if (Array.isArray(value)) return value as NotificationItem[];

    if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown[] }).data)) {
        return (value as { data: NotificationItem[] }).data;
    }

    return [];
}

function linksOf(value: unknown): PaginationLink[] {
    if (value && typeof value === 'object' && Array.isArray((value as { links?: PaginationLink[] }).links)) {
        return (value as { links: PaginationLink[] }).links;
    }

    return [];
}

function cleanLabel(value?: string | null) {
    return String(value || 'System')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactDateTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function notificationIcon(type?: string | null, kind?: string | null) {
    const normalized = `${type || ''} ${kind || ''}`.toLowerCase();

    if (normalized.includes('payment')) return CreditCard;
    if (normalized.includes('booking')) return ShieldCheck;
    if (normalized.includes('calendar')) return CalendarDays;
    if (normalized.includes('automation') || normalized.includes('deadline')) return BellRing;
    if (normalized.includes('mice')) return FileText;
    if (normalized.includes('inquiry')) return MessageCircle;
    if (normalized.includes('user') || normalized.includes('account') || normalized.includes('role')) return UserCog;
    if (normalized.includes('content')) return FileText;
    if (normalized.includes('system')) return Settings;

    return Bell;
}

function typeClass(type?: string | null, kind?: string | null) {
    const normalized = `${type || ''} ${kind || ''}`.toLowerCase();

    if (normalized.includes('payment')) return 'is-payment';
    if (normalized.includes('booking')) return 'is-booking';
    if (normalized.includes('calendar')) return 'is-calendar';
    if (normalized.includes('automation') || normalized.includes('deadline')) return 'is-automation';
    if (normalized.includes('mice')) return 'is-mice';
    if (normalized.includes('inquiry')) return 'is-deadline';

    return '';
}

function severityClass(severity?: string | null) {
    const normalized = String(severity || 'info').toLowerCase();

    if (['success', 'good', 'approved'].includes(normalized)) return 'is-good';
    if (['danger', 'error', 'rejected', 'declined'].includes(normalized)) return 'is-bad';
    if (['warning', 'warn', 'due'].includes(normalized)) return 'is-warn';

    return '';
}

function paginationLabel(label?: string | null) {
    return String(label || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&laquo;|&raquo;/g, '')
        .trim();
}

function Pagination({ links }: { links: PaginationLink[] }) {
    if (!links.length) return null;

    return (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveScroll
                        className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                            link.active
                                ? 'border-[#20242b] bg-[#20242b] text-white dark:border-white dark:bg-white dark:text-slate-950'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                        aria-label={paginationLabel(link.label)}
                        dangerouslySetInnerHTML={{ __html: link.label || '' }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60"
                        dangerouslySetInnerHTML={{ __html: link.label || '' }}
                    />
                ),
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    helper,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    helper: string;
    icon: typeof Bell;
}) {
    return (
        <article className="notification-kpi">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="backend-booking-label">{label}</p>
                    <strong>{value}</strong>
                </div>
                <div className="alh-admin-kpi-icon">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p>{helper}</p>
        </article>
    );
}

function ClientConversation({ feed, links }: { feed: NotificationItem[]; links: PaginationLink[] }) {
    return (
        <main className="notification-conversation-shell">
            <div className="notification-conversation-header">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7f2f0] text-[#1f7465] dark:bg-white/10 dark:text-[#7dd7c6]">
                    <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                    <p className="backend-booking-label">Private system conversation</p>
                    <h2>BCCC EASE System</h2>
                    <span>Only your own booking, payment, account, and system messages are shown here.</span>
                </div>
            </div>

            <div className="notification-conversation-thread">
                {feed.length > 0 ? (
                    feed.map((item) => {
                        const Icon = notificationIcon(item.type, item.kind);
                        const unread = item.is_unread || !item.read_at;

                        return (
                            <article key={item.id} className={`notification-chat-message ${unread ? 'is-unread' : ''}`}>
                                <div className="notification-chat-avatar">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="notification-chat-bubble">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`alh-status-chip ${severityClass(item.severity)}`}>{cleanLabel(item.severity || item.kind || item.type)}</span>
                                        {unread ? <span className="alh-status-chip is-warn">Unread</span> : null}
                                        <span className="booking-mini-pill"><Clock3 className="h-3.5 w-3.5" /> {compactDateTime(item.created_at)}</span>
                                    </div>
                                    <h3>{item.title}</h3>
                                    {item.message ? <p>{item.message}</p> : null}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link href={`/notifications/${item.id}/open`} className="alh-primary-button">
                                            <Eye className="h-4 w-4" />
                                            Open
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="ops-empty-state">
                        <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                        <h3>No private messages yet</h3>
                        <p>Your booking, payment, deadline, and account messages will appear here.</p>
                    </div>
                )}
            </div>

            <Pagination links={links} />
        </main>
    );
}

export default function NotificationsIndex({
    notificationFeed,
    notifications,
    notificationFilters,
    notificationStats,
    automationLatest,
    isClientNotificationCenter = false,
    notificationKindOptions,
}: Props) {
    const feedSource = notificationFeed ?? notifications;
    const feed = useMemo(() => collection(feedSource), [feedSource]);
    const pageLinks = useMemo(() => linksOf(feedSource), [feedSource]);
    const automation = useMemo(() => collection(automationLatest), [automationLatest]);

    const [q, setQ] = useState(String(notificationFilters?.q ?? ''));
    const [status, setStatus] = useState(String(notificationFilters?.status ?? 'all'));
    const [kind, setKind] = useState(String(notificationFilters?.kind ?? 'all'));

    const stats = notificationStats ?? {};
    const unreadCount = stats.unread ?? feed.filter((item) => item.is_unread || !item.read_at).length;
    const readCount = stats.read ?? feed.filter((item) => !item.is_unread && item.read_at).length;
    const kindOptions = (notificationKindOptions && notificationKindOptions.length > 0 ? notificationKindOptions : ['all', 'automation', 'bookings', 'payments', 'calendar', 'services', 'users', 'system']).map((value) => ({
        value,
        label: optionLabels[value] ?? cleanLabel(value),
    }));

    function applyFilters(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        router.get('/notifications', {
            q: q || undefined,
            status: status && status !== 'all' ? status : undefined,
            kind: kind && kind !== 'all' ? kind : undefined,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        setQ('');
        setStatus('all');
        setKind('all');

        router.get('/notifications', {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="notifications-responsive-page backend-admin-page space-y-5">
                <section className={isClientNotificationCenter ? 'notification-hero notification-hero-client' : 'notification-hero'}>
                    <div>
                        <p className="backend-booking-label">Notifications</p>
                        <h1>{isClientNotificationCenter ? 'Your private BCCC EASE messages.' : 'System alerts, automation notices, and booking updates.'}</h1>
                        <span>
                            {isClientNotificationCenter
                                ? 'This inbox works like a private conversation from the system. You only see your own booking, payment, deadline, and account updates.'
                                : 'Review all BCCC EASE monitoring notifications. Admin can monitor booking, account, staff, manager, content, calendar, inquiry, payment, and MICE activity.'}
                        </span>
                    </div>

                    <button type="button" onClick={markAllRead} className="alh-primary-button">
                        <CheckCircle2 className="h-4 w-4" />
                        Mark All Read
                    </button>
                </section>

                <section className="notification-stat-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total" value={stats.total ?? stats.all ?? feed.length} helper="Notifications visible to your current role." icon={Bell} />
                    <StatCard label="Unread" value={unreadCount} helper="Messages still requiring attention." icon={BellRing} />
                    <StatCard label="Read" value={readCount} helper="Already opened or marked read." icon={CheckCircle2} />
                    <StatCard label={isClientNotificationCenter ? 'Private' : 'Automation'} value={isClientNotificationCenter ? 'Scoped' : (stats.automation ?? automation.length)} helper={isClientNotificationCenter ? 'Filtered to your account only.' : 'Lifecycle automation notifications.'} icon={Sparkles} />
                </section>

                <form onSubmit={applyFilters} className="notification-filter-grid notification-panel p-4">
                    <div className="relative xl:col-span-2">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={q} onChange={(event) => setQ(event.target.value)} className="backend-booking-input pl-10" placeholder="Search notification title or message..." />
                    </div>

                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="backend-booking-input">
                        <option value="all">All statuses</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>

                    <select value={kind} onChange={(event) => setKind(event.target.value)} className="backend-booking-input">
                        {kindOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <button type="submit" className="alh-primary-button justify-center">Search</button>
                    <button type="button" onClick={resetFilters} className="alh-secondary-button justify-center"><X className="h-4 w-4" /> Reset</button>
                </form>

                {isClientNotificationCenter ? (
                    <ClientConversation feed={feed} links={pageLinks} />
                ) : (
                    <section className="notification-monitoring-layout grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <main className="notification-panel overflow-hidden">
                            <div className="notification-panel-header">
                                <div>
                                    <p className="backend-booking-label">Monitoring Feed</p>
                                    <h2>{feed.length} visible notification{feed.length === 1 ? '' : 's'}</h2>
                                    <span>Admin monitoring receives system-wide actions, including staff and manager updates.</span>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {feed.length > 0 ? (
                                    feed.map((item) => {
                                        const Icon = notificationIcon(item.type, item.kind);
                                        const unread = item.is_unread || !item.read_at;

                                        return (
                                            <article key={item.id} className={`notification-row ${unread ? 'is-unread' : ''}`}>
                                                <div className={`notification-row-icon ${typeClass(item.type, item.kind)}`}><Icon className="h-5 w-5" /></div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`alh-status-chip ${unread ? 'is-warn' : 'is-good'}`}>{unread ? 'Unread' : 'Read'}</span>
                                                        <span className={`alh-status-chip ${severityClass(item.severity)}`}>{cleanLabel(item.severity || 'info')}</span>
                                                        <span className="booking-mini-pill">{cleanLabel(item.kind || item.type)}</span>
                                                        <span className="booking-mini-pill"><Clock3 className="h-3.5 w-3.5" /> {compactDateTime(item.created_at)}</span>
                                                    </div>

                                                    <h3>{item.title}</h3>
                                                    {item.message ? <p>{item.message}</p> : null}
                                                    {item.actor ? <p className="mt-1 !text-[11px] uppercase tracking-[0.16em] !text-slate-400">Actor: {item.actor.name} · {item.actor.email}</p> : null}
                                                </div>

                                                <div className="flex flex-wrap gap-2 xl:justify-end">
                                                    <Link href={`/notifications/${item.id}/open`} className="alh-primary-button"><Eye className="h-4 w-4" /> Open</Link>
                                                    {item.link ? <a href={item.link} className="alh-secondary-button">Direct Link</a> : null}
                                                </div>
                                            </article>
                                        );
                                    })
                                ) : (
                                    <div className="ops-empty-state">
                                        <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                                        <h3>No notifications found</h3>
                                        <p>System and booking notifications will appear here when available.</p>
                                    </div>
                                )}
                            </div>

                            <Pagination links={pageLinks} />
                        </main>

                        <aside className="space-y-5">
                            <section className="notification-panel overflow-hidden">
                                <div className="notification-panel-header"><div><p className="backend-booking-label">Automation Latest</p><h2>Recent automation</h2></div></div>
                                <div className="grid gap-3 p-5">
                                    {automation.length > 0 ? automation.map((item) => {
                                        const Icon = notificationIcon(item.type, item.kind);
                                        return (
                                            <Link key={item.id} href={`/notifications/${item.id}/open`} className="notification-side-card">
                                                <Icon className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                                                <span><strong>{item.title}</strong><small>{compactDateTime(item.created_at)}</small></span>
                                            </Link>
                                        );
                                    }) : (
                                        <div className="ops-empty-state !p-8"><Sparkles className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-700" /><h3>No automation alerts</h3><p>Lifecycle notifications will appear here.</p></div>
                                    )}
                                </div>
                            </section>

                            <section className="notification-panel overflow-hidden">
                                <div className="notification-panel-header"><div><p className="backend-booking-label">Breakdown</p><h2>Types</h2></div></div>
                                <div className="grid gap-3 p-5">
                                    {[
                                        ['Bookings', stats.bookings ?? 0],
                                        ['Payments', stats.payments ?? 0],
                                        ['Calendar', stats.calendar ?? 0],
                                        ['Inquiries', stats.inquiries ?? 0],
                                        ['MICE', stats.mice ?? 0],
                                        ['Users', stats.users ?? 0],
                                        ['Content', stats.content ?? 0],
                                        ['System', stats.system ?? 0],
                                    ].map(([label, value]) => (
                                        <div key={String(label)} className="alh-admin-mini-box"><span>{label}</span><strong>{value}</strong></div>
                                    ))}
                                </div>
                            </section>
                        </aside>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
