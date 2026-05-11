import type { LucideIcon } from 'lucide-react';

export type ID = number | string;

export type Nullable<T> = T | null;

export type Primitive = string | number | boolean | null | undefined;

export type Dictionary<T = unknown> = Record<string, T>;

export type Appearance = 'light' | 'dark' | 'system';

export type ThemeMode = Appearance;

export type UserRoleName = 'admin' | 'manager' | 'staff' | 'user' | 'client' | string;

export type PermissionName = string;

export type Role = {
    id?: ID;
    name?: UserRoleName | null;
    guard_name?: string | null;
    description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type Permission = {
    id?: ID;
    name: PermissionName;
    guard_name?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type User = {
    id: ID;
    name: string;
    email: string;
    email_verified_at?: string | null;
    avatar?: string | null;
    role?: UserRoleName | null;
    role_name?: UserRoleName | null;
    roles?: Array<Role | string>;
    permissions?: PermissionName[];
    last_login_at?: string | null;
    bookings_view_tracking_started_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type Auth = {
    user: User | null;
    roles?: Array<Role | string>;
    permissions?: PermissionName[];
};

export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
    message?: string | null;
    status?: string | null;
};

export type ValidationErrors = Record<string, string | string[] | undefined>;

export type BreadcrumbItem = {
    title: string;
    href?: string;
};

export type Breadcrumb = BreadcrumbItem;

export type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
    exact?: boolean;
    badge?: string | number | null;
    permission?: string | string[] | null;
    description?: string | null;
    children?: NavItem[];
};

export type SidebarNavItem = NavItem;

export type PageLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PageLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    first_page_url?: string | null;
    from: number | null;
    last_page: number;
    last_page_url?: string | null;
    links: PageLink[];
    next_page_url?: string | null;
    path: string;
    per_page: number;
    prev_page_url?: string | null;
    to: number | null;
    total: number;
};

export type SelectOption<T extends Primitive = string> = {
    label: string;
    value: T;
    description?: string | null;
    category?: string | null;
    disabled?: boolean;
};

export type StatCard = {
    label: string;
    value: string | number;
    description?: string | null;
    icon?: LucideIcon;
    tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

export type SharedData = {
    name?: string;
    auth?: Auth;
    flash?: FlashMessages;
    errors?: ValidationErrors;
    ziggy?: {
        location?: string;
        url?: string;
        port?: number | null;
        defaults?: Record<string, unknown>;
        routes?: Record<string, unknown>;
    };
    csrf_token?: string;
    appName?: string;
    appUrl?: string;
    appearance?: Appearance;
    sidebarOpen?: boolean;
    [key: string]: unknown;
};

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = SharedData & T;

export type BookingStatus =
    | 'pending'
    | 'pencil_booked'
    | 'for_review'
    | 'active'
    | 'approved'
    | 'confirmed'
    | 'cancelled'
    | 'canceled'
    | 'declined'
    | 'completed'
    | 'deleted'
    | 'expired'
    | string;

export type PaymentStatus =
    | 'unpaid'
    | 'partial'
    | 'paid'
    | 'submitted'
    | 'pending'
    | 'for_review'
    | 'confirmed'
    | 'rejected'
    | 'refunded'
    | string;

export type BookingDateRange = {
    booking_date_from?: string | null;
    booking_date_to?: string | null;
    flexible_date_from?: string | null;
    flexible_date_to?: string | null;
};

export type BookingListItem = BookingDateRange & {
    id: ID;
    reference_no?: string | null;
    company_name?: string | null;
    client_name?: string | null;
    client_email?: string | null;
    client_contact_number?: string | null;
    type_of_event?: string | null;
    number_of_guests?: number | null;
    booking_status?: BookingStatus | null;
    payment_status?: PaymentStatus | null;
    public_calendar_title?: string | null;
    is_public_calendar_visible?: boolean | number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type ServiceType = {
    id: ID;
    name: string;
    description?: string | null;
    capacity?: string | number | null;
    min_capacity?: number | null;
    max_capacity?: number | null;
    sort_order?: number | null;
    is_active?: boolean | number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type Service = {
    id: ID;
    service_type_id?: ID | null;
    serviceType?: ServiceType | null;
    service_type?: ServiceType | null;
    name: string;
    description?: string | null;
    rate?: number | string | null;
    price?: number | string | null;
    unit?: string | null;
    min_guests?: number | null;
    max_guests?: number | null;
    capacity_note?: string | null;
    is_active?: boolean | number | null;
    sort_order?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type BookingServiceItem = {
    id?: ID;
    booking_id?: ID;
    service_id: ID;
    service?: Service | null;
    quantity?: number;
    line_total?: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type InertiaPage<TProps extends Record<string, unknown> = Record<string, unknown>> = {
    component: string;
    props: PageProps<TProps>;
    url: string;
    version: string | null;
};

export type FormErrors<T extends Record<string, unknown> = Record<string, unknown>> = Partial<
    Record<keyof T | string, string>
>;

export type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

export type LaravelBoolean = boolean | 0 | 1 | '0' | '1';

export type DateTimeString = string;

export type DateString = string;

export type MoneyValue = number | string;

export * from './public-content';
