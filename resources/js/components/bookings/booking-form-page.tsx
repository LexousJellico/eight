import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { bookingBasePath, bookingShowPath, normalizeWorkspaceRole } from '@/lib/booking-role-ui';
import type { RoleThemeKey } from '@/lib/role-theme';
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
  LoaderCircle,
  Minus,
  PackageCheck,
  ReceiptText,
  ScrollText,
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
  mice?: {
    classificationOptions?: SelectOption[];
    typeOptions?: SelectOption[];
    privateEventOptions?: SelectOption[];
  };
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
  service?: { id?: number | string | null; name?: string | null } | null;
  booking_date_from?: string | null;
  booking_date_to?: string | null;
  selected_package_code?: string | null;
  selected_area_keys?: string[] | null;
  mice_required?: boolean | number | null;
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
  booking_status?: string | null;
  payment_status?: string | null;
  is_public_calendar_visible?: boolean | number | null;
  public_calendar_title?: string | null;
  payment_meta?: Record<string, unknown> | null;
  schedule_meta?: Record<string, unknown> | null;
  [key: string]: unknown;
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

type ActiveVenueKey = 'FULL_HALL' | 'MAIN_HALL' | 'LED_WALL' | 'LOUNGE' | 'BOARDROOM';
type ScheduleBlock = 'am' | 'pm' | 'whole_day';
type EventScope = 'public' | 'private';
type PackageMode = 'packages' | 'manual';

type ActiveVenue = {
  key: ActiveVenueKey;
  number: string;
  label: string;
  officialLabel: string;
  shortLabel: string;
  description: string;
  image: string;
  inclusions: string[];
  rates: {
    wholeDay: number;
    halfDay: number;
    extraHour: number;
  };
  matchers: string[];
};

type ActivePackage = {
  code: string;
  label: string;
  subtitle: string;
  areaKeys: ActiveVenueKey[];
  image: string;
  featured?: boolean;
};

type ScheduleSelection = {
  date: string;
  block: ScheduleBlock;
  additionalHours: number;
};


type AvailabilityBlockKey = 'AM' | 'PM' | 'EVE';

type AvailabilityApiBlock = {
  key?: string | null;
  label?: string | null;
  from?: string | null;
  to?: string | null;
  is_available?: boolean | null;
  isAvailable?: boolean | null;
  booked?: boolean | null;
  blocked?: boolean | null;
  reason?: string | null;
};

type AvailabilityApiDay = {
  date?: string | null;
  status?: string | null;
  title?: string | null;
  note?: string | null;
  description?: string | null;
  can_proceed?: boolean | null;
  is_fully_booked?: boolean | null;
  isFullyBooked?: boolean | null;
  blocks?: AvailabilityApiBlock[] | Record<string, AvailabilityApiBlock | boolean> | null;
};

type AvailabilityBlockState = {
  key: AvailabilityBlockKey;
  label: string;
  from: string;
  to: string;
  available: boolean | null;
  reason: string | null;
};

type DayAvailabilitySummary = {
  date: string;
  status: string;
  title: string;
  note: string;
  canProceed: boolean | null;
  am: AvailabilityBlockState;
  pm: AvailabilityBlockState;
  eve: AvailabilityBlockState;
  sourceCount: number;
};

type CalendarAvailabilityMap = Record<string, DayAvailabilitySummary>;


type ReviewLineItem = {
  key: string;
  date: string;
  label: string;
  detail: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  type: 'venue' | 'additional_hour';
};

type DiscountLine = {
  key: string;
  label: string;
  basis: number;
  rate: number;
  amount: number;
  note: string;
};

type BookingFormData = {
  service_id: string;
  items: BookingFormItem[];
  payment_meta: BookingPaymentMeta;
  selected_package_code: string;
  selected_area_keys: ActiveVenueKey[];
  schedule_version: string;
  schedule_meta: BookingPaymentMeta;
  schedule_segments: Array<{
    date: string;
    segment_role: 'event' | 'ingress' | 'egress';
    base_block: ScheduleBlock;
    additional_hours: number;
    area_keys: ActiveVenueKey[];
  }>;
  mice_required: boolean;
  mice_exemption_reason: string;
  private_event_type: string;
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
  booking_status: string;
  payment_status: string;
  is_public_calendar_visible: boolean;
  public_calendar_title: string;
  policy_acknowledged: boolean;
  accuracy_acknowledged: boolean;
  estimated_usage: string;
  estimated_duration_hours: string;
  estimated_other_rentals: string;
  estimated_additional_charges: string;
  reservation_notes: string;
  event_nature: EventScope;
  event_center_name: string;
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

type StepDefinition = {
  key: 'schedule' | 'services' | 'contact' | 'review' | 'submitted';
  label: string;
  helper: string;
  icon: typeof CalendarDays;
};

type FieldName = keyof BookingFormData;

const ACTIVE_VENUES: ActiveVenue[] = [
  {
    key: 'FULL_HALL',
    number: '01',
    label: 'FULL HALL',
    officialLabel: 'Full Hall',
    shortLabel: 'Full Hall',
    description: 'Primary full venue reservation. The lobby is included and is not charged as a separate booking item.',
    image: '/marketing/images/facilities/darkmain.JPG',
    inclusions: ['Includes lobby access', 'Whole hall event setup', 'Best for major public and institutional events'],
    rates: { wholeDay: 80000, halfDay: 45000, extraHour: 5000 },
    matchers: ['full hall', 'whole hall'],
  },
  {
    key: 'MAIN_HALL',
    number: '02',
    label: 'MAIN HALL',
    officialLabel: 'Ground Hall',
    shortLabel: 'Main Hall',
    description: 'Main event hall for conferences, ceremonies, exhibits, and public gatherings.',
    image: '/marketing/images/facilities/darkmain.JPG',
    inclusions: ['Main event floor', 'Public event-ready layout', 'Manual combination ready'],
    rates: { wholeDay: 60000, halfDay: 35000, extraHour: 5000 },
    matchers: ['main hall', 'ground hall'],
  },
  {
    key: 'LED_WALL',
    number: '03',
    label: 'LED WALL',
    officialLabel: 'LED Video Wall',
    shortLabel: 'LED Wall',
    description: 'Visual display add-on for programs, ceremonies, presentations, and production-led events.',
    image: '/marketing/images/facilities/ledwall.jpg',
    inclusions: ['Standalone active choice', 'Can be combined with venue areas', 'Charged by booking duration'],
    rates: { wholeDay: 30000, halfDay: 15000, extraHour: 3500 },
    matchers: ['led wall', 'video wall', 'led video wall'],
  },
  {
    key: 'LOUNGE',
    number: '04',
    label: 'LOUNGE',
    officialLabel: 'Executive Lounge',
    shortLabel: 'Lounge',
    description: 'Compact executive space for holding, coordination, small meetings, or VIP support.',
    image: '/marketing/images/facilities/darkvip.JPG',
    inclusions: ['VIP support room', 'Small meeting format', 'Can combine with hall selections'],
    rates: { wholeDay: 6000, halfDay: 3500, extraHour: 500 },
    matchers: ['lounge', 'vip lounge', 'executive lounge'],
  },
  {
    key: 'BOARDROOM',
    number: '05',
    label: 'BOARDROOM',
    officialLabel: 'Executive Boardroom',
    shortLabel: 'Boardroom',
    description: 'Boardroom setup for executive meetings, planning sessions, and organizer coordination.',
    image: '/marketing/images/facilities/boardroom.jpg',
    inclusions: ['Boardroom setup', 'Meeting support space', 'Can combine with Main Hall'],
    rates: { wholeDay: 6000, halfDay: 3500, extraHour: 500 },
    matchers: ['boardroom', 'board room', 'executive boardroom'],
  },
];

const FALLBACK_PACKAGES: ActivePackage[] = [
  {
    code: 'FULL_HALL_ONLY',
    label: 'Full Hall',
    subtitle: 'Full Hall with lobby included',
    areaKeys: ['FULL_HALL'],
    image: '/marketing/images/facilities/darkmain.JPG',
    featured: true,
  },
  {
    code: 'MAIN_BOARD',
    label: 'Main Hall + Boardroom',
    subtitle: '₱66,000 whole day active combination',
    areaKeys: ['MAIN_HALL', 'BOARDROOM'],
    image: '/marketing/images/facilities/darkmain.JPG',
    featured: true,
  },
  {
    code: 'MAIN_LOUNGE',
    label: 'Main Hall + Lounge',
    subtitle: 'Main hall with VIP support space',
    areaKeys: ['MAIN_HALL', 'LOUNGE'],
    image: '/marketing/images/facilities/darkvip.JPG',
  },
  {
    code: 'MAIN_LED',
    label: 'Main Hall + LED Wall',
    subtitle: 'Program-ready hall with visual display',
    areaKeys: ['MAIN_HALL', 'LED_WALL'],
    image: '/marketing/images/facilities/ledwall.jpg',
  },
  {
    code: 'LOUNGE_BOARDROOM',
    label: 'Lounge + Boardroom',
    subtitle: 'Executive rooms only',
    areaKeys: ['LOUNGE', 'BOARDROOM'],
    image: '/marketing/images/facilities/boardroom.jpg',
  },
];

const STEPS: StepDefinition[] = [
  { key: 'schedule', label: 'Schedule', helper: 'Select dates and time blocks', icon: CalendarDays },
  { key: 'services', label: 'Package / Services', helper: 'Choose active BCCC areas', icon: PackageCheck },
  { key: 'contact', label: 'Contact Details', helper: 'Organizer, event, and MICE data', icon: UserRound },
  { key: 'review', label: 'Review', helper: 'Final computation and policy', icon: ClipboardList },
  { key: 'submitted', label: 'Submitted', helper: 'Reservation request sent', icon: CheckCircle2 },
];

const CLASSIFICATION_OPTIONS: SelectOption[] = [
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'REGIONAL ASIA PACIFIC', label: 'Regional Asia Pacific' },
  { value: 'REGIONAL OFFSHORE', label: 'Regional Offshore' },
  { value: 'REGIONAL PHILIPPINES', label: 'Regional Philippines' },
  { value: 'NATIONAL', label: 'National' },
];

const MICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'MEETINGS', label: 'Meetings' },
  { value: 'INCENTIVE TRAVEL', label: 'Incentive Travel' },
  { value: 'CONVENTIONS', label: 'Conventions' },
  { value: 'EXHIBITS', label: 'Exhibits' },
  { value: 'SEMINAR/WORKSHOP/SYMPOSIUM/OTHERS', label: 'Seminar / Workshop / Symposium / Others' },
];

