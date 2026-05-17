import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import {
  BCCC_BOOKING_GENERAL_GUIDELINES,
  BOOKING_USAGE_LABELS,
  BOOKING_VENUE_CATALOG,
  catalogItemMatchesService,
  estimateSelectedVenueCharge,
  type BookingUsageKey,
  type BookingVenueCatalogItem,
  type BookingVenueKey,
} from '@/lib/booking-venue-catalog';
import { bookingBasePath, bookingShowPath, normalizeWorkspaceRole } from '@/lib/booking-role-ui';
import type { RoleThemeKey } from '@/lib/role-theme';
import {
  OTHER_ADDRESS_VALUE,
  PHILIPPINES_ADDRESS_OPTIONS,
  cityByName,
  provinceByName,
  regionByCode,
  type CityOption,
  type ProvinceOption,
  type RegionOption,
} from '@/data/philippines-addresses';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Pencil,
  ReceiptText,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type ServiceOption = {
  id: number | string;
  name: string;
  price?: number | string | null;
  description?: string | null;
  service_type_id?: number | string | null;
  service_type_name?: string | null;
  service_type?: {
    id?: number | string;
    name?: string | null;
  } | null;
};

type ServiceTypeOption = {
  id: number | string;
  name: string;
  services?: ServiceOption[];
};

type PaginatedLike<T> = {
  data?: T[];
};

type InitialSchedule = {
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  booking_date_from?: string | null;
  booking_date_to?: string | null;
  from?: string | null;
  to?: string | null;
};

type BookingRecord = {
  id?: number | string | null;
  service_id?: number | string | null;
  service?: { id?: number | string | null } | null;
  booking_date_from?: string | null;
  booking_date_to?: string | null;
  selected_package_code?: string | null;
  selected_area_keys?: string[] | null;
  dressing_room_selection?: string | null;
  dressing_room_charge?: number | string | null;
  mice_required?: boolean | number | null;
  mice_exemption_reason?: string | null;
  private_event_type?: string | null;
  organization_type?: string | null;
  company_name?: string | null;
  client_name?: string | null;
  client_contact_number?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_region?: string | null;
  client_province?: string | null;
  client_city_municipality?: string | null;
  client_barangay?: string | null;
  client_zip_code?: string | null;
  client_street_address?: string | null;
  head_of_organization?: string | null;
  type_of_event?: string | null;
  number_of_guests?: number | string | null;
  survey_email?: string | null;
  booking_status?: string | null;
  payment_status?: string | null;
  is_public_calendar_visible?: boolean | number | null;
  public_calendar_title?: string | null;
  payment_meta?: Record<string, unknown> | null;
  schedule_meta?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type SelectOption = {
  value: string | number | boolean;
  label: string;
  charge?: number | string | null;
  charge_label?: string | null;
};

type VenuePackageOption = {
  code: string;
  name?: string | null;
  label?: string | null;
  subtitle?: string | null;
  description?: string | null;
  area_keys?: string[] | null;
  area_labels?: string[] | null;
  image_path?: string | null;
  is_public?: boolean | number | null;
  is_featured?: boolean | number | null;
  sort_order?: number | null;
};

type BookingFormOptions = {
  venuePackages?: VenuePackageOption[];
  dressingRooms?: SelectOption[];
  schedule?: {
    baseBlocks?: Record<string, unknown> | SelectOption[];
    segmentRoles?: Record<string, unknown> | SelectOption[];
    additionalHourOptions?: SelectOption[] | number[];
  };
  mice?: {
    classificationOptions?: SelectOption[];
    typeOptions?: SelectOption[];
    coveredMonthOptions?: SelectOption[];
    eventCenterOptions?: SelectOption[];
    privateEventOptions?: SelectOption[];
  };
};

type BookingFormPageProps = {
  workspaceRole?: string;
  booking?: BookingRecord;
  serviceTypes?: ServiceTypeOption[] | PaginatedLike<ServiceTypeOption>;
  services?: ServiceOption[] | PaginatedLike<ServiceOption>;
  venuePackages?: VenuePackageOption[];
  bookingFormOptions?: BookingFormOptions;
  initialSchedule?: InitialSchedule;
  initialPackageCode?: string | null;
  initialVenue?: string | null;
  initialEventType?: string | null;
  initialGuests?: number | string | null;
};

type BookingFormItem = {
  service_id: string;
  quantity: number;
};

type BookingPaymentMeta = Record<string, unknown>;

type BookingScheduleSegmentPayload = {
  date: string;
  segment_role: 'event' | 'ingress' | 'egress';
  base_block: 'am' | 'pm' | 'whole_day';
  additional_hours: number;
  area_keys: string[];
};

type BookingFormData = {
  service_id: string;
  items: BookingFormItem[];
  payment_meta: BookingPaymentMeta;

  selected_package_code: string;
  selected_area_keys: string[];
  dressing_room_selection: string;
  dressing_room_charge: string;
  mice_required: boolean;
  mice_exemption_reason: string;
  private_event_type: string;
  schedule_version: string;
  schedule_meta: BookingPaymentMeta;
  schedule_segments: BookingScheduleSegmentPayload[];

  organization_type: string;
  company_name: string;
  client_name: string;
  client_contact_number: string;
  client_email: string;

  client_address: string;
  client_region: string;
  client_province: string;
  client_city_municipality: string;
  client_barangay: string;
  client_zip_code: string;
  client_street_address: string;

  head_of_organization: string;
  type_of_event: string;

  booking_date_from: string;
  booking_date_to: string;
  number_of_guests: string;

  survey_email: string;
  survey_proof_image: File | null;

  booking_status: string;
  payment_status: string;
  is_public_calendar_visible: boolean;
  public_calendar_title: string;

  package_acknowledged: boolean;
  policy_acknowledged: boolean;
  accuracy_acknowledged: boolean;

  estimated_usage: BookingUsageKey;
  estimated_duration_hours: string;
  estimated_other_rentals: string;
  estimated_additional_charges: string;
  reservation_notes: string;

  event_nature: 'mice' | 'private' | '';
  event_center_name: string;
  event_center_other: string;
  covered_month: string;
  classification_of_event: string;
  classification_other: string;
  mice_type_of_event: string;
  mice_type_other: string;
  function_halls_count: string;
  function_hall_capacity: string;
  number_of_hours: string;
  foreign_attendees: string;
  domestic_attendees: string;
  total_number_of_countries: string;
  countries_breakdown_text: string;
  has_exhibitions: string;
  exhibitors_count: string;
  visitors_count: string;
  comments_feedback: string;
};

type MatchedVenueItem = BookingVenueCatalogItem & {
  service?: ServiceOption;
  configured: boolean;
};

type StepDefinition = {
  title: string;
  subtitle: string;
  icon: typeof PackageCheck;
};

type FieldName = keyof BookingFormData;

type ScheduleBaseBlock = 'AM' | 'PM' | 'WHOLE_DAY';

type BookingDateRange = {
  from: string;
  to: string;
};

const BOOKING_STEPS: StepDefinition[] = [
  { title: 'Package', subtitle: 'Venue package', icon: PackageCheck },
  { title: 'Event', subtitle: 'MICE or private', icon: ClipboardList },
  { title: 'Organizer', subtitle: 'Contact details', icon: UserRound },
  { title: 'Address', subtitle: 'PH dropdowns', icon: MapPin },
  { title: 'Schedule', subtitle: 'Date and time', icon: CalendarDays },
  { title: 'MICE', subtitle: 'Report fields', icon: Sparkles },
  { title: 'Guidelines', subtitle: 'Terms', icon: ShieldCheck },
  { title: 'Review', subtitle: 'Final check', icon: CheckCircle2 },
];

const FALLBACK_ORGANIZATION_TYPES = ['Private', 'Government', 'NGO', 'Academe', 'Religious', 'Corporate', 'Association', 'Other'];

const FALLBACK_MICE_CLASSIFICATIONS: SelectOption[] = [
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'REGIONAL ASIA PACIFIC', label: 'Regional Asia Pacific' },
  { value: 'REGIONAL OFFSHORE', label: 'Regional Offshore' },
  { value: 'REGIONAL PHILIPPINES', label: 'Regional Philippines' },
  { value: 'NATIONAL', label: 'National' },
  { value: 'OTHER', label: 'Other / for validation' },
];

const FALLBACK_MICE_TYPES: SelectOption[] = [
  { value: 'MEETINGS', label: 'Meetings' },
  { value: 'INCENTIVE TRAVEL', label: 'Incentive Travel' },
  { value: 'CONVENTIONS', label: 'Conventions' },
  { value: 'EXHIBITS', label: 'Exhibits' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SYMPOSIUM', label: 'Symposium' },
  { value: 'OTHERS', label: 'Others' },
];

const FALLBACK_PRIVATE_TYPES: SelectOption[] = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'DEBUT', label: 'Debut' },
  { value: 'FAMILY_EVENT', label: 'Family event' },
  { value: 'PRIVATE_SOCIAL_EVENT', label: 'Private social event' },
  { value: 'OTHER_PRIVATE_EVENT', label: 'Other private event' },
];

const FALLBACK_MONTHS: SelectOption[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((month) => ({ value: month, label: month }));

const FALLBACK_EVENT_CENTERS: SelectOption[] = [
  'BAGUIO CONVENTION AND CULTURAL CENTER',
  '456 HOTEL LE GRANDE',
  'A HOTEL',
  'BAGUIO COUNTRY CLUB',
  'THE MANOR CAMP JOHN HAY',
  'OTHER',
].map((center) => ({ value: center, label: center }));

const FALLBACK_DRESSING_ROOMS: SelectOption[] = [
  { value: 'none', label: 'No dressing room', charge: 0, charge_label: '₱0.00' },
  { value: 'dressing_room_1', label: 'Dressing Room 1', charge: 1000, charge_label: '₱1,000.00' },
  { value: 'dressing_room_2', label: 'Dressing Room 2', charge: 1000, charge_label: '₱1,000.00' },
  { value: 'dressing_room_1_and_2', label: 'Dressing Room 1 & 2', charge: 2000, charge_label: '₱2,000.00' },
];

const SCHEDULE_BASE_BLOCKS: Record<ScheduleBaseBlock, { label: string; start: string; baseEnd: string; helper: string }> = {
  AM: {
    label: 'Half Day AM',
    start: '06:00',
    baseEnd: '12:00',
    helper: '6:00 AM - 12:00 PM',
  },
  PM: {
    label: 'Half Day PM',
    start: '12:00',
    baseEnd: '18:00',
    helper: '12:00 PM - 6:00 PM; additional hours may extend after 6:00 PM',
  },
  WHOLE_DAY: {
    label: 'Whole Day',
    start: '06:00',
    baseEnd: '18:00',
    helper: '6:00 AM - 6:00 PM; additional hours may extend after 6:00 PM',
  },
};

const ADDITIONAL_HOUR_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const PUBLIC_EVENT_CENTER = 'BAGUIO CONVENTION AND CULTURAL CENTER';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function collection<T>(value?: T[] | PaginatedLike<T>): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

function firstValue(...values: unknown[]): string {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value);
    }
  }

  return '';
}

function money(value: unknown): string {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) return '₱0.00';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(number);
}

