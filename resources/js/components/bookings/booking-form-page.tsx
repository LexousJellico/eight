import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { OfficialReservationPreview } from '@/components/bookings/official-reservation-preview';
import {
  BCCC_BOOKING_GENERAL_GUIDELINES,
  BOOKING_USAGE_LABELS,
  BOOKING_VENUE_CATALOG,
  catalogItemMatchesService,
  estimateVenueCharge,
  type BookingUsageKey,
  type BookingVenueCatalogItem,
  type BookingVenueKey,
} from '@/lib/booking-venue-catalog';
import {
  bookingBasePath,
  bookingShowPath,
  normalizeWorkspaceRole,
  type BookingLike,
} from '@/lib/booking-role-ui';
import { type RoleThemeKey } from '@/lib/role-theme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  PackageCheck,
  Pencil,
  ReceiptText,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BookingFormLoadingLayer } from '@/components/bookings/booking-form-loading-layer';
import { useBookingScrollMotion } from '@/hooks/use-booking-scroll-motion';
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
};

type BookingFormPageProps = {
  workspaceRole?: string;
  booking?: BookingLike;
  serviceTypes?: ServiceTypeOption[] | PaginatedLike<ServiceTypeOption>;
  services?: ServiceOption[] | PaginatedLike<ServiceOption>;
  initialSchedule?: InitialSchedule;
  initialVenue?: string | null;
  initialEventType?: string | null;
  initialGuests?: number | string | null;
};

