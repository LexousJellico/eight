import {
    ResourceActionLink,
    ResourcePageShell,
    ResourceSection,
    ResourceStatCard,
} from '@/components/admin-resource/resource-page-shell';
import type { BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    Globe2,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type SiteSettings = {
    mapEmbedUrl?: string | null;
    openMapUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    visitaUrl?: string | null;
    creativeBaguioUrl?: string | null;
    footerDescription?: string | null;
    footerCopyright?: string | null;
};

type GuidelineSection = {
    title: string;
    items: string[];
};

type ContactCard = {
    office: string;
    person: string;
    role: string;
    email?: string | null;
    phones: string[];
};

type RentalArea = {
    area: string;
    rates: Array<{
        usage: string;
        rate: string;
    }>;
};

type Props = {
    siteSettings: SiteSettings;
    guidelinesSections: GuidelineSection[];
    contactCards: ContactCard[];
    rentalAreas: RentalArea[];
    reservationNotes: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Guidelines & Contacts', href: '/admin/guidelines-contacts' },
];

function currentBasePath() {
    if (window.location.pathname.startsWith('/manager')) {
        return '/manager/guidelines-contacts';
    }

    return '/admin/guidelines-contacts';
}

function safeArray<T>(value: T[] | null | undefined): T[] {
    return Array.isArray(value) ? value : [];
}

function settingText(value?: string | null, fallback = 'Not configured') {
    return value && String(value).trim() ? String(value) : fallback;
}

export default function AdminGuidelinesContactsPage({
    siteSettings,
    guidelinesSections,
    contactCards,
    rentalAreas,
    reservationNotes,
}: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};
    const basePath = currentBasePath();

    const [form, setForm] = useState({
        map_embed_url: siteSettings?.mapEmbedUrl ?? '',
        open_map_url: siteSettings?.openMapUrl ?? '',
        address: siteSettings?.address ?? '',
        phone: siteSettings?.phone ?? '',
        email: siteSettings?.email ?? '',
        visita_url: siteSettings?.visitaUrl ?? '',
        creative_baguio_url: siteSettings?.creativeBaguioUrl ?? '',
        footer_description: siteSettings?.footerDescription ?? '',
        footer_copyright: siteSettings?.footerCopyright ?? '',
    });

    const [saving, setSaving] = useState(false);

    function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);

        router.post(basePath, form, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    return (
        <ResourcePageShell
            title="Guidelines & Contacts"
            eyebrow="Public Website"
            icon={ShieldCheck}
            breadcrumbs={breadcrumbs}
            subtitle="Keep public policy reminders, office contact details, public website footer links, and BCCC reference information in one clean admin workspace."
            actions={
                <>
                    <ResourceActionLink href="/admin/content" variant="secondary">
                        Content Manager
                    </ResourceActionLink>
                    <ResourceActionLink href="/" variant="primary">
                        Open Public Site
                    </ResourceActionLink>
                </>
            }
        >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ResourceStatCard label="Guideline Groups" value={safeArray(guidelinesSections).length} description="Operational reminder sections." icon={FileText} />
                <ResourceStatCard label="Contact Cards" value={safeArray(contactCards).length} description="Official contact references." icon={Mail} />
                <ResourceStatCard label="Rental Areas" value={safeArray(rentalAreas).length} description="Reference rate sections." icon={BookOpen} />
                <ResourceStatCard label="Reservation Notes" value={safeArray(reservationNotes).length} description="Client-facing reminders." icon={ShieldCheck} />
            </div>

            {flash.success ? (
                <div className="mt-5 rounded-[1.2rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                    {flash.success}
                </div>
            ) : null}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <ResourceSection
                    title="Official operational reminders"
                    eyebrow="Booking Rules"
                    description="Rules are grouped by section so staff do not need to read a crowded long page."
                >
                    <div className="grid gap-3">
                        {safeArray(guidelinesSections).map((section) => (
                            <article
                                key={section.title}
                                className="rounded-[1.25rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                            >
                                <h3 className="text-lg font-semibold tracking-[-0.04em] text-[#21180d] dark:text-white">
                                    {section.title}
                                </h3>

                                <ul className="mt-3 grid gap-2">
                                    {safeArray(section.items).map((item, index) => (
                                        <li key={`${section.title}-${index}`} className="flex gap-3 text-sm leading-7 text-[#6e604c] dark:text-white/56">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b08d48]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </ResourceSection>

                <ResourceSection
                    title="Public contact settings"
                    eyebrow="Editable Site Settings"
                    description="These fields update the public contact/footer settings used by frontend pages."
                >
                    <form onSubmit={submit} className="grid gap-3">
                        <Field label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} icon={MapPin} />
                        <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} icon={Phone} />
                        <Field label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} icon={Mail} />
                        <Field label="VISITA URL" value={form.visita_url} onChange={(value) => setForm((current) => ({ ...current, visita_url: value }))} icon={Globe2} />
                        <Field label="Creative Baguio URL" value={form.creative_baguio_url} onChange={(value) => setForm((current) => ({ ...current, creative_baguio_url: value }))} icon={Globe2} />

                        <label className="grid gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                Footer Description
                            </span>
                            <textarea
                                value={form.footer_description}
                                onChange={(event) => setForm((current) => ({ ...current, footer_description: event.target.value }))}
                                rows={4}
                                className="rounded-[1.1rem] border border-[#d9c7a6]/70 bg-white px-4 py-3 text-sm text-[#21180d] outline-none transition focus:border-[#b08d48] dark:border-white/10 dark:bg-white/7 dark:text-white"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f2517] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(47,37,23,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4a3921] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#17120b]"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </ResourceSection>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <ResourceSection title="Venue rate references" eyebrow="Rental Areas">
                    <div className="grid gap-3">
                        {safeArray(rentalAreas).map((area) => (
                            <article
                                key={area.area}
                                className="rounded-[1.25rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                            >
                                <h3 className="text-lg font-semibold tracking-[-0.04em] text-[#21180d] dark:text-white">
                                    {area.area}
                                </h3>

                                <div className="mt-3 grid gap-2">
                                    {safeArray(area.rates).map((rate) => (
                                        <div
                                            key={`${area.area}-${rate.usage}`}
                                            className="flex items-center justify-between rounded-[1rem] bg-white/70 px-3 py-2 text-sm dark:bg-white/[0.04]"
                                        >
                                            <span className="font-semibold text-[#21180d] dark:text-white">{rate.usage}</span>
                                            <span className="text-[#6e604c] dark:text-white/56">{rate.rate}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </ResourceSection>

                <ResourceSection title="Official contacts" eyebrow="Contact Cards">
                    <div className="grid gap-3">
                        {safeArray(contactCards).map((card) => (
                            <article
                                key={`${card.office}-${card.person}`}
                                className="rounded-[1.25rem] border border-[#eadcc2]/80 bg-[#fffaf0]/72 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                                    {card.office}
                                </p>
                                <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#21180d] dark:text-white">
                                    {card.person}
                                </h3>
                                <p className="mt-1 text-sm text-[#6e604c] dark:text-white/56">{card.role}</p>
                                <p className="mt-3 text-sm leading-7 text-[#6e604c] dark:text-white/56">
                                    Email: {settingText(card.email)}
                                    <br />
                                    Phone: {safeArray(card.phones).join(', ') || 'Not configured'}
                                </p>
                            </article>
                        ))}
                    </div>
                </ResourceSection>
            </div>
        </ResourcePageShell>
    );
}

function Field({
    label,
    value,
    onChange,
    icon: Icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: typeof Mail;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9d7b3d] dark:text-[#f1d89b]">
                {label}
            </span>

            <span className="flex min-h-11 items-center gap-2 rounded-full border border-[#d9c7a6]/70 bg-white px-4 dark:border-white/10 dark:bg-white/7">
                <Icon className="h-4 w-4 shrink-0 text-[#9d7b3d] dark:text-[#f1d89b]" />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#21180d] outline-none placeholder:text-[#8a7a63] dark:text-white"
                />
            </span>
        </label>
    );
}
