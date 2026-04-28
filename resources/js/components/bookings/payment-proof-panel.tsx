import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import {
  bookingPaymentPath,
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
import { router, useForm } from '@inertiajs/react';
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileImage,
  Loader2,
  ReceiptText,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type PaymentProofPanelProps = {
  role?: string | null;
  booking: BookingLike;
  canManagePayments?: boolean;
};

type PaymentRecord = {
  id: number | string;
  amount?: number | string | null;
  status?: string | null;
  payment_method?: string | null;
  payment_gateway?: string | null;
  payment_type?: string | null;
  transaction_reference?: string | null;
  proof_image_url?: string | null;
  created_at?: string | null;
  remarks?: string | null;
};

type PaymentFormData = {
  payment_method: string;
  payment_gateway: string;
  payment_type: string;
  amount: string;
  transaction_reference: string;
  payer_name: string;
  proof_image: File | null;
  remarks: string;
  status: string;
};

function totalValue(booking: BookingLike, key: string): number | string | null {
  const totals = booking.totals as Record<string, number | string | null | undefined> | null | undefined;

  return totals?.[key] ?? null;
}

function gatewayLabel(value?: string | null) {
  return cleanLabel(value || 'Manual');
}

function proofPath(role: RoleThemeKey, bookingId: number | string, paymentId: number | string): string {
  return `${bookingPaymentPath(role, bookingId)}/${paymentId}/proof`;
}

function updatePath(role: RoleThemeKey, bookingId: number | string, paymentId: number | string): string {
  return `${bookingPaymentPath(role, bookingId)}/${paymentId}`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="backend-booking-label">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

export function PaymentProofPanel({
  role,
  booking,
  canManagePayments = false,
}: PaymentProofPanelProps) {
  const normalizedRole = normalizeWorkspaceRole(role) as RoleThemeKey;
  const isClient = normalizedRole === 'user';
  const payments = Array.isArray(booking.payments) ? (booking.payments as PaymentRecord[]) : [];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const remainingBalance = useMemo(() => {
    const direct = Number(totalValue(booking, 'remaining_balance'));

    if (Number.isFinite(direct) && direct > 0) return String(direct.toFixed(2));

    const total = Number(totalValue(booking, 'items_total') ?? 0);
    const confirmed = Number(
      totalValue(booking, 'confirmed_payments_total') ??
        totalValue(booking, 'payments_total') ??
        0,
    );
    const remaining = total - confirmed;

    if (!Number.isFinite(remaining) || remaining <= 0) return '';

    return String(remaining.toFixed(2));
  }, [booking]);

  const { data, setData, post, processing, errors, reset } = useForm<PaymentFormData>({
    payment_method: 'online',
    payment_gateway: isClient ? 'gcash' : 'manual',
    payment_type: 'down',
    amount: remainingBalance,
    transaction_reference: '',
    payer_name: String(booking.client_name || ''),
    proof_image: null,
    remarks: '',
    status: canManagePayments ? 'confirmed' : 'pending',
  });

  useEffect(() => {
    if (!data.proof_image) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(data.proof_image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [data.proof_image]);

  const gatewayNeedsProof = ['gcash', 'paypal', 'bank'].includes(data.payment_gateway);

  function submitPayment(event: FormEvent) {
    event.preventDefault();

    post(bookingPaymentPath(normalizedRole, booking.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        reset('transaction_reference', 'proof_image', 'remarks');
        setData('amount', remainingBalance);
        setData('status', canManagePayments ? 'confirmed' : 'pending');
      },
    });
  }

  function updatePaymentStatus(paymentId: number | string, status: string) {
    const payment = payments.find((item) => String(item.id) === String(paymentId));

    router.put(
      updatePath(normalizedRole, booking.id, paymentId),
      {
        status,
        payment_method: payment?.payment_method || 'manual',
        payment_gateway: payment?.payment_gateway || 'manual',
        payment_type: payment?.payment_type || 'down',
        amount: payment?.amount || 0,
        transaction_reference: payment?.transaction_reference || '',
        payer_name: '',
        remarks:
          status === 'confirmed'
            ? 'Payment proof reviewed and confirmed.'
            : status === 'declined'
              ? 'Payment proof reviewed and declined.'
              : 'Payment status updated.',
      },
      {
        preserveScroll: true,
      },
    );
  }

  return (
    <Card className="backend-booking-card">
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="backend-booking-icon">
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <Badge
              variant="outline"
              className="border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]"
            >
              Payment Compliance
            </Badge>
            <CardTitle className="mt-3 text-xl font-black">
              {isClient ? 'Submit payment proof' : 'Record or review payment'}
            </CardTitle>
            <CardDescription className="mt-2">
              Upload proof, save manual records, and review submitted payments.
            </CardDescription>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/35 px-4 py-3">
          <p className="backend-booking-label">Balance</p>
          <p className="mt-1 text-xl font-black">
            {formatMoney(totalValue(booking, 'remaining_balance') ?? remainingBalance)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={submitPayment} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Payer Name" error={errors.payer_name}>
              <input
                value={data.payer_name}
                onChange={(event) => setData('payer_name', event.target.value)}
                className="backend-booking-input"
                placeholder="Name of payer"
              />
            </Field>

            <Field label="Amount" error={errors.amount}>
              <input
                value={data.amount}
                onChange={(event) => setData('amount', event.target.value)}
                className="backend-booking-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </Field>

            <Field label="Gateway" error={errors.payment_gateway}>
              <select
                value={data.payment_gateway}
                onChange={(event) => {
                  const gateway = event.target.value;
                  setData('payment_gateway', gateway);
                  setData('payment_method', gateway === 'cash' ? 'cash' : 'online');
                }}
                className="backend-booking-input"
              >
                <option value="gcash">GCash</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="manual">Manual</option>
              </select>
            </Field>

            <Field label="Payment Type" error={errors.payment_type}>
              <select
                value={data.payment_type}
                onChange={(event) => setData('payment_type', event.target.value)}
                className="backend-booking-input"
              >
                <option value="down">Down Payment</option>
                <option value="full">Full Payment</option>
              </select>
            </Field>

            {canManagePayments ? (
              <Field label="Review Status" error={errors.status}>
                <select
                  value={data.status}
                  onChange={(event) => setData('status', event.target.value)}
                  className="backend-booking-input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="failed">Failed</option>
                  <option value="declined">Declined</option>
                  <option value="refunded">Refunded</option>
                </select>
              </Field>
            ) : null}

            <Field
              label="Transaction Reference"
              required={gatewayNeedsProof}
              error={errors.transaction_reference}
            >
              <input
                value={data.transaction_reference}
                onChange={(event) => setData('transaction_reference', event.target.value)}
                className="backend-booking-input"
                placeholder="Reference number / confirmation code"
              />
            </Field>

            <Field
              label="Proof Image"
              required={gatewayNeedsProof}
              error={errors.proof_image}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setData('proof_image', event.target.files?.[0] ?? null)}
                className="backend-booking-file"
              />
            </Field>
          </div>

          <Field label="Remarks" error={errors.remarks}>
            <textarea
              value={data.remarks}
              onChange={(event) => setData('remarks', event.target.value)}
              rows={3}
              className="backend-booking-input min-h-[100px] py-3"
              placeholder="Optional notes"
            />
          </Field>

          {previewUrl ? (
            <div className="overflow-hidden rounded-2xl border bg-muted/35">
              <img
                src={previewUrl}
                alt="Payment proof preview"
                className="max-h-80 w-full object-contain"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              {gatewayNeedsProof
                ? 'Proof image and transaction reference are required for this gateway.'
                : 'Cash/manual records may be added by authorized internal users.'}
            </p>

            <Button type="submit" disabled={processing} className="rounded-full">
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {isClient ? 'Submit Payment Proof' : 'Save Payment Record'}
            </Button>
          </div>
        </form>

        <Separator />

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="backend-booking-label">Payment History</p>
              <h4 className="text-lg font-black">
                {payments.length} record{payments.length === 1 ? '' : 's'}
              </h4>
            </div>
            <ReceiptText className="h-5 w-5 text-muted-foreground" />
          </div>

          {payments.length > 0 ? (
            <div className="grid gap-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-2xl border bg-muted/30 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <BookingStatusBadge value={payment.status} />
                        <Badge variant="outline">
                          {gatewayLabel(payment.payment_gateway ?? payment.payment_method)}
                        </Badge>
                      </div>

                      <p className="mt-3 text-xl font-black">
                        {formatMoney(payment.amount)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Ref: {payment.transaction_reference || 'No reference'} · {formatDateTime(payment.created_at)}
                      </p>

                      {payment.remarks ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {payment.remarks}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {payment.proof_image_url ? (
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <a
                            href={proofPath(normalizedRole, booking.id, payment.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Proof
                          </a>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="gap-1.5">
                          <FileImage className="h-3.5 w-3.5" />
                          No Proof
                        </Badge>
                      )}

                      {canManagePayments ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200"
                            onClick={() => updatePaymentStatus(payment.id, 'confirmed')}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200"
                            onClick={() => updatePaymentStatus(payment.id, 'declined')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/25 p-8 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h4 className="mt-4 text-lg font-black">
                No payment records yet
              </h4>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Payment submissions and staff-recorded payments will appear here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
