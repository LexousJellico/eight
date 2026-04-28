import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  compactDateTime,
  currentWorkspaceRole,
  extractCollection,
  extractLinks,
  money,
  normalizeAdminResourceRole,
  statusBadgeTone,
} from '@/lib/admin-resource-ui';
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
  CreditCard,
  ExternalLink,
  Eye,
  Search,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type PaymentRecord = {
  id: number | string;
  booking_id?: number | string | null;
  booking?: {
    id?: number | string;
    client_name?: string | null;
    company_name?: string | null;
    type_of_event?: string | null;
  } | null;
  amount?: number | string | null;
  status?: string | null;
  payment_method?: string | null;
  payment_gateway?: string | null;
  payment_type?: string | null;
  transaction_reference?: string | null;
  proof_image_url?: string | null;
  created_at?: string | null;
};

type PageProps = {
  workspaceRole?: string;
  payments?: unknown;
  paymentProofs?: unknown;
  records?: unknown;
  filters?: {
    q?: string;
  };
};

function basePath(role: string) {
  if (role === 'manager') return '/manager/payments/review';

  return '/admin/payments/review';
}

function bookingHref(role: string, payment: PaymentRecord): string {
  const bookingId = payment.booking_id ?? payment.booking?.id;

  if (!bookingId) return '#';

  if (role === 'manager') return `/manager/bookings/${bookingId}`;
  if (role === 'staff') return `/staff/bookings/${bookingId}`;

  return `/admin/bookings/${bookingId}`;
}

function proofHref(payment: PaymentRecord): string | null {
  if (!payment.proof_image_url) return null;

  return String(payment.proof_image_url);
}

export function PaymentReviewPage() {
  const { props } = usePage() as unknown as { props: PageProps };
  const role = normalizeAdminResourceRole(props.workspaceRole ?? currentWorkspaceRole());
  const payments = useMemo(
    () => extractCollection<PaymentRecord>(props.payments ?? props.paymentProofs ?? props.records),
    [props.payments, props.paymentProofs, props.records],
  );
  const pageLinks = extractLinks(props.payments ?? props.paymentProofs ?? props.records);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));
  const path = basePath(role);

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      path,
      { q: q || undefined },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  return (
    <ResourcePageShell
      role={props.workspaceRole}
      current="Payment Review"
      eyebrow="Payment Compliance"
      title="Payment Review"
      description="Review submitted payment records, proof uploads, transaction references, and related booking records."
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="backend-admin-card">
          <CardContent className="p-5">
            <p className="backend-admin-label">Records</p>
            <p className="mt-3 text-3xl font-black">{payments.length}</p>
          </CardContent>
        </Card>

        <Card className="backend-admin-card">
          <CardContent className="p-5">
            <p className="backend-admin-label">Pending</p>
            <p className="mt-3 text-3xl font-black">
              {payments.filter((payment) => String(payment.status).toLowerCase() === 'pending').length}
            </p>
          </CardContent>
        </Card>

        <Card className="backend-admin-card">
          <CardContent className="p-5">
            <p className="backend-admin-label">Confirmed</p>
            <p className="mt-3 text-3xl font-black">
              {payments.filter((payment) => String(payment.status).toLowerCase() === 'confirmed').length}
            </p>
          </CardContent>
        </Card>

        <Card className="backend-admin-card">
          <CardContent className="p-5">
            <p className="backend-admin-label">Total Amount</p>
            <p className="mt-3 text-3xl font-black">
              {money(payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0))}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="backend-admin-card overflow-hidden">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-[-0.04em]">
              Payment submissions
            </CardTitle>

            <CardDescription>
              Open the related booking to confirm, decline, or review uploaded proof.
            </CardDescription>
          </div>

          <form onSubmit={search} className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="backend-admin-input pl-11"
              placeholder="Search payments..."
            />
          </form>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {payments.length > 0 ? (
            <div className="divide-y">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="backend-admin-icon">
                        <CreditCard className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-black">
                          {payment.booking?.type_of_event || `Payment #${payment.id}`}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {payment.booking?.company_name || payment.booking?.client_name || 'No booking client'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className={statusBadgeTone(payment.status)}>
                        {payment.status || 'Pending'}
                      </Badge>
                      <Badge variant="outline">
                        {money(payment.amount)}
                      </Badge>
                      <Badge variant="outline">
                        {payment.payment_gateway || payment.payment_method || 'Manual'}
                      </Badge>
                      <Badge variant="outline">
                        Ref: {payment.transaction_reference || 'None'}
                      </Badge>
                      <Badge variant="outline">
                        {compactDateTime(payment.created_at)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:justify-end">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={bookingHref(role, payment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Booking
                      </Link>
                    </Button>

                    {proofHref(payment) ? (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <a href={proofHref(payment) || '#'} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Proof
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h3 className="mt-4 text-xl font-black">No payment records found</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Submitted and recorded payments will appear here.
              </p>
            </div>
          )}

          {pageLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t p-5">
              {pageLinks.map((link, index) =>
                link.url ? (
                  <Link
                    key={`${link.label}-${index}`}
                    href={link.url}
                    preserveScroll
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      link.active
                        ? 'border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ) : (
                  <span
                    key={`${link.label}-${index}`}
                    className="rounded-full border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground/50"
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </ResourcePageShell>
  );
}