type BookingFormData = {
  service_id: string;

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

const BOOKING_STEPS: StepDefinition[] = [
  {
    title: 'Package',
    subtitle: 'Area, usage, and rate',
    icon: PackageCheck,
  },
  {
    title: 'Organizer',
    subtitle: 'Event and contact',
    icon: UserRound,
  },
  {
    title: 'Address',
    subtitle: 'Organizer location',
    icon: MapPin,
  },
  {
    title: 'Schedule',
    subtitle: 'Date, guests, charges',
    icon: CalendarDays,
  },
  {
    title: 'Guidelines',
    subtitle: 'Rules and proof',
    icon: ShieldCheck,
  },
  {
    title: 'Review',
    subtitle: 'Final check',
    icon: CheckCircle2,
  },
];

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

function toInputDateTime(value?: string | null): string {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function buildInitialDateTime(
  schedule?: InitialSchedule,
  fallback?: string | null,
  part?: 'from' | 'to',
): string {
  if (fallback) return toInputDateTime(fallback);

  if (schedule?.date && schedule?.start_time && part === 'from') {
    return `${schedule.date}T${schedule.start_time}`;
  }

  if (schedule?.date && schedule?.end_time && part === 'to') {
    return `${schedule.date}T${schedule.end_time}`;
  }

  return '';
}

function flattenServices(
  serviceTypes?: ServiceTypeOption[] | PaginatedLike<ServiceTypeOption>,
  services?: ServiceOption[] | PaginatedLike<ServiceOption>,
): ServiceOption[] {
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
  return [service.name, service.service_type_name, service.service_type?.name]
    .filter(Boolean)
    .join(' ');
}

function matchCatalogWithServices(services: ServiceOption[]): MatchedVenueItem[] {
  return BOOKING_VENUE_CATALOG.map((item) => {
    const service = services.find((option) => {
      return (
        catalogItemMatchesService(item, option.name) ||
        catalogItemMatchesService(item, option.service_type_name) ||
        catalogItemMatchesService(item, option.service_type?.name) ||
        catalogItemMatchesService(item, serviceSearchName(option))
      );
    });

    return {
      ...item,
      service,
      configured: Boolean(service),
    };
  });
}

function formTitle(role: RoleThemeKey, editing: boolean): string {
  if (role === 'admin') return editing ? 'Edit Reservation' : 'Create Reservation';
  if (role === 'manager') return 'Review Reservation';
  if (role === 'staff') return editing ? 'Update Assisted Booking' : 'Assist Booking';

  return editing ? 'Update Your Event Request' : 'Reserve Your Event Space';
}

function formDescription(role: RoleThemeKey): string {
  if (role === 'user') {
    return 'Complete the reservation form one page at a time, review the details, then submit your booking request.';
  }

  return 'Create or update a reservation using the official BCCC booking structure, charges, guidelines, and backend requirements.';
}

function combinedAddress(data: BookingFormData): string {
  return [
    data.client_street_address,
    data.client_barangay,
    data.client_city_municipality,
    data.client_province,
    data.client_region,
    data.client_zip_code,
  ]
    .filter(Boolean)
    .join(', ');
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function smoothScrollElementTo(
  element: HTMLElement,
  targetLeft: number,
  duration = 850,
) {
  const startLeft = element.scrollLeft;
  const distance = targetLeft - startLeft;
  const startTime = performance.now();

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuint(progress);

    element.scrollLeft = startLeft + distance * eased;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function scrollStageToStart() {
  const stage = document.querySelector('.booking-wizard-stage');

  if (stage) {
    stage.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="booking-wizard-field">
      <span className="backend-booking-label">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      {children}

      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

function WizardNotice({ errors }: { errors: Record<string, string> }) {
  const values = Object.values(errors);

  if (values.length === 0) return null;

  return (
    <div className="booking-wizard-notice">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-black">Complete this page first.</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
          {values.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function VenueImage({
  item,
  selected,
}: {
  item: BookingVenueCatalogItem;
  selected: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`booking-hotel-card-image ${item.fallbackClass}`}>
      {!failed ? (
        <img
          src={item.image}
          alt={item.displayLabel}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover brightness-[0.54] saturate-[0.95] transition duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-12 w-12 text-white/35" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />

      <div className="booking-hotel-card-badges">
        <span>{item.category === 'package' ? 'Complete Package' : 'Individual Space'}</span>
        <span>{item.capacity}</span>
      </div>

      <div
        className={`booking-hotel-selected-mark ${
          selected ? 'is-selected' : ''
        }`}
      >
        {selected ? <Check className="h-4 w-4" /> : null}
      </div>

      <div className="booking-hotel-image-caption">
        <p>{item.subtitle}</p>
        <h3>{item.displayLabel}</h3>
      </div>
    </div>
  );
}

function VenueCard({
  item,
  selected,
  onSelect,
}: {
  item: MatchedVenueItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-venue-key={item.key}
      onClick={onSelect}
      disabled={!item.configured}
      className={`booking-hotel-card group ${selected ? 'is-selected' : ''} ${
        !item.configured ? 'is-disabled' : ''
      }`}
    >
      <VenueImage item={item} selected={selected} />

      <div className="booking-hotel-card-body">
        <div className="booking-hotel-card-title-row">
          <div className="min-w-0">
            <p className="backend-booking-label">
              {item.category === 'package' ? 'Flagship reservation' : 'Venue selection'}
            </p>

            <h4>{item.label}</h4>
          </div>

          <Badge
            variant="outline"
            className={
              item.configured
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                : 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200'
            }
          >
            {item.configured ? 'Ready' : 'Missing'}
          </Badge>
        </div>

        <p className="booking-hotel-card-description">
          {item.longDescription || item.description}
        </p>

        <div className="booking-hotel-rate-grid">
          <div>
            <span>Whole Day</span>
            <strong>{money(item.rates.whole_day)}</strong>
          </div>
          <div>
            <span>Half Day</span>
            <strong>{money(item.rates.half_day)}</strong>
          </div>
          <div>
            <span>Extra Hour</span>
            <strong>{money(item.rates.additional_hour)}</strong>
          </div>
        </div>

        <div className="booking-hotel-selected-details">
          <div>
            <p className="backend-booking-label">Included</p>
            <div className="booking-hotel-pill-grid">
              {item.includes.map((included) => (
                <span key={included}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {included}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="backend-booking-label">Highlights</p>
            <div className="booking-hotel-pill-grid">
              {item.amenities.slice(0, 6).map((amenity) => (
                <span key={amenity}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="backend-booking-label">Ideal For</p>
            <div className="booking-hotel-pill-grid">
              {item.idealFor.slice(0, 5).map((ideal) => (
                <span key={ideal}>
                  <Star className="h-3.5 w-3.5" />
                  {ideal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function Stepper({
  activeStep,
  maxStep,
  onStepClick,
}: {
  activeStep: number;
  maxStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="booking-wizard-top-steps">
      {BOOKING_STEPS.map((step, index) => {
        const Icon = step.icon;
        const current = index === activeStep;
        const done = index < activeStep;
        const unlocked = index <= maxStep;

        return (
          <button
            key={step.title}
            type="button"
            disabled={!unlocked}
            onClick={() => onStepClick(index)}
            className={`booking-wizard-step-pill ${current ? 'is-current' : ''} ${
              done ? 'is-done' : ''
            }`}
          >
            <span className="booking-wizard-step-icon">
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>

            <span className="hidden min-w-0 text-left lg:block">
              <span className="block truncate text-xs font-black">{step.title}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{step.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewBlock({
  title,
  icon: Icon,
  children,
  onEdit,
}: {
  title: string;
  icon: typeof UserRound;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <Card className="backend-booking-card booking-review-card">
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="backend-booking-icon">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-black">{title}</CardTitle>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="rounded-full">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ReviewGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="booking-review-grid">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border bg-muted/35 p-3">
          <p className="backend-booking-label">{label}</p>
          <div className="mt-1 text-sm font-bold leading-6">{value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

export function BookingFormPage() {
  const { props } = usePage<BookingFormPageProps>();
  const role = normalizeWorkspaceRole(props.workspaceRole) as RoleThemeKey;
  const booking = props.booking;
  const bookingAny = booking as Record<string, any> | undefined;
  const editing = Boolean(booking?.id);
  const isClient = role === 'user';
  const isManager = role === 'manager';
  const isStaffLike = role === 'admin' || role === 'manager' || role === 'staff';

  const packageCarouselRef = useRef<HTMLDivElement | null>(null);

useBookingScrollMotion(true);

  useEffect(() => {
    document.documentElement.classList.add('booking-wizard-screen-active');

    return () => {
      document.documentElement.classList.remove('booking-wizard-screen-active');
    };
  }, []);

  const services = useMemo(
    () => flattenServices(props.serviceTypes, props.services),
    [props.serviceTypes, props.services],
  );

  const venueItems = useMemo(() => matchCatalogWithServices(services), [services]);

  const initialServiceId = firstValue(
    bookingAny?.service_id,
    bookingAny?.service?.id,
    props.initialVenue &&
      services.find((service) =>
        serviceSearchName(service)
          .toUpperCase()
          .includes(String(props.initialVenue).toUpperCase()),
      )?.id,
  );

  const matchedInitialVenue =
    venueItems.find((item) => String(item.service?.id ?? '') === String(initialServiceId)) ??
    venueItems.find((item) => item.configured) ??
    venueItems[0];

  const [selectedVenueKey, setSelectedVenueKey] = useState<BookingVenueKey | null>(
    matchedInitialVenue?.key ?? null,
  );

  const [usage, setUsage] = useState<BookingUsageKey>('whole_day');
  const [durationHours, setDurationHours] = useState('1');
  const [otherRentals, setOtherRentals] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('');
  const [reservationNotes, setReservationNotes] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const selectedVenue = venueItems.find((item) => item.key === selectedVenueKey);
  const selectedIndex = Math.max(
    0,
    venueItems.findIndex((item) => item.key === selectedVenueKey),
  );

  const estimatedBase = estimateVenueCharge(selectedVenue, usage, Number(durationHours || 1));
  const estimatedAdditional = Number(additionalCharges || 0);
  const estimatedTotal = estimatedBase + (Number.isFinite(estimatedAdditional) ? estimatedAdditional : 0);
  const backHref = editing && booking?.id ? bookingShowPath(role, booking.id) : bookingBasePath(role);

  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    transform,
  } = useForm<BookingFormData>({
    service_id: initialServiceId,

    organization_type: firstValue(bookingAny?.organization_type, 'Private'),
    company_name: firstValue(bookingAny?.company_name),
    client_name: firstValue(bookingAny?.client_name),
    client_contact_number: firstValue(bookingAny?.client_contact_number),
    client_email: firstValue(bookingAny?.client_email),

    client_address: firstValue(bookingAny?.client_address),
    client_region: firstValue(bookingAny?.client_region, 'CAR'),
    client_province: firstValue(bookingAny?.client_province, 'Benguet'),
    client_city_municipality: firstValue(bookingAny?.client_city_municipality, 'Baguio City'),
    client_barangay: firstValue(bookingAny?.client_barangay),
    client_zip_code: firstValue(bookingAny?.client_zip_code),
    client_street_address: firstValue(bookingAny?.client_street_address, bookingAny?.client_address),

    head_of_organization: firstValue(bookingAny?.head_of_organization),
    type_of_event: firstValue(bookingAny?.type_of_event, props.initialEventType),
    booking_date_from: buildInitialDateTime(props.initialSchedule, bookingAny?.booking_date_from, 'from'),
    booking_date_to: buildInitialDateTime(props.initialSchedule, bookingAny?.booking_date_to, 'to'),
    number_of_guests: firstValue(bookingAny?.number_of_guests, props.initialGuests),

    survey_email: firstValue(bookingAny?.survey_email, bookingAny?.client_email),
    survey_proof_image: null,

    booking_status: firstValue(bookingAny?.booking_status, 'pending'),
    payment_status: firstValue(bookingAny?.payment_status, 'unpaid'),
    is_public_calendar_visible: Boolean(bookingAny?.is_public_calendar_visible ?? false),
    public_calendar_title: firstValue(bookingAny?.public_calendar_title),

    package_acknowledged: Boolean(editing),
    policy_acknowledged: Boolean(editing),
    accuracy_acknowledged: Boolean(editing),
  });

  function focusVenueCard(key: BookingVenueKey) {
    window.requestAnimationFrame(() => {
      const carousel = packageCarouselRef.current;
      const card = carousel?.querySelector<HTMLElement>(`[data-venue-key="${key}"]`);

      if (!carousel || !card) return;

      const carouselRect = carousel.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const currentScroll = carousel.scrollLeft;

      const target =
        currentScroll +
        (cardRect.left - carouselRect.left) -
        carouselRect.width / 2 +
        cardRect.width / 2;

      smoothScrollElementTo(carousel, target, 900);
    });
  }

  function selectVenue(item: MatchedVenueItem) {
    if (!item.configured) return;

    setSelectedVenueKey(item.key);
    setData('service_id', item.service?.id ? String(item.service.id) : '');
    setStepErrors({});
    focusVenueCard(item.key);
  }

  function moveVenue(direction: 'previous' | 'next') {
    const nextIndex =
      direction === 'previous'
        ? Math.max(0, selectedIndex - 1)
        : Math.min(venueItems.length - 1, selectedIndex + 1);

    const nextVenue = venueItems[nextIndex];

    if (nextVenue) {
      selectVenue(nextVenue);
    }
  }

  function validateStep(step: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!selectedVenue) nextErrors.package = 'Select a booking package or venue.';
      if (!data.service_id) nextErrors.service_id = 'Selected package must be connected to a backend Rental Option.';
      if (!usage) nextErrors.usage = 'Select Whole Day, Half Day, or Additional Hour.';
      if (usage === 'additional_hour' && Number(durationHours || 0) <= 0) {
        nextErrors.duration = 'Enter a valid number of additional hours.';
      }
      if (!data.package_acknowledged) {
        nextErrors.package_acknowledged = 'Confirm that you reviewed the package, rates, and inclusions.';
      }
    }

    if (step === 1) {
      if (!data.type_of_event.trim()) nextErrors.type_of_event = 'Event title/type is required.';
      if (!data.client_name.trim()) nextErrors.client_name = 'Contact person is required.';
      if (!data.client_contact_number.trim()) nextErrors.client_contact_number = 'Telephone/contact number is required.';
      if (!data.company_name.trim()) nextErrors.company_name = 'Name of organization is required.';
    }

    if (step === 2) {
      if (!data.client_region.trim()) nextErrors.client_region = 'Region is required.';
      if (!data.client_province.trim()) nextErrors.client_province = 'Province is required.';
      if (!data.client_city_municipality.trim()) nextErrors.client_city_municipality = 'City / municipality is required.';
      if (!data.client_street_address.trim()) nextErrors.client_street_address = 'Street address is required.';
    }

    if (step === 3) {
      if (!data.booking_date_from.trim()) nextErrors.booking_date_from = 'Start date/time is required.';
      if (!data.booking_date_to.trim()) nextErrors.booking_date_to = 'End date/time is required.';
      if (!data.number_of_guests.trim()) nextErrors.number_of_guests = 'Number of guests is required.';

      if (data.booking_date_from && data.booking_date_to) {
        const start = Date.parse(data.booking_date_from);
        const end = Date.parse(data.booking_date_to);

        if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
          nextErrors.booking_date_to = 'End date/time must be later than start date/time.';
        }
      }
    }

    if (step === 4) {
      if (!data.policy_acknowledged) {
        nextErrors.policy_acknowledged = 'Confirm that the BCCC guidelines were reviewed.';
      }

      if (!data.accuracy_acknowledged) {
        nextErrors.accuracy_acknowledged = 'Confirm that all encoded information is accurate.';
      }
    }

    setStepErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function runStepTransition(callback: () => void) {
    setStepLoading(true);

    window.setTimeout(() => {
      callback();

      window.setTimeout(() => {
        setStepLoading(false);
      }, 180);
    }, 180);
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

  function finalSubmit() {
    if (!validateStep(4)) {
      setActiveStep(4);
      return;
    }

    const finalAddress = combinedAddress(data);

    transform((current) => ({
      ...current,
      client_address: current.client_address || finalAddress,
      public_calendar_title: current.public_calendar_title || current.type_of_event,
    }));

    if (editing && booking?.id) {
      put(`${bookingBasePath(role)}/${booking.id}`, {
        forceFormData: true,
        preserveScroll: true,
      });

      return;
    }

    const createPath =
      role === 'admin'
        ? '/admin/bookings'
        : role === 'staff'
          ? '/staff/bookings'
          : '/book';

    post(createPath, {
      forceFormData: true,
      preserveScroll: true,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      <div className="booking-wizard-footer">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={activeStep === 0 || processing}
          className="rounded-full"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex min-w-0 flex-1 justify-end gap-2">
          <Button asChild type="button" variant="outline" className="rounded-full">
            <Link href={backHref}>Cancel</Link>
          </Button>

          <Button type="submit" disabled={processing} className="rounded-full">
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isReview ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isReview ? (editing ? 'Save Booking' : 'Submit Booking') : 'Save & Continue'}
          </Button>
        </div>
      </div>
    );
  }

  function SummaryDrawer() {
    return (
      <>
        <button
          type="button"
          className={`booking-summary-side-tab ${summaryOpen ? 'is-open' : ''}`}
          onClick={() => setSummaryOpen(true)}
        >
          <FileText className="h-4 w-4" />
          <span>Summary</span>
        </button>

        <aside className={`booking-summary-drawer ${summaryOpen ? 'is-open' : ''}`}>
          <div className="booking-summary-drawer-card">
            <div className="booking-summary-drawer-header">
              <div className="min-w-0">
                <p className="backend-booking-label">Live Reservation Summary</p>
                <h3>{selectedVenue?.displayLabel ?? 'No package selected'}</h3>
                <p>
                  {BOOKING_USAGE_LABELS[usage]}
                  {usage === 'additional_hour' ? ` · ${durationHours || 0} hour(s)` : ''}
                </p>
              </div>

              <button
                type="button"
                className="booking-summary-close"
                onClick={() => setSummaryOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Separator />

            <div className="booking-summary-drawer-grid">
              <div>
                <p className="backend-booking-label">Base Charge</p>
                <strong>{money(estimatedBase)}</strong>
              </div>

              <div>
                <p className="backend-booking-label">Estimated Total</p>
                <strong>{money(estimatedTotal)}</strong>
              </div>

              <div>
                <p className="backend-booking-label">Event</p>
                <strong>{data.type_of_event || 'Not encoded yet'}</strong>
              </div>

              <div>
                <p className="backend-booking-label">Organizer</p>
                <strong>{data.company_name || data.client_name || 'Not encoded yet'}</strong>
              </div>

              <div>
                <p className="backend-booking-label">Schedule</p>
                <strong>
                  {data.booking_date_from || 'No start date'} → {data.booking_date_to || 'No end date'}
                </strong>
              </div>

              <div>
                <p className="backend-booking-label">Guests</p>
                <strong>{data.number_of_guests || 'Not encoded yet'}</strong>
              </div>
            </div>

            <div className="booking-summary-actions">
              <Button
                type="button"
                variant={showDigitalForm ? 'default' : 'outline'}
                className="w-full rounded-full"
                onClick={() => {
                  setShowDigitalForm((current) => !current);
                  setSummaryOpen(false);
                }}
              >
                {showDigitalForm ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {showDigitalForm ? 'Hide Digital Form' : 'View Digital Form'}
              </Button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  function DigitalFormPanel() {
    if (!showDigitalForm) {
      return null;
    }

    return (
      <aside className="booking-digital-form-panel">
        <div className="booking-digital-form-topbar no-print">
          <div>
            <p className="backend-booking-label">Official Preview</p>
            <h3 className="text-lg font-black tracking-[-0.03em]">
              Digital Reservation Form
            </h3>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setShowDigitalForm(false)}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Hide
          </Button>
        </div>

        <div className="booking-digital-form-scroll">
          <OfficialReservationPreview
            data={data}
            selectedVenue={selectedVenue}
            usage={usage}
            durationHours={durationHours}
            otherRentals={otherRentals}
            additionalCharges={additionalCharges}
            reservationNotes={reservationNotes}
            estimatedBase={estimatedBase}
            estimatedTotal={estimatedTotal}
            fullAddress={combinedAddress(data)}
          />
        </div>
      </aside>
    );
  }

  function renderPackageStep() {
    return (
      <div className="booking-step-screen booking-package-step-screen">
        <div className="booking-hotel-header">
          <div>
            <Badge
              variant="outline"
              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
            >
              Hotel-style package selection
            </Badge>
            <h2>Choose your BCCC event space</h2>
            <p>
              Select the venue package like a premium stay: compare rates, inclusions,
              amenities, and backend readiness in one focused carousel.
            </p>
          </div>

          <div className="booking-hotel-carousel-controls">
            <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => moveVenue('previous')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => moveVenue('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={packageCarouselRef} className="booking-hotel-carousel">
          {venueItems.map((item) => (
            <VenueCard
              key={item.key}
              item={item}
              selected={selectedVenueKey === item.key}
              onSelect={() => selectVenue(item)}
            />
          ))}
        </div>

        <div className="booking-hotel-bottom-panel">
          <div className="booking-hotel-usage-strip">
            {(['whole_day', 'half_day', 'additional_hour'] as BookingUsageKey[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setUsage(option)}
                className={`backend-usage-card ${usage === option ? 'is-selected' : ''}`}
              >
                <span className="backend-booking-label">{BOOKING_USAGE_LABELS[option]}</span>
                <span className="mt-1 block text-xl font-black">
                  {selectedVenue ? money(selectedVenue.rates[option]) : '₱0.00'}
                </span>
              </button>
            ))}
          </div>

          <div className="booking-hotel-booking-controls">
            {usage === 'additional_hour' ? (
              <Field label="Hours" required error={stepErrors.duration}>
                <input
                  value={durationHours}
                  onChange={(event) => setDurationHours(event.target.value)}
                  className="backend-booking-input"
                  inputMode="numeric"
                />
              </Field>
            ) : null}

            <Field label="Backend Rental Option" required error={errors.service_id || stepErrors.service_id}>
              <select
                value={data.service_id}
                onChange={(event) => {
                  setData('service_id', event.target.value);

                  const matched = venueItems.find(
                    (item) => String(item.service?.id ?? '') === String(event.target.value),
                  );

                  if (matched) selectVenue(matched);
                }}
                className="backend-booking-input"
              >
                <option value="">Select configured option</option>
                {venueItems
                  .filter((item) => item.configured && item.service)
                  .map((item) => (
                    <option key={item.key} value={item.service?.id}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </Field>

            <label className="booking-check-card">
              <input
                type="checkbox"
                checked={data.package_acknowledged}
                onChange={(event) => setData('package_acknowledged', event.target.checked)}
              />
              <span>
                <span className="block text-sm font-black">Reviewed package and rates.</span>
                <span className="block text-xs text-muted-foreground">
                  Final charges may still be adjusted after BCCC assessment.
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  function renderOrganizerStep() {
    return (
      <div className="booking-step-screen">
        <Card className="backend-booking-card booking-fit-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="backend-booking-icon">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <Badge variant="outline">Organizer</Badge>
                <CardTitle className="mt-2 text-xl font-black">Event and organizer details</CardTitle>
                <CardDescription>
                  This follows the official reservation form fields.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="booking-field-carousel">
            <Field label="Event Title / Type" required error={errors.type_of_event || stepErrors.type_of_event}>
              <input
                value={data.type_of_event}
                onChange={(event) => {
                  setData('type_of_event', event.target.value);
                  if (!data.public_calendar_title) setData('public_calendar_title', event.target.value);
                }}
                className="backend-booking-input"
                placeholder="Event title"
              />
            </Field>

            <Field label="Name of Organization" required error={errors.company_name || stepErrors.company_name}>
              <input
                value={data.company_name}
                onChange={(event) => setData('company_name', event.target.value)}
                className="backend-booking-input"
                placeholder="Organization name"
              />
            </Field>

            <Field label="Head of Organization" error={errors.head_of_organization}>
              <input
                value={data.head_of_organization}
                onChange={(event) => setData('head_of_organization', event.target.value)}
                className="backend-booking-input"
                placeholder="Head of organization"
              />
            </Field>

            <Field label="Contact Person" required error={errors.client_name || stepErrors.client_name}>
              <input
                value={data.client_name}
                onChange={(event) => setData('client_name', event.target.value)}
                className="backend-booking-input"
                placeholder="Contact person"
              />
            </Field>

            <Field label="Telephone / Contact Number" required error={errors.client_contact_number || stepErrors.client_contact_number}>
              <input
                value={data.client_contact_number}
                onChange={(event) => setData('client_contact_number', event.target.value)}
                className="backend-booking-input"
                placeholder="09XX XXX XXXX"
              />
            </Field>

            <Field label="Email Address" error={errors.client_email}>
              <input
                value={data.client_email}
                onChange={(event) => {
                  setData('client_email', event.target.value);
                  if (!data.survey_email) setData('survey_email', event.target.value);
                }}
                className="backend-booking-input"
                type="email"
                placeholder="name@example.com"
                disabled={isClient && editing}
              />
            </Field>

            <Field label="Organization Type" error={errors.organization_type}>
              <select
                value={data.organization_type}
                onChange={(event) => setData('organization_type', event.target.value)}
                className="backend-booking-input"
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="NGO">NGO</option>
                <option value="Academe">Academe</option>
                <option value="Religious">Religious</option>
                <option value="Others">Others</option>
              </select>
            </Field>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderAddressStep() {
    return (
      <div className="booking-step-screen">
        <Card className="backend-booking-card booking-fit-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="backend-booking-icon">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <Badge variant="outline">Address</Badge>
                <CardTitle className="mt-2 text-xl font-black">Organizer address</CardTitle>
                <CardDescription>Complete the organizer/client address.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="booking-field-carousel">
            <Field label="Region" required error={errors.client_region || stepErrors.client_region}>
              <input value={data.client_region} onChange={(event) => setData('client_region', event.target.value)} className="backend-booking-input" />
            </Field>

            <Field label="Province" required error={errors.client_province || stepErrors.client_province}>
              <input value={data.client_province} onChange={(event) => setData('client_province', event.target.value)} className="backend-booking-input" />
            </Field>

            <Field label="City / Municipality" required error={errors.client_city_municipality || stepErrors.client_city_municipality}>
              <input value={data.client_city_municipality} onChange={(event) => setData('client_city_municipality', event.target.value)} className="backend-booking-input" />
            </Field>

            <Field label="Barangay" error={errors.client_barangay}>
              <input value={data.client_barangay} onChange={(event) => setData('client_barangay', event.target.value)} className="backend-booking-input" />
            </Field>

            <Field label="ZIP Code" error={errors.client_zip_code}>
              <input value={data.client_zip_code} onChange={(event) => setData('client_zip_code', event.target.value)} className="backend-booking-input" />
            </Field>

            <Field label="Street Address" required error={errors.client_street_address || stepErrors.client_street_address}>
              <input
                value={data.client_street_address}
                onChange={(event) => {
                  setData('client_street_address', event.target.value);
                  setData('client_address', event.target.value);
                }}
                className="backend-booking-input"
              />
            </Field>

            <div className="booking-generated-card">
              <p className="backend-booking-label">Generated Full Address</p>
              <p className="mt-2 text-sm font-bold leading-6">
                {combinedAddress(data) || 'Complete the address fields to generate full address.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderScheduleStep() {
    return (
      <div className="booking-step-screen">
        <Card className="backend-booking-card booking-fit-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="backend-booking-icon">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <Badge variant="outline">Schedule</Badge>
                <CardTitle className="mt-2 text-xl font-black">Schedule and charges</CardTitle>
                <CardDescription>Set the event schedule and estimated charge information.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="booking-field-carousel">
            <Field label="Selected Area / Package">
              <input value={selectedVenue?.label ?? 'No package selected'} readOnly className="backend-booking-input" />
            </Field>

            <Field label="Usage">
              <input value={BOOKING_USAGE_LABELS[usage]} readOnly className="backend-booking-input" />
            </Field>

            <Field label="Date/Time From" required error={errors.booking_date_from || stepErrors.booking_date_from}>
              <input
                type="datetime-local"
                value={data.booking_date_from}
                onChange={(event) => setData('booking_date_from', event.target.value)}
                className="backend-booking-input"
              />
            </Field>

            <Field label="Date/Time To" required error={errors.booking_date_to || stepErrors.booking_date_to}>
              <input
                type="datetime-local"
                value={data.booking_date_to}
                onChange={(event) => setData('booking_date_to', event.target.value)}
                className="backend-booking-input"
              />
            </Field>

            <Field label="Number of Guests" required error={errors.number_of_guests || stepErrors.number_of_guests}>
              <input
                value={data.number_of_guests}
                onChange={(event) => setData('number_of_guests', event.target.value)}
                className="backend-booking-input"
                inputMode="numeric"
                placeholder="0"
              />
            </Field>

            <Field label="Other Rentals">
              <input
                value={otherRentals}
                onChange={(event) => setOtherRentals(event.target.value)}
                className="backend-booking-input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Additional Charges">
              <input
                value={additionalCharges}
                onChange={(event) => setAdditionalCharges(event.target.value)}
                className="backend-booking-input"
                inputMode="decimal"
                placeholder="0.00"
              />
            </Field>

            <Field label="Reservation Notes">
              <input
                value={reservationNotes}
                onChange={(event) => setReservationNotes(event.target.value)}
                className="backend-booking-input"
                placeholder="Optional notes"
              />
            </Field>

            <div className="booking-generated-card">
              <p className="backend-booking-label">Estimated Total Charges</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.05em]">{money(estimatedTotal)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Additional charges may be imposed after assessment at egress.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderGuidelinesStep() {
    return (
      <div className="booking-step-screen">
        <div className="booking-guideline-carousel">
          {BCCC_BOOKING_GENERAL_GUIDELINES.map((section) => (
            <Card key={section.title} className="backend-booking-card booking-guideline-card">
              <CardHeader>
                <Badge variant="outline">Guideline</Badge>
                <CardTitle className="mt-2 text-xl font-black">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="backend-booking-card booking-guideline-card">
            <CardHeader>
              <Badge variant="outline">Proof and confirmation</Badge>
              <CardTitle className="mt-2 text-xl font-black">Requirements</CardTitle>
              <CardDescription>
                Review the rules and confirm the encoded information.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field label="Survey / Reference Email" error={errors.survey_email}>
                <input
                  value={data.survey_email}
                  onChange={(event) => setData('survey_email', event.target.value)}
                  className="backend-booking-input"
                  type="email"
                  placeholder="Email used for survey/reference proof"
                />
              </Field>

              <Field label="Survey Proof Image" error={errors.survey_proof_image}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setData('survey_proof_image', event.target.files?.[0] ?? null)}
                  className="backend-booking-file"
                />
              </Field>

              <label className="booking-check-card">
                <input
                  type="checkbox"
                  checked={data.policy_acknowledged}
                  onChange={(event) => setData('policy_acknowledged', event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-black">I reviewed the BCCC guidelines.</span>
                  <span className="block text-xs text-muted-foreground">
                    The booking is subject to BCCC review, payment compliance, schedule validation, and house rules.
                  </span>
                </span>
              </label>

              <label className="booking-check-card">
                <input
                  type="checkbox"
                  checked={data.accuracy_acknowledged}
                  onChange={(event) => setData('accuracy_acknowledged', event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-black">I confirm that all information is accurate.</span>
                  <span className="block text-xs text-muted-foreground">
                    Incorrect details may delay assessment and approval.
                  </span>
                </span>
              </label>

              {isStaffLike ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Booking Status" error={errors.booking_status}>
                    <select
                      value={data.booking_status}
                      onChange={(event) => setData('booking_status', event.target.value)}
                      className="backend-booking-input"
                      disabled={isManager}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="declined">Declined</option>
                    </select>
                  </Field>

                  <Field label="Payment Status" error={errors.payment_status}>
                    <select
                      value={data.payment_status}
                      onChange={(event) => setData('payment_status', event.target.value)}
                      className="backend-booking-input"
                      disabled={isManager}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="owing">Owing</option>
                    </select>
                  </Field>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderReviewStep() {
    return (
      <div className="booking-review-carousel">
        <ReviewBlock title="Package and Charges" icon={PackageCheck} onEdit={() => goToStep(0)}>
          <ReviewGrid
            items={[
              ['Package', selectedVenue?.displayLabel],
              ['Backend Rental Option', selectedVenue?.service?.name ?? 'Not configured'],
              ['Usage', BOOKING_USAGE_LABELS[usage]],
              ['Duration', usage === 'additional_hour' ? `${durationHours} hour(s)` : 'Fixed rate'],
              ['Base Charge', money(estimatedBase)],
              ['Additional Charges', money(additionalCharges || 0)],
              ['Estimated Total', money(estimatedTotal)],
              ['Included', selectedVenue?.includes.join(', ')],
            ]}
          />
        </ReviewBlock>

        <ReviewBlock title="Event and Organizer" icon={UserRound} onEdit={() => goToStep(1)}>
          <ReviewGrid
            items={[
              ['Event Title / Type', data.type_of_event],
              ['Organization', data.company_name],
              ['Head of Organization', data.head_of_organization],
              ['Contact Person', data.client_name],
              ['Telephone / Contact Number', data.client_contact_number],
              ['Email', data.client_email],
              ['Organization Type', data.organization_type],
            ]}
          />
        </ReviewBlock>

        <ReviewBlock title="Address" icon={MapPin} onEdit={() => goToStep(2)}>
          <ReviewGrid
            items={[
              ['Region', data.client_region],
              ['Province', data.client_province],
              ['City / Municipality', data.client_city_municipality],
              ['Barangay', data.client_barangay],
              ['ZIP Code', data.client_zip_code],
              ['Full Address', combinedAddress(data)],
            ]}
          />
        </ReviewBlock>

        <ReviewBlock title="Schedule" icon={CalendarDays} onEdit={() => goToStep(3)}>
          <ReviewGrid
            items={[
              ['Date/Time From', data.booking_date_from],
              ['Date/Time To', data.booking_date_to],
              ['Guests', data.number_of_guests],
              ['Other Rentals', otherRentals],
              ['Notes', reservationNotes],
              ['Public Calendar Title', data.public_calendar_title],
            ]}
          />
        </ReviewBlock>

        <ReviewBlock title="Requirements and Status" icon={ShieldCheck} onEdit={() => goToStep(4)}>
          <ReviewGrid
            items={[
              ['Survey Email', data.survey_email],
              [
                'Survey Proof Image',
                data.survey_proof_image
                  ? data.survey_proof_image.name
                  : bookingAny?.survey_proof_image_url
                    ? 'Existing uploaded proof'
                    : 'Not uploaded',
              ],
              ['Guidelines Reviewed', data.policy_acknowledged ? 'Yes' : 'No'],
              ['Information Accuracy Confirmed', data.accuracy_acknowledged ? 'Yes' : 'No'],
              ['Booking Status', <BookingStatusBadge key="booking-status" value={data.booking_status} />],
              ['Payment Status', <BookingStatusBadge key="payment-status" value={data.payment_status} />],
            ]}
          />
        </ReviewBlock>
      </div>
    );
  }

  function renderActiveStep() {
    if (activeStep === 0) return renderPackageStep();
    if (activeStep === 1) return renderOrganizerStep();
    if (activeStep === 2) return renderAddressStep();
    if (activeStep === 3) return renderScheduleStep();
    if (activeStep === 4) return renderGuidelinesStep();

    return renderReviewStep();
  }

  return (
    <BookingRolePageShell
      role={role}
      title={formTitle(role, editing)}
      description={formDescription(role)}
      compact
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="booking-wizard-shell booking-hotel-wizard-shell">
      <BookingFormLoadingLayer
  visible={processing || stepLoading}
  label={processing ? 'Submitting reservation' : 'Loading form page'}
  sublabel={
    processing
      ? 'Please wait while the booking request is being saved.'
      : 'Preparing the next section of the reservation form.'
  }
/>
        <div className="booking-wizard-toolbar">
          <Stepper activeStep={activeStep} maxStep={maxStep} onStepClick={goToStep} />

          <Button
            type="button"
            variant={showDigitalForm ? 'default' : 'outline'}
            className="booking-digital-form-button rounded-full"
            onClick={() => setShowDigitalForm((current) => !current)}
          >
            {showDigitalForm ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showDigitalForm ? 'Hide Form' : 'View Form'}
          </Button>
        </div>

        <WizardNotice errors={stepErrors} />

        <section className="booking-wizard-stage">
          {renderActiveStep()}
        </section>

        <SummaryDrawer />
        <DigitalFormPanel />

        <StepFooter />
      </form>

    </BookingRolePageShell>
  );
}