function normalizeSearch(value?: string | null): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/gallery\s*2600/g, 'gallery2600')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toInputDateTime(value?: string | null): string {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function buildInitialDateTime(schedule?: InitialSchedule, fallback?: string | null, part?: 'from' | 'to'): string {
  if (fallback) return toInputDateTime(fallback);
  if (!schedule) return '';

  const exactFrom = firstValue(schedule.booking_date_from, schedule.date_from, schedule.from);
  const exactTo = firstValue(schedule.booking_date_to, schedule.date_to, schedule.to);

  if (part === 'from' && exactFrom) return toInputDateTime(exactFrom);
  if (part === 'to' && exactTo) return toInputDateTime(exactTo);

  if (schedule.date && schedule.start_time && part === 'from') return `${schedule.date}T${schedule.start_time}`;
  if (schedule.date && schedule.end_time && part === 'to') return `${schedule.date}T${schedule.end_time}`;

  return '';
}

function flattenServices(serviceTypes?: ServiceTypeOption[] | PaginatedLike<ServiceTypeOption>, services?: ServiceOption[] | PaginatedLike<ServiceOption>): ServiceOption[] {
  const directServices = collection(services);
  const nestedServices = collection(serviceTypes).flatMap((type) =>
    Array.isArray(type.services)
      ? type.services.map((service) => ({
          ...service,
          service_type_id: service.service_type_id ?? type.id,
          service_type_name: service.service_type_name ?? type.name,
        }))
      : [],
  );

  const merged = [...directServices, ...nestedServices];
  const seen = new Set<string>();

  return merged.filter((service) => {
    const key = String(service.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function serviceSearchName(service: ServiceOption): string {
  return [service.name, service.service_type_name, service.service_type?.name].filter(Boolean).join(' ');
}

function matchCatalogWithServices(services: ServiceOption[]): MatchedVenueItem[] {
  return BOOKING_VENUE_CATALOG.map((item) => {
    const service = services.find((option) =>
      catalogItemMatchesService(item, option.name) ||
      catalogItemMatchesService(item, option.service_type_name) ||
      catalogItemMatchesService(item, option.service_type?.name) ||
      catalogItemMatchesService(item, serviceSearchName(option)),
    );

    return { ...item, service, configured: Boolean(service) };
  });
}

function toVenueKey(value?: string | null): BookingVenueKey | null {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const allowed: BookingVenueKey[] = ['FULL_HALL', 'MAIN_HALL', 'LED_WALL', 'VIP_LOUNGE', 'BOARD_ROOM'];
  return allowed.includes(normalized as BookingVenueKey) ? (normalized as BookingVenueKey) : null;
}

function venueKeysFromPackage(packageOption?: VenuePackageOption | null): BookingVenueKey[] {
  return (packageOption?.area_keys ?? []).map((key) => toVenueKey(key)).filter((key): key is BookingVenueKey => Boolean(key));
}

function matchInitialServiceId(booking: BookingRecord | undefined, initialVenue: string | null | undefined, services: ServiceOption[]): string {
  const direct = firstValue(booking?.service_id, booking?.service?.id);
  if (direct) return direct;

  const needle = normalizeSearch(initialVenue);
  if (!needle) return '';

  const matched = services.find((service) => {
    const haystack = normalizeSearch([service.name, service.service_type_name, service.service_type?.name].filter(Boolean).join(' '));
    return haystack.includes(needle) || needle.includes(haystack);
  });

  return matched?.id ? String(matched.id) : '';
}

function serviceIdOf(item?: MatchedVenueItem | null): string {
  return item?.service?.id ? String(item.service.id) : '';
}

function serviceItems(serviceIds?: Array<string | number | null | undefined>): BookingFormItem[] {
  return (serviceIds ?? [])
    .map((serviceId) => String(serviceId ?? '').trim())
    .filter(Boolean)
    .map((serviceId) => ({ service_id: serviceId, quantity: 1 }));
}

function selectedServiceIds(items: MatchedVenueItem[]): string[] {
  return items.map(serviceIdOf).filter(Boolean);
}

function chargedItems(items: MatchedVenueItem[], keys: BookingVenueKey[]): MatchedVenueItem[] {
  return items.filter((item) => keys.includes(item.key));
}

function packageSelectionLabel(keys: BookingVenueKey[], packageName?: string | null): string {
  if (packageName) return `${packageName} selected. Only the listed areas are included and blocked.`;
  if (keys.includes('FULL_HALL')) return 'Full Hall selected. VIP Lounge, Board Room, and LED Wall are not automatically included.';
  if (keys.length > 1) return 'Combined individual areas selected. Each area is charged and checked for availability.';
  if (keys.length === 1) return 'Individual area selected.';
  return 'No venue area selected yet.';
}

function combinedAddress(data: BookingFormData): string {
  return [data.client_street_address, data.client_barangay, data.client_city_municipality, data.client_province, data.client_region, data.client_zip_code]
    .filter(Boolean)
    .join(', ');
}

function formTitle(role: RoleThemeKey, editing: boolean): string {
  if (role === 'admin') return editing ? 'Edit Reservation' : 'Create Reservation';
  if (role === 'manager') return 'Review Reservation';
  if (role === 'staff') return editing ? 'Update Assisted Booking' : 'Assist Booking';
  return editing ? 'Update Your Event Request' : 'Reserve Your Event Space';
}

function formDescription(role: RoleThemeKey): string {
  if (role === 'user') {
    return 'Complete the package, event, schedule, MICE, guidelines, and review steps before submitting your request.';
  }

  return 'Create or update a reservation using the official BCCC package, schedule, and MICE reporting fields.';
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function formatDateOnly(value?: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function rangeHours(from?: string | null, to?: string | null): number {
  if (!from || !to) return 0;
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 36_000) / 100;
}

function fieldStatusClass(error?: string): string {
  return error
    ? 'border-rose-300/70 bg-rose-50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-white'
    : 'border-[var(--bccc-backend-line)] bg-[var(--bccc-backend-panel-muted)] text-[var(--bccc-backend-text)] focus:border-[var(--bccc-backend-gold-line)]';
}

function todayInputDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthInputDate(value?: string | null): string {
  const fallback = todayInputDate();
  const date = value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : fallback;
  return `${date.slice(0, 7)}-01`;
}

function dateInputOnly(value?: string | null): string {
  return value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

function dateTimestamp(value: string): number {
  return new Date(`${value}T00:00:00`).getTime();
}

function minDateString(a: string, b: string): string {
  return dateTimestamp(a) <= dateTimestamp(b) ? a : b;
}

function maxDateString(a: string, b: string): string {
  return dateTimestamp(a) >= dateTimestamp(b) ? a : b;
}

function inclusiveDateCount(from?: string | null, to?: string | null): number {
  if (!from || !to) return 1;
  const start = dateTimestamp(from);
  const end = dateTimestamp(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(Math.round((end - start) / 86_400_000) + 1, 1);
}

function calendarDaysForMonth(cursorDate: string): Array<{ date: string; day: number; inMonth: boolean }> {
  const first = new Date(`${cursorDate.slice(0, 7)}-01T00:00:00`);
  const year = first.getFullYear();
  const month = first.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

function addMonthsToInputDate(value: string, amount: number): string {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  date.setMonth(date.getMonth() + amount);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}-01`;
}

function calendarMonthTitle(value: string): string {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(date);
}

function addHoursToClock(clock: string, hours: number): string {
  const [hour, minute] = clock.split(':').map(Number);
  const totalMinutes = Math.min(hour * 60 + minute + Math.max(hours, 0) * 60, 23 * 60 + 59);
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

function buildDateTimeFromRange(range: BookingDateRange, block: ScheduleBaseBlock, additionalHours: number): { from: string; to: string } {
  const base = SCHEDULE_BASE_BLOCKS[block];
  const canExtend = block === 'PM' || block === 'WHOLE_DAY';
  const end = canExtend && additionalHours > 0 ? addHoursToClock(base.baseEnd, additionalHours) : base.baseEnd;
  return { from: `${range.from}T${base.start}`, to: `${range.to}T${end}` };
}

function optionsFromMaybe(value?: SelectOption[]): SelectOption[] {
  return Array.isArray(value) ? value : [];
}

function optionValue(value: SelectOption['value']): string {
  return String(value);
}

function boolString(value: boolean | number | string | null | undefined): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function defaultCoveredMonth(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
}

function StepIcon({ icon: Icon, done, current }: { icon: typeof PackageCheck; done: boolean; current: boolean }) {
  if (done) return <Check className="h-4 w-4" />;
  return <Icon className={cx('h-4 w-4', current && 'text-[var(--bccc-backend-gold)]')} />;
}

function Field({ label, required, error, helper, children }: { label: string; required?: boolean; error?: string; helper?: ReactNode; children: ReactNode }) {
  return (
    <label className="booking-lux-field">
      <span className="booking-lux-field-label">
        {label}
        {required ? <strong>*</strong> : null}
      </span>
      {children}
      {helper && !error ? <span className="booking-lux-field-helper">{helper}</span> : null}
      {error ? (
        <span className="booking-lux-field-error">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </span>
      ) : null}
    </label>
  );
}

function WizardNotice({ errors }: { errors: Record<string, string> }) {
  const values = Object.values(errors).filter(Boolean);
  if (values.length === 0) return null;

  return (
    <div className="booking-step-warning">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Complete this page first.</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          {values.map((error) => (
            <li key={error}>• {error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ServerErrorsBanner({ errors }: { errors: Record<string, string> }) {
  const values = Object.values(errors).filter(Boolean);
  if (values.length === 0) return null;

  return (
    <div className="booking-lux-error-banner">
      <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Please review the highlighted fields.</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          {values.slice(0, 6).map((error) => (
            <li key={error}>• {error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stepper({ activeStep, maxStep, onStepClick }: { activeStep: number; maxStep: number; onStepClick: (index: number) => void }) {
  return (
    <nav className="booking-stepper" aria-label="Booking form steps">
      {BOOKING_STEPS.map((step, index) => {
        const current = index === activeStep;
        const done = index < activeStep;
        const unlocked = index <= maxStep;
        return (
          <button key={step.title} type="button" disabled={!unlocked} onClick={() => onStepClick(index)} className={cx('booking-wizard-step-pill', current && 'is-current', done && 'is-done')}>
            <span className="booking-step-icon">
              <StepIcon icon={step.icon} done={done} current={current} />
            </span>
            <span className="min-w-0">
              <span className="block truncate">{step.title}</span>
              <small className="block truncate">{step.subtitle}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ReviewBlock({ title, icon: Icon, children, onEdit }: { title: string; icon: typeof UserRound; children: ReactNode; onEdit: () => void }) {
  return (
    <section className="booking-review-block">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="booking-review-icon">
            <Icon className="h-4 w-4" />
          </span>
          <h3>{title}</h3>
        </div>
        <button type="button" onClick={onEdit} className="booking-review-edit">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ReviewGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="booking-review-grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <p>{label}</p>
          <strong>{value || '—'}</strong>
        </div>
      ))}
    </div>
  );
}

export function BookingFormPage() {
  const { props } = usePage<BookingFormPageProps>();
  const role = normalizeWorkspaceRole(props.workspaceRole) as RoleThemeKey;
  const booking = props.booking;
  const editing = Boolean(booking?.id);
  const isClient = role === 'user';
  const isManager = role === 'manager';
  const isStaffLike = role === 'admin' || role === 'manager' || role === 'staff';
  const packageCarouselRef = useRef<HTMLDivElement | null>(null);

  const bookingOptions = props.bookingFormOptions ?? {};
  const packageOptions = props.venuePackages ?? bookingOptions.venuePackages ?? [];
  const dressingRoomOptions = optionsFromMaybe(bookingOptions.dressingRooms).length > 0 ? optionsFromMaybe(bookingOptions.dressingRooms) : FALLBACK_DRESSING_ROOMS;
  const miceOptions = bookingOptions.mice ?? {};
  const classificationOptions = optionsFromMaybe(miceOptions.classificationOptions).length > 0 ? optionsFromMaybe(miceOptions.classificationOptions) : FALLBACK_MICE_CLASSIFICATIONS;
  const miceTypeOptions = optionsFromMaybe(miceOptions.typeOptions).length > 0 ? optionsFromMaybe(miceOptions.typeOptions) : FALLBACK_MICE_TYPES;
  const coveredMonthOptions = optionsFromMaybe(miceOptions.coveredMonthOptions).length > 0 ? optionsFromMaybe(miceOptions.coveredMonthOptions) : FALLBACK_MONTHS;
  const eventCenterOptions = optionsFromMaybe(miceOptions.eventCenterOptions).length > 0 ? optionsFromMaybe(miceOptions.eventCenterOptions) : FALLBACK_EVENT_CENTERS;
  const privateEventOptions = optionsFromMaybe(miceOptions.privateEventOptions).length > 0 ? optionsFromMaybe(miceOptions.privateEventOptions) : FALLBACK_PRIVATE_TYPES;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add('booking-wizard-screen-active');
    body.classList.add('booking-wizard-screen-active');

    return () => {
      html.classList.remove('booking-wizard-screen-active');
      body.classList.remove('booking-wizard-screen-active');
    };
  }, []);

  const services = useMemo(() => flattenServices(props.serviceTypes, props.services), [props.serviceTypes, props.services]);
  const venueItems = useMemo(() => matchCatalogWithServices(services), [services]);
  const initialServiceId = useMemo(() => matchInitialServiceId(booking, props.initialVenue, services), [booking, props.initialVenue, services]);
  const matchedInitialVenue = venueItems.find((item) => String(item.service?.id ?? '') === String(initialServiceId)) ?? venueItems.find((item) => item.configured) ?? venueItems[0];

  const initialPackageCode = firstValue(booking?.selected_package_code, props.initialPackageCode);
  const initialPackageOption = packageOptions.find((option) => option.code === initialPackageCode) ?? null;
  const initialPackageKeys = venueKeysFromPackage(initialPackageOption);
  const bookingAreaKeys = Array.isArray(booking?.selected_area_keys) ? booking.selected_area_keys.map((key) => toVenueKey(key)).filter((key): key is BookingVenueKey => Boolean(key)) : [];
  const initialSelectedKeys = initialPackageKeys.length > 0 ? initialPackageKeys : bookingAreaKeys.length > 0 ? bookingAreaKeys : matchedInitialVenue?.key ? [matchedInitialVenue.key] : [];
  const initialChargedItems = chargedItems(venueItems, initialSelectedKeys);
  const initialServiceIds = selectedServiceIds(initialChargedItems);

  const backHref = editing && booking?.id ? bookingShowPath(role, booking.id) : bookingBasePath(role);
  const initialFrom = buildInitialDateTime(props.initialSchedule, booking?.booking_date_from, 'from');
  const initialTo = buildInitialDateTime(props.initialSchedule, booking?.booking_date_to, 'to');
  const initialDateFrom = dateInputOnly(initialFrom) || todayInputDate();
  const initialDateTo = dateInputOnly(initialTo) || initialDateFrom;
  const initialRange: BookingDateRange = { from: minDateString(initialDateFrom, initialDateTo), to: maxDateString(initialDateFrom, initialDateTo) };
  const hasPublicPrefill = Boolean(props.initialVenue || props.initialPackageCode || props.initialEventType || props.initialGuests || initialFrom || initialTo);
  const initialBlock: ScheduleBaseBlock = 'WHOLE_DAY';
  const initialAdditionalHours = 0;
  const initialDateTimes = buildDateTimeFromRange(initialRange, initialBlock, initialAdditionalHours);
  const initialPaymentMeta = booking?.payment_meta && typeof booking.payment_meta === 'object' ? booking.payment_meta : {};

  const [selectedVenueKeys, setSelectedVenueKeys] = useState<BookingVenueKey[]>(initialSelectedKeys);
  const [selectedPackageCode, setSelectedPackageCode] = useState(initialPackageCode);
  const [packageSelectionMode, setPackageSelectionMode] = useState<'packages' | 'manual'>(() => (packageOptions.length > 0 && initialPackageCode ? 'packages' : packageOptions.length > 0 ? 'packages' : 'manual'));
  const [previewVenueKey, setPreviewVenueKey] = useState<BookingVenueKey>(initialSelectedKeys[0] ?? matchedInitialVenue?.key ?? 'FULL_HALL');
  const [usage, setUsage] = useState<BookingUsageKey>('whole_day');
  const [baseBlock, setBaseBlock] = useState<ScheduleBaseBlock>(initialBlock);
  const [additionalHours, setAdditionalHours] = useState(initialAdditionalHours);
  const [rangeClickAnchor, setRangeClickAnchor] = useState<string | null>(null);
  const [calendarCursor, setCalendarCursor] = useState<string>(() => monthInputDate(initialRange.from));
  const [selectedDateRange, setSelectedDateRange] = useState<BookingDateRange>(initialRange);
  const [hasIngress, setHasIngress] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);

  const selectedPackage = packageOptions.find((option) => option.code === selectedPackageCode) ?? null;
  const selectedChargedItems = chargedItems(venueItems, selectedVenueKeys);
  const selectedDateCount = inclusiveDateCount(selectedDateRange.from, selectedDateRange.to);
  const durationHours = String(additionalHours || 1);
  const estimatedBasePerDay = estimateSelectedVenueCharge(selectedChargedItems, usage, Number(durationHours || 1));
  const estimatedBase = estimatedBasePerDay * selectedDateCount;
  const selectedDressingRoom = dressingRoomOptions.find((option) => optionValue(option.value) === firstValue(booking?.dressing_room_selection, 'none')) ?? dressingRoomOptions[0];
  const initialDressingCharge = Number(selectedDressingRoom?.charge ?? booking?.dressing_room_charge ?? 0);

  const { data, setData: rawSetData, post, put, processing, errors, transform } = useForm<BookingFormData>({
    service_id: initialServiceIds[0] ?? serviceIdOf(matchedInitialVenue),
    items: serviceItems(initialServiceIds),
    payment_meta: initialPaymentMeta,

    selected_package_code: selectedPackageCode,
    selected_area_keys: initialSelectedKeys,
    dressing_room_selection: optionValue(selectedDressingRoom?.value ?? 'none'),
    dressing_room_charge: String(initialDressingCharge),
    mice_required: booking?.mice_required === undefined || booking?.mice_required === null ? true : boolString(booking.mice_required),
    mice_exemption_reason: firstValue(booking?.mice_exemption_reason),
    private_event_type: firstValue(booking?.private_event_type),
    schedule_version: 'segments_v1',
    schedule_meta: booking?.schedule_meta && typeof booking.schedule_meta === 'object' ? booking.schedule_meta : {},
    schedule_segments: [],

    organization_type: firstValue(booking?.organization_type, 'Private'),
    company_name: firstValue(booking?.company_name),
    client_name: firstValue(booking?.client_name),
    client_contact_number: firstValue(booking?.client_contact_number),
    client_email: firstValue(booking?.client_email),

    client_address: firstValue(booking?.client_address),
    client_region: firstValue(booking?.client_region, 'CAR'),
    client_province: firstValue(booking?.client_province, 'Benguet'),
    client_city_municipality: firstValue(booking?.client_city_municipality, 'Baguio City'),
    client_barangay: firstValue(booking?.client_barangay),
    client_zip_code: firstValue(booking?.client_zip_code, '2600'),
    client_street_address: firstValue(booking?.client_street_address, booking?.client_address),

    head_of_organization: firstValue(booking?.head_of_organization),
    type_of_event: firstValue(booking?.type_of_event, props.initialEventType),

    booking_date_from: initialDateTimes.from,
    booking_date_to: initialDateTimes.to,
    number_of_guests: firstValue(booking?.number_of_guests, props.initialGuests),

    survey_email: firstValue(booking?.survey_email, booking?.client_email),
    survey_proof_image: null,

    booking_status: firstValue(booking?.booking_status, 'pending'),
    payment_status: firstValue(booking?.payment_status, 'unpaid'),
    is_public_calendar_visible: Boolean(booking?.is_public_calendar_visible ?? false),
    public_calendar_title: firstValue(booking?.public_calendar_title),

    package_acknowledged: Boolean(editing || hasPublicPrefill),
    policy_acknowledged: Boolean(editing),
    accuracy_acknowledged: Boolean(editing),

    estimated_usage: 'whole_day',
    estimated_duration_hours: '0',
    estimated_other_rentals: optionValue(selectedDressingRoom?.value ?? 'none'),
    estimated_additional_charges: String(initialDressingCharge),
    reservation_notes: '',

    event_nature: booking?.mice_required === false || booking?.mice_required === 0 ? 'private' : 'mice',
    event_center_name: firstValue(initialPaymentMeta.event_center_name, PUBLIC_EVENT_CENTER),
    event_center_other: firstValue(initialPaymentMeta.event_center_other),
    covered_month: firstValue(initialPaymentMeta.covered_month, defaultCoveredMonth(initialDateFrom)),
    classification_of_event: firstValue(initialPaymentMeta.classification_of_event, 'REGIONAL PHILIPPINES'),
    classification_other: firstValue(initialPaymentMeta.classification_other),
    mice_type_of_event: firstValue(initialPaymentMeta.mice_type_of_event, 'MEETINGS'),
    mice_type_other: firstValue(initialPaymentMeta.mice_type_other),
    function_halls_count: firstValue(initialPaymentMeta.function_halls_count, '1'),
    function_hall_capacity: firstValue(initialPaymentMeta.function_hall_capacity, dataSafeNumber(props.initialGuests, '0')),
    number_of_hours: firstValue(initialPaymentMeta.number_of_hours, '12'),
    foreign_attendees: firstValue(initialPaymentMeta.foreign_attendees, '0'),
    domestic_attendees: firstValue(initialPaymentMeta.domestic_attendees, props.initialGuests, '0'),
    total_number_of_countries: firstValue(initialPaymentMeta.total_number_of_countries, '1'),
    countries_breakdown_text: firstValue(initialPaymentMeta.countries_breakdown_text, 'PHILIPPINES'),
    has_exhibitions: firstValue(initialPaymentMeta.has_exhibitions, 'No'),
    exhibitors_count: firstValue(initialPaymentMeta.exhibitors_count, '0'),
    visitors_count: firstValue(initialPaymentMeta.visitors_count, '0'),
    comments_feedback: firstValue(initialPaymentMeta.comments_feedback),
  });

  const setData = rawSetData as unknown as <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => void;
  const mergedErrors = { ...errors, ...stepErrors } as Record<string, string>;
  const selectedDressingCharge = Number(data.dressing_room_charge || 0);
  const estimatedTotal = estimatedBase + selectedDressingCharge;
  const finalAddress = combinedAddress(data);

  const selectedRegion: RegionOption = regionByCode(data.client_region);
  const selectedProvince: ProvinceOption = provinceByName(selectedRegion, data.client_province);
  const selectedCity: CityOption = cityByName(selectedProvince, data.client_city_municipality);
  const isPrivateEvent = data.event_nature === 'private';
  const isMiceRequired = data.event_nature === 'mice';

  function dataSafeNumber(value: unknown, fallback: string): string {
    const number = Number(value ?? 0);
    return Number.isFinite(number) && number > 0 ? String(number) : fallback;
  }

  function fieldError(name: FieldName | string): string | undefined {
    return mergedErrors[name];
  }

  function focusVenueCard(key: BookingVenueKey) {
    setPreviewVenueKey(key);
    window.requestAnimationFrame(() => {
      const carousel = packageCarouselRef.current;
      const card = carousel?.querySelector<HTMLElement>(`[data-venue-key="${key}"]`);
      if (!carousel || !card) return;
      const carouselRect = carousel.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      carousel.scrollTo({ left: carousel.scrollLeft + (cardRect.left - carouselRect.left) - carouselRect.width / 2 + cardRect.width / 2, behavior: 'smooth' });
    });
  }

  function syncSelection(next: BookingVenueKey[], packageCode = selectedPackageCode) {
    const nextChargedItems = chargedItems(venueItems, next);
    const nextServiceIds = selectedServiceIds(nextChargedItems);
    const packageOption = packageOptions.find((option) => option.code === packageCode) ?? null;
    const paymentMeta = {
      ...data.payment_meta,
      selected_package_code: packageCode,
      selected_package_name: packageOption?.name ?? packageOption?.label ?? null,
      selected_area_keys: next,
      charged_area_keys: nextChargedItems.map((charged) => charged.key),
      charged_area_labels: nextChargedItems.map((charged) => charged.displayLabel),
      package_note: packageSelectionLabel(next, packageOption?.name ?? packageOption?.label),
    };

    setData('service_id', nextServiceIds[0] ?? '');
    setData('items', serviceItems(nextServiceIds));
    setData('selected_area_keys', next);
    setData('selected_package_code', packageCode);
    setData('payment_meta', paymentMeta);
  }

  function selectPackage(packageOption: VenuePackageOption) {
    const keys = venueKeysFromPackage(packageOption);
    if (keys.length === 0) return;
    setPackageSelectionMode('packages');
    setSelectedPackageCode(packageOption.code);
    setSelectedVenueKeys(keys);
    syncSelection(keys, packageOption.code);
    focusVenueCard(keys[0]);
    setStepErrors({});
  }

  function switchToManualSelection() {
    setPackageSelectionMode('manual');
    setSelectedPackageCode('');
    syncSelection(selectedVenueKeys, '');
    setStepErrors({});
  }

  function scrollPackageCarousel(direction: -1 | 1) {
    const carousel = packageCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * Math.max(320, carousel.clientWidth * 0.82),
      behavior: 'smooth',
    });
  }

  function selectVenue(item: MatchedVenueItem) {
    if (!item.configured) return;
    setPackageSelectionMode('manual');
    setSelectedPackageCode('');
    setPreviewVenueKey(item.key);
    setSelectedVenueKeys((current) => {
      const next = current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key];
      syncSelection(next, '');
      return next;
    });
    setStepErrors({});
    focusVenueCard(item.key);
  }

  function syncScheduleRange(range: BookingDateRange, block: ScheduleBaseBlock = baseBlock, hours = additionalHours) {
    const normalizedRange = { from: minDateString(range.from, range.to), to: maxDateString(range.from, range.to) };
    const normalizedAdditional = block === 'AM' ? 0 : hours;
    const computed = buildDateTimeFromRange(normalizedRange, block, normalizedAdditional);

    setSelectedDateRange(normalizedRange);
    setBaseBlock(block);
    setAdditionalHours(normalizedAdditional);
    setData('booking_date_from', computed.from);
    setData('booking_date_to', computed.to);
    setData('estimated_usage', block === 'WHOLE_DAY' ? 'whole_day' : 'half_day');
    setData('estimated_duration_hours', String(normalizedAdditional));
    setUsage(block === 'WHOLE_DAY' ? 'whole_day' : 'half_day');
  }

  function handleCalendarDateClick(date: string) {
    if (!rangeClickAnchor) {
      setRangeClickAnchor(date);
      syncScheduleRange({ from: date, to: date });
      return;
    }

    const nextRange = { from: minDateString(rangeClickAnchor, date), to: maxDateString(rangeClickAnchor, date) };
    setRangeClickAnchor(null);
    syncScheduleRange(nextRange);
  }

  function isCalendarDateSelected(date: string): boolean {
    const current = dateTimestamp(date);
    return current >= dateTimestamp(selectedDateRange.from) && current <= dateTimestamp(selectedDateRange.to);
  }

  function isCalendarDateEdge(date: string): boolean {
    return date === selectedDateRange.from || date === selectedDateRange.to;
  }

  function handleBaseBlockChange(block: ScheduleBaseBlock) {
    syncScheduleRange(selectedDateRange, block, block === 'AM' ? 0 : additionalHours);
  }

  function handleAdditionalHourChange(hours: number) {
    syncScheduleRange(selectedDateRange, baseBlock, hours);
  }

  function handleDressingRoomChange(value: string) {
    const option = dressingRoomOptions.find((item) => optionValue(item.value) === value) ?? dressingRoomOptions[0];
    const charge = Number(option?.charge ?? 0);
    setData('dressing_room_selection', value);
    setData('dressing_room_charge', String(charge));
    setData('estimated_other_rentals', value);
    setData('estimated_additional_charges', String(charge));
  }

  function handleEventNatureChange(nature: 'mice' | 'private') {
    setData('event_nature', nature);
    setData('mice_required', nature === 'mice');
    if (nature === 'private') {
      setData('classification_of_event', 'NATIONAL');
      setData('mice_type_of_event', 'OTHERS');
      setData('mice_exemption_reason', 'Private event - full MICE report not required during booking intake.');
    } else {
      setData('private_event_type', '');
      setData('mice_exemption_reason', '');
    }
  }

  function handleAddressRegionChange(value: string) {
    const region = regionByCode(value);
    const provinceOption = region.provinces[0];
    const cityOption = provinceOption.cities[0];
    setData('client_region', region.code);
    setData('client_province', provinceOption.name);
    setData('client_city_municipality', cityOption.name);
    setData('client_barangay', '');
    setData('client_zip_code', cityOption.zip ?? '');
  }

  function handleAddressProvinceChange(value: string) {
    const provinceOption = provinceByName(selectedRegion, value);
    const cityOption = provinceOption.cities[0];
    setData('client_province', provinceOption.name);
    setData('client_city_municipality', cityOption.name);
    setData('client_barangay', '');
    setData('client_zip_code', cityOption.zip ?? '');
  }

  function handleAddressCityChange(value: string) {
    const cityOption = cityByName(selectedProvince, value);
    setData('client_city_municipality', cityOption.name);
    setData('client_barangay', '');
    setData('client_zip_code', cityOption.zip ?? '');
  }

  function validateStep(step: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (selectedVenueKeys.length === 0) nextErrors.package = 'Select at least one venue area or public package.';
      if (selectedVenueKeys.length > 0 && selectedChargedItems.length === 0) nextErrors.service_id = 'The selected area is missing a matching backend Rental Option.';
      if (!data.package_acknowledged) nextErrors.package_acknowledged = 'Confirm that you reviewed the package, rates, and inclusions.';
    }

    if (step === 1) {
      if (!data.event_nature) nextErrors.event_nature = 'Select whether this is a MICE/reportable event or a private event.';
      if (!data.type_of_event.trim()) nextErrors.type_of_event = 'Event name/title is required.';
      if (isMiceRequired) {
        if (!data.classification_of_event) nextErrors.classification_of_event = 'Classification is required for MICE events.';
        if (!data.mice_type_of_event) nextErrors.mice_type_of_event = 'Type of event is required for MICE events.';
        if (data.mice_type_of_event === 'OTHERS' && !data.mice_type_other.trim()) nextErrors.mice_type_other = 'Specify the other event type.';
      }
      if (isPrivateEvent && !data.private_event_type) nextErrors.private_event_type = 'Select the private event type.';
    }

    if (step === 2) {
      if (!data.company_name.trim()) nextErrors.company_name = 'Name of organization is required.';
      if (!data.client_name.trim()) nextErrors.client_name = 'Contact person is required.';
      if (!/^09\d{9}$/.test(data.client_contact_number.replace(/\D+/g, ''))) nextErrors.client_contact_number = 'Use a valid Philippine mobile number, example: 09171234567.';
      if (!data.client_email.trim()) nextErrors.client_email = 'Email address is required.';
    }

    if (step === 3) {
      if (!data.client_region.trim()) nextErrors.client_region = 'Region is required.';
      if (!data.client_province.trim()) nextErrors.client_province = 'Province is required.';
      if (!data.client_city_municipality.trim()) nextErrors.client_city_municipality = 'City / municipality is required.';
      if (!data.client_street_address.trim()) nextErrors.client_street_address = 'Street address is required.';
    }

    if (step === 4) {
      if (!selectedDateRange.from) nextErrors.booking_date_from = 'Start date is required.';
      if (!selectedDateRange.to) nextErrors.booking_date_to = 'End date is required.';
      if (!data.number_of_guests.trim() || Number(data.number_of_guests || 0) < 1) nextErrors.number_of_guests = 'Number of guests must be at least 1.';
      if (baseBlock === 'AM' && additionalHours > 0) nextErrors.additional_hours = 'Additional hours can only be added after PM or Whole Day.';
    }

    if (step === 5 && isMiceRequired) {
      if (!data.event_center_name) nextErrors.event_center_name = 'Name of event center is required.';
      if (data.event_center_name === 'OTHER' && !data.event_center_other.trim()) nextErrors.event_center_other = 'Specify the event center.';
      if (!data.covered_month) nextErrors.covered_month = 'Covered month is required.';
      if (!data.function_halls_count.trim()) nextErrors.function_halls_count = 'Number of function halls is required.';
      if (!data.function_hall_capacity.trim()) nextErrors.function_hall_capacity = 'Function hall capacity is required.';
      if (!data.number_of_hours.trim()) nextErrors.number_of_hours = 'Number of hours is required.';
      if (!data.domestic_attendees.trim()) nextErrors.domestic_attendees = 'Domestic attendees is required.';
      if (!data.total_number_of_countries.trim()) nextErrors.total_number_of_countries = 'Total number of countries is required.';
      if (!data.countries_breakdown_text.trim()) nextErrors.countries_breakdown_text = 'Breakdown of countries is required.';
      if (data.has_exhibitions === 'Yes' && !data.exhibitors_count.trim()) nextErrors.exhibitors_count = 'Number of exhibitors is required when exhibitions is Yes.';
    }

    if (step === 6) {
      if (!data.policy_acknowledged) nextErrors.policy_acknowledged = 'Confirm that the BCCC guidelines were reviewed.';
      if (!data.accuracy_acknowledged) nextErrors.accuracy_acknowledged = 'Confirm that all encoded information is accurate.';
    }

    setStepErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateAllBeforeSubmit(): boolean {
    for (let step = 0; step <= 6; step += 1) {
      if (!validateStep(step)) {
        setActiveStep(step);
        setMaxStep((current) => Math.max(current, step));
        return false;
      }
    }
    return true;
  }

  function runStepTransition(callback: () => void) {
    setStepLoading(true);
    window.setTimeout(() => {
      callback();
      window.setTimeout(() => setStepLoading(false), 160);
    }, 160);
  }

  function scrollStageToStart() {
    const root = document.querySelector<HTMLElement>('.booking-lux-form');
    const stage = document.querySelector<HTMLElement>('.booking-wizard-stage');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (stage) {
      stage.scrollTo({ left: 0, top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    if (!root) {
      return;
    }

    const stickyOffset = window.innerWidth < 768 ? 84 : 96;
    const targetTop = Math.max(0, root.getBoundingClientRect().top + window.scrollY - stickyOffset);

    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  function goToStep(index: number) {
    if (index > maxStep || index === activeStep) return;
    runStepTransition(() => {
      setActiveStep(index);
      setStepErrors({});
      scrollStageToStart();
    });
  }

  function continueStep() {
    if (!validateStep(activeStep)) return;
    const nextStep = Math.min(activeStep + 1, BOOKING_STEPS.length - 1);
    runStepTransition(() => {
      setActiveStep(nextStep);
      setMaxStep((current) => Math.max(current, nextStep));
      setStepErrors({});
      scrollStageToStart();
    });
  }

  function previousStep() {
    if (activeStep === 0) return;
    runStepTransition(() => {
      setActiveStep((current) => Math.max(current - 1, 0));
      setStepErrors({});
      scrollStageToStart();
    });
  }

  function buildMiceDraft(): BookingPaymentMeta {
    return {
      event_center_name: data.event_center_name === 'OTHER' ? data.event_center_other : data.event_center_name,
      covered_month: data.covered_month,
      event_started_at: selectedDateRange.from,
      event_finished_at: selectedDateRange.to,
      event_name: data.type_of_event,
      number_of_hours: data.number_of_hours,
      classification_of_event: data.classification_of_event === 'OTHER' ? data.classification_other : data.classification_of_event,
      mice_type_of_event: data.mice_type_of_event === 'OTHERS' && data.mice_type_other ? data.mice_type_other : data.mice_type_of_event,
      function_halls_count: data.function_halls_count,
      function_hall_capacity: data.function_hall_capacity,
      foreign_attendees: data.foreign_attendees,
      domestic_attendees: data.domestic_attendees,
      total_number_of_countries: data.total_number_of_countries,
      countries_breakdown_text: data.countries_breakdown_text,
      has_exhibitions: data.has_exhibitions,
      exhibitors_count: data.exhibitors_count,
      visitors_count: data.visitors_count,
      organizer_organization_name: data.company_name,
      organizer_address: finalAddress,
      organizer_contact_person: data.client_name,
      organizer_contact_number: data.client_contact_number,
      comments_feedback: data.comments_feedback,
    };
  }

  function buildScheduleMeta(): BookingPaymentMeta {
    const roleByDate: Array<Record<string, string | number | boolean>> = [];
    const days = inclusiveDateCount(selectedDateRange.from, selectedDateRange.to);
    for (let index = 0; index < days; index += 1) {
      const date = new Date(`${selectedDateRange.from}T00:00:00`);
      date.setDate(date.getDate() + index);
      const value = date.toISOString().slice(0, 10);
      let roleName = 'event';
      if (hasIngress && index === 0) roleName = 'ingress';
      if (hasIngress && index === days - 1 && days > 1) roleName = 'egress';
      roleByDate.push({ date: value, role: roleName, base_block: baseBlock, additional_hours: additionalHours });
    }

    return {
      version: 'segments_v1',
      has_ingress: hasIngress,
      has_egress: hasIngress,
      base_block: baseBlock,
      base_block_label: SCHEDULE_BASE_BLOCKS[baseBlock].label,
      additional_hours: additionalHours,
      additional_hours_note: additionalHours > 0 ? `Extends after 6:00 PM by ${additionalHours} hour(s).` : 'No evening extension.',
      day_roles: roleByDate,
    };
  }

  function buildScheduleSegmentsPayload(): BookingScheduleSegmentPayload[] {
    const days = inclusiveDateCount(selectedDateRange.from, selectedDateRange.to);
    const normalizedBaseBlock = baseBlock === 'AM' ? 'am' : baseBlock === 'PM' ? 'pm' : 'whole_day';

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(`${selectedDateRange.from}T00:00:00`);
      date.setDate(date.getDate() + index);
      const value = date.toISOString().slice(0, 10);
      let segmentRole: BookingScheduleSegmentPayload['segment_role'] = 'event';

      if (hasIngress && index === 0) segmentRole = 'ingress';
      if (hasIngress && index === days - 1 && days > 1) segmentRole = 'egress';

      return {
        date: value,
        segment_role: segmentRole,
        base_block: normalizedBaseBlock,
        additional_hours: normalizedBaseBlock === 'am' ? 0 : additionalHours,
        area_keys: selectedVenueKeys,
      };
    });
  }

  function finalSubmit() {
    if (!validateAllBeforeSubmit()) return;

    const finalChargedItems = chargedItems(venueItems, selectedVenueKeys);
    const finalServiceIds = selectedServiceIds(finalChargedItems);
    const selectedServiceId = finalServiceIds[0] ?? String(data.service_id || '').trim();
    const packageName = selectedPackage?.name ?? selectedPackage?.label ?? '';
    const scheduleMeta = buildScheduleMeta();
    const scheduleSegmentsPayload = buildScheduleSegmentsPayload();
    const miceDraft = buildMiceDraft();

    transform((current) => ({
      ...current,
      service_id: selectedServiceId,
      items: serviceItems(finalServiceIds.length ? finalServiceIds : [selectedServiceId]),
      client_contact_number: current.client_contact_number.replace(/\D+/g, ''),
      client_address: finalAddress,
      public_calendar_title: current.public_calendar_title || current.type_of_event,
      selected_package_code: selectedPackageCode,
      selected_area_keys: selectedVenueKeys,
      dressing_room_selection: current.dressing_room_selection,
      dressing_room_charge: current.dressing_room_charge,
      mice_required: isMiceRequired,
      mice_exemption_reason: isPrivateEvent ? current.mice_exemption_reason || 'Private event - MICE report not required during initial booking.' : '',
      private_event_type: isPrivateEvent ? current.private_event_type : '',
      schedule_version: 'segments_v1',
      schedule_meta: scheduleMeta,
      schedule_segments: scheduleSegmentsPayload,
      payment_meta: {
        ...(typeof current.payment_meta === 'object' && current.payment_meta !== null ? current.payment_meta : {}),
        selected_package_code: selectedPackageCode,
        selected_package_name: packageName,
        selected_area_keys: selectedVenueKeys,
        charged_area_keys: finalChargedItems.map((item) => item.key),
        charged_area_labels: finalChargedItems.map((item) => item.displayLabel),
        package_note: packageSelectionLabel(selectedVenueKeys, packageName),
        selected_date_from: selectedDateRange.from,
        selected_date_to: selectedDateRange.to,
        selected_date_count: selectedDateCount,
        schedule: scheduleMeta,
        schedule_segments: scheduleSegmentsPayload,
        event_nature: current.event_nature,
        mice_required: isMiceRequired,
        mice_draft: miceDraft,
        private_event_type: isPrivateEvent ? current.private_event_type : null,
        dressing_room_selection: current.dressing_room_selection,
        dressing_room_charge: current.dressing_room_charge,
        estimated_base_per_day: estimatedBasePerDay,
        estimated_base: estimatedBase,
        estimated_total: estimatedTotal,
        reservation_notes: current.reservation_notes,
      },
      estimated_usage: usage,
      estimated_duration_hours: String(additionalHours),
      estimated_other_rentals: current.dressing_room_selection,
      estimated_additional_charges: current.dressing_room_charge,
    }));

    if (editing && booking?.id) {
      put(`${bookingBasePath(role)}/${booking.id}`, { forceFormData: true, preserveScroll: true });
      return;
    }

    const createPath = role === 'admin' ? '/admin/bookings' : role === 'staff' ? '/staff/bookings' : '/book';
    post(createPath, { forceFormData: true, preserveScroll: true });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (activeStep < BOOKING_STEPS.length - 1) {
      continueStep();
      return;
    }
    finalSubmit();
  }

  function StepFooter() {
    const isReview = activeStep === BOOKING_STEPS.length - 1;
    return (
      <footer className="booking-step-footer booking-step-footer-sticky">
        <div className="booking-step-footer-inner">
          <button type="button" onClick={previousStep} disabled={activeStep === 0 || processing} className="booking-secondary-action booking-footer-previous">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="booking-step-footer-status">
            <span>Step {activeStep + 1} of {BOOKING_STEPS.length}</span>
            <strong>{BOOKING_STEPS[activeStep]?.title}</strong>
          </div>
          <div className="booking-step-footer-actions">
            <Link href={backHref} className="booking-ghost-action">Cancel</Link>
            <button type="submit" disabled={processing || stepLoading} className="booking-primary-action">
              {processing || stepLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isReview ? <Save className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {isReview ? (editing ? 'Save Booking' : 'Submit Booking') : 'Save & Continue'}
            </button>
          </div>
        </div>
      </footer>
    );
  }

  function PrefillBanner() {
    if (!hasPublicPrefill) return null;
    return (
      <section className="public-booking-prefill-banner p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--bccc-backend-gold)]">Public Selection Applied</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--bccc-backend-text)]">Your selected package/calendar details were pre-filled.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--bccc-backend-muted)]">Review the selected venue, event details, guest count, and schedule before submitting. Final reservation still depends on BCCC assessment and payment compliance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPackage ? <span className="booking-prefill-chip is-active">{selectedPackage.name ?? selectedPackage.label}</span> : null}
            {props.initialVenue ? <span className="booking-prefill-chip is-active">{props.initialVenue}</span> : null}
            {data.booking_date_from ? <span className="booking-prefill-chip">{formatDateTime(data.booking_date_from)}</span> : null}
          </div>
        </div>
      </section>
    );
  }

  function SummaryLine({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
    return (
      <div className="booking-summary-line">
        <span>{label}</span>
        <strong className={strong ? 'text-[var(--bccc-backend-gold)]' : ''}>{value}</strong>
      </div>
    );
  }

  function SummaryDrawer() {
    const summaryTitle = selectedPackage?.name ?? selectedPackage?.label ?? (selectedChargedItems.length > 0 ? selectedChargedItems.map((item) => item.displayLabel).join(' + ') : 'No area selected');
    return (
      <>
        <button type="button" className="booking-summary-fab" onClick={() => setSummaryOpen(true)} aria-label="Open reservation summary">
          <ReceiptText className="h-4 w-4" />
          Summary
        </button>
        <div className={cx('booking-summary-overlay', summaryOpen && 'is-open')} onClick={() => setSummaryOpen(false)} />
        <aside className={cx('booking-summary-drawer', summaryOpen && 'is-open')} aria-hidden={!summaryOpen}>
          <header className="flex items-start justify-between gap-4 border-b border-[var(--bccc-backend-line)] p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--bccc-backend-gold)]">Live Reservation Summary</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--bccc-backend-text)]">{summaryTitle}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--bccc-backend-muted)]">{SCHEDULE_BASE_BLOCKS[baseBlock].label}{additionalHours > 0 ? ` + ${additionalHours} evening hour(s)` : ''}</p>
            </div>
            <button type="button" onClick={() => setSummaryOpen(false)} className="booking-icon-button"><X className="h-5 w-5" /></button>
          </header>
          <div className="grid gap-4 p-5">
            <SummaryLine label="Venue charge" value={money(estimatedBase)} />
            <SummaryLine label="Dressing Room" value={money(selectedDressingCharge)} />
            <SummaryLine label="Estimated Total" value={money(estimatedTotal)} strong />
            <SummaryLine label="Event" value={data.type_of_event || 'Not encoded yet'} />
            <SummaryLine label="Organizer" value={data.company_name || data.client_name || 'Not encoded yet'} />
            <SummaryLine label="Schedule" value={`${formatDateTime(data.booking_date_from)} → ${formatDateTime(data.booking_date_to)}`} />
            <SummaryLine label="MICE" value={isMiceRequired ? 'Required' : 'Private event exemption'} />
            <button type="button" onClick={() => { setShowDigitalForm((current) => !current); setSummaryOpen(false); }} className="booking-secondary-action justify-center">
              {showDigitalForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDigitalForm ? 'Hide Digital Form' : 'View Digital Form'}
            </button>
          </div>
        </aside>
      </>
    );
  }

  function DigitalFormPanel() {
    if (!showDigitalForm) return null;
    return (
      <section className="booking-digital-form">
        <header className="flex flex-col gap-3 border-b border-[var(--bccc-backend-line)] p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--bccc-backend-gold)]">Official Preview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--bccc-backend-text)]">Digital Reservation and MICE Intake Form</h2>
          </div>
          <button type="button" onClick={() => setShowDigitalForm(false)} className="booking-ghost-action">Hide</button>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <ReviewGrid items={[
            ['Organization', data.company_name],
            ['Event', data.type_of_event],
            ['Event Nature', isMiceRequired ? 'MICE/reportable' : 'Private event'],
            ['Classification', isMiceRequired ? data.classification_of_event : 'Private'],
            ['MICE Type', isMiceRequired ? data.mice_type_of_event : data.private_event_type],
            ['Contact Person', data.client_name],
            ['Contact Number', data.client_contact_number],
            ['Email', data.client_email],
            ['Address', finalAddress],
            ['Venue', selectedPackage?.name ?? selectedChargedItems.map((item) => item.displayLabel).join(' + ')],
            ['Schedule', `${formatDateTime(data.booking_date_from)} → ${formatDateTime(data.booking_date_to)}`],
            ['Guests', data.number_of_guests],
            ['Estimated Total', money(estimatedTotal)],
          ]} />
          <div className="border border-[var(--bccc-backend-line)] bg-[var(--bccc-backend-panel-muted)] p-5 text-sm leading-7 text-[var(--bccc-backend-muted)]">
            <p className="font-semibold text-[var(--bccc-backend-text)]">This preview follows the new connected booking intake.</p>
            <p className="mt-2">MICE details are carried inside the booking payload as a draft and can be finalized in the official registry/print flow after booking creation.</p>
          </div>
        </div>
      </section>
    );
  }

  function renderPackageStep() {
    const publicPackages = packageOptions.filter((packageOption) => packageOption.is_public !== false);
    const featuredPackages = publicPackages.length > 0 ? publicPackages : packageOptions;
    const showingManual = packageSelectionMode === 'manual' || featuredPackages.length === 0;

    return (
      <section className="booking-step-panel booking-package-screen-step booking-venue-package-stage">
        <WizardNotice errors={stepErrors} />

        <div className="booking-step-kicker"><PackageCheck className="h-4 w-4" /> Package and venue areas</div>
        <div className="booking-step-heading booking-package-heading-row">
          <div>
            <h2>Choose a public package or build your own area set</h2>
            <p>Public packages use visual cards. Manual selection hides packages and opens the exact venue areas. Full Hall does not automatically include VIP Lounge, Board Room, or LED Wall.</p>
          </div>

          <div className="booking-package-mode-switch" role="tablist" aria-label="Package selection mode">
            <button
              type="button"
              role="tab"
              aria-selected={!showingManual}
              onClick={() => setPackageSelectionMode('packages')}
              className={cx(!showingManual && 'is-active')}
              disabled={featuredPackages.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              Public Packages
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showingManual}
              onClick={switchToManualSelection}
              className={cx(showingManual && 'is-active')}
            >
              <Pencil className="h-4 w-4" />
              Manual Selection
            </button>
          </div>
        </div>

        {!showingManual ? (
          <div className="booking-public-package-carousel-shell">
            <div className="booking-package-carousel-header">
              <div>
                <p className="booking-mini-heading">Public venue combinations</p>
                <h3>Swipe through curated BCCC packages.</h3>
              </div>
              <div className="booking-package-carousel-controls" aria-label="Package carousel controls">
                <button type="button" onClick={() => scrollPackageCarousel(-1)} aria-label="Previous packages">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => scrollPackageCarousel(1)} aria-label="Next packages">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="booking-public-package-gallery booking-public-package-carousel" ref={packageCarouselRef}>
              {featuredPackages.map((packageOption, index) => {
                const active = selectedPackageCode === packageOption.code;
                const imagePath = packageOption.image_path || (index % 2 === 0 ? '/marketing/images/facilities/darkmain.JPG' : '/marketing/images/facilities/darkvip.JPG');
                const areas = packageOption.area_labels ?? venueKeysFromPackage(packageOption);

                return (
                  <button
                    type="button"
                    key={packageOption.code}
                    onClick={() => selectPackage(packageOption)}
                    className={cx('booking-public-package-card booking-public-package-slide group', active && 'is-selected')}
                    aria-pressed={active}
                  >
                    <span className="booking-package-image-wrap">
                      <img
                        src={imagePath}
                        alt={packageOption.name ?? packageOption.label ?? packageOption.code}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = '/marketing/images/hero/noon2.jpg';
                        }}
                      />
                      <span className="booking-package-image-shade" />
                      <span className="booking-package-badge">{packageOption.is_featured ? 'Suggested package' : 'Public package'}</span>
                      {active ? <span className="booking-package-selected-mark"><Check className="h-4 w-4" /> Selected</span> : null}
                    </span>

                    <span className="booking-public-package-content">
                      <span className="booking-package-code">{String(packageOption.code).replace(/_/g, ' ')}</span>
                      <strong>{packageOption.name ?? packageOption.label ?? packageOption.code}</strong>
                      <small>{packageOption.subtitle ?? packageOption.description ?? 'Choose this prepared venue combination.'}</small>
                      <span className="booking-package-area-list">
                        {areas.map((label) => <em key={String(label)}>{String(label)}</em>)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="booking-manual-area-panel">
            <div className="booking-manual-area-intro">
              <div>
                <p className="booking-mini-heading">Manual area selection</p>
                <h3>Select the exact areas needed for the event.</h3>
              </div>
              {featuredPackages.length > 0 ? (
                <button type="button" onClick={() => setPackageSelectionMode('packages')} className="booking-secondary-action">
                  Back to packages
                </button>
              ) : null}
            </div>

            <div ref={packageCarouselRef} className="booking-package-choice-grid mt-3">
              {venueItems.map((item) => {
                const selected = selectedVenueKeys.includes(item.key);
                return (
                  <button type="button" key={item.key} data-venue-key={item.key} disabled={!item.configured} onClick={() => selectVenue(item)} className={cx('booking-package-choice-card booking-area-image-card', selected && 'is-selected', !item.configured && 'is-disabled')}>
                    <img src={item.image} alt={item.displayLabel} />
                    <span>{item.category === 'package' ? 'Area base' : 'Add-on / area'}</span>
                    <strong>{item.displayLabel}</strong>
                    <small>{item.configured ? item.subtitle : 'Missing backend rental option'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Field label="Usage Preview">
            <select value={usage} onChange={(event) => setUsage(event.target.value as BookingUsageKey)} className="backend-booking-input">
              <option value="whole_day">Whole Day</option>
              <option value="half_day">Half Day</option>
              <option value="additional_hour">Additional Hour pricing preview</option>
            </select>
          </Field>
          <div className="booking-charge-card lg:col-span-2">
            <div><p>Per Day Estimate</p><strong>{money(estimatedBasePerDay)}</strong></div>
            <div><p>Selected Days</p><strong>{selectedDateCount}</strong></div>
            <div><p>Estimated Venue Charge</p><strong>{money(estimatedBase)}</strong></div>
            <span>{packageSelectionLabel(selectedVenueKeys, selectedPackage?.name ?? selectedPackage?.label)}</span>
          </div>
        </div>
      </section>
    );
  }

  function renderEventStep() {
    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><ClipboardList className="h-4 w-4" /> Event identity</div>
        <div className="booking-step-heading">
          <h2>Identify the event first</h2>
          <p>The rest of the form unlocks based on whether the event is MICE/reportable or a private event.</p>
        </div>
        <WizardNotice errors={stepErrors} />

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Event Nature" required error={fieldError('event_nature')}>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => handleEventNatureChange('mice')} className={cx('booking-checkbox-card text-left', data.event_nature === 'mice' && 'is-selected')}>
                <span><strong>MICE / reportable event</strong><small>Meeting, seminar, convention, exhibit, workshop, government/corporate activity.</small></span>
              </button>
              <button type="button" onClick={() => handleEventNatureChange('private')} className={cx('booking-checkbox-card text-left', data.event_nature === 'private' && 'is-selected')}>
                <span><strong>Private event</strong><small>Wedding, birthday, family event, or private social activity.</small></span>
              </button>
            </div>
          </Field>

          <Field label="Event's Name / Title" required error={fieldError('type_of_event')}>
            <input value={data.type_of_event} onChange={(event) => { setData('type_of_event', event.target.value); if (!data.public_calendar_title) setData('public_calendar_title', event.target.value); }} className={cx('backend-booking-input', fieldStatusClass(fieldError('type_of_event')))} placeholder="Example: 2026 Regional Tourism Summit" />
          </Field>

          {isMiceRequired ? (
            <>
              <Field label="Classification of the Event" required error={fieldError('classification_of_event')}>
                <select value={data.classification_of_event} onChange={(event) => setData('classification_of_event', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('classification_of_event')))}>
                  {classificationOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}
                </select>
              </Field>
              {data.classification_of_event === 'OTHER' ? (
                <Field label="Other Classification" required error={fieldError('classification_other')}>
                  <input value={data.classification_other} onChange={(event) => setData('classification_other', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('classification_other')))} />
                </Field>
              ) : null}
              <Field label="Type of the Event" required error={fieldError('mice_type_of_event')}>
                <select value={data.mice_type_of_event} onChange={(event) => setData('mice_type_of_event', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('mice_type_of_event')))}>
                  {miceTypeOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}
                </select>
              </Field>
              {data.mice_type_of_event === 'OTHERS' ? (
                <Field label="Specify Other Event Type" required error={fieldError('mice_type_other')}>
                  <input value={data.mice_type_other} onChange={(event) => setData('mice_type_other', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('mice_type_other')))} />
                </Field>
              ) : null}
            </>
          ) : (
            <>
              <Field label="Private Event Type" required error={fieldError('private_event_type')}>
                <select value={data.private_event_type} onChange={(event) => setData('private_event_type', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('private_event_type')))}>
                  <option value="">Select private event type</option>
                  {privateEventOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="MICE Exemption Note">
                <input value={data.mice_exemption_reason} onChange={(event) => setData('mice_exemption_reason', event.target.value)} className="backend-booking-input" placeholder="Private event - MICE report not required during initial booking." />
              </Field>
            </>
          )}
        </div>
      </section>
    );
  }

  function renderOrganizerStep() {
    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><UserRound className="h-4 w-4" /> Organizer details</div>
        <div className="booking-step-heading"><h2>Enter organizer contact details</h2><p>These values are reused by the MICE report and official reservation preview.</p></div>
        <WizardNotice errors={stepErrors} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Organization Type" required>
            <select value={data.organization_type} onChange={(event) => setData('organization_type', event.target.value)} className="backend-booking-input">
              {FALLBACK_ORGANIZATION_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Name of Organization of the Organizer" required error={fieldError('company_name')}>
            <input value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('company_name')))} placeholder="Organization name" />
          </Field>
          <Field label="Head of Organization">
            <input value={data.head_of_organization} onChange={(event) => setData('head_of_organization', event.target.value)} className="backend-booking-input" placeholder="Optional" />
          </Field>
          <Field label="Contact Person of the Organizer" required error={fieldError('client_name')}>
            <input value={data.client_name} onChange={(event) => setData('client_name', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_name')))} placeholder="Full name" />
          </Field>
          <Field label="Contact Number of the Organizer" required error={fieldError('client_contact_number')} helper="Use 09XXXXXXXXX format.">
            <input value={data.client_contact_number} onChange={(event) => setData('client_contact_number', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_contact_number')))} placeholder="09171234567" inputMode="tel" />
          </Field>
          <Field label="Email Address" required error={fieldError('client_email')}>
            <input value={data.client_email} onChange={(event) => { setData('client_email', event.target.value); if (!data.survey_email) setData('survey_email', event.target.value); }} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_email')))} type="email" placeholder="name@example.com" disabled={isClient && editing} />
          </Field>
          <Field label="Public Calendar Title">
            <input value={data.public_calendar_title} onChange={(event) => setData('public_calendar_title', event.target.value)} className="backend-booking-input" placeholder="Optional public-facing title" />
          </Field>
        </div>
      </section>
    );
  }

  function renderAddressStep() {
    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><MapPin className="h-4 w-4" /> Organizer address</div>
        <div className="booking-step-heading"><h2>Complete the connected address</h2><p>Region, province, city, barangay, and ZIP code are linked. Choose Other / Manual Input when the exact street or locality is not listed.</p></div>
        <WizardNotice errors={stepErrors} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Region" required error={fieldError('client_region')}>
            <select value={data.client_region} onChange={(event) => handleAddressRegionChange(event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_region')))}>
              {PHILIPPINES_ADDRESS_OPTIONS.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}
            </select>
          </Field>
          <Field label="Province" required error={fieldError('client_province')}>
            <select value={data.client_province} onChange={(event) => handleAddressProvinceChange(event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_province')))}>
              {selectedRegion.provinces.map((provinceOption) => <option key={provinceOption.name} value={provinceOption.name}>{provinceOption.name}</option>)}
            </select>
          </Field>
          <Field label="City / Municipality" required error={fieldError('client_city_municipality')}>
            <select value={data.client_city_municipality} onChange={(event) => handleAddressCityChange(event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_city_municipality')))}>
              {selectedProvince.cities.map((cityOption) => <option key={cityOption.name} value={cityOption.name}>{cityOption.name}</option>)}
            </select>
          </Field>
          <Field label="Barangay">
            <select value={data.client_barangay} onChange={(event) => setData('client_barangay', event.target.value)} className="backend-booking-input">
              <option value="">Select barangay</option>
              {selectedCity.barangays.map((barangay) => <option key={barangay.name} value={barangay.name}>{barangay.name}</option>)}
            </select>
          </Field>
          <Field label="ZIP Code">
            <input value={data.client_zip_code} onChange={(event) => setData('client_zip_code', event.target.value)} className="backend-booking-input" inputMode="numeric" placeholder="Auto-filled when available" />
          </Field>
          <Field label="Street / Building / Exact Address" required error={fieldError('client_street_address')}>
            <input value={data.client_street_address} onChange={(event) => { setData('client_street_address', event.target.value); setData('client_address', event.target.value); }} className={cx('backend-booking-input', fieldStatusClass(fieldError('client_street_address')))} placeholder="House / building / street, or choose Other then type manually" />
          </Field>
        </div>
        {data.client_barangay === OTHER_ADDRESS_VALUE || data.client_city_municipality === OTHER_ADDRESS_VALUE ? (
          <div className="booking-schedule-note mt-4">Manual locality selected. Please type the exact address clearly in the street address field.</div>
        ) : null}
        <div className="booking-generated-address"><p>Generated Full Address</p><strong>{finalAddress || 'Complete the address fields to generate full address.'}</strong></div>
      </section>
    );
  }

  function renderScheduleStep() {
    const monthDays = calendarDaysForMonth(calendarCursor);
    const daysCount = inclusiveDateCount(selectedDateRange.from, selectedDateRange.to);
    const canAddHours = baseBlock === 'PM' || baseBlock === 'WHOLE_DAY';
    const scheduleSegmentsPreview = buildScheduleSegmentsPayload();
    const selectedAreaLabel = selectedChargedItems.length > 0 ? selectedChargedItems.map((item) => item.displayLabel).join(' + ') : 'No area selected';
    const additionalEndLabel = additionalHours > 0 ? `until ${String(18 + additionalHours).padStart(2, '0')}:00` : 'No extension';

    return (
      <section className="booking-step-panel booking-schedule-step-panel">
        <div className="booking-step-kicker"><CalendarDays className="h-4 w-4" /> Operational schedule planner</div>
        <div className="booking-step-heading">
          <h2>Select the exact booking range and time coverage</h2>
          <p>This is now the detailed operational calendar. It prepares ingress, event, egress, AM/PM/Whole Day, and additional-hour segments for backend conflict validation.</p>
        </div>
        <WizardNotice errors={stepErrors} />

        <div className="booking-operational-calendar-shell">
          <section className="booking-calendar-card booking-calendar-card-detailed">
            <header className="booking-calendar-header">
              <button type="button" onClick={() => setCalendarCursor((current) => addMonthsToInputDate(current, -1))} className="booking-calendar-nav"><ChevronLeft className="h-4 w-4" /></button>
              <div>
                <p>Package-aware calendar</p>
                <h3>{calendarMonthTitle(calendarCursor)}</h3>
                <span>{selectedAreaLabel}</span>
              </div>
              <button type="button" onClick={() => setCalendarCursor((current) => addMonthsToInputDate(current, 1))} className="booking-calendar-nav"><ChevronRight className="h-4 w-4" /></button>
            </header>

            <div className="booking-calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="booking-calendar-grid booking-calendar-grid-operational">
              {monthDays.map((day) => {
                const selected = isCalendarDateSelected(day.date);
                const edge = isCalendarDateEdge(day.date);
                const anchor = rangeClickAnchor === day.date;
                const isStart = day.date === selectedDateRange.from;
                const isEnd = day.date === selectedDateRange.to;
                return (
                  <button
                    type="button"
                    key={day.date}
                    onClick={() => handleCalendarDateClick(day.date)}
                    className={cx('booking-calendar-day booking-calendar-day-operational', !day.inMonth && 'is-muted', selected && 'is-selected', edge && 'is-edge', anchor && 'is-anchor')}
                  >
                    <span className="booking-calendar-day-number">{day.day}</span>
                    <small>{isStart ? 'Start' : isEnd ? 'End' : selected ? 'Selected' : 'Tap'}</small>
                    {selected ? <em>{SCHEDULE_BASE_BLOCKS[baseBlock].label}</em> : null}
                  </button>
                );
              })}
            </div>

            <div className="booking-calendar-instruction-row">
              <div><span>1</span><strong>{rangeClickAnchor ? 'Select the final date' : 'Click start date'}</strong></div>
              <div><span>2</span><strong>{rangeClickAnchor ? formatDateOnly(rangeClickAnchor) : 'Click end date'}</strong></div>
              <div><span>3</span><strong>Choose AM / PM / Whole Day</strong></div>
            </div>
          </section>

          <aside className="booking-schedule-command-panel">
            <div className="booking-schedule-summary-card">
              <p className="booking-mini-heading">Selected Schedule</p>
              <div className="booking-schedule-range-display">
                <div><span>From</span><strong>{formatDateOnly(selectedDateRange.from)}</strong></div>
                <div><span>To</span><strong>{formatDateOnly(selectedDateRange.to)}</strong></div>
                <div><span>Total Days</span><strong>{daysCount}</strong></div>
              </div>
              <label className="booking-checkbox-card">
                <input type="checkbox" checked={hasIngress} onChange={(event) => setHasIngress(event.target.checked)} />
                <span><strong>First date has ingress/setup/preparation</strong><small>If enabled, the last selected date is automatically marked as egress/pack-out.</small></span>
              </label>
              <div className="booking-time-blocks">
                {(['AM', 'PM', 'WHOLE_DAY'] as ScheduleBaseBlock[]).map((block) => (
                  <button type="button" key={block} onClick={() => handleBaseBlockChange(block)} className={cx('booking-time-block-card', baseBlock === block && 'is-selected')}>
                    <span>{block === 'WHOLE_DAY' ? 'DAY' : block}</span>
                    <strong>{SCHEDULE_BASE_BLOCKS[block].label}</strong>
                    <small>{SCHEDULE_BASE_BLOCKS[block].helper}</small>
                  </button>
                ))}
              </div>
              <Field label="Additional Hours after 6:00 PM" helper={canAddHours ? `Allowed after ${SCHEDULE_BASE_BLOCKS[baseBlock].label}; ${additionalEndLabel}.` : 'Not available for AM bookings.'} error={fieldError('additional_hours')}>
                <select value={additionalHours} onChange={(event) => handleAdditionalHourChange(Number(event.target.value))} className="backend-booking-input" disabled={!canAddHours}>
                  {ADDITIONAL_HOUR_OPTIONS.map((hours) => <option key={hours} value={hours}>{hours === 0 ? 'No additional hours' : `${hours} hour(s)`}</option>)}
                </select>
              </Field>
            </div>

            <div className="booking-charge-card booking-charge-card-compact">
              <div><p>Venue Estimate</p><strong>{money(estimatedBase)}</strong></div>
              <div><p>Dressing Room</p><strong>{money(selectedDressingCharge)}</strong></div>
              <div><p>Total Estimate</p><strong>{money(estimatedTotal)}</strong></div>
              <span>Backend validation checks the final selected areas, date segments, calendar blocks, and existing bookings before saving.</span>
            </div>
          </aside>
        </div>

        <section className="booking-segment-preview-panel">
          <div className="booking-segment-preview-header">
            <div>
              <p className="booking-mini-heading">Per-date schedule segments</p>
              <h3>{hasIngress ? 'Ingress, event proper, and egress are prepared automatically.' : 'All selected dates are marked as event proper.'}</h3>
            </div>
            <span>{scheduleSegmentsPreview.length} segment{scheduleSegmentsPreview.length === 1 ? '' : 's'}</span>
          </div>
          <div className="booking-segment-preview-grid">
            {scheduleSegmentsPreview.map((segment, index) => {
              const roleLabel = segment.segment_role === 'ingress' ? 'Ingress / setup' : segment.segment_role === 'egress' ? 'Egress / pack-out' : 'Event proper';
              const blockLabel = segment.base_block === 'whole_day' ? 'Whole Day · 6:00 AM – 6:00 PM' : segment.base_block === 'pm' ? 'PM · 12:00 PM – 6:00 PM' : 'AM · 6:00 AM – 12:00 PM';
              return (
                <article key={`${segment.date}-${index}`} className="booking-segment-card">
                  <div>
                    <span>{roleLabel}</span>
                    <strong>{formatDateOnly(segment.date)}</strong>
                  </div>
                  <p>{blockLabel}</p>
                  <small>{Number(segment.additional_hours || 0) > 0 ? `+ ${segment.additional_hours} evening hour(s) after 6:00 PM` : 'No evening extension'}</small>
                </article>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Number of Guests" required error={fieldError('number_of_guests')}><input value={data.number_of_guests} onChange={(event) => { setData('number_of_guests', event.target.value); setData('domestic_attendees', event.target.value); setData('function_hall_capacity', event.target.value); }} className={cx('backend-booking-input', fieldStatusClass(fieldError('number_of_guests')))} inputMode="numeric" placeholder="0" /></Field>
          <Field label="Other Rentals"><select value={data.dressing_room_selection} onChange={(event) => handleDressingRoomChange(event.target.value)} className="backend-booking-input">{dressingRoomOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label} {option.charge_label ? `(${option.charge_label})` : ''}</option>)}</select></Field>
          <Field label="Additional Charges"><input value={money(selectedDressingCharge)} className="backend-booking-input" readOnly /></Field>
        </div>
        <Field label="Reservation Notes"><textarea value={data.reservation_notes} onChange={(event) => setData('reservation_notes', event.target.value)} className="backend-booking-input min-h-28 py-3" placeholder="Optional notes" /></Field>
      </section>
    );
  }

  function renderMiceStep() {
    if (!isMiceRequired) {
      return (
        <section className="booking-step-panel">
          <div className="booking-step-kicker"><Sparkles className="h-4 w-4" /> Private event exemption</div>
          <div className="booking-step-heading"><h2>MICE report is not required for this booking intake</h2><p>Because the event was marked private, only the booking and guidelines confirmations are required now.</p></div>
          <div className="booking-mice-required-card"><div><p>Private event</p><h3>{data.private_event_type || 'Private event selected'}</h3></div><span>{data.mice_exemption_reason || 'MICE report not required during initial booking.'}</span></div>
        </section>
      );
    }

    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><Sparkles className="h-4 w-4" /> Official MICE report fields</div>
        <div className="booking-step-heading"><h2>Complete the MICE details inside the booking</h2><p>These fields follow the MICE report format you provided and will be carried into the official registry/print workflow.</p></div>
        <WizardNotice errors={stepErrors} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Name of Event Center" required error={fieldError('event_center_name')}><select value={data.event_center_name} onChange={(event) => setData('event_center_name', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('event_center_name')))}>{eventCenterOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}</select></Field>
          {data.event_center_name === 'OTHER' ? <Field label="Other Event Center" required error={fieldError('event_center_other')}><input value={data.event_center_other} onChange={(event) => setData('event_center_other', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('event_center_other')))} /></Field> : null}
          <Field label="Covered Month" required error={fieldError('covered_month')}><select value={data.covered_month} onChange={(event) => setData('covered_month', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('covered_month')))}>{coveredMonthOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}</select></Field>
          <Field label="No. of Function Halls" required error={fieldError('function_halls_count')}><input value={data.function_halls_count} onChange={(event) => setData('function_halls_count', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('function_halls_count')))} inputMode="numeric" /></Field>
          <Field label="Function Hall Capacity" required error={fieldError('function_hall_capacity')}><input value={data.function_hall_capacity} onChange={(event) => setData('function_hall_capacity', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('function_hall_capacity')))} inputMode="numeric" /></Field>
          <Field label="Number of Hours" required error={fieldError('number_of_hours')}><input value={data.number_of_hours} onChange={(event) => setData('number_of_hours', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('number_of_hours')))} inputMode="decimal" /></Field>
          <Field label="Number of Attendees - Foreign" required><input value={data.foreign_attendees} onChange={(event) => setData('foreign_attendees', event.target.value)} className="backend-booking-input" inputMode="numeric" /></Field>
          <Field label="Number of Attendees - Domestic" required error={fieldError('domestic_attendees')}><input value={data.domestic_attendees} onChange={(event) => setData('domestic_attendees', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('domestic_attendees')))} inputMode="numeric" /></Field>
          <Field label="Total Number of Countries" required error={fieldError('total_number_of_countries')}><input value={data.total_number_of_countries} onChange={(event) => setData('total_number_of_countries', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('total_number_of_countries')))} inputMode="numeric" /></Field>
          <Field label="Breakdown of Countries" required error={fieldError('countries_breakdown_text')}><input value={data.countries_breakdown_text} onChange={(event) => setData('countries_breakdown_text', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('countries_breakdown_text')))} placeholder="Example: PHILIPPINES" /></Field>
          <Field label="Exhibitions" required><select value={data.has_exhibitions} onChange={(event) => setData('has_exhibitions', event.target.value)} className="backend-booking-input"><option value="No">No</option><option value="Yes">Yes</option></select></Field>
          <Field label="No. of Exhibitors" error={fieldError('exhibitors_count')}><input value={data.exhibitors_count} onChange={(event) => setData('exhibitors_count', event.target.value)} className={cx('backend-booking-input', fieldStatusClass(fieldError('exhibitors_count')))} inputMode="numeric" /></Field>
          <Field label="No. of Visitors"><input value={data.visitors_count} onChange={(event) => setData('visitors_count', event.target.value)} className="backend-booking-input" inputMode="numeric" /></Field>
          <Field label="Comment and/or Feedback"><textarea value={data.comments_feedback} onChange={(event) => setData('comments_feedback', event.target.value)} className="backend-booking-input min-h-28 py-3" placeholder="N/A if none" /></Field>
        </div>
      </section>
    );
  }

  function renderGuidelinesStep() {
    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><ShieldCheck className="h-4 w-4" /> Guidelines and confirmation</div>
        <div className="booking-step-heading"><h2>Review the rules before submitting</h2><p>Guidelines are kept inside the booking flow so the organizer confirms them before the request is submitted.</p></div>
        <WizardNotice errors={stepErrors} />
        <div className="booking-guideline-grid">{BCCC_BOOKING_GENERAL_GUIDELINES.map((section) => <article key={section.title} className="booking-guideline-card"><p>Guideline</p><h3>{section.title}</h3><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
        <div className="booking-mice-required-card"><div><p>{isMiceRequired ? 'MICE report required' : 'Private event exemption'}</p><h3>{isMiceRequired ? 'MICE details were collected inside this booking.' : 'Full MICE report is not required for this private event.'}</h3></div><span>{isMiceRequired ? 'The official MICE fields will be forwarded as draft data for the registry and print form.' : data.mice_exemption_reason || 'Private event exemption was recorded.'}</span></div>
        <div className="grid gap-3">
          <label className={cx('booking-checkbox-card', fieldError('policy_acknowledged') && 'has-error')}><input type="checkbox" checked={data.policy_acknowledged} onChange={(event) => setData('policy_acknowledged', event.target.checked)} /><span><strong>I reviewed the BCCC guidelines.</strong><small>The booking is subject to BCCC review, payment compliance, schedule validation, and house rules.</small></span></label>
          <label className={cx('booking-checkbox-card', fieldError('accuracy_acknowledged') && 'has-error')}><input type="checkbox" checked={data.accuracy_acknowledged} onChange={(event) => setData('accuracy_acknowledged', event.target.checked)} /><span><strong>I confirm that all information is accurate.</strong><small>Incorrect details may delay assessment and approval.</small></span></label>
        </div>
        {isStaffLike ? <div className="mt-5 grid gap-4 border border-[var(--bccc-backend-line)] bg-[var(--bccc-backend-panel-muted)] p-5 lg:grid-cols-2"><Field label="Booking Status"><select value={data.booking_status} onChange={(event) => setData('booking_status', event.target.value)} className="backend-booking-input" disabled={isManager}><option value="pending">Pending</option><option value="pencil_booked">Pencil Booked</option><option value="confirmed">Confirmed</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="declined">Declined</option></select></Field><Field label="Payment Status"><select value={data.payment_status} onChange={(event) => setData('payment_status', event.target.value)} className="backend-booking-input" disabled={isManager}><option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option><option value="owing">Owing</option></select></Field></div> : null}
      </section>
    );
  }

  function renderReviewStep() {
    return (
      <section className="booking-step-panel">
        <div className="booking-step-kicker"><CheckCircle2 className="h-4 w-4" /> Final review</div>
        <div className="booking-step-heading"><h2>Check everything before submitting</h2><p>Use the edit buttons if something needs correction. This is the last screen before submission.</p></div>
        <ServerErrorsBanner errors={errors as Record<string, string>} />
        <div className="grid gap-5">
          <ReviewBlock title="Package and Venue" icon={PackageCheck} onEdit={() => goToStep(0)}><ReviewGrid items={[[ 'Selected Package', selectedPackage?.name ?? selectedPackage?.label ?? 'Manual area selection' ], [ 'Selected Areas', selectedChargedItems.map((item) => item.displayLabel).join(', ') ], [ 'Package Note', packageSelectionLabel(selectedVenueKeys, selectedPackage?.name ?? selectedPackage?.label) ], [ 'Venue Estimate', money(estimatedBase) ], [ 'Dressing Room', `${data.dressing_room_selection} · ${money(selectedDressingCharge)}` ], [ 'Estimated Total', money(estimatedTotal) ]]} /></ReviewBlock>
          <ReviewBlock title="Event Identity" icon={ClipboardList} onEdit={() => goToStep(1)}><ReviewGrid items={[[ 'Event', data.type_of_event ], [ 'Nature', isMiceRequired ? 'MICE / reportable' : 'Private event' ], [ 'Classification', isMiceRequired ? data.classification_of_event : 'Private' ], [ 'Type', isMiceRequired ? data.mice_type_of_event : data.private_event_type ]]} /></ReviewBlock>
          <ReviewBlock title="Organizer" icon={UserRound} onEdit={() => goToStep(2)}><ReviewGrid items={[[ 'Organization', data.company_name ], [ 'Head', data.head_of_organization ], [ 'Contact', data.client_name ], [ 'Mobile', data.client_contact_number ], [ 'Email', data.client_email ]]} /></ReviewBlock>
          <ReviewBlock title="Address" icon={MapPin} onEdit={() => goToStep(3)}><ReviewGrid items={[[ 'Region', data.client_region ], [ 'Province', data.client_province ], [ 'City / Municipality', data.client_city_municipality ], [ 'Barangay', data.client_barangay ], [ 'ZIP', data.client_zip_code ], [ 'Full Address', finalAddress ]]} /></ReviewBlock>
          <ReviewBlock title="Schedule and Guests" icon={CalendarDays} onEdit={() => goToStep(4)}><ReviewGrid items={[[ 'Start', formatDateTime(data.booking_date_from) ], [ 'End', formatDateTime(data.booking_date_to) ], [ 'Duration', `${rangeHours(data.booking_date_from, data.booking_date_to)} hour(s)` ], [ 'Ingress/Egress', hasIngress ? 'Ingress first day + egress last day' : 'Event days only' ], [ 'Base Schedule', SCHEDULE_BASE_BLOCKS[baseBlock].label ], [ 'Additional Hours', additionalHours > 0 ? `${additionalHours} hour(s)` : 'None' ], [ 'Guests', data.number_of_guests ], [ 'Notes', data.reservation_notes ]]} /></ReviewBlock>
          <ReviewBlock title="MICE / Guidelines" icon={ShieldCheck} onEdit={() => goToStep(5)}><ReviewGrid items={[[ 'MICE Requirement', isMiceRequired ? 'Required' : 'Private event exemption' ], [ 'Covered Month', isMiceRequired ? data.covered_month : '—' ], [ 'Countries', isMiceRequired ? data.countries_breakdown_text : '—' ], [ 'Exhibitions', isMiceRequired ? data.has_exhibitions : '—' ], [ 'Policy Confirmed', data.policy_acknowledged ? 'Yes' : 'No' ], [ 'Accuracy Confirmed', data.accuracy_acknowledged ? 'Yes' : 'No' ]]} /></ReviewBlock>
        </div>
      </section>
    );
  }

  function renderActiveStep() {
    if (activeStep === 0) return renderPackageStep();
    if (activeStep === 1) return renderEventStep();
    if (activeStep === 2) return renderOrganizerStep();
    if (activeStep === 3) return renderAddressStep();
    if (activeStep === 4) return renderScheduleStep();
    if (activeStep === 5) return renderMiceStep();
    if (activeStep === 6) return renderGuidelinesStep();
    return renderReviewStep();
  }

  return (
    <BookingRolePageShell role={role} title={formTitle(role, editing)} description={formDescription(role)} actions={<><Link href={backHref} className="booking-ghost-action"><ArrowLeft className="h-4 w-4" />Back</Link><button type="button" onClick={() => setShowDigitalForm((current) => !current)} className="booking-secondary-action">{showDigitalForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showDigitalForm ? 'Hide Form' : 'View Form'}</button></>}>
      <form onSubmit={handleSubmit} className="booking-lux-form" data-booking-wizard-root>
        <PrefillBanner />
        <Stepper activeStep={activeStep} maxStep={maxStep} onStepClick={goToStep} />
        <DigitalFormPanel />
        <div className={cx('booking-wizard-stage', stepLoading && 'is-loading')}>
          {stepLoading ? <div className="booking-step-loader"><LoaderCircle className="h-8 w-8 animate-spin" /><p>Preparing next page...</p></div> : null}
          {renderActiveStep()}
        </div>
        <StepFooter />
      </form>
      <SummaryDrawer />
    </BookingRolePageShell>
  );
}