const PRIVATE_EVENT_OPTIONS: SelectOption[] = [
  { value: 'PRIVATE/PERSONAL EVENT', label: 'Private / Personal Event' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'FAMILY EVENT', label: 'Family Event' },
  { value: 'OTHER PRIVATE EVENT', label: 'Other Private Event' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PUBLIC_EVENT_CENTER = 'BAGUIO CONVENTION AND CULTURAL CENTER';
const MAX_ADDITIONAL_HOURS = 6;
const REQUIRED_BOND = 10000;

const BCCC_POLICY_NOTICE = [
  'Reservation requests remain subject to BCCC schedule verification, assessment, and approval.',
  'The date becomes fully reserved only after the required down payment is reviewed and accepted by BCCC.',
  'A refundable/event bond may be required before the event, except when waived for qualified official city activities.',
  'Cancellation penalties, post-event charges, and house-rule violations may be assessed according to BCCC policy.',
  'Only Full Hall, Main Hall, LED Wall, Lounge, and Boardroom are active charge choices in this booking system.',
  'Lobby access is included with Full Hall and is not charged as a standalone rental item.',
];

const EXCLUDED_USER_CHARGES = [
  'Basement Function Room, Basement Hall - Half, and Whole Basement',
];

const REVIEW_POLICY_SECTIONS = [
  {
    title: 'Reservation and payment',
    body: 'This submission is a reservation request for review. The final reservation depends on BCCC assessment, availability confirmation, and payment compliance. The review computation separates the base venue estimate, hidden eligible discounts, required down payment, bond, and remaining balance.',
  },
  {
    title: 'Active charge scope',
    body: 'The only selectable charge choices are Full Hall, Main Hall, LED Wall, Lounge, and Boardroom. Lobby access is included with Full Hall. Basement spaces, shop rentals, catering maintenance, air conditioning, stationery kit, and ordinance special packages are not user-selectable charges in this flow.',
  },
  {
    title: 'Discount visibility',
    body: 'Discounts are intentionally hidden during schedule and service selection. They appear only on the final review computation and remain subject to BCCC assessment before billing is finalized.',
  },
  {
    title: 'Responsibility and post-event assessment',
    body: 'The organizer is responsible for accurate details, proper conduct, house-rule compliance, and possible post-event assessment for damages, violations, extra use, or unpaid balance.',
  },
];



type PhilippinesRegionOption = {
  code: string;
  label: string;
  provinces: string[];
};

const PHILIPPINES_ADDRESS_REGIONS: PhilippinesRegionOption[] = [
  { code: 'NCR', label: 'National Capital Region (NCR)', provinces: ['NCR - CITY OF MANILA', 'NCR - SECOND DISTRICT', 'NCR - THIRD DISTRICT', 'NCR - FOURTH DISTRICT'] },
  { code: 'CAR', label: 'Cordillera Administrative Region (CAR)', provinces: ['ABRA', 'APAYAO', 'BENGUET', 'IFUGAO', 'KALINGA', 'MOUNTAIN PROVINCE'] },
  { code: 'REGION I', label: 'Region I (Ilocos Region)', provinces: ['ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN'] },
  { code: 'REGION II', label: 'Region II (Cagayan Valley)', provinces: ['BATANES', 'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO'] },
  { code: 'REGION III', label: 'Region III (Central Luzon)', provinces: ['AURORA', 'BATAAN', 'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES'] },
  { code: 'REGION IV-A', label: 'Region IV-A (CALABARZON)', provinces: ['BATANGAS', 'CAVITE', 'LAGUNA', 'QUEZON', 'RIZAL'] },
  { code: 'MIMAROPA', label: 'MIMAROPA Region', provinces: ['MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'PALAWAN', 'ROMBLON'] },
  { code: 'REGION V', label: 'Region V (Bicol Region)', provinces: ['ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON'] },
  { code: 'REGION VI', label: 'Region VI (Western Visayas)', provinces: ['AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL'] },
  { code: 'NIR', label: 'Negros Island Region (NIR)', provinces: ['NEGROS OCCIDENTAL', 'NEGROS ORIENTAL', 'SIQUIJOR'] },
  { code: 'REGION VII', label: 'Region VII (Central Visayas)', provinces: ['BOHOL', 'CEBU'] },
  { code: 'REGION VIII', label: 'Region VIII (Eastern Visayas)', provinces: ['BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE'] },
  { code: 'REGION IX', label: 'Region IX (Zamboanga Peninsula)', provinces: ['ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY'] },
  { code: 'REGION X', label: 'Region X (Northern Mindanao)', provinces: ['BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL'] },
  { code: 'REGION XI', label: 'Region XI (Davao Region)', provinces: ['DAVAO DE ORO', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL'] },
  { code: 'REGION XII', label: 'Region XII (SOCCSKSARGEN)', provinces: ['COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT'] },
  { code: 'REGION XIII', label: 'Region XIII (Caraga)', provinces: ['AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR'] },
  { code: 'BARMM', label: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)', provinces: ['BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO DEL NORTE', 'MAGUINDANAO DEL SUR', 'SULU', 'TAWI-TAWI'] },
];

const COMMON_CITY_MUNICIPALITY_OPTIONS: Record<string, string[]> = {
  'BENGUET': ['BAGUIO CITY', 'LA TRINIDAD', 'ITOGON', 'SABLAN', 'TUBA', 'TUBLAY', 'ATOK', 'BAKUN', 'BOKOD', 'BUGUIAS', 'KABAYAN', 'KAPANGAN', 'KIBUNGAN', 'MANKAYAN'],
  'ABRA': ['BANGUED', 'BOLINEY', 'BUCAY', 'BUCLOC', 'DAGUIOMAN', 'DANGLAS', 'DOLORES', 'LA PAZ', 'LACUB', 'LAGANGILANG', 'LAGAYAN', 'LANGIDEN', 'LICUAN-BAAY', 'LUBA', 'MALIBCONG', 'MANABO', 'PEÑARRUBIA', 'PIDIGAN', 'PILAR', 'SALLAPADAN', 'SAN ISIDRO', 'SAN JUAN', 'SAN QUINTIN', 'TAYUM', 'TINEG', 'TUBO', 'VILLAVICIOSA'],
  'APAYAO': ['CALANASAN', 'CONNER', 'FLORA', 'KABUGAO', 'LUNA', 'PUDTOL', 'SANTA MARCELA'],
  'IFUGAO': ['AGUINALDO', 'ALFONSO LISTA', 'ASIPULO', 'BANAUE', 'HINGYON', 'HUNGDUAN', 'KIANGAN', 'LAGAWE', 'LAMUT', 'MAYOYAO', 'TINOC'],
  'KALINGA': ['TABUK CITY', 'BALBALAN', 'LUBUAGAN', 'PASIL', 'PINUKPUK', 'RIZAL', 'TANUDAN', 'TINGLAYAN'],
  'MOUNTAIN PROVINCE': ['BONTOC', 'BARLIG', 'BAUKO', 'BESAO', 'NATONIN', 'PARACELIS', 'SABANGAN', 'SADANGA', 'SAGADA', 'TADIAN'],
  'NCR - CITY OF MANILA': ['CITY OF MANILA'],
  'NCR - SECOND DISTRICT': ['MANDALUYONG CITY', 'MARIKINA CITY', 'PASIG CITY', 'QUEZON CITY', 'SAN JUAN CITY'],
  'NCR - THIRD DISTRICT': ['CALOOCAN CITY', 'MALABON CITY', 'NAVOTAS CITY', 'VALENZUELA CITY'],
  'NCR - FOURTH DISTRICT': ['LAS PIÑAS CITY', 'MAKATI CITY', 'MUNTINLUPA CITY', 'PARAÑAQUE CITY', 'PASAY CITY', 'PATEROS', 'TAGUIG CITY'],
};

function provincesForRegion(regionCode: string): string[] {
  return PHILIPPINES_ADDRESS_REGIONS.find((region) => region.code === regionCode)?.provinces ?? [];
}

function citiesForProvince(province: string): string[] {
  return COMMON_CITY_MUNICIPALITY_OPTIONS[upper(province)] ?? [];
}

function composePhilippinesAddress(parts: Partial<Pick<BookingFormData, 'client_region' | 'client_province' | 'client_city_municipality' | 'client_barangay' | 'client_street_address'>>): string {
  return [
    parts.client_street_address,
    parts.client_barangay,
    parts.client_city_municipality,
    parts.client_province,
    parts.client_region,
    'PHILIPPINES',
  ]
    .map((part) => upper(String(part || '').trim()))
    .filter(Boolean)
    .join(', ');
}

function fullMainCombinationError(areaKeys: ActiveVenueKey[]): string | null {
  return areaKeys.includes('FULL_HALL') && areaKeys.includes('MAIN_HALL')
    ? 'Full Hall already includes and occupies the Main Hall. Choose Full Hall with LED Wall, Lounge, or Boardroom, or choose Main Hall without Full Hall.'
    : null;
}

function selectionAvailabilityProblem(selection: ScheduleSelection, availability: DayAvailabilitySummary | undefined): string | null {
  if (!availability || availability.canProceed === null) return null;

  if (availability.canProceed === false) {
    return `${displayDate(selection.date)} is not available for the selected service scope.`;
  }

  const needed: AvailabilityBlockState[] = selection.block === 'whole_day'
    ? [availability.am, availability.pm]
    : selection.block === 'am'
      ? [availability.am]
      : [availability.pm];

  if (selection.additionalHours > 0) {
    needed.push(availability.eve);
  }

  const closed = needed.find((block) => block.available === false);

  return closed ? `${displayDate(selection.date)} ${closed.label} is not available. ${closed.reason || 'Please choose another time block.'}` : null;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function collection<T>(value?: T[] | PaginatedLike<T>): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

function firstValue(...values: unknown[]): string {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== '') return String(value);
  }
  return '';
}

function optionValue(value: string | number | boolean): string {
  return String(value);
}

function money(value: number | string | null | undefined): string {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(number);
}

function normalize(value: string | null | undefined): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function upper(value: string): string {
  return value.toUpperCase();
}


function dateObjectToInput(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function toDateOnly(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function toDateTime(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

function todayDate(): string {
  return dateObjectToInput(new Date());
}

function addDays(date: string, days: number): string {
  const current = new Date(`${date}T00:00:00`);
  current.setDate(current.getDate() + days);
  return dateObjectToInput(current);
}

function compareDate(a: string, b: string): number {
  return a.localeCompare(b);
}

function dateRange(start: string, end: string): string[] {
  const from = compareDate(start, end) <= 0 ? start : end;
  const to = compareDate(start, end) <= 0 ? end : start;
  const days: string[] = [];
  let cursor = from;
  while (compareDate(cursor, to) <= 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

function monthStart(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-01`;
}

function shiftMonth(date: string, offset: number): string {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setMonth(parsed.getMonth() + offset);
  return monthStart(dateObjectToInput(parsed));
}

function monthLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

function displayDate(date: string): string {
  if (!date) return '—';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayDateTime(date: string): string {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function daysForMonth(cursor: string): Array<{ date: string; inMonth: boolean }> {
  const first = new Date(`${monthStart(cursor)}T00:00:00`);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = dateObjectToInput(date);
    return { date: iso, inMonth: date.getMonth() === first.getMonth() };
  });
}

function initialDateFromSchedule(schedule?: InitialSchedule, booking?: BookingRecord): string {
  const value = firstValue(booking?.booking_date_from, schedule?.booking_date_from, schedule?.date_from, schedule?.from, schedule?.date);
  return toDateOnly(value) || todayDate();
}

function initialDateToSchedule(schedule?: InitialSchedule, booking?: BookingRecord): string {
  const value = firstValue(booking?.booking_date_to, schedule?.booking_date_to, schedule?.date_to, schedule?.to, schedule?.date);
  return toDateOnly(value) || initialDateFromSchedule(schedule, booking);
}

function blockLabel(block: ScheduleBlock): string {
  if (block === 'am') return 'AM';
  if (block === 'pm') return 'PM';
  return 'Whole Day';
}

function blockBaseHours(block: ScheduleBlock): number {
  if (block === 'whole_day') return 12;
  return 6;
}

function startTime(block: ScheduleBlock): string {
  if (block === 'pm') return '12:00';
  return '06:00';
}

function endTime(block: ScheduleBlock, additionalHours: number): string {
  const baseEnd = block === 'am' ? 12 : 18;
  const hour = Math.min(23, baseEnd + Math.max(0, Math.min(MAX_ADDITIONAL_HOURS, additionalHours)));
  return `${String(hour).padStart(2, '0')}:00`;
}

function totalHours(selections: ScheduleSelection[]): number {
  return selections.reduce((sum, row) => sum + blockBaseHours(row.block) + Number(row.additionalHours || 0), 0);
}

function selectedVenueByKey(key: ActiveVenueKey): ActiveVenue {
  return ACTIVE_VENUES.find((venue) => venue.key === key) ?? ACTIVE_VENUES[0];
}

function rateForBlock(venue: ActiveVenue, block: ScheduleBlock): number {
  return block === 'whole_day' ? venue.rates.wholeDay : venue.rates.halfDay;
}

function dateVenueBaseTotal(selection: ScheduleSelection, areaKeys: ActiveVenueKey[]): number {
  return areaKeys.reduce((sum, key) => {
    const venue = selectedVenueByKey(key);
    return sum + rateForBlock(venue, selection.block) + venue.rates.extraHour * Number(selection.additionalHours || 0);
  }, 0);
}

function baseTotal(selections: ScheduleSelection[], areaKeys: ActiveVenueKey[]): number {
  return selections.reduce((sum, selection) => sum + dateVenueBaseTotal(selection, areaKeys), 0);
}


function reviewLineItems(selections: ScheduleSelection[], areaKeys: ActiveVenueKey[]): ReviewLineItem[] {
  return selections.flatMap((selection) => {
    return areaKeys.flatMap((key) => {
      const venue = selectedVenueByKey(key);
      const baseAmount = rateForBlock(venue, selection.block);
      const items: ReviewLineItem[] = [
        {
          key: `${selection.date}-${key}-base`,
          date: selection.date,
          label: venue.shortLabel,
          detail: blockLabel(selection.block),
          quantity: 1,
          unitAmount: baseAmount,
          amount: baseAmount,
          type: 'venue',
        },
      ];

      const hours = Number(selection.additionalHours || 0);
      if (hours > 0) {
        items.push({
          key: `${selection.date}-${key}-additional`,
          date: selection.date,
          label: `${venue.shortLabel} additional hours`,
          detail: `${hours} hour(s) × ${money(venue.rates.extraHour)}`,
          quantity: hours,
          unitAmount: venue.rates.extraHour,
          amount: venue.rates.extraHour * hours,
          type: 'additional_hour',
        });
      }

      return items;
    });
  });
}

function finalDiscountLines(selections: ScheduleSelection[], areaKeys: ActiveVenueKey[], ingressPrep: boolean): DiscountLine[] {
  const lines: DiscountLine[] = [];

  if (selections.length > 1) {
    const basis = selections.slice(1).reduce((sum, selection) => sum + dateVenueBaseTotal(selection, areaKeys), 0);
    if (basis > 0) {
      lines.push({
        key: 'consecutive-day-5-percent',
        label: 'Consecutive-day discount',
        basis,
        rate: 0.05,
        amount: Math.round(basis * 0.05),
        note: 'Shown only in final computation. Subject to BCCC assessment before billing.',
      });
    }
  }

  if (ingressPrep && areaKeys.includes('MAIN_HALL') && selections.length > 0) {
    const first = selections[0];
    const last = selections[selections.length - 1];
    const basis = dateVenueBaseTotal(first, ['MAIN_HALL']) + (last.date !== first.date ? dateVenueBaseTotal(last, ['MAIN_HALL']) : 0);
    if (basis > 0) {
      lines.push({
        key: 'setup-rehearsal-30-percent',
        label: 'Setup / rehearsal / preparation discount',
        basis,
        rate: 0.3,
        amount: Math.round(basis * 0.3),
        note: 'Applied only to eligible Main Hall setup/rehearsal/preparation dates and subject to final BCCC approval.',
      });
    }
  }

  return lines;
}

function finalDiscountPreview(selections: ScheduleSelection[], areaKeys: ActiveVenueKey[], ingressPrep: boolean): number {
  return finalDiscountLines(selections, areaKeys, ingressPrep).reduce((sum, line) => sum + line.amount, 0);
}

function flattenServices(serviceTypes?: ServiceTypeOption[] | PaginatedLike<ServiceTypeOption>, services?: ServiceOption[] | PaginatedLike<ServiceOption>): ServiceOption[] {
  const direct = collection(services);
  const nested = collection(serviceTypes).flatMap((type) =>
    Array.isArray(type.services)
      ? type.services.map((service) => ({
          ...service,
          service_type_id: service.service_type_id ?? type.id,
          service_type_name: service.service_type_name ?? type.name,
        }))
      : [],
  );
  const seen = new Set<string>();
  return [...direct, ...nested].filter((service) => {
    const id = String(service.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function serviceSearchText(service: ServiceOption): string {
  return normalize([service.name, service.service_type_name, service.service_type?.name].filter(Boolean).join(' '));
}

function serviceForVenue(services: ServiceOption[], venue: ActiveVenue): ServiceOption | null {
  return services.find((service) => {
    const text = serviceSearchText(service);
    return venue.matchers.some((matcher) => text.includes(normalize(matcher)));
  }) ?? null;
}

function serviceIdsForAreas(services: ServiceOption[], areaKeys: ActiveVenueKey[]): string[] {
  return areaKeys
    .map((key) => serviceForVenue(services, selectedVenueByKey(key)))
    .filter((service): service is ServiceOption => Boolean(service))
    .map((service) => String(service.id));
}

function activeKeyFromString(value?: string | null): ActiveVenueKey | null {
  const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const aliases: Record<string, ActiveVenueKey> = {
    FULL_HALL: 'FULL_HALL',
    MAIN_HALL: 'MAIN_HALL',
    GROUND_HALL: 'MAIN_HALL',
    LED_WALL: 'LED_WALL',
    LED_VIDEO_WALL: 'LED_WALL',
    LOUNGE: 'LOUNGE',
    VIP_LOUNGE: 'LOUNGE',
    EXECUTIVE_LOUNGE: 'LOUNGE',
    BOARDROOM: 'BOARDROOM',
    BOARD_ROOM: 'BOARDROOM',
    EXECUTIVE_BOARDROOM: 'BOARDROOM',
  };
  return aliases[normalized] ?? null;
}

function packageFromBackend(option: VenuePackageOption): ActivePackage | null {
  const areaKeys = (option.area_keys ?? [])
    .map((key) => activeKeyFromString(key))
    .filter((key): key is ActiveVenueKey => Boolean(key));
  if (areaKeys.length === 0) return null;
  return {
    code: option.code,
    label: option.name ?? option.label ?? option.code,
    subtitle: option.subtitle ?? option.description ?? areaKeys.map((key) => selectedVenueByKey(key).shortLabel).join(' + '),
    areaKeys,
    image: option.image_path || selectedVenueByKey(areaKeys[0]).image,
    featured: Boolean(option.is_featured),
  };
}

function uniquePackages(packages: ActivePackage[]): ActivePackage[] {
  const seen = new Set<string>();
  return packages.filter((item) => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

function packagePriceLabel(pkg: ActivePackage): string {
  const whole = pkg.areaKeys.reduce((sum, key) => sum + selectedVenueByKey(key).rates.wholeDay, 0);
  const half = pkg.areaKeys.reduce((sum, key) => sum + selectedVenueByKey(key).rates.halfDay, 0);
  return `${money(whole)} whole day · ${money(half)} half day`;
}


function monthQueryValue(date: string): string {
  return String(date || todayDate()).slice(0, 7);
}

function availabilityAreaLabel(key: ActiveVenueKey): string {
  return selectedVenueByKey(key).shortLabel;
}

function availabilityBlockFallback(key: AvailabilityBlockKey): AvailabilityBlockState {
  if (key === 'PM') return { key, label: 'PM', from: '12:00', to: '18:00', available: null, reason: null };
  if (key === 'EVE') return { key, label: 'EVE', from: '18:00', to: '23:59', available: null, reason: null };
  return { key, label: 'AM', from: '06:00', to: '12:00', available: null, reason: null };
}

function emptyDayAvailability(date: string, status = 'unverified', note = 'Availability is being verified.'): DayAvailabilitySummary {
  return {
    date,
    status,
    title: status === 'loading' ? 'Checking availability' : 'Availability not verified',
    note,
    canProceed: null,
    am: availabilityBlockFallback('AM'),
    pm: availabilityBlockFallback('PM'),
    eve: availabilityBlockFallback('EVE'),
    sourceCount: 0,
  };
}

function normalizeAvailabilityBlocks(blocks: AvailabilityApiDay['blocks']): Record<AvailabilityBlockKey, AvailabilityBlockState> {
  const normalized: Record<AvailabilityBlockKey, AvailabilityBlockState> = {
    AM: availabilityBlockFallback('AM'),
    PM: availabilityBlockFallback('PM'),
    EVE: availabilityBlockFallback('EVE'),
  };

  if (!blocks) return normalized;

  const entries: Array<[string, AvailabilityApiBlock | boolean]> = Array.isArray(blocks)
    ? blocks.map((block, index) => [String(typeof block === 'object' && block ? block.key ?? index : index), block])
    : Object.entries(blocks);

  entries.forEach(([rawKey, rawBlock]) => {
    const key = String(typeof rawBlock === 'object' && rawBlock ? rawBlock.key ?? rawKey : rawKey).toUpperCase();
    if (key !== 'AM' && key !== 'PM' && key !== 'EVE') return;

    if (typeof rawBlock === 'boolean') {
      normalized[key] = {
        ...availabilityBlockFallback(key),
        available: rawBlock,
        reason: rawBlock ? null : 'Booked or blocked',
      };
      return;
    }

    const explicitAvailable = rawBlock.is_available ?? rawBlock.isAvailable ?? true;
    const blocked = Boolean(rawBlock.blocked);
    const booked = Boolean(rawBlock.booked);
    const available = Boolean(explicitAvailable) && !blocked && !booked;

    normalized[key] = {
      key,
      label: String(rawBlock.label ?? key),
      from: String(rawBlock.from ?? availabilityBlockFallback(key).from),
      to: String(rawBlock.to ?? availabilityBlockFallback(key).to),
      available,
      reason: rawBlock.reason ?? (available ? null : 'Booked or blocked'),
    };
  });

  return normalized;
}

function normalizeAvailabilityDay(day: AvailabilityApiDay): DayAvailabilitySummary | null {
  const date = toDateOnly(day.date);
  if (!date) return null;
  const blocks = normalizeAvailabilityBlocks(day.blocks ?? null);
  return {
    date,
    status: String(day.status ?? 'available'),
    title: String(day.title ?? 'Availability status'),
    note: String(day.note ?? day.description ?? ''),
    canProceed: day.can_proceed === null || day.can_proceed === undefined ? null : Boolean(day.can_proceed),
    am: blocks.AM,
    pm: blocks.PM,
    eve: blocks.EVE,
    sourceCount: 1,
  };
}

function mergeBlockAvailability(left: AvailabilityBlockState, right: AvailabilityBlockState): AvailabilityBlockState {
  const leftAvailable = left.available;
  const rightAvailable = right.available;
  const available = leftAvailable === null ? rightAvailable : rightAvailable === null ? leftAvailable : leftAvailable && rightAvailable;
  const reason = available === false ? [left.reason, right.reason].filter(Boolean).join(' / ') || 'One selected area is already occupied.' : null;

  return {
    ...left,
    available,
    reason,
  };
}

function mergeDayAvailability(left: DayAvailabilitySummary, right: DayAvailabilitySummary): DayAvailabilitySummary {
  const am = mergeBlockAvailability(left.am, right.am);
  const pm = mergeBlockAvailability(left.pm, right.pm);
  const eve = mergeBlockAvailability(left.eve, right.eve);
  const hasClosedBlock = [am, pm, eve].some((block) => block.available === false);
  const allClosed = [am, pm, eve].every((block) => block.available === false);

  return {
    date: left.date,
    status: allClosed ? 'private_booked' : hasClosedBlock ? 'limited' : left.status === 'unverified' ? right.status : left.status,
    title: allClosed ? 'Selected service scope is fully occupied' : hasClosedBlock ? 'Selected service scope has limited availability' : left.title || right.title,
    note: [left.note, right.note].filter(Boolean).slice(0, 2).join(' '),
    canProceed: left.canProceed === false || right.canProceed === false ? false : left.canProceed ?? right.canProceed,
    am,
    pm,
    eve,
    sourceCount: left.sourceCount + right.sourceCount,
  };
}

function buildCalendarMonthUrl(month: string, areaLabel?: string): string {
  const params = new URLSearchParams({ month });
  if (areaLabel) params.set('area', areaLabel);
  return `/public/calendar-month?${params.toString()}`;
}

function availabilityPillClasses(available: boolean | null, selected: boolean): string {
  if (available === null) return selected ? 'border-white/25 bg-white/10 text-white/80' : 'border-slate-200 bg-slate-100 text-slate-500';
  if (available) return selected ? 'border-emerald-200/50 bg-emerald-300/15 text-emerald-50' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return selected ? 'border-red-200/50 bg-red-300/15 text-red-50' : 'border-red-200 bg-red-50 text-red-700';
}

function availabilityPillText(available: boolean | null): string {
  if (available === null) return 'Check';
  return available ? 'Open' : 'Booked';
}

function coveredMonthFromDate(date: string): string {
  if (!date) return MONTHS[new Date().getMonth()];
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return MONTHS[new Date().getMonth()];
  return MONTHS[parsed.getMonth()];
}

function buildBookingDateFrom(selection: ScheduleSelection): string {
  return `${selection.date}T${startTime(selection.block)}`;
}

function buildBookingDateTo(selection: ScheduleSelection): string {
  return `${selection.date}T${endTime(selection.block, selection.additionalHours)}`;
}

function statusRole(role?: string | null): RoleThemeKey {
  return normalizeWorkspaceRole(role) as RoleThemeKey;
}

function pagePropsWithFallback<T extends Record<string, unknown>>(props: T, pageProps: Record<string, unknown>): T {
  return { ...pageProps, ...props } as T;
}

function formTitle(role: RoleThemeKey, editing: boolean): string {
  if (editing) return 'Update Reservation';
  if (role === 'user') return 'Reserve Your Event Space';
  return 'Create Booking';
}

function formDescription(role: RoleThemeKey): string {
  if (role === 'user') {
    return 'Select your schedule, choose active BCCC services, complete organizer details, and submit the request for review.';
  }
  return 'Encode an official BCCC reservation using the active charge catalog and guided schedule workflow.';
}

function hiddenDiscountNote(): string {
  return 'Discounts are intentionally hidden until final computation and remain subject to BCCC assessment.';
}

function buildInitialSelections(start: string, end: string): ScheduleSelection[] {
  return dateRange(start, end).map((date) => ({ date, block: 'whole_day', additionalHours: 0 }));
}

function buildMiceDraft(data: BookingFormData, selections: ScheduleSelection[], eventScope: EventScope): BookingPaymentMeta {
  if (eventScope === 'private') {
    return {
      event_scope: 'PRIVATE/PERSONAL EVENT',
      event_center_name: PUBLIC_EVENT_CENTER,
      covered_month: data.covered_month,
      date_event_started: selections[0]?.date ?? '',
      date_event_finished: selections[selections.length - 1]?.date ?? '',
      event_name: upper(data.type_of_event || ''),
      number_of_hours: String(totalHours(selections)),
      function_halls_count: '-',
      function_hall_capacity: '-',
      classification_of_event: '-',
      mice_type_of_event: '-',
      foreign_attendees: '-',
      domestic_attendees: '-',
      total_number_of_countries: '-',
      countries_breakdown_text: '-',
      has_exhibitions: '-',
      exhibitors_count: '-',
      visitors_count: '-',
      organization_name: upper(data.company_name || ''),
      organizer_address: upper(data.client_address || ''),
      organizer_contact_person: upper(data.client_name || ''),
      organizer_contact_number: data.client_contact_number,
      comments_feedback: data.comments_feedback.trim() || 'N/A',
    };
  }

  const hasExhibitions = data.has_exhibitions === 'Yes';
  return {
    event_scope: 'PUBLIC EVENT',
    event_center_name: PUBLIC_EVENT_CENTER,
    covered_month: data.covered_month,
    date_event_started: selections[0]?.date ?? '',
    date_event_finished: selections[selections.length - 1]?.date ?? '',
    event_name: upper(data.type_of_event || ''),
    number_of_hours: String(totalHours(selections)),
    function_halls_count: '1',
    function_hall_capacity: '4000',
    classification_of_event: data.classification_of_event,
    mice_type_of_event: data.mice_type_of_event,
    foreign_attendees: data.foreign_attendees || '0',
    domestic_attendees: data.domestic_attendees || '0',
    total_number_of_countries: data.total_number_of_countries || '1',
    countries_breakdown_text: upper(data.countries_breakdown_text || 'PHILIPPINES'),
    has_exhibitions: data.has_exhibitions,
    exhibitors_count: hasExhibitions ? data.exhibitors_count : '0',
    visitors_count: hasExhibitions ? data.visitors_count : '0',
    organization_name: upper(data.company_name || ''),
    organizer_address: upper(data.client_address || ''),
    organizer_contact_person: upper(data.client_name || ''),
    organizer_contact_number: data.client_contact_number,
    comments_feedback: data.comments_feedback.trim() || 'N/A',
  };
}

function Field({ label, required, error, children, help }: { label: string; required?: boolean; error?: string; children: ReactNode; help?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span className="flex items-center gap-1">
        {label}
        {required ? <strong className="text-red-600">*</strong> : null}
      </span>
      {children}
      {help ? <small className="text-xs font-normal leading-5 text-slate-500">{help}</small> : null}
      {error ? <small className="text-xs font-semibold text-red-600">{error}</small> : null}
    </label>
  );
}

function inputClass(hasError?: boolean): string {
  return cx(
    'min-h-11 w-full border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#164734] focus:ring-2 focus:ring-[#164734]/10',
    hasError ? 'border-red-400 bg-red-50/60' : 'border-slate-200',
  );
}

function StepProgress({ activeStep, submitted, onStepClick }: { activeStep: number; submitted: boolean; onStepClick: (index: number) => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const done = submitted || index < activeStep;
          const active = index === activeStep && !submitted;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => !submitted && index < 4 && onStepClick(index)}
              className={cx(
                'group flex min-w-[170px] flex-1 items-center gap-3 border px-3 py-2 text-left transition duration-300',
                active ? 'border-[#164734] bg-[#164734] text-white shadow-md' : done ? 'border-[#d6b56d]/50 bg-[#fff8e6] text-[#164734]' : 'border-slate-200 bg-white text-slate-500',
              )}
            >
              <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full border transition', active ? 'border-white/40 bg-white/15' : done ? 'border-[#d6b56d] bg-white' : 'border-slate-200 bg-slate-50')}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-[11px] uppercase tracking-[0.24em]">{step.label}</strong>
                <small className={cx('block truncate text-xs', active ? 'text-white/75' : 'text-current/65')}>{step.helper}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionShell({ kicker, title, description, icon, children }: { kicker: string; title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a88633]">{icon}{kicker}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function BookingFormPage(rawProps: BookingFormPageProps = {}) {
  const page = usePage();
  const props = pagePropsWithFallback(rawProps, page.props as Record<string, unknown>);
  const role = statusRole(props.workspaceRole ?? ((page.props.auth as { user?: { role?: string } } | undefined)?.user?.role ?? 'user'));
  const booking = props.booking;
  const editing = Boolean(booking?.id);
  const services = useMemo(() => flattenServices(props.serviceTypes, props.services), [props.serviceTypes, props.services]);
  const backendPackages = useMemo(() => (props.venuePackages ?? props.bookingFormOptions?.venuePackages ?? []).map(packageFromBackend).filter((item): item is ActivePackage => Boolean(item)), [props.venuePackages, props.bookingFormOptions?.venuePackages]);
  const packages = useMemo(() => uniquePackages([...backendPackages, ...FALLBACK_PACKAGES]), [backendPackages]);
  const classificationOptions = props.bookingFormOptions?.mice?.classificationOptions?.length ? props.bookingFormOptions.mice.classificationOptions : CLASSIFICATION_OPTIONS;
  const miceTypeOptions = props.bookingFormOptions?.mice?.typeOptions?.length ? props.bookingFormOptions.mice.typeOptions : MICE_TYPE_OPTIONS;
  const privateTypeOptions = props.bookingFormOptions?.mice?.privateEventOptions?.length ? props.bookingFormOptions.mice.privateEventOptions : PRIVATE_EVENT_OPTIONS;

  const initialFrom = initialDateFromSchedule(props.initialSchedule, booking);
  const initialTo = initialDateToSchedule(props.initialSchedule, booking);
  const initialSelections = buildInitialSelections(initialFrom, initialTo);
  const initialMeta = (booking?.payment_meta && typeof booking.payment_meta === 'object' ? booking.payment_meta : {}) as BookingPaymentMeta;
  const initialAreaKeys = Array.isArray(booking?.selected_area_keys)
    ? booking.selected_area_keys.map((key) => activeKeyFromString(key)).filter((key): key is ActiveVenueKey => Boolean(key))
    : [];
  const initialPackageCode = firstValue(booking?.selected_package_code, props.initialPackageCode);
  const packageInitial = packages.find((item) => item.code === initialPackageCode) ?? null;
  const defaultAreaKeys: ActiveVenueKey[] = packageInitial?.areaKeys ?? (initialAreaKeys.length ? initialAreaKeys : ['FULL_HALL']);

  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const stepRootRef = useRef<HTMLDivElement | null>(null);
  const [floatingNotice, setFloatingNotice] = useState<{ title: string; message: string; tone: 'error' | 'info' } | null>(null);
  const [calendarCursor, setCalendarCursor] = useState(monthStart(initialFrom));
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [scheduleSelections, setScheduleSelections] = useState<ScheduleSelection[]>(initialSelections);
  const [packageMode, setPackageMode] = useState<PackageMode>(() => (packageInitial ? 'packages' : 'manual'));
  const [selectedPackageCode, setSelectedPackageCode] = useState(packageInitial?.code ?? 'FULL_HALL_ONLY');
  const [selectedAreaKeys, setSelectedAreaKeys] = useState<ActiveVenueKey[]>(defaultAreaKeys);
  const [ingressPrep, setIngressPrep] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyModalChecked, setPolicyModalChecked] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [calendarAvailability, setCalendarAvailability] = useState<CalendarAvailabilityMap>({});
  const [calendarAvailabilityLoading, setCalendarAvailabilityLoading] = useState(false);
  const [calendarAvailabilityError, setCalendarAvailabilityError] = useState<string | null>(null);

  const initialServiceIds = serviceIdsForAreas(services, defaultAreaKeys);
  const firstSelection = scheduleSelections[0] ?? { date: todayDate(), block: 'whole_day', additionalHours: 0 };
  const lastSelection = scheduleSelections[scheduleSelections.length - 1] ?? firstSelection;

  const { data, setData: rawSetData, post, put, processing, errors, transform } = useForm<BookingFormData>({
    service_id: firstValue(booking?.service_id, booking?.service?.id, initialServiceIds[0]),
    items: initialServiceIds.map((service_id) => ({ service_id, quantity: 1 })),
    payment_meta: initialMeta,
    selected_package_code: packageInitial?.code ?? 'FULL_HALL_ONLY',
    selected_area_keys: defaultAreaKeys,
    schedule_version: 'segments_v1',
    schedule_meta: {},
    schedule_segments: [],
    mice_required: booking?.mice_required === undefined || booking?.mice_required === null ? true : Boolean(booking.mice_required),
    mice_exemption_reason: firstValue(booking?.mice_exemption_reason, 'PRIVATE/PERSONAL EVENT'),
    private_event_type: firstValue(booking?.private_event_type, 'PRIVATE/PERSONAL EVENT'),
    organization_type: firstValue(booking?.organization_type, 'Private'),
    company_name: upper(firstValue(booking?.company_name)),
    client_name: upper(firstValue(booking?.client_name)),
    client_contact_number: firstValue(booking?.client_contact_number),
    client_email: firstValue(booking?.client_email),
    client_address: upper(firstValue(booking?.client_address, booking?.client_street_address)),
    client_region: firstValue(booking?.client_region, 'CAR'),
    client_province: firstValue(booking?.client_province, 'Benguet'),
    client_city_municipality: firstValue(booking?.client_city_municipality, 'Baguio City'),
    client_barangay: firstValue(booking?.client_barangay),
    client_zip_code: firstValue(booking?.client_zip_code, '2600'),
    client_street_address: upper(firstValue(booking?.client_street_address, booking?.client_address)),
    head_of_organization: upper(firstValue(booking?.head_of_organization)),
    type_of_event: upper(firstValue(booking?.type_of_event, props.initialEventType)),
    booking_date_from: buildBookingDateFrom(firstSelection),
    booking_date_to: buildBookingDateTo(lastSelection),
    number_of_guests: firstValue(booking?.number_of_guests, props.initialGuests),
    booking_status: firstValue(booking?.booking_status, 'pending'),
    payment_status: firstValue(booking?.payment_status, 'unpaid'),
    is_public_calendar_visible: Boolean(booking?.is_public_calendar_visible ?? false),
    public_calendar_title: firstValue(booking?.public_calendar_title),
    policy_acknowledged: Boolean(editing),
    accuracy_acknowledged: Boolean(editing),
    estimated_usage: 'whole_day',
    estimated_duration_hours: '0',
    estimated_other_rentals: '',
    estimated_additional_charges: '0',
    reservation_notes: '',
    event_nature: booking?.mice_required === false || booking?.mice_required === 0 ? 'private' : 'public',
    event_center_name: PUBLIC_EVENT_CENTER,
    covered_month: firstValue(initialMeta.covered_month, coveredMonthFromDate(initialFrom)),
    classification_of_event: firstValue(initialMeta.classification_of_event, 'REGIONAL PHILIPPINES'),
    classification_other: firstValue(initialMeta.classification_other),
    mice_type_of_event: firstValue(initialMeta.mice_type_of_event, 'MEETINGS'),
    mice_type_other: firstValue(initialMeta.mice_type_other),
    function_halls_count: '1',
    function_hall_capacity: '4000',
    number_of_hours: String(totalHours(initialSelections)),
    foreign_attendees: firstValue(initialMeta.foreign_attendees, '0'),
    domestic_attendees: firstValue(initialMeta.domestic_attendees, props.initialGuests, '0'),
    total_number_of_countries: firstValue(initialMeta.total_number_of_countries, '1'),
    countries_breakdown_text: upper(firstValue(initialMeta.countries_breakdown_text, 'PHILIPPINES')),
    has_exhibitions: firstValue(initialMeta.has_exhibitions, 'No'),
    exhibitors_count: firstValue(initialMeta.exhibitors_count, '0'),
    visitors_count: firstValue(initialMeta.visitors_count, '0'),
    comments_feedback: firstValue(initialMeta.comments_feedback),
  });

  const setData = rawSetData as unknown as <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => void;
  const mergedErrors = { ...(errors as Record<string, string>), ...stepErrors };
  const selectedPackage = packages.find((item) => item.code === selectedPackageCode) ?? packages[0];
  const selectedCombinationError = fullMainCombinationError(selectedAreaKeys);

  function scrollToCurrentStep() {
    requestAnimationFrame(() => {
      stepRootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function showFloatingNotice(title: string, message: string, tone: 'error' | 'info' = 'error') {
    setFloatingNotice({ title, message, tone });
    scrollToCurrentStep();
  }

  function patchAddress(patch: Partial<Pick<BookingFormData, 'client_region' | 'client_province' | 'client_city_municipality' | 'client_barangay' | 'client_zip_code' | 'client_street_address'>>) {
    const next = {
      client_region: data.client_region,
      client_province: data.client_province,
      client_city_municipality: data.client_city_municipality,
      client_barangay: data.client_barangay,
      client_zip_code: data.client_zip_code,
      client_street_address: data.client_street_address,
      ...patch,
    };

    setData({
      ...data,
      ...next,
      client_address: composePhilippinesAddress(next),
    });
  }

  const selectedVenues = selectedAreaKeys.map(selectedVenueByKey);
  const selectedAreaSignature = selectedAreaKeys.join('|');
  const availabilityScopeLabel = selectedAreaKeys.length === 1
    ? availabilityAreaLabel(selectedAreaKeys[0])
    : selectedAreaKeys.map(availabilityAreaLabel).join(' + ');
  const scheduleTotalHours = totalHours(scheduleSelections);
  const scheduleTotalDays = scheduleSelections.length;
  const estimatedBaseTotal = baseTotal(scheduleSelections, selectedAreaKeys);
  const hiddenDiscount = finalDiscountPreview(scheduleSelections, selectedAreaKeys, ingressPrep);
  const finalEstimatedTotal = Math.max(0, estimatedBaseTotal - hiddenDiscount);
  const requiredDownPayment = Math.round(finalEstimatedTotal * 0.5);
  const finalBalance = Math.max(0, finalEstimatedTotal - requiredDownPayment);
  const backHref = editing && booking?.id ? bookingShowPath(role, booking.id) : bookingBasePath(role);

  useEffect(() => {
    const first = scheduleSelections[0] ?? firstSelection;
    const last = scheduleSelections[scheduleSelections.length - 1] ?? first;
    const month = coveredMonthFromDate(first.date);
    setData('booking_date_from', buildBookingDateFrom(first));
    setData('booking_date_to', buildBookingDateTo(last));
    setData('covered_month', month);
    setData('number_of_hours', String(scheduleTotalHours));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleSelections, scheduleTotalHours]);

  useEffect(() => {
    const ids = serviceIdsForAreas(services, selectedAreaKeys);
    setData('service_id', ids[0] ?? '');
    setData('items', ids.map((service_id) => ({ service_id, quantity: 1 })));
    setData('selected_area_keys', selectedAreaKeys);
    setData('selected_package_code', packageMode === 'packages' ? selectedPackageCode : '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaKeys, selectedPackageCode, packageMode, services]);

  useEffect(() => {
    scrollToCurrentStep();
  }, [activeStep]);

  useEffect(() => {
    const serverErrors = Object.values(errors as Record<string, string>).filter(Boolean);

    if (serverErrors.length > 0) {
      showFloatingNotice('Please check the form', String(serverErrors[0]), 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  useEffect(() => {
    const month = monthQueryValue(calendarCursor);
    const areaLabels = selectedAreaKeys.length > 0 ? selectedAreaKeys.map(availabilityAreaLabel) : [''];
    const controller = new AbortController();
    let cancelled = false;

    setCalendarAvailabilityLoading(true);
    setCalendarAvailabilityError(null);

    Promise.all(
      areaLabels.map(async (areaLabel) => {
        const response = await fetch(buildCalendarMonthUrl(month, areaLabel), {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to check ${areaLabel || 'calendar'} availability.`);
        }

        return response.json() as Promise<{ days?: AvailabilityApiDay[] }>;
      }),
    )
      .then((payloads) => {
        if (cancelled) return;

        const next: CalendarAvailabilityMap = {};
        payloads.forEach((payload) => {
          (payload.days ?? []).forEach((rawDay) => {
            const normalizedDay = normalizeAvailabilityDay(rawDay);
            if (!normalizedDay) return;
            next[normalizedDay.date] = next[normalizedDay.date]
              ? mergeDayAvailability(next[normalizedDay.date], normalizedDay)
              : normalizedDay;
          });
        });

        setCalendarAvailability(next);
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        setCalendarAvailability({});
        setCalendarAvailabilityError(error instanceof Error ? error.message : 'Unable to verify calendar availability.');
      })
      .finally(() => {
        if (!cancelled) setCalendarAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [calendarCursor, selectedAreaSignature]);

  function patchSelection(date: string, patch: Partial<ScheduleSelection>) {
    setScheduleSelections((current) => current.map((row) => (row.date === date ? { ...row, ...patch } : row)));
  }

  function selectCalendarDate(date: string) {
    setRangeAnchor((anchor) => {
      if (!anchor) {
        setScheduleSelections([{ date, block: 'whole_day', additionalHours: 0 }]);
        return date;
      }
      const range = dateRange(anchor, date).map((rowDate) => {
        const existing = scheduleSelections.find((item) => item.date === rowDate);
        return existing ?? { date: rowDate, block: 'whole_day' as ScheduleBlock, additionalHours: 0 };
      });
      setScheduleSelections(range);
      return null;
    });
  }

  function choosePackage(pkg: ActivePackage) {
    const error = fullMainCombinationError(pkg.areaKeys);

    if (error) {
      showFloatingNotice('Package cannot be selected', error, 'error');
      return;
    }

    setFloatingNotice(null);
    setPackageMode('packages');
    setSelectedPackageCode(pkg.code);
    setSelectedAreaKeys(pkg.areaKeys);
  }

  function toggleArea(key: ActiveVenueKey) {
    setPackageMode('manual');
    setSelectedPackageCode('');
    setSelectedAreaKeys((current) => {
      if (current.includes(key)) {
        const next = current.filter((item) => item !== key);
        setFloatingNotice(null);
        return next.length ? next : [key];
      }

      const next = [...current, key];
      const error = fullMainCombinationError(next);

      if (error) {
        showFloatingNotice('This combination is not allowed', error, 'error');
        return current;
      }

      setFloatingNotice(null);
      return next;
    });
  }

  function validateStep(step = activeStep): boolean {
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (scheduleSelections.length < 1) nextErrors.schedule = 'Select at least one reservation date.';
      scheduleSelections.forEach((row) => {
        if (row.additionalHours > MAX_ADDITIONAL_HOURS) nextErrors.schedule = 'Additional hours must not exceed 6 hours.';
        const availabilityProblem = selectionAvailabilityProblem(row, calendarAvailability[row.date]);
        if (availabilityProblem) nextErrors.schedule = availabilityProblem;
      });
    }
    if (step === 1) {
      if (selectedAreaKeys.length < 1) nextErrors.selected_area_keys = 'Choose at least one active BCCC service.';
      const combinationError = fullMainCombinationError(selectedAreaKeys);
      if (combinationError) nextErrors.selected_area_keys = combinationError;
    }
    if (step === 2) {
      if (!data.type_of_event.trim()) nextErrors.type_of_event = 'Event name is required.';
      if (!data.company_name.trim()) nextErrors.company_name = 'Organization name is required.';
      if (!data.client_name.trim()) nextErrors.client_name = 'Contact person is required.';
      if (!data.client_contact_number.trim()) nextErrors.client_contact_number = 'Contact number is required.';
      if (!/^\d{7,15}$/.test(data.client_contact_number.replace(/\D/g, ''))) nextErrors.client_contact_number = 'Use numbers only, 7 to 15 digits.';
      if (!data.client_email.trim()) nextErrors.client_email = 'Email address is required.';
      if (!data.client_region.trim()) nextErrors.client_address = 'Select the organizer region.';
      if (!data.client_province.trim()) nextErrors.client_address = 'Select the organizer province/district.';
      if (!data.client_city_municipality.trim()) nextErrors.client_address = 'Enter the city or municipality.';
      if (!data.client_barangay.trim()) nextErrors.client_address = 'Enter the barangay.';
      if (!data.client_street_address.trim()) nextErrors.client_address = 'Enter the street/building address.';
      if (!data.number_of_guests.trim()) nextErrors.number_of_guests = 'Expected attendance is required.';
      if (data.event_nature === 'public') {
        if (!data.classification_of_event) nextErrors.classification_of_event = 'Classification is required for public events.';
        if (!data.mice_type_of_event) nextErrors.mice_type_of_event = 'MICE event type is required for public events.';
        if (!data.domestic_attendees.trim()) nextErrors.domestic_attendees = 'Domestic attendee count is required.';
        if (!data.total_number_of_countries.trim()) nextErrors.total_number_of_countries = 'Total number of countries is required.';
        if (!data.countries_breakdown_text.trim()) nextErrors.countries_breakdown_text = 'Country breakdown is required.';
        if (data.has_exhibitions === 'Yes' && (!data.exhibitors_count.trim() || !data.visitors_count.trim())) {
          nextErrors.exhibitors_count = 'Exhibitor and visitor counts are required when exhibitions is Yes.';
        }
      }
    }
    if (step === 3) {
      if (!data.policy_acknowledged) nextErrors.policy_acknowledged = 'Please confirm the booking policy and house rules.';
      if (!data.accuracy_acknowledged) nextErrors.accuracy_acknowledged = 'Please confirm the accuracy of the reservation details.';
    }
    setStepErrors(nextErrors);

    const firstError = Object.values(nextErrors)[0];

    if (firstError) {
      showFloatingNotice('Please check this step before continuing', firstError, 'error');
      return false;
    }

    setFloatingNotice(null);
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setActiveStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStepErrors({});
    setActiveStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submitReservation() {
    if (!validateStep(3)) return;

    const combinationError = fullMainCombinationError(selectedAreaKeys);

    if (combinationError) {
      setStepErrors({ selected_area_keys: combinationError });
      setActiveStep(1);
      showFloatingNotice('This combination is not allowed', combinationError, 'error');
      return;
    }

    const first = scheduleSelections[0];
    const last = scheduleSelections[scheduleSelections.length - 1];
    const serviceIds = serviceIdsForAreas(services, selectedAreaKeys);
    const scheduleSegments = scheduleSelections.map((row, index) => ({
      date: row.date,
      segment_role: ingressPrep && index === 0 ? 'ingress' as const : ingressPrep && index === scheduleSelections.length - 1 ? 'egress' as const : 'event' as const,
      base_block: row.block,
      additional_hours: row.additionalHours,
      area_keys: selectedAreaKeys,
    }));
    const scheduleMeta = {
      selected_dates: scheduleSelections,
      selected_date_count: scheduleTotalDays,
      total_hours: scheduleTotalHours,
      ingress_setup_preparation: ingressPrep,
      discount_visibility: 'review_and_admin_only',
    };
    const miceDraft = buildMiceDraft(data, scheduleSelections, data.event_nature);
    const chosenPackageName = packageMode === 'packages' ? selectedPackage?.label : 'Manual active service selection';

    transform((current) => ({
      ...current,
      service_id: serviceIds[0] ?? current.service_id,
      items: serviceIds.map((service_id) => ({ service_id, quantity: 1 })),
      selected_area_keys: selectedAreaKeys,
      selected_package_code: packageMode === 'packages' ? selectedPackageCode : '',
      booking_date_from: buildBookingDateFrom(first),
      booking_date_to: buildBookingDateTo(last),
      schedule_version: 'segments_v1',
      schedule_meta: scheduleMeta,
      schedule_segments: scheduleSegments,
      event_nature: current.event_nature,
      mice_required: current.event_nature === 'public',
      private_event_type: current.event_nature === 'private' ? current.private_event_type || 'PRIVATE/PERSONAL EVENT' : '',
      mice_exemption_reason: current.event_nature === 'private' ? 'PRIVATE/PERSONAL EVENT' : '',
      function_halls_count: current.event_nature === 'private' ? '-' : '1',
      function_hall_capacity: current.event_nature === 'private' ? '-' : '4000',
      number_of_hours: String(scheduleTotalHours),
      company_name: upper(current.company_name),
      client_name: upper(current.client_name),
      client_address: composePhilippinesAddress(current),
      client_street_address: upper(current.client_street_address),
      head_of_organization: upper(current.head_of_organization),
      type_of_event: upper(current.type_of_event),
      client_contact_number: current.client_contact_number.replace(/\D/g, ''),
      comments_feedback: current.comments_feedback.trim() || 'N/A',
      has_exhibitions: current.event_nature === 'private' ? '-' : current.has_exhibitions,
      exhibitors_count: current.event_nature === 'private' ? '-' : current.has_exhibitions === 'Yes' ? current.exhibitors_count : '0',
      visitors_count: current.event_nature === 'private' ? '-' : current.has_exhibitions === 'Yes' ? current.visitors_count : '0',
      foreign_attendees: current.event_nature === 'private' ? '-' : current.foreign_attendees || '0',
      domestic_attendees: current.event_nature === 'private' ? '-' : current.domestic_attendees || '0',
      total_number_of_countries: current.event_nature === 'private' ? '-' : current.total_number_of_countries || '1',
      countries_breakdown_text: current.event_nature === 'private' ? '-' : upper(current.countries_breakdown_text || 'PHILIPPINES'),
      payment_meta: {
        ...(typeof current.payment_meta === 'object' && current.payment_meta !== null ? current.payment_meta : {}),
        active_charge_scope: 'FULL_HALL_MAIN_HALL_LED_WALL_LOUNGE_BOARDROOM_ONLY',
        excluded_charge_items: ['LOBBY_STANDALONE', 'BASEMENT', 'SHOP_RENTALS', 'CATERING_MAINTENANCE', 'AIRCONDITIONING', 'STATIONERY_KIT', 'ORDINANCE_SPECIAL_PACKAGES'],
        selected_package_code: packageMode === 'packages' ? selectedPackageCode : null,
        selected_package_name: chosenPackageName,
        selected_area_keys: selectedAreaKeys,
        selected_area_labels: selectedVenues.map((venue) => venue.shortLabel),
        schedule: scheduleMeta,
        schedule_segments: scheduleSegments,
        event_scope: current.event_nature === 'public' ? 'PUBLIC EVENT' : 'PRIVATE/PERSONAL EVENT',
        mice_draft: miceDraft,
        estimated_base_total: estimatedBaseTotal,
        hidden_discount_preview: hiddenDiscount,
        final_estimated_total: finalEstimatedTotal,
        required_down_payment: requiredDownPayment,
        required_bond: REQUIRED_BOND,
        balance_after_down_payment: finalBalance,
        discount_note: hiddenDiscountNote(),
        reservation_notes: current.reservation_notes,
      },
      estimated_usage: scheduleSelections.some((row) => row.block === 'whole_day') ? 'whole_day' : 'half_day',
      estimated_duration_hours: String(scheduleTotalHours),
      estimated_other_rentals: '',
      estimated_additional_charges: '0',
    }));

    const options = {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setSubmitted(true);
        setActiveStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    };

    if (editing && booking?.id) {
      put(`${bookingBasePath(role)}/${booking.id}`, options);
      return;
    }

    const createPath = role === 'admin' ? '/admin/bookings' : role === 'staff' ? '/staff/bookings' : '/book';
    post(createPath, options);
  }

  function openFinalPolicyModal() {
    if (!validateStep(3)) return;
    setPolicyModalChecked(false);
    setShowPolicyModal(true);
  }

  function confirmFinalPolicyAndSubmit() {
    if (!policyModalChecked) return;
    setShowPolicyModal(false);
    submitReservation();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (activeStep < 3) {
      goNext();
      return;
    }
    openFinalPolicyModal();
  }

  function renderScheduleStep() {
    const monthDays = daysForMonth(calendarCursor);
    const selectedDates = new Set(scheduleSelections.map((row) => row.date));
    const today = todayDate();
    const monthAvailabilityNote = calendarAvailabilityLoading
      ? `Checking AM / PM availability for ${availabilityScopeLabel || 'selected service scope'}...`
      : calendarAvailabilityError
        ? calendarAvailabilityError
        : `AM / PM availability is shown per day for ${availabilityScopeLabel || 'selected service scope'}.`;

    return (
      <SectionShell kicker="Step 01 · Schedule" title="Choose the reservation dates first" description="The calendar owns the full left side. Every date box now shows AM and PM availability, while selected dates are summarized on the right with block and additional-hour controls." icon={<CalendarDays className="h-4 w-4" />}>
        <div className="grid min-h-[680px] gap-4 p-4 xl:grid-cols-[minmax(0,4fr)_minmax(300px,1fr)]">
          <div className="border border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-3 flex items-center justify-between border border-slate-200 bg-white px-3 py-2">
              <button type="button" onClick={() => setCalendarCursor((current) => shiftMonth(current, -1))} className="grid h-10 w-10 place-items-center border border-slate-200 bg-white transition hover:border-[#164734] hover:text-[#164734]"><ChevronLeft className="h-4 w-4" /></button>
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a88633]">BCCC Calendar</p>
                <h3 className="text-xl font-semibold text-slate-950">{monthLabel(calendarCursor)}</h3>
              </div>
              <button type="button" onClick={() => setCalendarCursor((current) => shiftMonth(current, 1))} className="grid h-10 w-10 place-items-center border border-slate-200 bg-white transition hover:border-[#164734] hover:text-[#164734]"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className={cx('mb-3 border px-3 py-2 text-xs font-medium', calendarAvailabilityError ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#d6b56d]/50 bg-[#fff8e6] text-[#164734]')}>{monthAvailabilityNote}</div>
            <div className="grid grid-cols-7 border-l border-t border-slate-200 bg-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="border-b border-r border-slate-200 bg-[#164734] px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white">{day}</div>)}
              {monthDays.map((day) => {
                const isSelected = selectedDates.has(day.date);
                const isToday = day.date === today;
                const isAnchor = rangeAnchor === day.date;
                const dayAvailability = calendarAvailabilityLoading
                  ? emptyDayAvailability(day.date, 'loading', 'Checking AM / PM availability...')
                  : calendarAvailability[day.date] ?? emptyDayAvailability(day.date);
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => selectCalendarDate(day.date)}
                    className={cx(
                      'group relative min-h-[122px] border-b border-r border-slate-200 p-2 text-left transition duration-300 hover:bg-[#fff7df]',
                      !day.inMonth && 'bg-slate-50 text-slate-300',
                      isSelected && 'bg-[#164734] text-white hover:bg-[#164734]',
                      isAnchor && 'ring-2 ring-inset ring-[#d6b56d]',
                    )}
                  >
                    <span className={cx('grid h-8 w-8 place-items-center rounded-full text-sm font-semibold', isToday && !isSelected ? 'bg-[#d6b56d] text-[#164734]' : '')}>{Number(day.date.slice(-2))}</span>
                    <div className="mt-3 grid gap-1.5">
                      {[
                        ['AM', dayAvailability.am] as const,
                        ['PM', dayAvailability.pm] as const,
                      ].map(([label, block]) => (
                        <span
                          key={label}
                          title={block.reason || `${label} ${availabilityPillText(block.available)}`}
                          className={cx(
                            'flex items-center justify-between border px-1.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] transition',
                            availabilityPillClasses(block.available, isSelected),
                          )}
                        >
                          <span>{label}</span>
                          <span>{availabilityPillText(block.available)}</span>
                        </span>
                      ))}
                    </div>
                    {isSelected ? <span className="absolute bottom-2 left-2 right-2 truncate border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">Selected</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="sticky top-24 h-fit border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-[#f8f3e6] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">Selected Dates</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">{scheduleTotalDays} day(s) · {scheduleTotalHours} hour(s)</h3>
            </div>
            <div className="max-h-[470px] overflow-y-auto p-3">
              {scheduleSelections.map((selection) => (
                <div key={selection.date} className="mb-3 border border-slate-200 bg-white p-3 last:mb-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <strong className="text-sm text-slate-950">{displayDate(selection.date)}</strong>
                    <button type="button" onClick={() => setScheduleSelections((current) => current.filter((row) => row.date !== selection.date))} className="grid h-7 w-7 place-items-center border border-slate-200 text-slate-500 transition hover:border-red-300 hover:text-red-600" disabled={scheduleSelections.length === 1}><Minus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mb-2 grid grid-cols-2 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                    {(() => {
                      const dayAvailability = calendarAvailability[selection.date] ?? emptyDayAvailability(selection.date);
                      return [
                        ['AM', dayAvailability.am] as const,
                        ['PM', dayAvailability.pm] as const,
                      ].map(([label, block]) => (
                        <span key={label} className={cx('flex items-center justify-between border px-2 py-1', availabilityPillClasses(block.available, false))} title={block.reason || undefined}>
                          <span>{label}</span>
                          <span>{availabilityPillText(block.available)}</span>
                        </span>
                      ));
                    })()}
                  </div>
                  <div className="grid grid-cols-[minmax(0,4fr)_minmax(72px,1fr)] gap-2">
                    <select value={selection.block} onChange={(event) => patchSelection(selection.date, { block: event.target.value as ScheduleBlock })} className={inputClass()}>
                      <option value="am">AM</option>
                      <option value="pm">PM</option>
                      <option value="whole_day">WHOLE DAY</option>
                    </select>
                    <select value={selection.additionalHours} onChange={(event) => patchSelection(selection.date, { additionalHours: Number(event.target.value) })} className={inputClass()} aria-label="Additional hours">
                      {Array.from({ length: MAX_ADDITIONAL_HOURS + 1 }, (_, hour) => <option key={hour} value={hour}>{hour}h</option>)}
                    </select>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{blockLabel(selection.block)} · {blockBaseHours(selection.block)} base hour(s) + {selection.additionalHours} additional hour(s)</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-4">
              <label className="flex items-start gap-3 border border-dashed border-[#d6b56d] bg-[#fff8e6] p-3 text-sm text-slate-700">
                <input type="checkbox" checked={ingressPrep} onChange={(event) => setIngressPrep(event.target.checked)} className="mt-1" />
                <span><strong className="block text-slate-950">Ingress / setup / preparation</strong><small className="mt-1 block leading-5 text-slate-600">Discount details stay hidden until final computation and BCCC assessment.</small></span>
              </label>
              {mergedErrors.schedule ? <p className="mt-3 text-sm font-semibold text-red-600">{mergedErrors.schedule}</p> : null}
            </div>
          </aside>
        </div>
      </SectionShell>
    );
  }

  function renderServicesStep() {
    return (
      <SectionShell kicker="Step 02 · Package / Services" title="Choose only the active BCCC charge items" description="Lobby is included with Full Hall. Basement, shop rentals, catering maintenance, air-conditioning, stationery kit, and ordinance special packages are not shown as booking charges." icon={<PackageCheck className="h-4 w-4" />}>
        <div className="grid min-h-[680px] gap-4 p-4 xl:grid-cols-[minmax(0,4fr)_minmax(300px,1fr)]">
          <div>
            <div className="mb-4 flex justify-center">
              <div className="inline-flex border border-slate-200 bg-white p-1 shadow-sm">
                <button type="button" onClick={() => { setPackageMode('packages'); choosePackage(selectedPackage); }} className={cx('px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition', packageMode === 'packages' ? 'bg-[#164734] text-white' : 'text-slate-600 hover:bg-slate-50')}>Packages</button>
                <button type="button" onClick={() => setPackageMode('manual')} className={cx('px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition', packageMode === 'manual' ? 'bg-[#164734] text-white' : 'text-slate-600 hover:bg-slate-50')}>Manual Selection</button>
              </div>
            </div>

            {packageMode === 'packages' ? (
              <div className="grid gap-2">
                {packages.map((pkg, index) => {
                  const active = selectedPackageCode === pkg.code;
                  return (
                    <button key={pkg.code} type="button" onClick={() => choosePackage(pkg)} className={cx('group relative min-h-[112px] overflow-hidden border text-left transition duration-300', active ? 'border-[#d6b56d] shadow-lg ring-2 ring-[#d6b56d]/40' : 'border-slate-200 hover:border-[#d6b56d]')}>
                      <img src={pkg.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/38 to-black/70" />
                      <span className="relative flex min-h-[112px] items-center justify-between gap-4 p-4 text-white">
                        <span className="flex items-center gap-4">
                          <span className="grid h-12 w-12 place-items-center border border-white/35 bg-white/10 text-sm font-semibold">{String(index + 1).padStart(2, '0')}</span>
                          <span>
                            <strong className="block text-2xl font-semibold uppercase tracking-[0.08em]">{pkg.label}</strong>
                            <small className="mt-1 block max-w-2xl text-sm leading-5 text-white/75">{pkg.subtitle}</small>
                            <small className="mt-2 block text-xs uppercase tracking-[0.2em] text-[#f2d58b]">{pkg.areaKeys.map((key) => selectedVenueByKey(key).shortLabel).join(' + ')}</small>
                          </span>
                        </span>
                        <span className="hidden min-w-[230px] text-right lg:block">
                          <strong className="block text-xl font-semibold">{money(pkg.areaKeys.reduce((sum, key) => sum + selectedVenueByKey(key).rates.wholeDay, 0))}</strong>
                          <small className="block text-white/70">Whole day</small>
                          <small className="mt-1 block text-[#f2d58b]">{packagePriceLabel(pkg)}</small>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-0">
                {ACTIVE_VENUES.map((venue) => {
                  const active = selectedAreaKeys.includes(venue.key);
                  return (
                    <button key={venue.key} type="button" onClick={() => toggleArea(venue.key)} className={cx('group relative min-h-[118px] overflow-hidden border-x border-t text-left transition duration-300 last:border-b', active ? 'z-10 border-[#d6b56d] shadow-lg ring-2 ring-[#d6b56d]/40' : 'border-slate-200 hover:border-[#d6b56d]')}>
                      <img src={venue.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/30 to-black/75" />
                      <span className="relative flex min-h-[118px] items-center justify-between gap-4 p-4 text-white">
                        <span className="flex min-w-0 items-center gap-4">
                          <span className="group/number relative grid h-14 w-14 shrink-0 place-items-center border border-white/35 bg-white/10 text-sm font-semibold">
                            {venue.number}
                            <span className="pointer-events-none absolute left-16 top-0 w-[260px] translate-y-2 border border-white/20 bg-black/75 p-3 text-left text-xs font-normal leading-5 text-white/80 opacity-0 shadow-xl backdrop-blur transition duration-300 group-hover/number:translate-y-0 group-hover/number:opacity-100">{venue.description}</span>
                          </span>
                          <span className="min-w-0">
                            <strong className="block truncate text-3xl font-semibold uppercase tracking-[0.08em]">{venue.label}</strong>
                            <small className="mt-1 block max-w-2xl truncate text-sm text-white/75">{venue.inclusions.join(' · ')}</small>
                          </span>
                        </span>
                        <span className="min-w-[210px] text-right">
                          <strong className="block text-xl font-semibold">{money(venue.rates.wholeDay)}</strong>
                          <small className="block text-white/70">Whole day</small>
                          <small className="mt-1 block text-[#f2d58b]">{money(venue.rates.halfDay)} half · {money(venue.rates.extraHour)}/hr</small>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedCombinationError ? <p className="mt-3 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{selectedCombinationError}</p> : null}
            {mergedErrors.selected_area_keys ? <p className="mt-3 text-sm font-semibold text-red-600">{mergedErrors.selected_area_keys}</p> : null}
          </div>

          <ComputationAside title="Service Computation" subtitle={`${scheduleTotalDays} day(s) · ${scheduleTotalHours} hour(s)`} hideDiscount={activeStep < 3} rows={scheduleSelections} areaKeys={selectedAreaKeys} ingressPrep={ingressPrep} />
        </div>
      </SectionShell>
    );
  }

  function renderContactStep() {
    const isPublic = data.event_nature === 'public';
    return (
      <SectionShell kicker="Step 03 · Contact Details" title="Complete organizer, event, and MICE information" description="Public events collect MICE statistical fields. Private/personal events skip the MICE tourism statistics and store skipped values as dashes." icon={<UserRound className="h-4 w-4" />}>
        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,4fr)_minmax(300px,1fr)]">
          <div className="grid gap-4">
            <div className="grid gap-4 border border-slate-200 bg-white p-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">Event Scope</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <button type="button" onClick={() => { setData('event_nature', 'public'); setData('mice_required', true); }} className={cx('border p-4 text-left transition duration-300', isPublic ? 'border-[#164734] bg-[#164734] text-white shadow-md' : 'border-slate-200 bg-white hover:border-[#164734]')}><strong className="block text-lg">PUBLIC EVENT</strong><small className={cx('mt-1 block leading-5', isPublic ? 'text-white/75' : 'text-slate-500')}>Requires MICE classification, event type, attendees, countries, and exhibition details.</small></button>
                  <button type="button" onClick={() => { setData('event_nature', 'private'); setData('mice_required', false); }} className={cx('border p-4 text-left transition duration-300', !isPublic ? 'border-[#164734] bg-[#164734] text-white shadow-md' : 'border-slate-200 bg-white hover:border-[#164734]')}><strong className="block text-lg">PRIVATE / PERSONAL EVENT</strong><small className={cx('mt-1 block leading-5', !isPublic ? 'text-white/75' : 'text-slate-500')}>Skips public MICE statistical fields; required basics remain.</small></button>
                </div>
              </div>
              <Field label="Event Name" required error={mergedErrors.type_of_event}><input value={data.type_of_event} onChange={(event) => setData('type_of_event', upper(event.target.value))} className={inputClass(Boolean(mergedErrors.type_of_event))} /></Field>
              <Field label="Expected Number of Guests" required error={mergedErrors.number_of_guests}><input value={data.number_of_guests} onChange={(event) => setData('number_of_guests', event.target.value.replace(/\D/g, ''))} className={inputClass(Boolean(mergedErrors.number_of_guests))} inputMode="numeric" /></Field>
              {!isPublic ? <Field label="Private Event Type" required><select value={data.private_event_type} onChange={(event) => setData('private_event_type', event.target.value)} className={inputClass()}>{privateTypeOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}</select></Field> : null}
              <Field label="Public Calendar Title"><input value={data.public_calendar_title} onChange={(event) => setData('public_calendar_title', event.target.value)} className={inputClass()} placeholder="Optional display title" /></Field>
              <label className="flex items-center gap-3 self-end border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"><input type="checkbox" checked={data.is_public_calendar_visible} onChange={(event) => setData('is_public_calendar_visible', event.target.checked)} /> Show approved title on public calendar</label>
            </div>

            <div className="grid gap-4 border border-slate-200 bg-white p-4 lg:grid-cols-2">
              <div className="lg:col-span-2"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">Organizer Details</p></div>
              <Field label="Name of Organization" required error={mergedErrors.company_name}><input value={data.company_name} onChange={(event) => setData('company_name', upper(event.target.value))} className={inputClass(Boolean(mergedErrors.company_name))} /></Field>
              <Field label="Head of Organization"><input value={data.head_of_organization} onChange={(event) => setData('head_of_organization', upper(event.target.value))} className={inputClass()} /></Field>
              <Field label="Contact Person" required error={mergedErrors.client_name}><input value={data.client_name} onChange={(event) => setData('client_name', upper(event.target.value))} className={inputClass(Boolean(mergedErrors.client_name))} /></Field>
              <Field label="Contact Number" required error={mergedErrors.client_contact_number}><input value={data.client_contact_number} onChange={(event) => setData('client_contact_number', event.target.value.replace(/\D/g, ''))} className={inputClass(Boolean(mergedErrors.client_contact_number))} inputMode="numeric" /></Field>
              <Field label="Email Address" required error={mergedErrors.client_email}><input value={data.client_email} onChange={(event) => setData('client_email', event.target.value)} className={inputClass(Boolean(mergedErrors.client_email))} type="email" /></Field>
              <Field label="Organization Type"><input value={data.organization_type} onChange={(event) => setData('organization_type', event.target.value)} className={inputClass()} /></Field>
              <div className="lg:col-span-2 grid gap-4 border border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">Address of Organizer</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Select the Philippine region and province/district, then complete the city/municipality, barangay, and street/building details.</p>
                  {mergedErrors.client_address ? <p className="mt-2 text-xs font-semibold text-red-600">{mergedErrors.client_address}</p> : null}
                </div>
                <Field label="Region" required>
                  <select
                    value={data.client_region}
                    onChange={(event) => {
                      const region = event.target.value;
                      const firstProvince = provincesForRegion(region)[0] ?? '';
                      patchAddress({ client_region: region, client_province: firstProvince, client_city_municipality: '', client_barangay: '' });
                    }}
                    className={inputClass(Boolean(mergedErrors.client_address))}
                  >
                    <option value="">Select region</option>
                    {PHILIPPINES_ADDRESS_REGIONS.map((region) => <option key={region.code} value={region.code}>{region.label}</option>)}
                  </select>
                </Field>
                <Field label="Province / District" required>
                  <select
                    value={data.client_province}
                    onChange={(event) => patchAddress({ client_province: event.target.value, client_city_municipality: '', client_barangay: '' })}
                    className={inputClass(Boolean(mergedErrors.client_address))}
                  >
                    <option value="">Select province or district</option>
                    {provincesForRegion(data.client_region).map((province) => <option key={province} value={province}>{province}</option>)}
                  </select>
                </Field>
                <Field label="City / Municipality" required help={citiesForProvince(data.client_province).length ? 'Choose from the list or type if not shown.' : 'Type the official city or municipality.'}>
                  <input
                    value={data.client_city_municipality}
                    onChange={(event) => patchAddress({ client_city_municipality: upper(event.target.value) })}
                    className={inputClass(Boolean(mergedErrors.client_address))}
                    list="booking-city-municipality-options"
                    placeholder="BAGUIO CITY"
                  />
                  <datalist id="booking-city-municipality-options">
                    {citiesForProvince(data.client_province).map((city) => <option key={city} value={city} />)}
                  </datalist>
                </Field>
                <Field label="Barangay" required>
                  <input value={data.client_barangay} onChange={(event) => patchAddress({ client_barangay: upper(event.target.value) })} className={inputClass(Boolean(mergedErrors.client_address))} placeholder="BARANGAY" />
                </Field>
                <Field label="Street / Building / House No." required>
                  <input value={data.client_street_address} onChange={(event) => patchAddress({ client_street_address: upper(event.target.value) })} className={inputClass(Boolean(mergedErrors.client_address))} placeholder="STREET, BUILDING, UNIT" />
                </Field>
                <Field label="ZIP Code">
                  <input value={data.client_zip_code} onChange={(event) => patchAddress({ client_zip_code: event.target.value.replace(/[^0-9]/g, '') })} className={inputClass()} inputMode="numeric" />
                </Field>
                <div className="lg:col-span-2 border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
                  <strong className="block text-slate-950">Saved address preview</strong>
                  <span>{composePhilippinesAddress(data) || 'Complete the address fields above.'}</span>
                </div>
              </div>
              <Field label="Comment / Feedback"><textarea value={data.comments_feedback} onChange={(event) => setData('comments_feedback', event.target.value)} className={cx(inputClass(), 'min-h-24')} placeholder="N/A if none" /></Field>
            </div>

            <div className="grid gap-4 border border-slate-200 bg-white p-4 lg:grid-cols-2">
              <div className="lg:col-span-2"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">MICE Report Fields</p></div>
              <Field label="Name of Event Center"><input value={PUBLIC_EVENT_CENTER} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="Covered Month"><input value={data.covered_month} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="Date Event Started"><input value={displayDate(scheduleSelections[0]?.date ?? '')} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="Date Event Finished"><input value={displayDate(scheduleSelections[scheduleSelections.length - 1]?.date ?? '')} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="No. of Function Halls"><input value={isPublic ? '1' : '-'} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="Function Hall Capacity"><input value={isPublic ? '4000' : '-'} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              <Field label="Number of Hours"><input value={String(scheduleTotalHours)} readOnly className={cx(inputClass(), 'bg-slate-50')} /></Field>
              {isPublic ? (
                <>
                  <div className="lg:col-span-2 border border-[#d6b56d]/60 bg-[#fff8e6] p-4 text-sm leading-6 text-slate-700">
                    <strong className="block text-slate-950">Classification guide</strong>
                    International = participants from two continents. Regional Asia Pacific = two or more countries in same continent. Regional Offshore = one foreign country excluding Philippines. Regional Philippines = within a Philippine region. National = two or more Philippine regions.
                  </div>
                  <Field label="Classification of Event" required error={mergedErrors.classification_of_event}><select value={data.classification_of_event} onChange={(event) => setData('classification_of_event', event.target.value)} className={inputClass(Boolean(mergedErrors.classification_of_event))}>{classificationOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}</select></Field>
                  <Field label="Type of Event" required error={mergedErrors.mice_type_of_event}><select value={data.mice_type_of_event} onChange={(event) => setData('mice_type_of_event', event.target.value)} className={inputClass(Boolean(mergedErrors.mice_type_of_event))}>{miceTypeOptions.map((option) => <option key={optionValue(option.value)} value={optionValue(option.value)}>{option.label}</option>)}</select></Field>
                  <Field label="Foreign Attendees"><input value={data.foreign_attendees} onChange={(event) => setData('foreign_attendees', event.target.value.replace(/\D/g, ''))} className={inputClass()} inputMode="numeric" /></Field>
                  <Field label="Domestic Attendees" required error={mergedErrors.domestic_attendees}><input value={data.domestic_attendees} onChange={(event) => setData('domestic_attendees', event.target.value.replace(/\D/g, ''))} className={inputClass(Boolean(mergedErrors.domestic_attendees))} inputMode="numeric" /></Field>
                  <Field label="Total Number of Countries" required error={mergedErrors.total_number_of_countries}><input value={data.total_number_of_countries} onChange={(event) => setData('total_number_of_countries', event.target.value.replace(/\D/g, ''))} className={inputClass(Boolean(mergedErrors.total_number_of_countries))} inputMode="numeric" /></Field>
                  <Field label="Breakdown of Countries" required error={mergedErrors.countries_breakdown_text}><input value={data.countries_breakdown_text} onChange={(event) => setData('countries_breakdown_text', upper(event.target.value))} className={inputClass(Boolean(mergedErrors.countries_breakdown_text))} placeholder="PHILIPPINES" /></Field>
                  <Field label="Exhibitions"><select value={data.has_exhibitions} onChange={(event) => setData('has_exhibitions', event.target.value)} className={inputClass()}><option value="No">No</option><option value="Yes">Yes</option></select></Field>
                  {data.has_exhibitions === 'Yes' ? <Field label="No. of Exhibitors" required error={mergedErrors.exhibitors_count}><input value={data.exhibitors_count} onChange={(event) => setData('exhibitors_count', event.target.value.replace(/\D/g, ''))} className={inputClass(Boolean(mergedErrors.exhibitors_count))} inputMode="numeric" /></Field> : null}
                  {data.has_exhibitions === 'Yes' ? <Field label="No. of Visitors" required><input value={data.visitors_count} onChange={(event) => setData('visitors_count', event.target.value.replace(/\D/g, ''))} className={inputClass()} inputMode="numeric" /></Field> : null}
                </>
              ) : (
                <div className="lg:col-span-2 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">Private/personal event selected. MICE statistical fields are skipped and saved as <strong>-</strong> on the record.</div>
              )}
            </div>
          </div>

          <ComputationAside title="Current Booking Summary" subtitle={`${selectedVenues.map((venue) => venue.shortLabel).join(' + ')}`} hideDiscount rows={scheduleSelections} areaKeys={selectedAreaKeys} ingressPrep={ingressPrep} />
        </div>
      </SectionShell>
    );
  }

  function renderReviewStep() {
    return (
      <SectionShell kicker="Step 04 · Review" title="Final computation and confirmation" description="This is the first stage where hidden discounts and payment guidance are visible. Final approval and billing still depend on BCCC assessment." icon={<ReceiptText className="h-4 w-4" />}>
        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,4fr)_minmax(300px,1fr)]">
          <div className="grid gap-4">
            <ReviewCard title="Schedule" icon={<CalendarDays className="h-4 w-4" />}>
              <ReviewGrid rows={[
                ['Start', displayDateTime(buildBookingDateFrom(scheduleSelections[0]))],
                ['End', displayDateTime(buildBookingDateTo(scheduleSelections[scheduleSelections.length - 1]))],
                ['Total Days', `${scheduleTotalDays}`],
                ['Total Hours', `${scheduleTotalHours}`],
                ['Ingress / setup / preparation', ingressPrep ? 'Marked for BCCC assessment' : 'No'],
              ]} />
            </ReviewCard>
            <ReviewCard title="Selected Services" icon={<PackageCheck className="h-4 w-4" />}>
              <div className="grid gap-2">
                {selectedVenues.map((venue) => <div key={venue.key} className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2"><span><strong className="block text-sm text-slate-950">{venue.shortLabel}</strong><small className="text-xs text-slate-500">{venue.officialLabel}</small></span><span className="text-right text-sm font-semibold text-slate-950">{money(venue.rates.wholeDay)}<small className="block font-normal text-slate-500">whole day</small></span></div>)}
              </div>
            </ReviewCard>
            <ReviewCard title="Contact and MICE" icon={<UserRound className="h-4 w-4" />}>
              <ReviewGrid rows={[
                ['Event Scope', data.event_nature === 'public' ? 'PUBLIC EVENT' : 'PRIVATE/PERSONAL EVENT'],
                ['Event Name', data.type_of_event],
                ['Organization', data.company_name],
                ['Contact Person', data.client_name],
                ['Contact Number', data.client_contact_number],
                ['Email', data.client_email],
                ['Event Center', PUBLIC_EVENT_CENTER],
                ['Covered Month', data.covered_month],
                ['MICE Classification', data.event_nature === 'public' ? data.classification_of_event : '-'],
                ['MICE Type', data.event_nature === 'public' ? data.mice_type_of_event : '-'],
              ]} />
            </ReviewCard>
            <ReviewCard title="Policy Confirmation" icon={<ShieldCheck className="h-4 w-4" />}>
              <div className="grid gap-3">
                <div className="border border-[#d6b56d]/60 bg-[#fff8e6] p-4 text-sm leading-6 text-slate-700">
                  <strong className="block text-slate-950">BCCC final review notice</strong>
                  This review page is the first place where the hidden computation details are shown. Final billing still depends on BCCC assessment, approved discounts, payment compliance, and event-policy review.
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {REVIEW_POLICY_SECTIONS.map((section) => (
                    <div key={section.title} className="border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
                      <strong className="block text-slate-950">{section.title}</strong>
                      {section.body}
                    </div>
                  ))}
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <strong className="block text-slate-950">Excluded from user charges</strong>
                  <span>{EXCLUDED_USER_CHARGES.join(' · ')}</span>
                </div>
                <label className={cx('flex items-start gap-3 border p-3 text-sm', mergedErrors.policy_acknowledged ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white')}><input type="checkbox" checked={data.policy_acknowledged} onChange={(event) => setData('policy_acknowledged', event.target.checked)} className="mt-1" /><span><strong className="block text-slate-950">I have read and agree to the BCCC booking policy and house rules.</strong><small className="mt-1 block leading-5 text-slate-500">Includes payment terms, bond requirement, cancellation policy, outsourced service requirements, and post-event responsibility.</small></span></label>
                <label className={cx('flex items-start gap-3 border p-3 text-sm', mergedErrors.accuracy_acknowledged ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white')}><input type="checkbox" checked={data.accuracy_acknowledged} onChange={(event) => setData('accuracy_acknowledged', event.target.checked)} className="mt-1" /><span><strong className="block text-slate-950">I confirm that the reservation details are accurate.</strong><small className="mt-1 block leading-5 text-slate-500">Incorrect or incomplete data may delay assessment or approval.</small></span></label>
                {mergedErrors.policy_acknowledged ? <p className="text-sm font-semibold text-red-600">{mergedErrors.policy_acknowledged}</p> : null}
                {mergedErrors.accuracy_acknowledged ? <p className="text-sm font-semibold text-red-600">{mergedErrors.accuracy_acknowledged}</p> : null}
              </div>
            </ReviewCard>
            <ReviewCard title="Final line-item preview" icon={<ReceiptText className="h-4 w-4" />}>
              <ReviewLineItemsTable rows={scheduleSelections} areaKeys={selectedAreaKeys} ingressPrep={ingressPrep} />
            </ReviewCard>
          </div>
          <ComputationAside title="Final Computation" subtitle="Discounts visible only here" hideDiscount={false} rows={scheduleSelections} areaKeys={selectedAreaKeys} ingressPrep={ingressPrep} />
        </div>
      </SectionShell>
    );
  }

  function renderSubmittedStep() {
    return (
      <section className="grid min-h-[620px] place-items-center border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#164734] text-white shadow-xl"><CheckCircle2 className="h-12 w-12" /></div>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#a88633]">Reservation Submitted</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Your Reservation has been Submitted</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">BCCC will review the schedule, active service selection, contact details, MICE draft data, and payment requirements before confirmation.</p>
          <Link href={bookingBasePath(role)} className="mt-8 inline-flex items-center justify-center gap-2 bg-[#164734] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#0f3325]">View My Bookings <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    );
  }

  function renderActiveStep() {
    if (submitted || activeStep === 4) return renderSubmittedStep();
    if (activeStep === 0) return renderScheduleStep();
    if (activeStep === 1) return renderServicesStep();
    if (activeStep === 2) return renderContactStep();
    return renderReviewStep();
  }

  return (
    <BookingRolePageShell
      role={role}
      title={formTitle(role, editing)}
      description={formDescription(role)}
      actions={<Link href={backHref} className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#164734] hover:text-[#164734]"><ArrowLeft className="h-4 w-4" />Back</Link>}
      compact
    >
      <form onSubmit={handleSubmit} className="relative bg-slate-100/70 pb-24">
        <StepProgress activeStep={activeStep} submitted={submitted} onStepClick={(index) => { if (index <= activeStep || validateStep(activeStep)) setActiveStep(index); }} />
        {floatingNotice ? (
          <div className="fixed right-4 top-24 z-50 max-w-md border border-red-200 bg-white p-4 text-sm text-slate-700 shadow-2xl">
            <div className="flex gap-3">
              <AlertTriangle className={cx('mt-0.5 h-5 w-5 shrink-0', floatingNotice.tone === 'error' ? 'text-red-600' : 'text-[#164734]')} />
              <div>
                <strong className="block text-slate-950">{floatingNotice.title}</strong>
                <span className="mt-1 block leading-5">{floatingNotice.message}</span>
                <button type="button" onClick={() => setFloatingNotice(null)} className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#164734]">Close</button>
              </div>
            </div>
          </div>
        ) : null}
        <div ref={stepRootRef} className="mx-auto max-w-[1700px] scroll-mt-28 p-3 sm:p-5">
          {Object.keys(errors as Record<string, string>).length > 0 ? <div className="mb-4 flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="h-5 w-5 shrink-0" /><div><strong className="block">Please check the form</strong><span>{Object.values(errors as Record<string, string>)[0] || 'The server returned validation feedback after submission.'}</span></div></div> : null}
          {renderActiveStep()}
        </div>
        {showPolicyModal ? <FinalPolicyModal checked={policyModalChecked} setChecked={setPolicyModalChecked} onClose={() => setShowPolicyModal(false)} onConfirm={confirmFinalPolicyAndSubmit} processing={processing} /> : null}
        {!submitted && activeStep < 4 ? (
          <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1700px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a88633]">{STEPS[activeStep]?.label}</p>
                <p className="truncate text-sm text-slate-600">{scheduleTotalDays} day(s), {scheduleTotalHours} hour(s), {selectedVenues.map((venue) => venue.shortLabel).join(' + ')}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeStep > 0 ? <button type="button" onClick={goBack} className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#164734] hover:text-[#164734]">Back</button> : null}
                <button type="submit" disabled={processing || (activeStep === 3 && (!data.policy_acknowledged || !data.accuracy_acknowledged))} className="inline-flex items-center justify-center gap-2 bg-[#164734] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0f3325] disabled:cursor-not-allowed disabled:opacity-60">
                  {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : activeStep === 3 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {activeStep === 3 ? 'Submit Reservation' : 'Save & Continue'}
                </button>
              </div>
            </div>
          </footer>
        ) : null}
      </form>
    </BookingRolePageShell>
  );

  function ComputationAside({ title, subtitle, hideDiscount, rows, areaKeys, ingressPrep: hasIngressPrep }: { title: string; subtitle: string; hideDiscount: boolean; rows: ScheduleSelection[]; areaKeys: ActiveVenueKey[]; ingressPrep: boolean }) {
    const subtotal = baseTotal(rows, areaKeys);
    const discountLines = finalDiscountLines(rows, areaKeys, hasIngressPrep);
    const discount = discountLines.reduce((sum, line) => sum + line.amount, 0);
    const total = Math.max(0, subtotal - (hideDiscount ? 0 : discount));
    const down = Math.round(total * 0.5);
    const balance = Math.max(0, total - down);
    const lineItems = reviewLineItems(rows, areaKeys);
    return (
      <aside className="sticky top-24 h-fit border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[#164734] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2d58b]">{title}</p>
          <h3 className="mt-1 text-lg font-semibold">{subtitle}</h3>
        </div>
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4">
          <div className="grid gap-2">
            {areaKeys.map((key) => {
              const venue = selectedVenueByKey(key);
              return <div key={key} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm"><span className="text-slate-600">{venue.shortLabel}</span><strong className="text-slate-950">{money(rows.reduce((sum, row) => sum + dateVenueBaseTotal(row, [key]), 0))}</strong></div>;
            })}
          </div>
          {!hideDiscount && lineItems.length ? (
            <div className="mt-4 border border-slate-100 bg-slate-50 p-3">
              <strong className="block text-xs uppercase tracking-[0.18em] text-slate-500">Line items</strong>
              <div className="mt-2 grid gap-2">
                {lineItems.slice(0, 6).map((line) => <div key={line.key} className="flex justify-between gap-3 text-xs"><span className="text-slate-600">{displayDate(line.date)} · {line.label}</span><strong>{money(line.amount)}</strong></div>)}
                {lineItems.length > 6 ? <p className="text-xs text-slate-500">+ {lineItems.length - 6} more line item(s) shown in the review table.</p> : null}
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Base venue estimate</span><strong>{money(subtotal)}</strong></div>
            {hideDiscount ? <div className="flex items-start gap-2 border border-dashed border-[#d6b56d] bg-[#fff8e6] p-3 text-xs leading-5 text-slate-600"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-[#a88633]" />{hiddenDiscountNote()}</div> : discountLines.length ? discountLines.map((line) => <div key={line.key} className="grid gap-1 border border-[#d6b56d]/60 bg-[#fff8e6] p-3 text-xs text-[#164734]"><div className="flex justify-between gap-3"><span>{line.label}</span><strong>-{money(line.amount)}</strong></div><small className="text-slate-600">Basis {money(line.basis)} · {Math.round(line.rate * 100)}%</small></div>) : <div className="text-xs text-slate-500">No hidden discount is currently applicable.</div>}
            {!hideDiscount ? <div className="flex justify-between"><span>Required 50% down payment</span><strong>{money(down)}</strong></div> : null}
            {!hideDiscount ? <div className="flex justify-between"><span>Required bond</span><strong>{money(REQUIRED_BOND)}</strong></div> : null}
            {!hideDiscount ? <div className="flex justify-between"><span>Balance after down payment</span><strong>{money(balance)}</strong></div> : null}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="flex items-end justify-between gap-3">
            <span><small className="block text-xs uppercase tracking-[0.18em] text-slate-500">{hideDiscount ? 'Running Estimate' : 'Final Estimate'}</small><strong className="text-sm text-slate-700">Subject to BCCC review</strong></span>
            <strong className="text-2xl tracking-[-0.04em] text-slate-950">{money(total)}</strong>
          </div>
        </div>
      </aside>
    );
  }
}
function ReviewCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <article className="border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#164734]">{icon}{title}</h3>{children}</article>;
}

function ReviewGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <div className="grid gap-2 md:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="border border-slate-100 bg-slate-50 p-3"><small className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</small><strong className="mt-1 block break-words text-sm text-slate-950">{value || '—'}</strong></div>)}</div>;
}

function ReviewLineItemsTable({ rows, areaKeys, ingressPrep }: { rows: ScheduleSelection[]; areaKeys: ActiveVenueKey[]; ingressPrep: boolean }) {
  const lineItems = reviewLineItems(rows, areaKeys);
  const discounts = finalDiscountLines(rows, areaKeys, ingressPrep);
  const subtotal = lineItems.reduce((sum, line) => sum + line.amount, 0);
  const discountTotal = discounts.reduce((sum, line) => sum + line.amount, 0);
  const finalTotal = Math.max(0, subtotal - discountTotal);

  return (
    <div className="overflow-hidden border border-slate-200">
      <div className="hidden grid-cols-[1.2fr_1.4fr_.7fr_.8fr] bg-[#164734] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white md:grid">
        <span>Date</span>
        <span>Charge</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Amount</span>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {lineItems.map((line) => (
          <div key={line.key} className="grid gap-1 px-3 py-3 text-sm md:grid-cols-[1.2fr_1.4fr_.7fr_.8fr] md:items-center">
            <span className="font-medium text-slate-950">{displayDate(line.date)}</span>
            <span className="text-slate-600"><strong className="block text-slate-950">{line.label}</strong><small>{line.detail}</small></span>
            <span className="text-slate-600 md:text-right">{line.quantity}</span>
            <strong className="text-slate-950 md:text-right">{money(line.amount)}</strong>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-slate-50 p-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        {discounts.length ? discounts.map((line) => <div key={line.key} className="mt-2 flex justify-between text-[#164734]"><span>{line.label}</span><strong>-{money(line.amount)}</strong></div>) : <div className="mt-2 text-xs text-slate-500">No discount is currently applicable for this draft computation.</div>}
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base"><span>Final estimate</span><strong>{money(finalTotal)}</strong></div>
      </div>
    </div>
  );
}

function FinalPolicyModal({ checked, setChecked, onClose, onConfirm, processing }: { checked: boolean; setChecked: (value: boolean) => void; onClose: () => void; onConfirm: () => void; processing: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden border border-white/20 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[#164734] p-5 text-white">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f2d58b]"><ScrollText className="h-4 w-4" /> Final confirmation</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Before submitting your reservation</h3>
            <p className="mt-1 text-sm leading-6 text-white/75">Read this confirmation. The submit button unlocks only after the checkbox is marked.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center border border-white/20 text-white transition hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="grid gap-3">
            {BCCC_POLICY_NOTICE.map((item) => <div key={item} className="flex gap-3 border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-[#164734]" /><span>{item}</span></div>)}
          </div>
          <div className="mt-4 border border-[#d6b56d]/70 bg-[#fff8e6] p-4 text-sm leading-6 text-slate-700">
            <strong className="block text-slate-950">Computation privacy notice</strong>
            Discounts and final billing adjustments are shown only at review/finalization and remain subject to BCCC assessment. Excluded charge categories are not part of this user booking flow.
          </div>
          <label className="mt-4 flex items-start gap-3 border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1" />
            <span><strong className="block text-slate-950">I have read this final notice and I want to submit this reservation request.</strong><small className="mt-1 block text-slate-500">The request will still be reviewed by BCCC before confirmation.</small></span>
          </label>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#164734] hover:text-[#164734]">Review Again</button>
          <button type="button" disabled={!checked || processing} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 bg-[#164734] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0f3325] disabled:cursor-not-allowed disabled:opacity-50">{processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Submit Reservation</button>
        </div>
      </div>
    </div>
  );
}

export default BookingFormPage;
