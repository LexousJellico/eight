import { BookingRolePageShell } from '@/components/bookings/booking-role-page-shell';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { PaymentProofPanel } from '@/components/bookings/payment-proof-panel';
import {
  bookingBasePath,
  bookingEditPath,
  bookingProofPath,
  bookingSurveyPath,
  cleanLabel,
  formatDateTime,
  formatMoney,
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
import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileImage,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';

type BookingShowPageProps = {
  workspaceRole?: string;
  booking?: BookingLike;
  canUpdateBooking?: boolean;
  canDeleteBooking?: boolean;
  canManagePayments?: boolean;
};

function safeText(value: unknown, fallback = 'Not set'): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return fallback;
  }

  return String(value);
}

function totalValue(booking: BookingLike, key: string): number | string | null {
  const totals = booking.totals as Record<string, number | string | null | undefined> | null | undefined;

  return totals?.[key] ?? null;
}

function detailItems(booking: BookingLike) {
  return [
    {
      label: 'Client Name',
      value: booking.client_name,
      icon: UserRound,
    },
    {
      label: 'Company / Organization',
      value: booking.company_name,
      icon: Building2,
    },
    {
      label: 'Email',
      value: booking.client_email,
      icon: Mail,
    },
    {
      label: 'Contact Number',
      value: booking.client_contact_number,
      icon: Phone,
    },
    {
      label: 'Address',
      value: booking.client_address,
      icon: MapPin,
    },
    {
      label: 'Guests',
      value: booking.number_of_guests,
      icon: Users,
    },
  ];
}

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: typeof UserRound;
}) {
  return (
    <div className="backend-booking-detail">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-[#8a6b2e] dark:text-[#e8d8b5]" /> : null}
        <p className="backend-booking-label">{label}</p>
      </div>

      <p className="mt-2 break-words text-sm font-bold leading-6">
        {value || 'Not set'}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="backend-booking-summary-card">
      <div className="backend-booking-icon">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="backend-booking-label">{label}</p>
        <p className="mt-1 truncate text-lg font-black tracking-[-0.025em]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function BookingShowPage() {
  const { props } = usePage<BookingShowPageProps>();
  const role = normalizeWorkspaceRole(props.workspaceRole) as RoleThemeKey;
  const booking = props.booking;

  if (!booking) {
    return (
      <BookingRolePageShell
        role={role}
        title="Booking Not Found"
        description="The booking record could not be loaded."
      >
        <Card className="backend-booking-card">
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-black">
              The booking record could not be loaded.
            </h2>

            <Button asChild className="mt-5 rounded-full">
              <Link href={bookingBasePath(role)}>
                Back to bookings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </BookingRolePageShell>
    );
  }

  const canUpdate = Boolean(props.canUpdateBooking);
  const canDelete = Boolean(props.canDeleteBooking);
  const canManagePayments = Boolean(props.canManagePayments);
  const isUser = role === 'user';
  const serviceName = safeText(booking.service_name ?? booking.service?.name, 'Venue not set');
  const companyName = safeText(booking.company_name, safeText(booking.client_name, 'Client not set'));
  const remainingBalance =
    totalValue(booking, 'remaining_balance') ??
    Math.max(
      Number(totalValue(booking, 'items_total') ?? 0) -
        Number(totalValue(booking, 'confirmed_payments_total') ?? totalValue(booking, 'payments_total') ?? 0),
      0,
    );

  function deleteBooking() {
    if (!window.confirm('Delete this booking record? This action cannot be undone.')) return;

    router.delete(`${bookingBasePath(role)}/${booking.id}`, {
      preserveScroll: false,
    });
  }

  return (
    <BookingRolePageShell
      role={role}
      title={safeText(booking.type_of_event, `Booking #${booking.id}`)}
      description="Review the reservation summary, schedule, client information, survey proof, and payment proof."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={bookingBasePath(role)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          {canUpdate ? (
            <Button asChild className="rounded-full">
              <Link href={bookingEditPath(role, booking.id)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          ) : null}

          {canDelete ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200"
              onClick={deleteBooking}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card className="backend-booking-card overflow-hidden">
            <CardHeader>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
                    >
                      Booking #{booking.id}
                    </Badge>
                    <BookingStatusBadge value={booking.booking_status} />
                    <BookingStatusBadge value={booking.payment_status} />
                  </div>

                  <CardTitle className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] lg:text-5xl">
                    {safeText(booking.type_of_event, 'Event Booking')}
                  </CardTitle>

                  <CardDescription className="mt-4 text-base">
                    {companyName} · {serviceName}
                  </CardDescription>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px] lg:grid-cols-1">
                  <SummaryCard
                    label="Schedule From"
                    value={formatDateTime(booking.booking_date_from)}
                    icon={CalendarDays}
                  />
                  <SummaryCard
                    label="Remaining Balance"
                    value={formatMoney(remainingBalance)}
                    icon={ReceiptText}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="backend-booking-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="backend-booking-icon">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Reservation Schedule</CardTitle>
                  <CardDescription>Booking date, venue, and guest count.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <DetailCard label="Venue / Rental Option" value={serviceName} icon={Building2} />
              <DetailCard label="Guests" value={booking.number_of_guests} icon={Users} />
              <DetailCard label="Date From" value={formatDateTime(booking.booking_date_from)} icon={Clock3} />
              <DetailCard label="Date To" value={formatDateTime(booking.booking_date_to)} icon={Clock3} />
            </CardContent>
          </Card>

          <Card className="backend-booking-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="backend-booking-icon">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Client Information</CardTitle>
                  <CardDescription>Contact and organization details.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              {detailItems(booking).map((item) => (
                <DetailCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="backend-booking-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="backend-booking-icon">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">
                    Requirements
                  </CardTitle>
                  <CardDescription>
                    Survey proof and requirement checklist.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-auto justify-start rounded-2xl p-4"
              >
                <Link href={bookingSurveyPath(role, booking.id)}>
                  <FileImage className="mr-3 h-5 w-5" />
                  <span className="text-left">
                    <span className="block font-black">Continue Survey Reference</span>
                    <span className="block text-xs text-muted-foreground">
                      Open the survey proof workflow.
                    </span>
                  </span>
                </Link>
              </Button>

              {booking.survey_proof_image_url ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-start rounded-2xl border-emerald-500/25 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-200"
                >
                  <a
                    href={bookingProofPath(role, booking.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <CheckCircle2 className="mr-3 h-5 w-5" />
                    <span className="text-left">
                      <span className="block font-black">View Survey Proof</span>
                      <span className="block text-xs opacity-75">
                        Survey proof image was submitted.
                      </span>
                    </span>
                  </a>
                </Button>
              ) : (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-200">
                  <FileImage className="h-5 w-5" />
                  <p className="mt-3 text-sm font-black">Survey proof missing</p>
                  <p className="mt-1 text-xs leading-5 opacity-75">
                    Survey proof is still required before final validation.
                  </p>
                </div>
              )}

              {isUser ? (
                <p className="rounded-2xl border bg-muted/35 p-4 text-sm leading-6 text-muted-foreground md:col-span-2">
                  Your booking remains under review until BCCC validates the schedule, survey proof, and payment compliance.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <PaymentProofPanel
            role={role}
            booking={booking}
            canManagePayments={canManagePayments}
          />
        </div>

        <aside className="space-y-6">
          <Card className="backend-booking-card sticky top-24">
            <CardHeader>
              <Badge
                variant="outline"
                className="w-fit border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
              >
                Financial Summary
              </Badge>
              <CardTitle className="mt-3 text-2xl font-black">
                Payment Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <DetailCard label="Estimated Charges" value={formatMoney(totalValue(booking, 'items_total'))} />
              <DetailCard label="Submitted Payments" value={formatMoney(totalValue(booking, 'submitted_payments_total'))} />
              <DetailCard label="Confirmed Payments" value={formatMoney(totalValue(booking, 'confirmed_payments_total') ?? totalValue(booking, 'payments_total'))} />
              <DetailCard label="Remaining Balance" value={formatMoney(remainingBalance)} />

              <Separator />

              <div>
                <p className="backend-booking-label">Record Status</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <BookingStatusBadge value={booking.booking_status} />
                  <BookingStatusBadge value={booking.payment_status} />
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/35 p-4">
                <p className="backend-booking-label">Created</p>
                <p className="mt-2 text-sm font-bold">
                  {formatDateTime(booking.created_at)}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/35 p-4">
                <p className="backend-booking-label">Booking Status</p>
                <p className="mt-2 text-sm font-bold">
                  {cleanLabel(booking.booking_status)}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </BookingRolePageShell>
  );
}
